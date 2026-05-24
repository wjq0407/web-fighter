# 格斗游戏（Web Fighter）

> 用原生 JavaScript 和 TypeScript 实现的 2D 格斗游戏，从零开始，不依赖任何游戏引擎。

[![JavaScript Version](https://img.shields.io/badge/JavaScript-v1.0-e94560?logo=javascript)](./v1-javascript/)
[![TypeScript Version](https://img.shields.io/badge/TypeScript-v2.0-0f3460?logo=typescript)](./v2-typescript/)

---

## 🎮 在线体验

- **v1（JavaScript 版）**：（部署后添加链接）
- **v2（TypeScript 版）**：（部署后添加链接）

---

## 📁 项目结构

```
web-fighter/
├── README.md                    ← 本文件
├── v1-javascript/              ← 第一版：原生 JS + 复活机制
│   ├── index.html
│   ├── game.js
│   └── README.md
└── v2-typescript/              ← 第二版：TypeScript + Vite 重构版
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    ├── index.html
    ├── src/
    │   ├── types.ts
    │   ├── Fighter.ts
    │   ├── EnemyFighter.ts
    │   ├── Game.ts
    │   ├── main.ts
    │   └── style.css
    └── README.md
```

---

## ✨ 核心特性

| 特性 | 实现方式 | 技术亮点 |
|------|---------|---------|
| **AABB 碰撞检测** | 轴对齐包围盒 | 精确攻击判定，支持击退物理 |
| **击退物理系统** | 速度 + 摩擦系数 | 自然的运动衰减（`v *= friction`） |
| **顿帧打击感** | `setTimeout` 暂停渲染 | 经典格斗游戏技巧（街霸、拳皇） |
| **屏幕震动** | CSS `offsetWidth` 强制回流 | 重播 CSS 动画的技巧 |
| **AI 状态机** | `idle / chasing / attacking` 三状态 | 距离驱动的行为切换 |
| **复活机制** | `setTimeout` 预约复活 | 修复了 `setInterval` 返回值的经典 bug |
| **面向对象架构** | ES6 Class + 继承 | `Fighter` 基类 → `EnemyFighter` 子类 |
| **BO3 三局两胜** | Game 类管理轮次 | 参考格斗游戏竞技规则（v2 新增） |
| **TypeScript 类型** | 接口 + 类型别名 | `FighterConfig`、`InputState`、`AIState`（v2 新增） |
| **模块化架构** | ES6 模块 | Vite 构建，HMR 热更新（v2 新增） |

---

## 🎯 操作说明

| 按键 | 功能 |
|------|------|
| **A** | 向左移动 |
| **D** | 向右移动 |
| **空格** | 跳跃 |
| **J** | 攻击 |

---

## 🏗️ 架构演进（五步重构）

本项目是作者**学习面向对象编程（OOP）的实战记录**——从过程式代码出发，经历五步重构，最终实现了模块化的类架构。

### 第 1 步：Fighter 类骨架
- **变化**：15+ 个全局变量 → 实例属性
- **原理**：原型链、`new` 关键字四步流程、`this` 绑定规则

### 第 2 步：移动逻辑封装
- **变化**：`gameLoop` 从 25 行 → 1 行（`player.update(input)`）
- **原理**：封装三要素（数据 + 方法 + 访问控制）

### 第 3 步：攻击管线封装
- **变化**：删除 3 个全局函数（`checkAttackHit`、`applyDamage`、`resetAttack`）
- **原理**：单一职责原则（SRP）

### 第 4 步：EnemyFighter 继承
- **变化**：AI 代码从 35 行 → 1 行（`enemy.updateAI(player)`）
- **原理**：继承、`super()`、原型链查找规则

### 第 5 步：Game 类 + 纯调度层
- **变化**：`gameLoop` 最终 **9 行纯调度**
- **原理**：三层分治架构（Game → gameLoop → Fighter/EnemyFighter）

---

## 🚀 快速开始

### v1（JavaScript 版）

1. 下载 `v1-javascript/` 文件夹
2. 用浏览器打开 `index.html`
3. 开始游戏！

（无需服务器，无需构建，双击即用）

### v2（TypeScript 版）

1. 进入 `v2-typescript/` 文件夹
2. 安装依赖：
   ```bash
   cd v2-typescript
   npm install
   ```
3. 启动开发服务器：
   ```bash
   npm run dev
   ```
4. 浏览器打开 `http://localhost:5173` 即可游戏

---

## 💎 技术亮点解析

### 1. 顿帧系统（Hitstop）

```javascript
// Game 类
hitstop(ms) {
    this._hitstop = true;
    setTimeout(() => { this._hitstop = false; }, ms);
}

// gameLoop 中
if (game.isPaused()) return;  // 顿帧期间跳过渲染
```

**原理**：顿帧是格斗游戏的经典技巧——攻击命中时暂停渲染几帧，给玩家"重量感"。

### 2. 屏幕震动（强制回流技巧）

```javascript
// Game 类
shake() {
    this.stage.classList.remove('shake');
    void this.stage.offsetWidth;  // ← 强制回流！
    this.stage.classList.add('shake');
}
```

**原理**：移除再添加同名 CSS 动画不会重播，因为浏览器优化了。读取 `offsetWidth` 强制浏览器重新计算布局（回流），动画就能重播。

### 3. 复活机制的 bug 修复

**原 bug**：
```javascript
// 错误写法
if (game.Time(5) <= 0) { /* 复活 */ }
```

**问题**：`setInterval` 返回计时器 ID（正整数），永远 > 0，条件永远为假。

**修复**：
```javascript
// 正确写法
this._reviveTimer = setTimeout(() => {
    this.revive();
}, 5000);
```

**原理**：`setTimeout` 在指定时间后**单次执行**回调函数，适合"延迟执行一次"的场景。

---

## 📚 学习资源

- **MDN Web Docs**：[https://developer.mozilla.org/](https://developer.mozilla.org/)
- **JavaScript.info**：[https://javascript.info/](https://javascript.info/)
- **TypeScript 官方文档**：[https://www.typescriptlang.org/docs/](https://www.typescriptlang.org/docs/)
- **Vite 官方文档**：[https://vitejs.dev/](https://vitejs.dev/)

---

## 📝 版本历史

| 版本 | 日期 | 说明 |
|------|------|------|
| v1.0 | 2026-05 | 初始版本，原生 JS 实现 |
| v2.0 | 2026-05 | TypeScript + Vite 重构，新增 BO3 赛制 |

---

## 📄 许可证

MIT License —— 可自由使用、修改、分发。

---

**作者**：王金强  
**联系方式**：1565722725@qq.com  
**GitHub**：[https://github.com/wjq0407](https://github.com/wjq0407)
