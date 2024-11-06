const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let countdown = 0; // 倒计时变量

// 设置马赛克效果的参数
const tileSize = 25;

// 初始化摄像头
async function initCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;

    video.addEventListener('loadeddata', () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        requestAnimationFrame(renderFrame);
    });
}

// 渲染彩色马赛克效果
function renderFrame() {
    // 将视频帧绘制到 canvas 上
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // 获取图像数据
    const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = frame.data;

    // 处理图像的每个小方块
    for (let y = 0; y < canvas.height; y += tileSize) {
        for (let x = 0; x < canvas.width; x += tileSize) {
            // 计算每块的平均RGB值
            let sumR = 0, sumG = 0, sumB = 0;
            let count = 0;

            for (let dy = 0; dy < tileSize; dy++) {
                for (let dx = 0; dx < tileSize; dx++) {
                    const i = ((y + dy) * canvas.width + (x + dx)) * 4;
                    sumR += data[i];
                    sumG += data[i + 1];
                    sumB += data[i + 2];
                    count++;
                }
            }

            const avgR = sumR / count;
            const avgG = sumG / count;
            const avgB = sumB / count;

            // 绘制彩色方块
            ctx.fillStyle = `rgb(${avgR}, ${avgG}, ${avgB})`;
            ctx.fillRect(x, y, tileSize, tileSize);
        }
    }

    // 显示倒计时（仅在倒计时未结束时显示）
    if (countdown > 0) {
        ctx.font = "48px Arial Black";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.fillText(countdown, canvas.width / 2, canvas.height / 2);
    }

    // 请求下一帧
    requestAnimationFrame(renderFrame);
}

// 截屏并下载
function takeScreenshot() {
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `screenshot_${Date.now()}.png`;
    link.click();
}

// 监听按键事件
document.addEventListener('keydown', (event) => {
    if (event.key === '1') { // 按下“1”键启动倒计时
        countdown = 3;
        const countdownInterval = setInterval(() => {
            countdown--;
            if (countdown === 0) {
                // 倒计时结束时，清除画面上的数字
                renderFrame(); // 清空画面上的倒计时数字
                clearInterval(countdownInterval);
                takeScreenshot(); // 截屏
            }
        }, 1000);
    }
});

initCamera();