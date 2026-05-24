// ============================================================
// Game 类（TypeScript 重构版）
// ============================================================
// 管理游戏世界本身的行为（震动、顿帧、BO3 轮次）
// 面试时这样说：
//   "Game 类是游戏世界的管理者，封装了帧级别的舞台效果。
//   这样做的好处是 gameLoop 变成纯调度层，不操心效果细节。
//   未来加新效果（慢动作、画面闪烁）只需给 Game 加方法。"
// ============================================================

import type { GamePhase } from './types';

export default class Game {
    stage: HTMLElement;
    private _hitstop: boolean;
    private bo3State: {
        playerWins: number;
        enemyWins: number;
        currentRound: number;
        phase: GamePhase;
        reviveTimer: ReturnType<typeof setTimeout> | null;
    };

    constructor(stageEl: HTMLElement) {
        this.stage = stageEl;
        this._hitstop = false;
        this.bo3State = {
            playerWins: 0,
            enemyWins: 0,
            currentRound: 1,
            phase: 'fighting',
            reviveTimer: null,
        };
    }

    // 当前是否处于顿帧暂停中
    isPaused(): boolean {
        return this._hitstop;
    }

    // 顿帧：画面暂停 ms 毫秒（给打击感）
    hitstop(ms: number): void {
        this._hitstop = true;
        setTimeout(() => { this._hitstop = false; }, ms);
    }

    // 屏幕震动（强制回流以触发 CSS 动画重播）
    shake(): void {
        // 经典技巧：先移除 → 读 offsetWidth 强制回流 → 再加回，这样 CSS 动画每次都能重播
        this.stage.classList.remove('shake');
        void this.stage.offsetWidth;
        this.stage.classList.add('shake');
    }

    // ---- BO3 轮次管理 ----
    getBO3State() {
        return this.bo3State;
    }

    resetRound(): void {
        this.bo3State.phase = 'fighting';
        this.bo3State.reviveTimer = null;
    }

    recordWin(winner: 'player' | 'enemy'): { winner: 'player' | 'enemy'; isMatchOver: boolean; matchWinner: 'player' | 'enemy' | null } {
        this.bo3State.phase = `${winner}-won` as GamePhase;

        if (winner === 'player') {
            this.bo3State.playerWins++;
        } else {
            this.bo3State.enemyWins++;
        }

        // 检查是否三局两胜
        const isMatchOver = this.bo3State.playerWins >= 2 || this.bo3State.enemyWins >= 2;
        const matchWinner = isMatchOver
            ? (this.bo3State.playerWins >= 2 ? 'player' : 'enemy')
            : null;

        if (!isMatchOver) {
            this.bo3State.currentRound++;
        }

        return { winner, isMatchOver, matchWinner };
    }

    checkRevive(player: any, enemy: any, noticeEl: HTMLElement | null): void {
        // 检查玩家是否需要复活
        if (!player.isAlive && !this.bo3State.reviveTimer) {
            noticeEl?.classList.remove('hidden');
            this.bo3State.reviveTimer = setTimeout(() => {
                player.revive();
                noticeEl?.classList.add('hidden');
                this.bo3State.reviveTimer = null;
            }, 3000);
        }

        // 检查敌人是否需要复活
        if (!enemy.isAlive && !this.bo3State.reviveTimer) {
            this.bo3State.reviveTimer = setTimeout(() => {
                enemy.revive();
                this.bo3State.reviveTimer = null;
            }, 3000);
        }
    }
}
