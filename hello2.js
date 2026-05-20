// 顿帧系统
let isHitstop = false; // 是否处于顿帧状态

const player = document.getElementById('player'); // 获取玩家元素

// X轴相关变量
let playerX = 100; // 玩家初始水平位置
let playerSpeed = 5; // 玩家水平移动速度
let isright = false; 
let isleft = false;
let playerDirection = 1; // 玩家初始面向方向

// Y轴相关变量
let playerY = 0; // 玩家初始垂直位置
let velocityY = 0; // 玩家垂直速度
const gravity = 0.3; // 重力加速度
let jumpStrength = 12; // 跳跃强度
let isJumping = false; // 跳跃状态

// 攻击状态
let isAttacking = false; // 攻击状态
const attackDuration = 300; // 攻击持续时间（毫秒）


document.addEventListener('keydown', (event) => {
   
    if (event.key === 'd') { // 按下右箭头键
        isright = true;
        playerDirection = 1; // 设置玩家面向右边
    }
    if(event.key === 'a') { // 按下左箭头键
        isleft = true;
        playerDirection = -1; // 设置玩家面向左边
    }

    if(event.key === ' ') { // 按下空格键
        // 执行跳跃动作
        if(!isJumping){ // 只有在未跳跃状态下才能跳跃
            velocityY = jumpStrength; // 设置垂直速度为跳跃强度
            isJumping = true; // 设置跳跃状态为true
        }
    }

    if(event.key === 'j') { // 按下J键
        // 执行攻击动作
        if(!isAttacking){ // 只有在未攻击状态下才能攻击
            isAttacking = true; // 设置攻击状态为true
            player.classList.add('attacking'); // 添加攻击状态的样式类

            setTimeout(() => {
                isAttacking = false; // 重置攻击状态
                player.classList.remove('attacking'); // 移除攻击状态的样式类
                hasHitInThisAttack = false; // 重置攻击命中标记
            }, attackDuration); // 在攻击持续时间后重置攻击状态
        }
    }
});

document.addEventListener('keyup', (event) => {
    if (event.key === 'd') { // 松开右箭头键
        isright = false;
    }
    if(event.key === 'a') { // 松开左箭头键
        isleft = false;
    }
});

const enemy = document.getElementById('enemy'); // 获取敌人元素

let enemyX = 600; // 敌人初始水平位置

let hasHitInThisAttack = false; // 记录当前攻击周期内是否已经命中敌人

// 敌人状态
let enemyHealth = 100; // 敌人初始生命值
const enemyMaxHealth = 100; // 敌人最大生命值

const enemyhealthfill = document.getElementById('enemy-health-fill'); // 获取敌人生命值填充元素

// 敌人击退物理系统
let enemyVelocityX = 0; // 敌人水平速度
const knockbackStrength = 5;
const fricion = 0.8; // 击退后的摩擦力

//敌人AI系统
const enemySpeed = 2; // 敌人移动速度
const enemyDetectionRange = 400; // 敌人检测范围
const enemyAttackRange = 50; // 敌人攻击范围
let enemyState = 'idle'; // 敌人状态：idle（闲置）、chasing（追逐）、attacking（攻击）
let enemylive = true; // 敌人是否存活

function checkAttackCollision() {
    if (!enemylive) return; // 如果敌人已经死亡，跳过碰撞检测
    // 简单的碰撞检测逻辑，判断玩家和敌人是否在攻击范围内
    if (!isAttacking || hasHitInThisAttack) {
        
        return;
    }

    // 定义玩家的碰撞范围
    let playerLeft = playerX;
    let playerRight = playerX + 60; // 假设玩家宽度为60px
    let playerTop = playerY + 80;
    let playerBottom = playerY ;

    // 定义敌人的碰撞范围
    let enemyLeft = enemyX;
    let enemyRight = enemyX + 50;
    let enemyTop = 0;
    let enemyBottom = 80;

    // 定义攻击范围，假设攻击范围是玩家前方的一小块区域
    let attackRangeLeft, attackRangeRight;
    if (playerDirection === 1) { // 面向右边
        attackRangeLeft = playerRight + 40;
        attackRangeRight = playerRight + 50; // 攻击范围向右延伸50px
    } else { // 面向左边
        attackRangeLeft = playerLeft - 50; // 攻击范围向左延伸50px
        attackRangeRight = playerLeft -40;
    }

    // 检测攻击范围与敌人碰撞
    let isColliding = !(attackRangeRight < enemyLeft || attackRangeLeft > enemyRight || playerBottom < enemyTop || playerTop > enemyBottom);
    

    if (isColliding) {
        
        console.log("攻击命中敌人！");
        // 这里可以添加敌人受伤的逻辑，例如减少敌人生命值等
        hasHitInThisAttack = true; // 标记当前攻击周期内已经命中敌人
        enemy.classList.add('hit'); // 攻击命中时改变敌人颜色

        const stage = document.getElementById('stage'); // 获取舞台元素
        stage.classList.remove('shake'); // 确保之前的顿帧效果被移除
        void stage.offsetWidth; // 强制浏览器重新计算样式，确保顿帧效果能够正确应用
        stage.classList.add('shake'); // 添加顿帧效果的样式类

        // 顿帧效果
        isHitstop = true; // 进入顿帧状态
        setTimeout(() => {  
            isHitstop = false; // 结束顿帧状态
        }, 60); // 顿帧持续时间（60毫秒）
        enemyHealth -= 25; // 减少敌人生命值

        // 更新敌人生命值显示
        let healthPercentage = (enemyHealth / enemyMaxHealth) * 100;
        enemyhealthfill.style.width = healthPercentage + '%';

        // 添加击退效果
        if (playerX < enemyX) {
            enemyVelocityX = knockbackStrength; // 向右击退
        } else {
            enemyVelocityX = -knockbackStrength; // 向左击退
        }

        // 玩家也会受到一定的反作用力，简单实现为玩家向相反方向移动
        if (playerX < enemyX) {
            playerX -= knockbackStrength / 2; // 玩家向左移动
        } else {
            playerX += knockbackStrength / 2; // 玩家向右移动
        }
        setTimeout(() => {
            enemy.classList.remove('hit'); // 恢复敌人颜色
        }, 200); // 200毫秒后恢复敌人颜色


        if (enemyHealth < 0) {
            enemyHealth = 0; // 确保生命值不会变成负数
           
        }

        // 死亡检测
        if (enemyHealth === 0) {
            console.log("敌人被击败了！");
            // 这里可以添加敌人死亡的逻辑，例如移除敌人元素等
            enemy.style.display = 'none'; // 隐藏敌人元素
            enemylive = false; // 标记敌人已死亡
        }

    }
}

