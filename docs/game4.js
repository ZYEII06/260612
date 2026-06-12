class Game4 {
    constructor() {
        this.reset();
    }

    reset() {
        this.gameState = 'playing';
        this.score = 0;
        this.timeLeft = GAME_DURATION;
        this.startTime = millis();
        this.config = (DIFFICULTY_CONFIG && DIFFICULTY_CONFIG[currentDifficulty]) ? DIFFICULTY_CONFIG[currentDifficulty].game1 : {}; // Using game1 config for now
        
        this.targetColor = color(random(255), random(255), random(255));
        this.playerColor = { r: 127, g: 127, b: 127 };
        
        this.toolbarX = 0;
        this.canvasX = 60;
        this.panelX = this.canvasX + CANVAS_WIDTH + 10;

        this.activeSlider = null; // 紀錄當前正在拖曳的滑桿
        this.lastSimilarity = 0; // 紀錄上次提交的相似度
        this.showFeedback = 0;   // 反饋顯示計時器

        this.sliders = [
            { id: 'r', label: 'R', val: 127, y: 440, color: [255, 107, 107] },
            { id: 'g', label: 'G', val: 127, y: 490, color: [78, 205, 196] },
            { id: 'b', label: 'B', val: 127, y: 540, color: [51, 154, 240] }
        ];
        this.submitBtn = { x: this.canvasX + CANVAS_WIDTH / 2, y: 610, w: 140, h: 44 };
    }

    update() {
        this.timeLeft = GAME_DURATION - (millis() - this.startTime);
        if (this.timeLeft <= 0) {
            this.gameState = 'ended';
            currentScreen = 'result';
            gameManager.lastScore = this.score;
        }
        if (this.showFeedback > 0) this.showFeedback--;
    }

    display() {
        // 背景
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

        // 得分
        fill(26, 26, 46);
        textSize(28);
        textStyle(BOLD);
        text(this.score, 195, 30);

        fill(26, 26, 46);
        textSize(12);
        textAlign(CENTER);
        text('Points', 195, 55);

        // Combo
        fill(26, 26, 46);
        textSize(14);
        textAlign(RIGHT);
        text('目標色匹配中...', width - 20, 40);
    }

    drawToolbar() {
        fill(45, 45, 45);
        noStroke();
        rect(0, 70, 60, CANVAS_HEIGHT);
        
        const tools = ['✨', '📏', '🎨', '🖌️', '🧼', '📝'];
        for (let i = 0; i < tools.length; i++) {
            fill(255, i === 2 ? 255 : 120); // 凸顯當前工具
            textAlign(CENTER, CENTER);
            textSize(22);
            text(tools[i], 30, 105 + i * 50);
        }
    }

    drawGameCanvas() {
        // 1. 工作區背景
        fill(245);
        noStroke();
        rect(this.canvasX, 70, CANVAS_WIDTH, CANVAS_HEIGHT);

        // 2. 上方：目標顏色區域 (題目)
        fill(255);
        stroke(220);
        rect(this.canvasX + 10, 85, CANVAS_WIDTH - 20, 140, 12);
        
        fill(80);
        textAlign(LEFT, CENTER);
        textSize(13);
        textStyle(BOLD);
        text('題目：目標顏色 (Target)', this.canvasX + 25, 102);

        fill(this.targetColor);
        noStroke();
        rect(this.canvasX + 25, 120, CANVAS_WIDTH - 50, 90, 8);

        // 3. 下方：玩家調色與操作區 (屬性面板)
        fill(255);
        stroke(220);
        rect(this.canvasX + 10, 240, CANVAS_WIDTH - 20, 330, 12);

        fill(80);
        textStyle(BOLD);
        text('屬性 (Properties)', this.canvasX + 25, 255);
        textStyle(NORMAL);

        // 玩家目前顏色預覽
        fill(this.sliders[0].val, this.sliders[1].val, this.sliders[2].val);
        stroke(230);
        rect(this.canvasX + 25, 275, CANVAS_WIDTH - 50, 120, 8);
        
        noStroke();
        fill(255);
        text('玩家：調整顏色 (Your Color)', this.canvasX + 35, 290);

        // 4. RGB 滑桿繪製
        this.sliders.forEach(s => {
            // 滑軌背景
            stroke(235);
            strokeWeight(6);
            line(this.canvasX + 45, s.y, this.canvasX + CANVAS_WIDTH - 65, s.y);
            
            // 顏色填充滑軌
            stroke(s.color);
            const hx = map(s.val, 0, 255, this.canvasX + 45, this.canvasX + CANVAS_WIDTH - 65);
            line(this.canvasX + 45, s.y, hx, s.y);

            // 標籤 R/G/B
            noStroke();
            fill(150);
            textAlign(RIGHT, CENTER);
            text(s.label, this.canvasX + 40, s.y);

            // 滑桿頭 (圓圈)
            fill(s.color);
            stroke(255);
            strokeWeight(1);
            circle(hx, s.y, 18);

            // 數值文字
            noStroke();
            fill(150);
            textAlign(LEFT, CENTER);
            text(floor(s.val), this.canvasX + CANVAS_WIDTH - 55, s.y);
        });

        // 5. 提交按鈕
        push();
        rectMode(CENTER);
        translate(this.submitBtn.x, this.submitBtn.y);
        fill(45, 45, 45);
        noStroke();
        rect(0, 0, this.submitBtn.w, this.submitBtn.h, 8);
        fill(255);
        textAlign(CENTER, CENTER);
        textSize(15);
        text('確認提交', 0, 0);
        pop();

        // 6. 相似度百分比回饋
        if (this.showFeedback > 0) {
            fill(0, map(this.showFeedback, 0, 60, 0, 200));
            noStroke();
            rect(this.canvasX + 25, 275, CANVAS_WIDTH - 50, 120, 8);
            fill(255);
            textAlign(CENTER, CENTER);
            textSize(22);
            textStyle(BOLD);
            text("相似度 " + this.lastSimilarity + "%", this.canvasX + CANVAS_WIDTH / 2, 325);
            textStyle(NORMAL);
        }
    }

    drawRightPanel() {
        fill(240, 240, 240);
        stroke(224, 224, 224);
        strokeWeight(1);
        rect(this.panelX, 70, 60, CANVAS_HEIGHT);

        fill(100);
        noStroke();
        textSize(10);
        textAlign(CENTER);
        text('圖層', this.panelX + 30, 85);
    }

    handleClick(x, y) {
        this.activeSlider = null;
        this.sliders.forEach(s => {
            if (y > s.y - 20 && y < s.y + 20 && x > this.canvasX + 40 && x < this.canvasX + CANVAS_WIDTH - 40) {
                this.activeSlider = s;
                this.updateSliderValue(s, x);
                if (typeof window.snd === 'function') window.snd(600, .02, "square", .05);
            }
        });

        if (abs(x - this.submitBtn.x) < this.submitBtn.w / 2 && abs(y - this.submitBtn.y) < this.submitBtn.h / 2) {
            this.evaluateColor();
        }
    }

    handleDragging(x, y) {
        if (this.activeSlider) {
            this.updateSliderValue(this.activeSlider, x);
        }
    }

    handleMouseReleased() {
        this.activeSlider = null;
    }

    updateSliderValue(s, x) {
        s.val = map(x, this.canvasX + 45, this.canvasX + CANVAS_WIDTH - 65, 0, 255, true);
    }

    evaluateColor() {
        const tr = red(this.targetColor);
        const tg = green(this.targetColor);
        const tb = blue(this.targetColor);
        
        const pr = this.sliders[0].val;
        const pg = this.sliders[1].val;
        const pb = this.sliders[2].val;
        
        const d = dist(tr, tg, tb, pr, pg, pb); 
        const similarity = Math.round((1 - d / 441.67) * 100);
        this.lastSimilarity = similarity;
        this.showFeedback = 60; // 顯示 1 秒
        
        let points = floor(max(0, 100 - (d / 4)));
        this.score += points;
        
        if (typeof window.sndGood === 'function' && similarity > 80) window.sndGood();
        
        this.targetColor = color(random(255), random(255), random(255));
        this.sliders.forEach(s => s.val = 127);
    }
}