// ============================================================
// EnemyFighter 子类（TypeScript 重构版）
// ============================================================
// 继承 Fighter，只加 AI 行为
// 面试时可以说："我用继承复用了全部角色能力，只加 AI 逻辑"
// ============================================================

import Fighter from './Fighter';
import type { AIState } from './types';

export default class EnemyFighter extends Fighter {
    state: AIState;
    detectionRange: number;
    attackRange: number;
    hitRecoveryFrames: number;

    constructor(id: string, startX: number, config: FighterConfig = {}) {
        super(id, startX, config);

        this.state = (config.state as AIState) ?? 'idle';
        this.detectionRange = config.detectionRange ?? 400;
        this.attackRange = config.attackRange ?? 50;
        this.hitRecoveryFrames = 0;
    }

    updateAI(target: Fighter): void {
        if (!this.isAlive || !target.isAlive) return;

        // 被击退恢复中：继续物理更新，但不切换状态
        if (this.hitRecoveryFrames > 0) {
            this.hitRecoveryFrames--;
            this.update({});
            return;
        }

        // 击退物理尚未结束：继续更新，结束后再恢复 AI
        if (this.vx !== 0) {
            this.update({});
            if (this.vx === 0) this.hitRecoveryFrames = 10;
            return;
        }

        const dist = Math.abs(this.x - target.x);

        // AI 状态机：距离驱动
        if (dist > this.detectionRange) {
            this.state = 'idle';
        } else if (dist < this.attackRange) {
            this.state = 'attacking';
        } else {
            this.state = 'chasing';
        }

        if (this.state === 'chasing')  this._chase(target);
        if (this.state === 'attacking') this._attackAI(target);

        this._renderDirection();
    }

    // --- AI 行为 ---
    private _chase(target: Fighter): void {
        this.faceToward(target);
        if (this.x < target.x) this.x += this.speed;
        else this.x -= this.speed;
        this._clampX();
        this.el.style.left = `${this.x}px`;
    }

    private _attackAI(target: Fighter): void {
        this.faceToward(target);
        this.attack();
    }
}