function gameLoop(){
    
    if(isHitstop){
        requestAnimationFrame(gameLoop); // 继续循环调用游戏主循环
        return; // 如果处于顿帧状态，跳过本次游戏循环
    }

    if(playerDirection === 1){
        player.classList.remove('face-left');
        player.classList.add('face-right');
    }else{
        player.classList.remove('face-right');
        player.classList.add('face-left');
    }


    if(isright){
        playerX += playerSpeed; // 向右移动玩家
    }
    if(isleft){
        playerX -= playerSpeed; // 向左移动玩家
    }
    
    
    if(playerX <= 0 ) playerX = 0; // 限制玩家在舞台内移动
    if(playerX >= 740) playerX = 740; // 限制玩家在舞台内移动\
    player.style.left = playerX + 'px'; // 更新玩家元素的水平位置

    // 更新玩家的垂直位置
    if(isJumping){
        velocityY -= gravity; // 受重力影响，垂直速度逐渐减少
        playerY += velocityY; // 更新垂直位置
        
        if(playerY <= 0){ // 当玩家落地时
            playerY = 0;
            velocityY = 0; // 重置垂直速度
            isJumping = false; // 重置跳跃状态
        }
        player.style.bottom = playerY + 'px'; // 更新玩家元素的垂直位置
    }
    
    
    checkAttackCollision(); // 在游戏循环中检查攻击碰撞
    
    // 实时演算敌人位置
    if( enemyVelocityX !== 0){
        enemyX += enemyVelocityX; // 更新敌人水平位置
        enemyVelocityX *= fricion; // 应用摩擦力逐渐减慢敌人速度

        if(Math.abs(enemyVelocityX) < 0.1){ // 当速度非常小时，停止敌人移动
            enemyVelocityX = 0;
        }

        if(enemyX <= 0) enemyX = 0; // 限制敌人在舞台内移动
        if(enemyX >= 750) enemyX = 750; // 限制敌人在舞台内移动

        enemy.style.left = enemyX + 'px'; // 更新敌人元素的水平位置
    
    }else{
        let distanceToPlayer = Math.abs(enemyX - playerX); // 计算敌人和玩家之间的距离

        

        // 先统一判断：玩家离得太远 → 直接回到闲置
        if (distanceToPlayer > enemyDetectionRange) {
            enemyState = 'idle';
        } 
        // 玩家在检测范围内
        else {
        // 在攻击范围内 → 攻击
            if (distanceToPlayer < enemyAttackRange) {
                enemyState = 'attacking';
            } 
        // 在检测范围，但不在攻击范围 → 追逐
            else {
                enemyState = 'chasing';
            }    
        }
    }

    // 根据最终状态执行行为
    if (enemyState === 'chasing') {
    // 向玩家移动
        if (enemyX < playerX) {
            enemyX += enemySpeed;
        } else {
            enemyX -= enemySpeed;
        }
        enemy.style.left = enemyX + 'px';
    }

    // 攻击状态你可以在这里加攻击逻辑
    if (enemyState === 'attacking') {
        enemyAttack(); // 执行敌人攻击函数
    }
        
   

    requestAnimationFrame(gameLoop); // 循环调用游戏主循环

}
gameLoop(); // 启动游戏主循环


function enemyAttack(){
    isEnemyAttacking = true; // 设置敌人攻击状态
    enemy.classList.add('attacking'); // 添加敌人攻击状态的样式类

    
    setTimeout(() => {
        isEnemyAttacking = false; // 重置敌人攻击状态
        enemy.classList.remove('attacking'); // 移除敌人攻击状态的样式类
    }, 200); // 在攻击持续时间后重置敌人攻击状态 
}