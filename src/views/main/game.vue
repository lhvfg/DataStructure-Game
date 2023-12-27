<script setup>
import { ref, reactive, computed } from 'vue'
import { useUserStore } from '../../store/store';
import { useRouter } from "vue-router";
import axios from "axios";
const router = useRouter();
const Request = axios.create({
    baseURL: 'api',
    timeout: 3000,
    withCredentials: true,
});
const store = useUserStore();
// 开始时间
const startTime = ref(0);
// 目前时间
const currentTime = ref(0);
// 计时器
const intervalId = ref();
// 行数、列数
const size = ref(9);
// 显示的数字个数
const N = ref(80);
// 记录添加的数字个数
const addCount = ref(0)
// 重新生成防止排队
var F = false;
// 记录当前是否在选数字状态
const clicking = ref(false)
// 记录是否悬浮
const hovering = ref(Array.from({ length: size.value }, () => Array(size.value).fill(0)))
// 记录一局有无结束
const end = ref(false)
// 记录错误数据
const wrong = ref(Array.from({ length: size.value }, () => Array(size.value).fill(0)))
// //row存储每行有的数字
// const row = ref([]);
// for (let i = 0; i < size.value + 1; i++) {
//     const tempArray = Array(size.value + 1).fill(0);
//     row.value.push(tempArray);
// }
// //line存储每列有的数字
// const line = ref([]);
// for (let i = 0; i < size.value + 1; i++) {
//     let tempArray = Array(size.value + 1).fill(0);
//     line.value.push(tempArray);
// }
// //box存储每个九宫格中有的数字
// const box = ref([]);
// for (let i = 0; i < size.value / 3; i++) {
//     let tempArray1 = [];
//     for (let j = 0; j < size.value / 3; j++) {
//         let tempArray2 = Array(size.value + 1).fill(0);
//         tempArray1.push(tempArray2);
//     }
//     box.value.push(tempArray1);
// }


// 存储数独数据
const sudoku = ref(Array.from({ length: size.value }, () => Array(size.value).fill(0)));

// 拷贝正确答案
const answer = ref(Array.from({ length: size.value }, () => Array(size.value).fill(0)));

// 存储显示的数字下标
const pos = ref(Array.from({ length: N.value }, () => Array(N.value).fill(0)))

// 存储对应位置的数字盘
const numpad = ref(Array.from({ length: size.value }, () => Array(size.value).fill(0)))

// 高亮的位置
const highlight = ref(Array.from({ length: size.value }, () => Array(size.value).fill(0)))

// 记录添加的数字位置
const addpos = ref(Array.from({ length: size.value }, () => Array(size.value).fill(0)))

// 记录胜利次数
const succeedNum = ref(0);

// 记录最快用时
const fastTime = ref(null);

// 侧边栏的变量
const isVertical = ref(false);
const showRestartPopup = ref(false);
const showTimePopup = ref(false);
const showWrenchPopup = ref(false);
const showEyePopup = ref(false);
const isPaused = ref(false);

// 检查指定的数字是否可以放置在指定的位置
function isValid(row, col, num) {
    // 检查行和列中是否已经存在该数字
    for (let i = 0; i < size.value; i++) {
        if ((sudoku.value[row][i] === num && i != col) || (sudoku.value[i][col] === num && i != row)) {
            return false;
        }
    }
    return handleGrid(row, col, num, 0);
}

// 处理九宫格
function handleGrid(row, col, num, type) {
    // 计算九宫格的起始位置
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;

    // 检查九宫格中是否已经存在该数字
    for (let i = startRow; i < startRow + 3; i++) {
        for (let j = startCol; j < startCol + 3; j++) {
            if (sudoku.value[i][j] === num) {
                if (i != row && j != col) {
                    if (type == 0)
                        return false;
                    else {
                        if (pos.value[i][j] == 1 || addpos.value[i][j] == 1) {
                            wrong.value[i][j] = 1;
                            if (wrong.value[row][col] == 0)
                                wrong.value[row][col] = 1;
                        }
                    }
                }
            }
        }
    }
    if (type == 0)
        return true;
}

