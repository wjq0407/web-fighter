// ============================================================
// 第5步重构：终局 —— Game 类 + 纯调度层 gameLoop
// ============================================================
// 最后一步的核心理念：
//   gameLoop 应该像「故事大纲」而不是「配方步骤」——
//   每行读出来就是一句话："玩家更新，检查攻击，敌人 AI"
//
// 这一步封装的是「游戏级效果」——震动、顿帧不属于任何角色，
// 它们是游戏世界本身的行为，应该由一个 Game 对象管理。
// ============================================================

// ============================================================
// Fighter 基类（步骤1-3沉淀，步骤4精简掉AI属性，最终稳定版）
// ============================================================
class Fighter {
    constructor(id, startX, config = {}) {
        this.el = document.getElementById(id);

        // 位置与运动
        this.x = startX;
        this.y = 0;
        this.vy = 0;
        this.vx = 0;
        this.direction = 1;

        // 生命与状态
        this.health = config.maxHealth || 100;
        this.maxHealth = config.maxHealth || 100;
        this.isAlive = true;
        this.isJumping = false;
        this.isAttacking = false;
        this.hasHitInThisAttack = false;

        // 物理常量
        this.speed = config.speed || 5;
        this.gravity = 0.3;
        this.jumpStrength = 12;
        this.attackDuration = config.attackDuration || 300;
        this.knockbackStrength = 5;
        this.friction = 0.8;
        this.maxX = config.maxX || 740;

        // 攻击碰撞体
        this.bodyWidth = config.bodyWidth || 50;
        this.bodyHeight = config.bodyHeight || 80;
        this.attackReach = config.attackReach || 50;
        this.attackBoxWidth = config.attackBoxWidth || 10;

        // 血条 DOM
        this.healthFill = config.healthFillEl || null;
    }

    // --- 每帧更新 ---
    update(input = {}) {
        this._renderDirection();
        this._moveHorizontal(input);
        this._applyJumpPhysics();
        this._syncPosition();
        this._applyKnockback();
    }

    // --- 攻击管线 ---
    attack() {
        if (this.isAttacking || !this.isAlive) return;
        this.isAttacking = true;
        this.hasHitInThisAttack = false;
        this.el.classList.add('attacking');
        setTimeout(() => {
            this.isAttacking = false;
            this.el.classList.remove('attacking');
        }, this.attackDuration);
    }

    canHit(target) {
        if (!this.isAttacking) return false;
        if (this.hasHitInThisAttack) return false;
        if (!target.isAlive) return false;

        const myRight = this.x + this.bodyWidth;
        const myLeft  = this.x;

        let attackLeft, attackRight;
        if (this.direction === 1) {
            attackLeft  = myRight + (this.attackReach - this.attackBoxWidth);
            attackRight = myRight + this.attackReach;
        } else {
            attackLeft  = myLeft - this.attackReach;
            attackRight = myLeft - (this.attackReach - this.attackBoxWidth);
        }

        const targetLeft  = target.x;
        const targetRight = target.x + target.bodyWidth;
        const targetTop   = target.y + target.bodyHeight;
        const targetBottom = target.y;

        const isColliding = !(
            attackRight  < targetLeft  ||
            attackLeft   > targetRight ||
            targetTop    < targetBottom ||
            targetBottom > targetTop
        );

        if (isColliding) {
            this.hasHitInThisAttack = true;
            console.log(this.el.id + ' 攻击命中 ' + target.el.id + '！');
        }
        return isColliding;
    }

