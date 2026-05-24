// ===========================================================
// Fighter 基类（TypeScript 重构版）
// ===========================================================
// 完整类型标注：属性、方法参数、返回值都有类型
// 面试时可以直接说："我用 TypeScript 重构了整个项目，每个属性都有类型标注"
// ===========================================================

import type { InputState, FighterConfig } from './types';

export default class Fighter {
    // ---- DOM 引用 ----
    el: HTMLElement;

    // ---- 位置与运动 ----
    x: number;
    y: number;
    vy: number;
    vx: number;
    direction: 1 | -1;

    // ---- 生命与状态 ----
    health: number;
    maxHealth: number;
    isAlive: boolean;
    isJumping: boolean;
    isAttacking: boolean;
    hasHitInThisAttack: boolean;

    // ---- 物理常量 ----
    speed: number;
    gravity: number;
    jumpStrength: number;
    attackDuration: number;
    knockbackStrength: number;
    friction: number;
    maxX: number;

    // ---- 攻击碰撞体 ----
    bodyWidth: number;
    bodyHeight: number;
    attackReach: number;
    attackBoxWidth: number;

    // ---- 血条 DOM ----
    healthFill: HTMLElement | null;

    constructor(id: string, startX: number, config: FighterConfig = {}) {
        this.el = document.getElementById(id)!;

        // 位置与运动
        this.x = startX;
        this.y = 0;
        this.vy = 0;
        this.vx = 0;
        this.direction = 1;

        // 生命与状态
        this.health = config.maxHealth ?? 100;
        this.maxHealth = config.maxHealth ?? 100;
        this.isAlive = true;
        this.isJumping = false;
        this.isAttacking = false;
        this.hasHitInThisAttack = false;

        // 物理常量
        this.speed = config.speed ?? 5;
        this.gravity = 0.3;
        this.jumpStrength = 12;
        this.attackDuration = config.attackDuration ?? 300;
        this.knockbackStrength = 5;
        this.friction = 0.8;
        this.maxX = config.maxX ?? 740;

        // 攻击碰撞体
        this.bodyWidth = config.bodyWidth ?? 50;
        this.bodyHeight = config.bodyHeight ?? 80;
        this.attackReach = config.attackReach ?? 50;
        this.attackBoxWidth = config.attackBoxWidth ?? 10;

        // 血条 DOM
        this.healthFill = config.healthFillEl ?? null;
    }

    // --- 每帧更新 ---
    update(input: InputState = {}): void {
        this._renderDirection();
        this._moveHorizontal(input);
        this._applyJumpPhysics();
        this._syncPosition();
        this._applyKnockback();
    }

    // --- 攻击管线 ---
    attack(): void {
        if (this.isAttacking || !this.isAlive) return;
        this.isAttacking = true;
        this.hasHitInThisAttack = false;
        this.el.classList.add('attacking');
        setTimeout(() => {
            this.isAttacking = false;
            this.el.classList.remove('attacking');
        }, this.attackDuration);
    }

    canHit(target: Fighter): boolean {
        if (!this.isAttacking) return false;
        if (this.hasHitInThisAttack) return false;
        if (!target.isAlive) return false;

        const myRight = this.x + this.bodyWidth;
        const myLeft  = this.x;

        let attackLeft: number, attackRight: number;
        if (this.direction === 1) {
            attackLeft  = myRight + (this.attackReach - this.attackBoxWidth);
            attackRight = myRight + this.attackReach;
        } else {
            attackLeft  = myLeft - this.attackReach;
            attackRight = myLeft - (this.attackReach - this.attackBoxWidth);
        }

        const targetLeft   = target.x;
        const targetRight  = target.x + target.bodyWidth;
        const targetTop    = target.y + target.bodyHeight;
        const targetBottom = target.y;

        const isColliding = !(
            attackRight  < targetLeft  ||
            attackLeft   > targetRight ||
            targetTop    < targetBottom ||
            targetBottom > targetTop
        );

        if (isColliding) {
            this.hasHitInThisAttack = true;
            console.log(`${this.el.id} 攻击命中 ${target.el.id}！`);
        }
        return isColliding;
    }

    takeDamage(amount: number, attacker: Fighter): void {
        if (!this.isAlive) return;
        this.health -= amount;
        this._updateHealthUI();

        if (attacker.x < this.x) {
            this.vx = this.knockbackStrength;
        } else {
            this.vx = -this.knockbackStrength;
        }

        this.el.classList.add('hit');
        setTimeout(() => { this.el.classList.remove('hit'); }, 200);

        if (this.health <= 0) {
            this.health = 0;
            this.die();
        }
    }

    die(): void {
        console.log(`${this.el.id} 被击败了！`);
        this.isAlive = false;
        this.isAttacking = false;
        this.el.style.display = 'none';

        // 5秒后自动复活
        setTimeout(() => {
            this.revive();
        }, 5000);
    }

    revive(): void {
        console.log(`${this.el.id} 复活了！`);
        this.isAlive = true;
        this.health = this.maxHealth;
        this.isAttacking = false;
        this.isJumping = false;
        this.vy = 0;
        this.vx = 0;
        this.el.style.display = 'block';
        this.el.classList.remove('hit');
        this._updateHealthUI();
    }

    _updateHealthUI(): void {
        if (!this.healthFill) return;
        const pct = (this.health / this.maxHealth) * 100;
        (this.healthFill as HTMLElement).style.width = `${pct}%`;
    }

    // --- 移动方法 ---
    _renderDirection(): void {
        if (this.direction === 1) {
            this.el.classList.remove('face-left');
            this.el.classList.add('face-right');
        } else {
            this.el.classList.remove('face-right');
            this.el.classList.add('face-left');
        }
    }

    _moveHorizontal(input: InputState): void {
        if (input.right) this.x += this.speed;
        if (input.left)  this.x -= this.speed;
        this._clampX();
    }

    _clampX(): void {
        if (this.x <= 0) this.x = 0;
        if (this.x >= this.maxX) this.x = this.maxX;
    }

    _applyJumpPhysics(): void {
        if (!this.isJumping) return;
        this.vy -= this.gravity;
        this.y += this.vy;
        if (this.y <= 0) { this.y = 0; this.vy = 0; this.isJumping = false; }
    }

    _applyKnockback(): void {
        if (this.vx === 0) return;
        this.x += this.vx;
        this.vx *= this.friction;
        if (Math.abs(this.vx) < 0.1) this.vx = 0;
        this._clampX();
    }

    _syncPosition(): void {
        this.el.style.left = `${this.x}px`;
        if (this.isJumping || this.y >= 0) {
            this.el.style.bottom = `${this.y}px`;
        }
    }

    // --- 便捷方法 ---
    jump(): void {
        if (!this.isJumping) {
            this.vy = this.jumpStrength;
            this.isJumping = true;
        }
    }

    faceToward(target: Fighter): void {
        this.direction = (target.x > this.x) ? 1 : -1;
    }
}