// 产生数据变量预处理
function generate() {
    // 防止排队
    if (F) {
        alert("点太快了！")
        return;
    }
    // 结束标志重置
    end.value = false;
    // 重置数组
    deepClear();
    // 重新随机产生N个显示数字的位置
    for (let i = 0; i < N.value; i++) {
        let x = Math.floor(Math.random() * size.value);
        let y = Math.floor(Math.random() * size.value);
        if (pos.value[x][y] == 1) {
            i--;
            continue;
        }
        pos.value[x][y] = 1;
    }
    // 生成新数据
    generateSudoku();
    // 重置时钟
    startTime.value = Date.now();
    //
    showWrenchPopup.value = false;
    // 拷贝正确答案
    copyArray(answer, sudoku);
}
// 拷贝数组
function copyArray(x, y) {
    for (let i = 0; i < size.value; i++) {
        for (let j = 0; j < size.value; j++) {
            x.value[i][j] = y.value[i][j];
        }
    }

}

// 重置所有变量
function deepClear() {
    for (let i = 0; i < size.value; i++) {
        for (let j = 0; j < size.value; j++) {
            numpad.value[i][j] = 0;
            addCount.value = 0;
            highlight.value[i][j] = 0;
            wrong.value[i][j] = 0;
            sudoku.value[i][j] = 0;
            pos.value[i][j] = 0;
            addpos.value[i][j] = 0;
            hovering.value[i][j] = 0;
        }
    }
}

// 重置所有显示变量
function clear() {
    for (let i = 0; i < size.value; i++) {
        for (let j = 0; j < size.value; j++) {
            numpad.value[i][j] = 0;
            highlight.value[i][j] = 0;
            wrong.value[i][j] = 0;
            hovering.value[i][j] = 0;
        }
    }
}

// 生成数独数据
function generateSudoku() {
    F = true;
    setTimeout(() => {
        F = false;
    }, 1)
    // 开始填充数独
    fillSudoku(0, 0);
}

// 递归填充数据
function fillSudoku(row, col) {
    // 到达最后一列时，调整到下一行的第一列
    if (col === 9) {
        row++;
        col = 0;
    }

    // 已经填充完所有位置，生成完成
    if (row === 9) {
        F = false;
        return true;
    }

    // 当前位置已经有数字，跳过继续填充下一个位置
    if (sudoku.value[row][col] !== 0) {
        return fillSudoku(row, col + 1);
    }

    // 尝试填充数字1-9
    for (let num = Math.floor(Math.random() * size.value + 1), count = 0; count < 15; num = Math.floor(Math.random() * size.value + 1, count++)) {
        if (isValid(row, col, num)) {
            sudoku.value[row][col] = num;

            // 递归地继续填充下一个位置
            if (fillSudoku(row, col + 1)) {
                return true;
            }

            // 还原该位置的数字，继续尝试下一个数字
            sudoku.value[row][col] = 0;
        }
    }

    return false;
}

generate();
// 处理点击事件
function handleClick(x, y) {
    if (end.value)
        return;
    if (pos.value[x][y] === 1) {
        //findSame(sudoku.value[x][y]);
    }
    else if (clicking.value == false) {
        numpad.value[x][y] = 1;
        clicking.value = true;
    }
}

// 添加数字
function addNum(x, y, num) {
    sudoku.value[x][y] = num;
    numpad.value[x][y] = 0;
    if (addpos.value[x][y] == 0) {
        addCount.value++;
        addpos.value[x][y] = 1
    }
    //防止同时触发ceil的点击事件
    setTimeout(() => {
        clicking.value = false;
    }, .4)
    handleRedCircle(x, y, num);

    if (Number(N.value) + Number(addCount.value) === Math.pow(size.value, 2)) {
        console.log("123");
        if (judge()) {
            alert("挑战成功！");
            end.value = true;
            let request = {
                id: store.userId,
                succeedNum: succeedNum.value + 1
            };
            Request.post("/changeSuccessNum", request).then(
                (res) => {
                    console.log(res);
                    if (res.data.status == "changeNumSuccess") {
                        succeedNum.value++;
                    }
                }
            )
            if (fastTime.value == null || fastTime.value > (currentTime.value - startTime.value) / 1000) {
                var newTime = (currentTime.value - startTime.value) / 1000;
                request = {
                    id: store.userId,
                    fastTime: newTime
                };
                Request.post("/changeFastTime", request).then(
                    (res) => {
                        console.log(res);
                        if (res.data.status == "changeTimeSuccess") {
                            fastTime.value = newTime;
                        }
                    }
                )
            }
        }
    }
    handleHighlight(x, y, num);

}

