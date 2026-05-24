# 格斗游戏 - TypeScript + Vite 重构版

> **版本**：v2.0 | **技术栈**：TypeScript + Vite + 原生 DOM 渲染 | **状态**：✅ 可运行（需先 `npm install`）

## 🎮 在线体验

（部署后添加链接）

## 📋 项目简介

这是**同一款格斗游戏**的 TypeScript 重构版。

在原版 JavaScript 实现的基础上，使用 **TypeScript + Vite** 进行了完整重构，新增了 **BO3 三局两胜制**，并实现了**完整的类型标注**。

**与 v1 的主要区别：**

| 特性 | v1（JavaScript） | v2（TypeScript） |
|------|-----------------|-------------------|
| **类型系统** | ❌ 无类型标注 | ✅ 完整 TypeScript 类型 |
| **构建工具** | ❌ 无（直接打开 HTML） | ✅ Vite（HMR + 构建） |
| **BO3 赛制** | ❌ 单局 | ✅ 三局两胜 |
| **UI** | ❌ 仅敌人血条 | ✅ 双方对称血条 + BO3 计分板 |
| **复活机制** | ✅ 5 秒 | ✅ 3 秒 + 复活提示 |
| **代码组织** | 单文件（~400 行） | 模块化（5 个文件） |

## ✨ 核心特性

| 特性 | 实现方式 | 技术亮点 |
|------|---------|---------|
| **AABB 碰撞检测** | 轴对齐包围盒 | 精确攻击判定，支持击退物理 |
| **击退物理系统** | 速度 + 摩擦系数 | 自然的运动衰减（`v *= friction`） |
| **顿帧打击感** | `setTimeout` 暂停渲染 | 经典格斗游戏技巧（街霸、拳皇） |
| **屏幕震动** | CSS `offsetWidth` 强制回流 | 重播 CSS 动画的技巧 |
| **AI 状态机** | `idle / chasing / attacking` 三状态 | 距离驱动的行为切换 |
| **BO3 三局两胜** | Game 类管理轮次 | 参考格斗游戏竞技规则 |
| **TypeScript 类型** | 接口 + 类型别名 | `FighterConfig`、`InputState`、`AIState` |
| **模块化架构** | ES6 模块 | `Fighter.ts` / `EnemyFighter.ts` / `Game.ts` / `main.ts` |

## 🎯 操作说明

| 按键 | 功能 |
|------|------|
| **A** | 向左移动 |
| **D** | 向右移动 |
| **空格** | 跳跃 |
| **J** | 攻击 |

## 🏗 架构设计

### 三层分治架构

```
Game（游戏世界）              Fighter（通用角色）
├── isPaused()               ├── update(input)
├── hitstop(ms)              ├── attack()
├── shake()                  ├── canHit(target)
└── BO3 轮次管理            ├── takeDamage(amount, attacker)
           ├── jump()
EnemyFighter extends Fighter ├── die()
├── updateAI(target)         ├── faceToward(target)
├── _chase(target)           └── 内部辅助方法
└── _attackAI(target)
```

### 最终 gameLoop（9 行纯调度）

```typescript
function gameLoop(): void {
    requestAnimationFrame(gameLoop);

    if (game.isPaused()) return;

    player.update(input);
    if (player.canHit(enemy)) { /* 伤害 + 舞台效果 */ }
    enemy.updateAI(player);
    game.checkRevive(player, enemy, reviveNoticeEl);
}
```

**设计理念：** gameLoop 应该像「故事大纲」而不是「配方步骤」——每行读出来就是一句话："玩家更新，检查攻击，敌人 AI"。

## 📁 文件结构

```
v2-typescript/
├── package.json           ← 项目配置（Vite + TypeScript）
├── tsconfig.json          ← TypeScript 编译配置
├── vite.config.ts        ← Vite 构建配置
├── index.html            ← 入口 HTML（含 BO3 计分板）
└── src/
    ├── types.ts          ← 共享类型定义
    ├── Fighter.ts        ← 角色基类（完整类型标注）
    ├── EnemyFighter.ts   ← 子类（AI 状态机）
    ├── Game.ts           ← 舞台管理器（震动/顿帧/BO3）
    ├── main.ts           ← 入口 + gameLoop + BO3 逻辑
    └── style.css         ← 完整样式（对称血条 + 中文面板）
```

## 🚀 本地运行

### 1. 安装依赖

```bash
cd v2-typescript
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

浏览器打开 `http://localhost:5173` 即可游戏。

### 3. 构建生产版本

```bash
npm run build
```

生成 `dist/` 文件夹，可部署到 Vercel、Netlify 等平台。

## 💎 技术亮点解析

### 1. TypeScript 类型标注

```typescript
// types.ts - 共享类型定义
export interface FighterConfig {
    maxHealth?: number;
    speed?: number;
    jumpStrength?: number;
    attackDuration?: number;
    // ...
}

export type AIState = 'idle' | 'chasing' | 'attacking';
```

**面试时可以这样说：**
> "我用 TypeScript 重构了整个项目，定义了 `FighterConfig`、`InputState`、`AIState` 等接口，确保每个属性都有类型标注，避免运行时错误。"

### 2. 顿帧系统（Hitstop）

```typescript
// Game 类
hitstop(ms: number): void {
    this._hitstop = true;
    setTimeout(() => { this._hitstop = false; }, ms);
}

// gameLoop 中
if (game.isPaused()) return;  // 顿帧期间跳过渲染
```

**原理：** 顿帧是格斗游戏的经典技巧——攻击命中时暂停渲染几帧，给玩家"重量感"。

### 3. 屏幕震动（强制回流技巧）

```typescript
// Game 类
shake(): void {
    this.stage.classList.remove('shake');
    void this.stage.offsetWidth;  // ← 强制回流！
    this.stage.classList.add('shake');
}
```

**原理：** 移除再添加同名 CSS 动画不会重播，因为浏览器优化了。读取 `offsetWidth` 强制浏览器重新计算布局（回流），动画就能重播。

### 4. BO3 三局两胜制

```typescript
// Game 类
recordWin(winner: 'player' | 'enemy'): {
    winner: 'player' | 'enemy';
    isMatchOver: boolean;
    matchWinner: 'player' | 'enemy' | null;
} {
    if (winner === 'player') { this.bo3State.playerWins++; }
    else { this.bo3State.enemyWins++; }

    const isMatchOver = this.bo3State.playerWins >= 2 || this.bo3State.enemyWins >= 2;
    // ...
}
```

**设计思路：** 参考格斗游戏（街霸、拳皇）的竞技规则，增加游戏的可玩性和竞技感。

## 📚 学习资源

- **TypeScript 官方文档**：[https://www.typescriptlang.org/docs/](https://www.typescriptlang.org/docs/)
- **Vite 官方文档**：[https://vitejs.dev/](https://vitejs.dev/)
- **MDN Web Docs**：[https://developer.mozilla.org/](https://developer.mozilla.org/)

## 📝 版本历史

| 版本 | 日期 | 说明 |
|------|------|------|
| v1.0 | 2026-05 | 初始版本，原生 JS 实现 |
| v2.0 | 2026-05 | TypeScript + Vite 重构，新增 BO3 赛制 |

## 📄 许可证

MIT License —— 可自由使用、修改、分发。

---

**作者**：王金强  
**联系方式**：1565722725@qq.com  
**GitHub**：[https://github.com/wjq0407](https://github.com/wjq0407)
