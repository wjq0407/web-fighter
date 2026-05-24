// ============================================================
// 共享类型定义（TypeScript 重构版）
// ============================================================

// 输入状态（玩家键盘输入）
export interface InputState {
    right: boolean;
    left: boolean;
}

// Fighter 配置（构造函数参数）
export interface FighterConfig {
    maxHealth?: number;
    speed?: number;
    jumpStrength?: number;
    attackDuration?: number;
    knockbackStrength?: number;
    friction?: number;
    maxX?: number;
    bodyWidth?: number;
    bodyHeight?: number;
    attackReach?: number;
    attackBoxWidth?: number;
    healthFillEl?: HTMLElement | null;
}

// 敌人 AI 状态
export type AIState = 'idle' | 'chasing' | 'attacking';

// 游戏阶段
export type GamePhase = 'fighting' | 'player-won' | 'enemy-won' | 'draw';
