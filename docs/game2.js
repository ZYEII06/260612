class Game2 {
    constructor() {
        this.reset();
    }

    reset() {
        this.gameState = 'playing';
        this.timeLeft = GAME_DURATION;
        this.startTime = millis();
        this.scoreTimer = 0;
        this.nextAITimer = millis() + 1100;
        this.targetIdx = 0;
        this.nextTargetTimer = 0;

        this.players = [
            { id: 0, name: '你', color: '#F2C14E', emoji: '😎', score: 0, isPlayer: true },
            { id: 1, name: 'CPU 阿派', color: '#D98E73', emoji: '🤪', isPlayer: false },
            { id: 2, name: 'CPU 小對', color: '#9FB7C9', emoji: '🤡', isPlayer: false },
            { id: 3, name: 'CPU 亂亂', color: '#C5A6C9', emoji: '👻', isPlayer: false }
        ];

        this.layerOrder = this.players.map(p => p.id);
        // 打亂初始順序
        this.layerOrder.sort(() => Math.random() - 0.5);
        // 避免玩家一開始就在最上層
        if (this.layerOrder[0] === 0) {
            this.layerOrder.splice(0, 1);
            this.layerOrder.splice(2, 0, 0);
        }

        // 遊戲畫布上的角色位置 (相對座標)
        this.slots = [
            { x: 0.04, y: 0.06 }, { x: 0.40, y: 0.02 },
            { x: 0.08, y: 0.36 }, { x: 0.42, y: 0.32 }
        ];

        this.rowH = 60; // 圖層面板中每個圖層的高度
        this.dragging = false;
        this.dragOffset = 0;
        
        this.toolbarX = 0;
        this.canvasX = 60;
        this.panelX = this.canvasX + CANVAS_WIDTH + 10;
        this.cpuFlashId = -1;
        this.cpuFlashTime = 0;

        // 確保玩家分數歸零
        this.players.forEach(p => p.score = 0);
    }

    // 輔助函數：將圖層從當前位置移動到新索引
    moveTo(id, newIdx) {
        const currentIdx = this.layerOrder.indexOf(id);
        if (currentIdx === newIdx) return;

        this.layerOrder.splice(currentIdx, 1); // 移除
        this.layerOrder.splice(newIdx, 0, id); // 插入
    }

    // 輔助函數：播放音效 (從 index.html 借用)
    snd(freq, dur, type, vol) {
        // 檢查全局的 snd 函數是否存在
        if (typeof window.snd === 'function') {
            window.snd(freq, dur, type, vol);
        }
    }
    sndGood() { if (typeof window.sndGood === 'function') window.sndGood(); }
    sndBad() { if (typeof window.sndBad === 'function') window.sndBad(); }

    update() {
        if (this.gameState !== 'playing') return;
        this.timeLeft = GAME_DURATION - (millis() - this.startTime);

        if (this.timeLeft <= 0) {
            this.gameState = 'ended';
            currentScreen = 'result';
            gameManager.lastScore = this.players[0].score;
            return;
        }

        // 更新目標位置
        if (millis() > this.nextTargetTimer) {
            this.targetIdx = floor(random(0, 4));
            this.nextTargetTimer = millis() + 5000;
        }

        // 每 100ms 計分一次 (若玩家在最上層)
        if (millis() > this.scoreTimer) {
            const playerPos = this.layerOrder.indexOf(0);
            if (playerPos === this.targetIdx) {
                this.players[0].score++;
            }
            this.scoreTimer = millis() + 100;
        }

        // AI 行為
        if (millis() > this.nextAITimer) {
            this.cpuAction();
            // 根據原始代碼，CPU 行為間隔是 ri(850, 1500)
            // 這裡使用類似的隨機範圍
            const interval = random(850, 1500); 
            this.nextAITimer = millis() + random(interval, interval * 1.5);
        }
    }

    // display 函數保持不變
    // drawTopBar 函數保持不變

    display() {
        background(255);

        // 頂部 HUD
        this.drawTopBar();

        // 工具欄
        this.drawToolbar();

        // Canvas
        this.drawGameCanvas();

        // 右側圖層面板
        this.drawLayerPanel();
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
        text(this.players[0].score, 195, 30);

        fill(COLORS.textDark);
        textSize(12);
        text('Points', 195, 55);

        // 目標提示
        const playerPos = this.layerOrder.indexOf(0);
        if (playerPos === this.targetIdx) {
            fill(COLORS.secondary2);
            textSize(16);
            textAlign(RIGHT, CENTER);
            text('✨ 位置正確!', width - 100, 40);
        }
        
        fill(26, 26, 46);
        textSize(14);
        textAlign(LEFT, CENTER);
        const posNames = ["第1層", "第2層", "第3層", "第4層"];
        text('🎯 目標位置: ' + posNames[this.targetIdx], 90, 85);
    }

    drawToolbar() {
        fill(45, 45, 45);
        noStroke();
        rect(0, 70, 60, CANVAS_HEIGHT);

        // 根據原始代碼，這裡的工具圖示是 '✨', '⚙️', '✏️', '🧹', '🖌️', '📝'
        const tools = ['✨', '⚙️', '✏️', '🧹', '🖌️', '📝']; 
        for (let i = 0; i < tools.length; i++) {
            fill(255);
            textAlign(CENTER, CENTER);
            textSize(20);
            text(tools[i], 30, 105 + i * 50); // 調整位置以匹配首頁卡片
        }
    }

    drawGameCanvas() {
        // Canvas 背景
        fill(240);
        stroke(78, 205, 196);
        strokeWeight(1); // 調整邊框粗細
        rect(this.canvasX, 70, CANVAS_WIDTH, CANVAS_HEIGHT);

        // 繪製角色圖層 (依序從下往上畫)
        for (let i = this.layerOrder.length - 1; i >= 0; i--) {
            const playerId = this.layerOrder[i];
            const player = this.players[playerId];
            const slot = this.slots[playerId];
            const isTop = (i === 0);

            const x = this.canvasX + slot.x * CANVAS_WIDTH + 60;
            const y = 70 + slot.y * CANVAS_HEIGHT + 60;

            fill(player.color); // 角色背景色
            stroke(isTop ? COLORS.secondary2 : COLORS.border); // 頂層角色黃色邊框
            strokeWeight(isTop ? 4 : 2); // 頂層角色粗邊框
            circle(x, y, 100); // 調整角色大小

            fill(255);
            textAlign(CENTER, CENTER);
            textSize(50);
            text(player.emoji, x, y);

            if (isTop) {
                fill(COLORS.secondary2); // 皇冠顏色
                textSize(24); // 皇冠大小
                text('👑', x + 50, y - 50);
            }
        }
    }

    drawLayerPanel() {
        fill(235);
        stroke(COLORS.border);
        strokeWeight(1);
        rect(this.panelX, 70, 60, CANVAS_HEIGHT);

        // 繪製目標位置高亮框
        push();
        fill(255, 255, 0, 40); // 淡淡的黃色提示
        noStroke();
        rect(this.panelX + 2, 90 + this.targetIdx * this.rowH, 56, 52, 6);
        pop();

        // 面板標題
        fill(COLORS.textDark);
        textSize(10);
        textStyle(BOLD);
        textAlign(LEFT);
        text('圖層', this.panelX + 5, 85);

        // 繪製圖層列表
        for (let i = 0; i < this.layerOrder.length; i++) {
            const playerId = this.layerOrder[i];
            const player = this.players[playerId];
            
            let y = 90 + i * this.rowH;
            // 如果是玩家且正在拖曳，則 Y 座標跟隨滑鼠
            if (this.dragging && playerId === 0) {
                y = constrain(mouseY - this.dragOffset, 90, 90 + (this.players.length - 1) * this.rowH - 8); // 減去 8 讓底部對齊
            }

            // 背景
            fill(player.color);
            // CPU 閃爍效果
            if (this.cpuFlashId === playerId && millis() < this.cpuFlashTime) {
                fill(255); // 閃爍白色
            }
            
            // 玩家拖曳時的邊框
            stroke(playerId === 0 && this.dragging ? COLORS.secondary2 : COLORS.border);
            strokeWeight(playerId === 0 && this.dragging ? 3 : 1);
            rect(this.panelX + 4, y, 52, 52, 6); // 調整圓角

            fill(255);
            textAlign(CENTER, CENTER);
            textSize(24);
            text(player.emoji, this.panelX + 30, y + 26);
            
            // 玩家圖層的「拖我！」提示
            if (playerId === 0) {
                fill(COLORS.textDark);
                textSize(9);
                text('拖我！', this.panelX + 30, y + 42);
            }
        }
    }

    // 處理滑鼠點擊事件
    handleClick(x, y) {
        // 檢查是否點擊了玩家的圖層面板行
        const playerIdx = this.layerOrder.indexOf(0);
        const rowY = 90 + playerIdx * this.rowH;
        // 判斷點擊是否在玩家圖層行的範圍內
        if (x > this.panelX + 4 && x < this.panelX + 4 + 52 && y > rowY && y < rowY + 52) {
            this.dragging = true;
            this.dragOffset = mouseY - rowY;
            this.snd(500, .04, "square", .08); // 拖曳開始音效
        }
    }

    // 處理滑鼠拖曳事件
    handleDragging(x, y) {
        if (!this.dragging) return;

        // 計算玩家圖層的新索引位置
        // 確保拖曳範圍在圖層面板內
        const constrainedY = constrain(mouseY - this.dragOffset, 90, 90 + (this.players.length - 1) * this.rowH - 8);
        const newIdx = round((constrainedY - 90) / this.rowH);
        const oldIdx = this.layerOrder.indexOf(0);
        
        if (newIdx !== oldIdx) {
            this.moveTo(0, newIdx); // 移動玩家圖層
            this.snd(500 + (this.players.length - 1 - newIdx) * 120, .04, "square", .08); // 排序音效
        }
    }

    // 處理滑鼠釋放事件 (拖曳結束)
    handleMouseReleased() {
        if (this.dragging) {
            this.dragging = false;
            // 拖曳結束後，可以觸發一次佈局更新，確保視覺對齊
            // (在 p5.js 中，因為 display() 每幀都繪製，所以通常不需要額外佈局)
        }
    }

    cpuAction() {
        const cpus = [1, 2, 3].filter(id => this.layerOrder.indexOf(id) !== 0);
        if (cpus.length > 0) {
            const id = random(cpus);
            const oldIdx = this.layerOrder.indexOf(id);
            this.moveTo(id, 0); // 將 CPU 移動到最頂層
            
            this.cpuFlashId = id;
            this.cpuFlashTime = millis() + 200;
            this.snd(260, .07, "sawtooth", .08); // CPU 搶奪音效
        }
    }
}