// 处理高亮
function handleHighlight(x, y, num) {
    for (let i = 0; i < size.value; i++) {
        for (let j = 0; j < size.value; j++) {
            //重置
            highlight.value[i][j] = 0;
            //判定
            if (sudoku.value[i][j] == num && (pos.value[i][j] == 1 || addpos.value[i][j] == 1)) {
                highlight.value[i][j] = 1;
            }
        }
    }
}

// 判断有没有错
function handleRedCircle(x, y, num) {
    var f = false;
    for (let i = 0; i < size.value; i++) {
        for (let j = 0; j < size.value; j++) {
            //重置
            wrong.value[i][j] = 0;
            //判定
            if (i != x || j != y) {
                if (sudoku.value[i][j] == num && (pos.value[i][j] == 1 || addpos.value[i][j] == 1) && (i == x || j == y)) {
                    wrong.value[i][j] = 1;
                    f = true;
                }
            }
            handleGrid(x, y, num, 1)
        }
    }
    if (f) {
        wrong.value[x][y] = 1;
    }
}

// 判断是否结束
function judge() {
    for (let i = 0; i < size.value; i++) {
        for (let j = 0; j < size.value; j++) {
            if (!isValid(i, j, sudoku.value[i][j])) {
                //console.log(i + "行" + j + "列的元素不可行");
                return false
            }
            else {
                //console.log(i + "行" + j + "列的元素可行");
            }
        }
    }
    return true;
}

// 显示正确答案
function showAnswer() {
    showEyePopup.value = false;
    clear();
    console.log(answer.value);
    end.value = true;
    copyArray(sudoku, answer);
    //将所有没有填入数字的位置都显示出来
    for (let i = 0; i < size.value; i++) {
        for (let j = 0; j < size.value; j++) {
            if (pos.value[i][j] == 0) {
                addpos.value[i][j] = 1;
            }
        }
    }
    console.log(sudoku.value);
    console.log(answer.value);
}

//以下为侧边栏内容
const toggleNavbarPosition = () => {
    isVertical.value = !isVertical.value;
};

const restart = () => {
    console.log('Restarting the puzzle...');
    showRestartPopup.value = false;
    generate();
};

let offsetX = ref(0);
let offsetY = ref(0);
let currentElement = ref(null);

const startDrag = (e, element) => {
    console.log("12313")
    currentElement.value = element;
    offsetX.value = e.clientX - e.currentTarget.getBoundingClientRect().left;
    offsetY.value = e.clientY - e.currentTarget.getBoundingClientRect().top;
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', stopDrag);
};

const drag = (e) => {
    if (currentElement.value === 'navbar') {
        const navbar = document.querySelector('.navbar');
        // 计算新的位置
        const newX = e.clientX - offsetX.value;
        const newY = e.clientY - offsetY.value;
        // 更新元素的位置
        navbar.style.left = `${newX}px`;
        navbar.style.top = `${newY}px`;
    } else if (currentElement.value === 'restartPopup') {
        // Adjust this logic to move the restart popup
    }
};

const stopDrag = () => {
    document.removeEventListener('mousemove', drag);
    document.removeEventListener('mouseup', stopDrag);
    currentElement.value = null;
};

