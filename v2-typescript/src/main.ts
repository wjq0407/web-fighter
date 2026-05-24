// ===========================================================
// 入口文件（TypeScript 重构版）
// ===========================================================
// 新增功能：BO3 三局两胜制
// 面试时可以说："我给格斗游戏加了 BO3 赛制，参考了格斗游戏的竞技规则"
// ===========================================================

import Fighter from './Fighter';
import EnemyFighter from './EnemyFighter';
import Game from './Game';
import type { FighterConfig } from './types';

// ---- 创建游戏舞台 ----
const game = new Game(document.getElementById('stage')!);

// ---- 创建玩家 ----
const player: Fighter = new Fighter('player', 100, {
    maxHealth: 100,
    speed: 5,
    jumpStrength: 12,
    attackDuration: 300,
    knockbackStrength: 5,
    bodyWidth: 60,
    bodyHeight: 80,
    attackReach: 50,
    maxX: 740,
    healthFillEl: document.getElementById('player-health-fill'),
} as FighterConfig);

// ---- 创建敌人 ----
const enemy: EnemyFighter = new EnemyFighter('enemy', 600, {
    maxHealth: 100,
    speed: 2,
    jumpStrength: 10,
    attackDuration: 200,
    knockbackStrength: 5,
    bodyWidth: 50,
    bodyHeight: 80,
    attackReach: 50,
    maxX: 750,
    healthFillEl: document.getElementById('enemy-health-fill'),
    detectionRange: 400,
    attackRange: 50,
} as FighterConfig);

// ---- BO3 UI 元素 ----
const roundTitleEl = document.getElementById('round-title')!;
const playerScoreEl = document.getElementById('player-score')!;
const enemyScoreEl = document.getElementById('enemy-score')!;
const reviveNoticeEl = document.getElementById('revive-notice');

// ---- 输入状态 ----
let input: { right: boolean; left: boolean } = { right: false, left: false };

document.addEventListener('keydown', (event: KeyboardEvent) => {
    if (event.key === 'd') { input.right = true; player.direction = 1; }
    if (event.key === 'a') { input.left  = true; player.direction = -1; }
    if (event.key === ' ')   { event.preventDefault(); player.jump(); }
    if (event.key === 'j')   { player.attack(); }
});

document.addEventListener('keyup', (event: KeyboardEvent) => {
    if (event.key === 'd') input.right = false;
    if (event.key === 'a') input.left  = false;
});

// ---- 更新 BO3 UI ----
function updateBO3UI(): void {
    const state = game.getBO3State();
    roundTitleEl.textContent = `ROUND ${state.currentRound}`;
    playerScoreEl.textContent = String(state.playerWins);
    enemyScoreEl.textContent = String(state.enemyWins);
}

// ---- 检查回合结束 ----
function checkRoundEnd(): void {
    const state = game.getBO3State();
    if (state.phase === 'fighting') return;

    // 回合结束，3 秒后重置
    setTimeout(() => {
        player.health = player.maxHealth;
        enemy.health  = enemy.maxHealth;
        player.isAlive = true;
        enemy.isAlive   = true;
        player.el.style.display = 'block';
        enemy.el.style.display  = 'block';
        player.el.classList.remove('hit');
        enemy.el.classList.remove('hit');
        player._updateHealthUI();
        enemy._updateHealthUI();

        game.resetRound();
        updateBO3UI();
    }, 3000);
}

// ===========================================================
// ★ 终局级 gameLoop —— 纯调度层（9 行核心逻辑）
//
// 五步重构后，gameLoop 从 ~60 行过程式代码变成了一个只有 4 个职责的故事：
//
//   1. 如果游戏暂停 → 跳过本帧
//   2. 玩家更新
//   3. 检查玩家攻击是否命中敌人 → 伤害 + 后坐力 + 舞台效果
//   4. 敌人 AI 更新
//   5. 检查回合结束
//   6. 检查复活
//
// 每行都是"声明意图"而不是"描述步骤"。
// ===========================================================
function gameLoop(): void {
    requestAnimationFrame(gameLoop);

    if (game.isPaused()) return;

    // 1. 玩家更新
    player.update(input);

    // 2. 检查攻击命中
    if (player.canHit(enemy)) {
        enemy.takeDamage(25, player);
        player.vx -= player.knockbackStrength * player.direction * 0.5;
        game.shake();
        game.hitstop(60);
    }

    // 3. 敌人 AI 更新
    enemy.updateAI(player);

    // 4. 检查回合结束
    const state = game.getBO3State();
    if (state.phase === 'fighting') {
        if (!player.isAlive) {
            const result = game.recordWin('enemy');
            if (result.isMatchOver) {
                console.log(`比赛结束！${result.matchWinner} 获胜！`);
            }
            checkRoundEnd();
        } else if (!enemy.isAlive) {
            const result = game.recordWin('player');
            if (result.isMatchOver) {
                console.log(`比赛结束！${result.matchWinner} 获胜！`);
            }
            checkRoundEnd();
        }
    }

    // 5. 检查复活
    game.checkRevive(player, enemy, reviveNoticeEl);
}

// ---- 启动游戏 ----
gameLoop();
updateBO3UI();

console.log('格斗游戏 TS 版已启动！BO3 三局两胜制。');
