class Game3 {
    constructor() {
        this.reset();
    }

    reset() {
        this.gameState = 'playing';
        this.score = 0;
        this.timeLeft = GAME_DURATION;
        this.startTime = millis();
        this.cleanPercentage = 0;
        this.smudges = [];
        this.particles = [];
        this.brushPosition = createVector(0, 0);
        this.isSampling = false;
        this.brushSize = 0;
        this.lastMudballTime = 0;
        this.mudGraphics = createGraphics(CANVAS_WIDTH, CANVAS_HEIGHT);

        this.config = DIFFICULTY_CONFIG[currentDifficulty].game3;
        this.brushSize = this.config.brushSize;

        this.toolbarX = 0;
        this.canvasX = 60;
        this.panelX = this.canvasX + CANVAS_WIDTH + 10;

        // 初始化污漬
        for (let i = 0; i < this.config.smudgeCount; i++) {
            const newSmudge = {
                id: random(10000),
                x: random(this.canvasX + 20, this.canvasX + CANVAS_WIDTH - this.config.smudgeSize - 20),
                y: random(80, 300),
                size: this.config.smudgeSize,
                opacity: 0.6,
                cleaned: 0
            };
            this.smudges.push(newSmudge);
        }
        this.drawInitialSmudges();
    }

    update() {
        this.timeLeft = GAME_DURATION - (millis() - this.startTime);

        if (this.timeLeft <= 0) {
            this.gameState = 'ended';
            currentScreen = 'result';
            gameManager.lastScore = this.score;
            return;
        }

        // 投擲泥巴
        if (millis() - this.lastMudballTime > this.config.mudballInterval) {
            const newSmudge = {
                id: random(10000),
                x: random(this.canvasX + 50, this.canvasX + CANVAS_WIDTH - 100),
                y: random(350, 450),
                size: this.config.smudgeSize,
                opacity: 0.6,
                cleaned: 0
            };
            this.smudges.push(newSmudge);
            this.mudGraphics.push();
            this.mudGraphics.blendMode(BLEND); // 確保新泥巴以正常模式繪製
            this.mudGraphics.fill(139, 111, 71, newSmudge.opacity * 255); // 繪製不透明的泥巴到離屏畫布
            this.mudGraphics.noStroke();
            this.mudGraphics.ellipse(
                newSmudge.x - this.canvasX + newSmudge.size / 2, // 轉換 x 座標
                newSmudge.y - 70 + newSmudge.size / 2, // 轉換 y 座標
                newSmudge.size, newSmudge.size * 0.8);
            this.mudGraphics.pop();
            this.lastMudballTime = millis();
        }

        // 更新粒子
        this.particles = this.particles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += 0.3;
            particle.life -= 16;
            return particle.life > 0;
        });

        // 計算清潔百分比
        if (this.smudges.length > 0) {
            const totalCleaned = this.smudges.reduce((sum, s) => sum + s.cleaned, 0);
            this.cleanPercentage = Math.min(100, (totalCleaned / this.smudges.length) * 100);
        }
    }

    display() {
        background(255);

        // 頂部 HUD
        this.drawTopBar();

        // 工具欄
        this.drawToolbar();

        // Canvas
        this.drawGameCanvas();

        // 右側面板
        this.drawRightPanel();
    }

    drawTopBar() {
        fill(240, 240, 240);
        noStroke();
        rect(0, 0, width, 70);

        // 計時器
        fill(78, 205, 196);
        rect(20, 10, 60, 60, 30);

        fill(255);
        textAlign(CENTER, CENTER);
        textSize(24);
        textStyle(BOLD);
        text((this.timeLeft / 1000).toFixed(1) + 's', 50, 40);

        // 清潔度進度條
        fill(26, 26, 46);
        textSize(10);
        textStyle(BOLD);
        textAlign(LEFT);
        text('清潔度: ' + this.cleanPercentage.toFixed(0) + '%', 90, 25);

        // 進度條背景
        fill(224, 224, 224);
        noStroke();
        rect(90, 38, 200, 12, 6);

        // 進度條
        fill(149, 225, 211);
        rect(90, 38, 200 * (this.cleanPercentage / 100), 12, 6);
    }

    drawToolbar() {
        fill(45, 45, 45);
        noStroke();
        rect(0, 70, 60, CANVAS_HEIGHT);

        const tools = ['🖌️', '⚙️', '✏️', '🧹', '🔧', '📝'];
        for (let i = 0; i < tools.length; i++) {
            fill(255);
            textAlign(CENTER, CENTER);
            textSize(20);
            text(tools[i], 30, 90 + i * 48 + 10);
        }
    }

    drawGameCanvas() {
        // Canvas 背景
        fill(135, 206, 235); // 天藍色
        noStroke();
        rect(this.canvasX, 70, CANVAS_WIDTH, CANVAS_HEIGHT * 0.6);
        fill(144, 238, 144); // 草綠色
        rect(this.canvasX, 70 + CANVAS_HEIGHT * 0.6, CANVAS_WIDTH, CANVAS_HEIGHT * 0.4);

        // 從 offscreen graphics 繪製污漬
        image(this.mudGraphics, this.canvasX, 70);

        // 筆刷預覽
        stroke(78, 205, 196);
        strokeWeight(2);
        noFill();
        circle(
            this.brushPosition.x,
            this.brushPosition.y,
            this.brushSize
        );

        if (this.isSampling) {
            fill(78, 205, 196, 50);
            circle(
                this.brushPosition.x,
                this.brushPosition.y,
                this.brushSize
            );
        }

        // 粒子
        this.particles.forEach(particle => {
            fill(255, 230, 109, particle.life);
            noStroke();
            circle(particle.x, particle.y, 8);
        });
    }

    drawRightPanel() {
        fill(240, 240, 240);
        stroke(224, 224, 224);
        strokeWeight(1);
        rect(this.panelX, 70, 60, CANVAS_HEIGHT);

        fill(26, 26, 46);
        textSize(10);
        textStyle(BOLD);
        textAlign(LEFT);
        text('筆刷大小', this.panelX + 5, 85);

        fill(255);
        stroke(224, 224, 224);
        strokeWeight(1);
        rect(this.panelX + 2, 100, 56, 30);

        fill(26, 26, 46);
        textSize(9);
        text(this.brushSize + 'px', this.panelX + 5, 116);

        fill(26, 26, 46);
        textSize(10);
        textStyle(BOLD);
        text('快捷鍵', this.panelX + 5, 160);

        fill(78, 205, 196);
        textSize(9);
        textAlign(LEFT);
        text('Alt + 點擊', this.panelX + 5, 180);
        text('採樣', this.panelX + 5, 195);
    }

    drawInitialSmudges() {
        this.mudGraphics.clear(); // 清空 offscreen graphics
        this.mudGraphics.push();
        // 繪製到 mudGraphics 時，需要將其轉換為相對於 mudGraphics 的座標
        this.smudges.forEach(smudge => {
            this.mudGraphics.fill(139, 111, 71, smudge.opacity * 255); // 繪製不透明的泥巴
            this.mudGraphics.noStroke();
            this.mudGraphics.ellipse(
                smudge.x - this.canvasX + smudge.size / 2, // 轉換 x 座標
                smudge.y - 70 + smudge.size / 2, // 轉換 y 座標
                smudge.size, smudge.size * 0.8);
        });
        this.mudGraphics.pop();
    }

    handleMouseMove(x, y) {
        this.brushPosition.set(x, y);
        if (!this.isSampling) {
            // 在 mudGraphics 上擦除泥巴
            this.mudGraphics.push();
            this.mudGraphics.blendMode(REMOVE); // 使用 REMOVE 模式進行擦除
            this.mudGraphics.noStroke();
            this.mudGraphics.fill(0, 0, 0, 255); // 繪製不透明的黑色以完全移除像素
            this.mudGraphics.circle(x - this.canvasX, y - 70, this.brushSize); // 轉換座標
            this.mudGraphics.pop();

            this.smudges = this.smudges.map(smudge => {
                const dx = x - (smudge.x + smudge.size / 2);
                const dy = y - (smudge.y + smudge.size / 2);
                const distance = sqrt(dx * dx + dy * dy);

                if (distance < this.brushSize / 2 + smudge.size / 2) {
                    const newCleaned = Math.min(100, smudge.cleaned + this.config.cleanSpeed);

                    if (newCleaned === 100 && smudge.cleaned < 100) {
                        // 污漬完全清潔
                        this.score += 50;

                        // 創建星星粒子
                        for (let i = 0; i < 15; i++) {
                            const angle = (i / 15) * TWO_PI;
                            this.particles.push({
                                x: smudge.x + smudge.size / 2,
                                y: smudge.y + smudge.size / 2,
                                vx: cos(angle) * 200 * 0.016,
                                vy: sin(angle) * 200 * 0.016,
                                life: 600
                            });
                        }
                    }

                    return { ...smudge, cleaned: newCleaned };
                }

                return smudge;
            });
        }
    }

    handleKeyPress(keyCode) {
        if (keyCode === 18) { // Alt key
            this.isSampling = true;
        }
    }

    handleKeyRelease(keyCode) {
        if (keyCode === 18) {
            this.isSampling = false;
        }
    }

    handleClick(x, y) {
        // 點擊工具欄選擇工具
        if (x < 60 && x > 0) {
            if (y > 70 && y < 118) {
                // 選擇仿製印章工具
            }
        }
    }
}