    takeDamage(amount, attacker) {
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

    die() {
        console.log(this.el.id + ' 被击败了！');
        this.isAlive = false;
        this.isAttacking = false;
        this.el.style.display = 'none';

        // 5秒后自动复活
        this._reviveTimer = setTimeout(() => {
            this.revive();
        }, 5000);
    }

    revive() {
        console.log(this.el.id + ' 复活了！');
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

    _updateHealthUI() {
        if (!this.healthFill) return;
        const pct = (this.health / this.maxHealth) * 100;
        this.healthFill.style.width = pct + '%';
    }

    // --- 移动方法 ---
    _renderDirection() {
        if (this.direction === 1) {
            this.el.classList.remove('face-left');
            this.el.classList.add('face-right');
        } else {
            this.el.classList.remove('face-right');
            this.el.classList.add('face-left');
        }
    }

    _moveHorizontal(input) {
        if (input.right) this.x += this.speed;
        if (input.left)  this.x -= this.speed;
        this._clampX();
    }

    _clampX() {
        if (this.x <= 0) this.x = 0;
        if (this.x >= this.maxX) this.x = this.maxX;
    }

    _applyJumpPhysics() {
        if (!this.isJumping) return;
        this.vy -= this.gravity;
        this.y += this.vy;
        if (this.y <= 0 ) { this.y = 0; this.vy = 0; this.isJumping = false; }
    }

    _applyKnockback() {
        if (this.vx === 0) return;
        this.x += this.vx;
        this.vx *= this.friction;
        if (Math.abs(this.vx) < 0.1) this.vx = 0;
        this._clampX();
    }

    _syncPosition() {
        this.el.style.left = this.x + 'px';
        if (this.isJumping || this.y >= 0) {
            this.el.style.bottom = this.y + 'px';
        }
    }

    // --- 便捷方法 ---
    jump() {
        if (!this.isJumping) {
            this.vy = this.jumpStrength;
            this.isJumping = true;
        }
    }

    faceToward(target) {
        this.direction = (target.x > this.x) ? 1 : -1;
    }
}

// ============================================================
// EnemyFighter 子类（步骤4沉淀，最终稳定版）
// ============================================================
class EnemyFighter extends Fighter {
    constructor(id, startX, config = {}) {
        super(id, startX, config);

        this.state = config.state || 'idle';
        this.detectionRange = config.detectionRange || 400;
        this.attackRange = config.attackRange || 50;
        this.hitRecoveryFrames = 0;
    }

    updateAI(target) {
        if (!this.isAlive || !target.isAlive) return;

        if (this.hitRecoveryFrames > 0) {
            this.hitRecoveryFrames--;
            this.update({});
            return;
        }

        if (this.vx !== 0) {
            this.update({});
            if (this.vx === 0) this.hitRecoveryFrames = 10;
            return;
        }

        const dist = Math.abs(this.x - target.x);

        if (dist > this.detectionRange) {
            this.state = 'idle';
        } else if (dist < this.attackRange) {
            this.state = 'attacking';
        } else {
            this.state = 'chasing';
        }

        if (this.state === 'chasing') this._chase(target);
        if (this.state === 'attacking') this._attackAI(target);

        this._renderDirection();
    }

    _chase(target) {
        this.faceToward(target);
        if (this.x < target.x) this.x += this.speed;
        else this.x -= this.speed;
        this._clampX();
        this.el.style.left = this.x + 'px';
    }

    _attackAI(target) {
        this.faceToward(target);
        this.attack();
    }
}

// ============================================================
// ★ 第5步核心新增：Game 类 —— 管理游戏世界本身的行为
//
// 设计思路：
//   震动和顿帧是"舞台效果"，不属于任何角色。
//   就像电影院的灯光、音响属于电影院，不属于演员。
//
//   面试时这样说：
//   "Game 类是游戏世界的管理者，封装了帧级别的舞台效果。
//   这样做的好处是 gameLoop 变成纯调度层，不操心效果细节。
//   未来加新效果（慢动作、画面闪烁）只需给 Game 加方法。"
// ============================================================
class Game {
    constructor(stageEl) {
        this.stage = stageEl;
        this._hitstop = false;
    }

    // 当前是否处于顿帧暂停中
    isPaused() {
        return this._hitstop;
    }

    // 顿帧：画面暂停 ms 毫秒（给打击感）
    hitstop(ms) {
        this._hitstop = true;
        setTimeout(() => { this._hitstop = false; }, ms);
    }

    // 屏幕震动（强制回流以触发 CSS 动画重播）
    shake() {
        // 经典技巧：先移除 → 读 offsetWidth 强制回流 → 再加回，这样 CSS 动画每次都能重播
        this.stage.classList.remove('shake');
        void this.stage.offsetWidth;
        this.stage.classList.add('shake');
    }
}

// ============================================================
// 创建实例
// ============================================================
const game = new Game(document.getElementById('stage'));

const player = new Fighter('player', 100, {
    bodyWidth: 60,
    attackDuration: 300
});

const enemyHealthBar = document.getElementById('enemy-health-fill');

const enemy = new EnemyFighter('enemy', 600, {
    speed: 2,
    maxX: 750,
    bodyWidth: 50,
    attackDuration: 200,
    healthFillEl: enemyHealthBar,
    detectionRange: 400,
    attackRange: 50
});

// ============================================================
// 输入状态
// ============================================================
let isRight = false;
let isLeft = false;

document.addEventListener('keydown', (event) => {
    if (event.key === 'd') { isRight = true; player.direction = 1; }
    if (event.key === 'a') { isLeft = true; player.direction = -1; }
    if (event.key === ' ')   player.jump();
    if (event.key === 'j')   player.attack();
});

document.addEventListener('keyup', (event) => {
    if (event.key === 'd') isRight = false;
    if (event.key === 'a') isLeft  = false;
});

// ============================================================
// ★ 终局级 gameLoop —— 纯调度层
//
// 五步重构后，gameLoop 从 ~60 行过程式代码变成了一个只有 5 个职责的故事：
//
//   1. 如果游戏暂停 → 跳过本帧
//   2. 玩家更新
//   3. 检查玩家攻击是否命中敌人 → 伤害 + 后坐力 + 舞台效果
//   4. 敌人 AI 更新
//   5. 请求下一帧
//
// 每行都是"声明意图"而不是"描述步骤"。
// 读起来像伪代码，跑起来像游戏。
// ============================================================
function gameLoop() {
    requestAnimationFrame(gameLoop);

    if (game.isPaused()) return;

    player.update({ right: isRight, left: isLeft });

    if (player.canHit(enemy)) {
        enemy.takeDamage(25, player);
        player.vx -= player.knockbackStrength * player.direction * 0.5;
        game.shake();
        game.hitstop(60);
    }

    enemy.updateAI(player);
}

gameLoop();

// ============================================================
// 五步重构完成。最终代码结构：
//
//   Game（游戏世界）              Fighter（通用角色）
//   ├── isPaused()               ├── update(input)
//   ├── hitstop(ms)              ├── attack()
//   ├── shake()                  ├── canHit(target)
//                                ├── takeDamage(amount, attacker)
//   EnemyFighter extends Fighter ├── jump()
//   ├── updateAI(target)         ├── die()
//   ├── _chase(target)           ├── faceToward(target)
//   └── _attackAI(target)        └── 内部辅助方法
//
//   gameLoop（纯调度，9行）
//
// 面向对象四大原则在此代码中的体现：
//
//   1. 封装 —— Fighter 管理自己的移动、攻击、生命，外部只调方法
//   2. 继承 —— EnemyFighter 复用 Fighter 全部能力，只加 AI 行为
//   3. 多态 —— 可以 new BossFighter() 重写 updateAI()，gameLoop 不动
//   4. 单一职责 —— Game 管舞台效果，Fighter 管角色行为，gameLoop 管调度
// ============================================================