// 开始游戏 开启计时器，获取在浏览器中记录的胜利次数
function start() {
    startTime.value = Date.now();
    // 每秒钟更新一次时间
    setInterval(() => {
        // 如果暂停或结束，startTime也每秒加一
        if (isPaused.value || end.value) {
            startTime.value += 1000;
        }
        currentTime.value = Date.now();
    }, 1000);
    // 获取记录次数和记录时间
    console.log(store.userId);
    if (store.succeedNum != null) {
        succeedNum.value = store.succeedNum;
    }
    if (store.fastTime != null) {
        fastTime.value = store.fastTime;
    }
};
start();

// 暂停与继续
const togglePause = () => {
    isPaused.value = !isPaused.value;
};

// 使用计算属性格式化时间
const formattedTime = computed(() => {
    if (!currentTime.value) {
        return '';
    }

    const duration = currentTime.value - startTime.value;

    const hours = Math.floor(duration / 3600000);
    const minutes = Math.floor((duration % 3600000) / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);

    return `${formatNumber(hours)}:${formatNumber(minutes)}:${formatNumber(seconds)}`;
});

// 格式化数字辅助函数
const formatNumber = (num) => num.toString().padStart(2, '0');

// 重置次数与时间
function reset() {
    let request = {
        id: store.userId,
        succeedNum: 0
    };
    Request.post("/changeSuccessNum", request).then(
        (res) => {
            console.log(res);
            if (res.data.status == "changeNumSuccess") {
                succeedNum.value = 0;
            }
        }
    )
    request = {
        id: store.userId,
        fastTime: 0
    };
    Request.post("/changeFastTime", request).then(
        (res) => {
            console.log(res);
            if (res.data.status == "changeTimeSuccess") {
                fastTime.value = null;
            }
        }
    )
}

