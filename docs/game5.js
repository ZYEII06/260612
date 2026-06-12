class Game5 {
    constructor() {
        this.reset();
    }

    reset() {
        this.gameState = 'playing';
        this.score = 0;
        this.timeLeft = GAME_DURATION; // 30秒
        this.startTime = millis();
        this.config = (DIFFICULTY_CONFIG && DIFFICULTY_CONFIG[currentDifficulty]) ? DIFFICULTY_CONFIG[currentDifficulty].game1 : {}; // 暫時借用 game1 config
        
        this.toolbarX = 0;
        this.canvasX = 60;
        this.panelX = this.canvasX + CANVAS_WIDTH + 10;

        this.targetShape = { x: 0, y: 0, r: 0 }; // 目標圓形
        this.playerStrokes = []; // 玩家繪製的筆觸
        this.brushSize = 20; // 筆刷大小
        this.drawing = false; // 是否正在繪製
        this.shapesCompleted = 0; // 完成的圖形數量
        this.maxShapes = 10; // 至少完成的圖形數量

        this.generateNewTarget();
    }

    // 輔助函數：播放音效 (從 index.html 借用)
    snd(freq, dur, type, vol) {
        if (typeof window.snd === 'function') {
            window.snd(freq, dur, type, vol);
        }
    }
    sndGood() { if (typeof window.sndGood === 'function') window.sndGood(); }
    sndBad() { if (typeof window.sndBad === 'function') window.sndBad(); }

    update() {
        this.timeLeft = GAME_DURATION - (millis() - this.startTime);
        if (this.timeLeft <= 0) {
            this.gameState = 'ended';
            currentScreen = 'result';
            gameManager.lastScore = this.score;
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
        fill(COLORS.secondary1);
        rect(20, 10, 60, 60, 30);

        fill(255);
        textAlign(CENTER, CENTER);
        textSize(24);
        textStyle(BOLD);
        text(max(0, (this.timeLeft / 1000)).toFixed(1) + 's', 50, 40);

        // 得分
        fill(COLORS.textDark);
        textSize(28);
        textStyle(BOLD);
        textAlign(CENTER, CENTER);
        text(this.score, 195, 30);

        fill(COLORS.textDark);
        textSize(12);
        text('Points', 195, 55);

        // 圖形進度
        fill(COLORS.textDark);
        textSize(14);
        textAlign(RIGHT);
        text(`圖形: ${this.shapesCompleted}/${this.maxShapes}`, width - 20, 40);
    }

    drawToolbar() {
        fill(45, 45, 45);
        noStroke();
        rect(0, 70, 60, CANVAS_HEIGHT);
        
        const tools = ['✨', '📏', '🎨', '🖌️', '🧼', '📝'];
        for (let i = 0; i < tools.length; i++) {
            fill(255, i === 3 ? 255 : 120); // 凸顯筆刷工具
            textAlign(CENTER, CENTER);
            textSize(22);
            text(tools[i], 30, 105 + i * 50);
        }
    }

    drawGameCanvas() {
        // Canvas 背景
        fill(240);
        stroke(78, 205, 196);
        strokeWeight(1);
        rect(this.canvasX, 70, CANVAS_WIDTH, CANVAS_HEIGHT);

        // 繪製目標圓形輪廓
        noFill();
        stroke(COLORS.secondary1);
        strokeWeight(3);
        circle(this.targetShape.x, this.targetShape.y, this.targetShape.r * 2);

        // 繪製玩家筆觸
        stroke(COLORS.secondary3);
        strokeWeight(this.brushSize);
        for (let i = 0; i < this.playerStrokes.length - 1; i++) {
            line(this.playerStrokes[i].x, this.playerStrokes[i].y, this.playerStrokes[i+1].x, this.playerStrokes[i+1].y);
        }

        // 繪製筆刷預覽
        noFill();
        stroke(COLORS.secondary3);
        strokeWeight(2);
        circle(mouseX, mouseY, this.brushSize);
    }

    drawRightPanel() {
        fill(240, 240, 240);
        stroke(224, 224, 224);
        strokeWeight(1);
        rect(this.panelX, 70, 60, CANVAS_HEIGHT);

        fill(COLORS.textDark);
        textSize(10);
        textStyle(BOLD);
        textAlign(LEFT);
        text('筆刷', this.panelX + 5, 85);

        fill(255);
        stroke(224, 224, 224);
        strokeWeight(1);
        rect(this.panelX + 2, 100, 56, 30);

        fill(COLORS.textDark);
        textSize(9);
        text(this.brushSize + 'px', this.panelX + 5, 116);
    }

    handleClick(x, y) {
        // 開始繪製
        if (x > this.canvasX && x < this.canvasX + CANVAS_WIDTH && y > 70 && y < 70 + CANVAS_HEIGHT) {
            this.drawing = true;
            this.playerStrokes = [{ x: mouseX, y: mouseY }];
        }
    }

    handleDragging(x, y) {
        if (this.drawing) {
            this.playerStrokes.push({ x: mouseX, y: mouseY });
        }
    }

    handleMouseReleased() {
        if (this.drawing) {
            this.drawing = false;
            this.evaluateDrawing();
        }
    }

    generateNewTarget() {
        const minR = 60;
        const maxR = 120;
        this.targetShape.r = random(minR, maxR);
        this.targetShape.x = random(this.canvasX + this.targetShape.r, this.canvasX + CANVAS_WIDTH - this.targetShape.r);
        this.targetShape.y = random(70 + this.targetShape.r, 70 + CANVAS_HEIGHT - this.targetShape.r);
        this.playerStrokes = []; // 清空玩家筆觸
    }

    evaluateDrawing() {
        let hitPoints = 0;
        let totalPoints = 0;
        const targetCircle = this.targetShape;

        // 檢查玩家筆觸與目標圓形的重疊程度
        for (let i = 0; i < this.playerStrokes.length; i++) {
            const p = this.playerStrokes[i];
            const d = dist(p.x, p.y, targetCircle.x, targetCircle.y);
            
            // 如果筆觸點在目標圓形輪廓附近 (考慮筆刷大小)
            if (abs(d - targetCircle.r) < this.brushSize / 2) {
                hitPoints++;
            }
            totalPoints++;
        }

        const accuracy = totalPoints > 0 ? (hitPoints / totalPoints) : 0;
        let pointsEarned = 0;

        if (accuracy > 0.7) { // 70% 以上算完成
            pointsEarned = 100 * accuracy; // 根據準確度給分
            this.shapesCompleted++;
            this.score += pointsEarned;
            this.sndGood();
            // 顯示反饋
            gameManager.showFeedback(`完美! +${floor(pointsEarned)}`, mouseX, mouseY, true);
            this.generateNewTarget(); // 生成下一個目標
        } else if (accuracy > 0.4) {
            pointsEarned = 50 * accuracy;
            this.score += pointsEarned;
            this.sndGood();
            gameManager.showFeedback(`不錯! +${floor(pointsEarned)}`, mouseX, mouseY, true);
            this.generateNewTarget();
        } else {
            this.sndBad();
            gameManager.showFeedback(`再試一次!`, mouseX, mouseY, false);
            this.playerStrokes = []; // 清空筆觸，讓玩家重畫
        }
    }
}