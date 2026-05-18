console.log("Hello,王金强!冲刺大厂前端实习！！");

// 变量声明
let student_name = "王金强"; //字符串
const birth_year = 2004;     //数字
let is_studying = true;      //布尔值
let future_plan = null;      //null
let score;                   //undefined

console.log(typeof student_name,typeof birth_year,typeof is_studying);
console.log(`我叫${student_name},${birth_year}年出生,正在学习: ${is_studying}`);

let a = 10;
let b = 3;
console.log("加减乘除:",a+b,a-b,a*b,a/b);
console.log("取余:",a % b);
console.log("指数:",a**b);

// 比较运算符
console.log(a>b,a===10);

// 逻辑运算符
console.log(true && false,true || false,!true);

// Math对象
console.log(Math.floor(3.7));
console.log(Math.random());


function getGrade(score){
    if(typeof score != "number" || score < 0 || score > 100){
        return "无效分数";
    }
    if(score >= 90){
        return "优秀";
    } else if (score >= 80){
        return "良好";
    } else if (score >= 70){
        return "中等";
    } else if (score >= 60){
        return "及格";
    } else {
        return "不及格";
    }
} 

// 测试成绩
console.log(getGrade(95));
console.log(getGrade(85));
console.log(getGrade(75));

console.log("------九九乘法表------");
for(let i = 1;i <= 9;i++){
    let row = "";
    for(let j = 1; j <= i;j++){
        row += `${i} * ${j} = ${i*j}\t`;
    }
    console.log(row)
}



const socres = [88, 92, 74, 60, 55, 45, 81];
console.log("------学生成绩单------");
socres.forEach((score,index) => {
    console.log(`学生${index+1}:分数:${score},等级${getGrade(score)}`);
});