//退出
function signout(){
    store.userId = null;
    store.fastTime = null;
    store.userName = null;
    setTimeout(()=>{
        router.push('/');
    },500)
}
</script>
<template>
    <head>
        <!-- <link rel="stylesheet" href="../app.css"> -->
        <!-- 引用了 Font Awesome 图标库的 CSS 样式表 -->
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    </head>
    <div class="mask" :class="{ 'transparent': !isPaused, 'ambigous': isPaused }"></div>
    <!-- Restart Popup -->
    <div v-if="showRestartPopup" class="custom-popup">
        <div class="custom-header" @mousedown="startDrag($event, 'restartPopup')">
            <span class="closeBtn" @click="showRestartPopup = false">&times;</span>
        </div>
        <div class="custom-content">
            <div class="top">
                <i class="fas fa-power-off"></i>
                <p class="warn">Restart puzzle</p>
            </div>
            <p class="message">You are about to clear the puzzle. Any saved data will be lost.</p>
            <div class="buttons">
                <button class="button1" @click="restart">Restart</button>
                <button class="button2" @click="showRestartPopup = false">Cancel</button>
            </div>
        </div>
    </div>
    <!-- Time Popup -->
    <div v-if="showTimePopup" class="popup">
        <div class="header">
            <span v-show="!isPaused" class="closeBtn" @click="showTimePopup = false">&times;</span>
        </div>
        <div class="Pbottom">
            <div id="time">{{ formattedTime }}</div>
            <button id="stopBtn" @click="togglePause">{{ isPaused ? 'Resume' : 'Pause' }}</button>
        </div>
    </div>
    <!-- Eye Popup -->
    <div v-if="showEyePopup" class="popup">
        <div class="custom-header" @mousedown="startDrag($event, 'restartPopup')">
            <span class="closeBtn" @click="showEyePopup = false">&times;</span>
        </div>
        <div class="custom-content">
            <div class="top">
                <i class="fas fa-eye"></i>
                <p class="warn">Show solution</p>
            </div>
            <p class="message">Showing solution will end this game</p>
            <div class="buttons">
                <button class="button1" @click="showAnswer()">Show</button>
                <button class="button2" @click="showEyePopup = false">Cancel</button>
            </div>
        </div>
    </div>
    <!-- Wrench Popup -->
    <div v-if="showWrenchPopup" class="popup">
        <div class="custom-header" @mousedown="startDrag($event, 'restartPopup')">
            <span class="closeBtn" @click="showWrenchPopup = false">&times;</span>
        </div>
        <div class="custom-content">
            <div class="top">
                <i class="fas fa-wrench"></i>
                <p class="warn">Change difficulity</p>
            </div>
            <p class="message">You will change the number that the number showed at first and start a new game.</p>
            <input v-model="N">
            <div class="buttons">
                <button class="button1" @click="generate()">Yes</button>
                <button class="button2" @click="showWrenchPopup = false">Cancel</button>
            </div>
        </div>
    </div>
    <div style=" height: 716px;; width: 100%; display: flex;">
        <div class="container">
            <!-- Navbar -->
            <div :class="['navbar', { vertical: isVertical, horizontal: !isVertical }]"
                @mousedown="startDrag($event, 'navbar')">
                <i class="arrow" :class="['fas', isVertical ? 'fa-chevron-down' : 'fa-chevron-right']"
                    @click="toggleNavbarPosition"></i>
                <i class="fa-solid fa-magnifying-glass-plus"></i>
                <i class="fas fa-search-minus"></i>
                <i class="fas fa-undo"></i>
                <i class="fas fa-redo"></i>
                <i class="fas fa-power-off" @click="showRestartPopup = true"></i>
                <i class="fas fa-check"></i>
                <i class="fas fa-pencil-alt"></i>
                <i class="fas fa-clock" @click="showTimePopup = true"></i>
                <i class="fas fa-eye" @click="showEyePopup = true"></i>
                <i class="fas fa-wrench" @click="showWrenchPopup = true"></i>
                <i class="fas fa-info-circle"></i>
                <i class="fas fa-question-circle"></i>
                <i class="fas fa-print"></i>
                <i class="fas fa-save"></i>
            </div>
        </div>
        <div class="title">Super Sudoku!</div>
        <div class="board">
            <div v-for="i in size" class="line">
                <div class="ceil"
                    :class="{ 'yellow': highlight[i - 1][j - 1] == 1, 'brownBack': (pos[i - 1][j - 1] == 0 && hovering[i - 1][j - 1] == 1), 'middle': (i - 1 > 0 && i < size && j - 1 > 0 && j < size), 'leftBorder': j - 1 == 0, 'rightBorder': (j == size || j == 3 || j == 6), 'topBorder': i - 1 == 0, 'bottomBorder': (i == size || i == 3 || i == 6) }"
                    v-for="j in size" @click="handleClick(i - 1, j - 1)" @mouseenter="hovering[i - 1][j - 1] = 1"
                    @mouseleave="hovering[i - 1][j - 1] = 0">
                    <span :class="{ 'brown': addpos[i - 1][j - 1] === 1 }" class="number1"
                        v-show="pos[i - 1][j - 1] === 1 || addpos[i - 1][j - 1] == 1">
                        {{ sudoku[i - 1][j - 1] }}
                    </span>
                    <div class="numpad"
                        :class="{ 'showNumpad': numpad[i - 1][j - 1] == 1 && end == false, 'hideNumpad': numpad[i - 1][j - 1] == 0 || end == true }"
                        @mouseleave="numpad[i - 1][j - 1] = 0; clicking = false;">
                        <div v-for="ii in size / 3" class="line" style="flex-direction: column-reverse">
                            <div v-for="jj in size / 3" class="smallceil" @click="addNum(i - 1, j - 1, (3 - jj) * 3 + ii)">
                                <span class="number2">{{ (3 - jj) * 3 + ii }}</span>
                            </div>
                        </div>
                    </div>
                    <div v-show="(wrong[i - 1][j - 1] == 1)" class="redCircle">
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="history">
        <span>用户：{{ store.userName }}</span>
        <span>胜利次数：{{ succeedNum }}</span>
        <div v-show="fastTime != null">最快用时：{{ fastTime }}s</div>
        <button @click="reset()" style="margin-top: 5px;">重置</button>
        <button @click="signout()" style="margin-top: 5px;">退出</button>
    </div>
    <!-- <button @click="generate()">重新生成</button>
    <input v-model="N">
    <button @click="generate()">确定</button>
    <button @click="showAnswer()">显示答案</button> -->
</template>
<style scoped>
@import 'game.css';
@import "navbar.css";
</style>