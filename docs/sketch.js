let gameManager;
let currentScreen = 'menu'; // 'menu', 'game', 'result'
let currentGame = 0; // 1, 2, 3
let currentDifficulty = 'normal';

function setup() {
    createCanvas(390, 844);
    frameRate(60);
    gameManager = new GameManager();
}

function draw() {
    background(255);

    if (currentScreen === 'menu') {
        gameManager.drawMainMenu();
    } else if (currentScreen === 'game') {
        if (currentGame === 1) {
            gameManager.game1.update();
            gameManager.game1.display();
        } else if (currentGame === 2) {
            gameManager.game2.update();
            gameManager.game2.display();
        } else if (currentGame === 3) {
            gameManager.game3.update();
            gameManager.game3.display();
        } else if (currentGame === 4) { // New Game 4
            gameManager.game4.update();
            gameManager.game4.display();
        } else if (currentGame === 5) { // New Game 5
            gameManager.game5.update();
            gameManager.game5.display();
        }
    } else if (currentScreen === 'result') {
        gameManager.drawResultScreen();
    }
}

function mousePressed() {
    if (currentScreen === 'menu') {
        gameManager.handleMenuClick(mouseX, mouseY);
    } else if (currentScreen === 'game') {
        if (currentGame === 1) {
            gameManager.game1.handleClick(mouseX, mouseY);
        } else if (currentGame === 2) {
            gameManager.game2.handleClick(mouseX, mouseY);
        } else if (currentGame === 3) {
            gameManager.game3.handleClick(mouseX, mouseY);
        } else if (currentGame === 4) { // New Game 4
            gameManager.game4.handleClick(mouseX, mouseY);
        } else if (currentGame === 5) { // New Game 5
            gameManager.game5.handleClick(mouseX, mouseY);
        }
    } else if (currentScreen === 'result') {
        gameManager.handleResultScreenClick(mouseX, mouseY);
    }
    return false;
}

function mouseDragged() {
    if (currentScreen === 'game') {
        if (currentGame === 1) {
            gameManager.game1.handleDragging(mouseX, mouseY);
        } else if (currentGame === 4) { // New Game 4
            gameManager.game4.handleDragging(mouseX, mouseY);
        } else if (currentGame === 5) { // New Game 5
            gameManager.game5.handleDragging(mouseX, mouseY);
        }
    } else if (currentScreen === 'menu') {
        gameManager.handleMenuScroll(mouseY - pmouseY);
    }
    return false;
}

function mouseReleased() {
    if (currentScreen === 'game') {
        if (currentGame === 1) {
            gameManager.game1.handleMouseReleased();
        } else if (currentGame === 2) {
            gameManager.game2.handleMouseReleased();
        } else if (currentGame === 4) { // New Game 4
            gameManager.game4.handleMouseReleased();
        } else if (currentGame === 5) { // New Game 5
            gameManager.game5.handleMouseReleased();
        }
    }
    return false;
}

function mouseMoved() {
    if (currentScreen === 'game' && currentGame === 3) {
        gameManager.game3.handleMouseMove(mouseX, mouseY);
    }
    return false;
}

function keyPressed() {
    if (currentScreen === 'game' && currentGame === 3) {
        gameManager.game3.handleKeyPress(keyCode);
    }
    return false;
}

function keyReleased() {
    if (currentScreen === 'game' && currentGame === 3) {
        gameManager.game3.handleKeyRelease(keyCode);
    }
    return false;
}

// 遊戲管理器
class GameManager {
    constructor() {
        this.game1 = new Game1();
        this.game2 = new Game2();
        this.game3 = new Game3();
        this.game4 = new Game4(); // Initialize Game 4
        this.game5 = new Game5(); // Initialize Game 5
        this.menuCards = this.createMenuCards();
        this.lastScore = 0;
        this.scrollY = 0; // 新增捲動偏移量
    }

    createMenuCards() {
        return [
            {
                id: 1,
                title: '調色大師',
                description: '精準色彩對比！',
                icon: '✨',
                color: COLORS.secondary1,
                x: 30,
                y: 190,
                width: 340,
                height: 90
            },
            {
                id: 2,
                title: '圖層疊疊樂',
                description: '別擋住我的臉！',
                icon: '👑',
                color: COLORS.secondary2,
                x: 30,
                y: 290,
                width: 340,
                height: 90
            },
            {
                id: 3,
                title: '仿製印章',
                description: '把臉擦乾淨！',
                icon: '🖌️',
                color: COLORS.secondary3,
                x: 30,
                y: 390,
                width: 340,
                height: 90
            },
            {
                id: 4, // New Game ID
                title: '色彩大師', // New Game Title
                description: '再戰色彩對比！', // New Game Description
                icon: '🌈', // New Game Icon
                color: COLORS.primary, // Choose a suitable color
                x: 30,
                y: 610, // Position below Game 3
                width: 340,
                height: 110
            },
            {
                id: 5, // New Game ID
                title: '筆刷大師', // New Game Title
                description: '精準繪製圓形！', // New Game Description
                icon: '🖌️', // New Game Icon
                color: COLORS.secondary3, // Choose a suitable color
                x: 30,
                y: 740, // Position below Game 4
                width: 340,
                height: 110
            }
        ];
    }

    drawMainMenu() {
        // 背景
        background(255);

        push();
        translate(0, this.scrollY); // 應用捲動偏移

        // 標題
        fill(COLORS.textDark);
        textAlign(CENTER, CENTER);
        textSize(42);
        textStyle(BOLD);
        text('🎮 PS 派對', width / 2, 90);
        
        textSize(24);
        fill(COLORS.secondary1);
        text('工具大亂鬥', width / 2, 145);
        
        stroke(COLORS.border);
        strokeWeight(1);
        line(50, 180, width - 50, 180);

        // 遊戲卡片
        this.menuCards.forEach(card => {
            this.drawMenuCard(card);
        });
        pop();

        // 繪製右側捲動條指示器
        this.drawMenuScrollbar();
    }

    drawMenuCard(card) {
        push();
        // 卡片背景
        fill(255);
        stroke(COLORS.border);
        strokeWeight(1);
        rect(card.x, card.y, card.width, card.height, 16);
        
        // 左側色彩飾條 (模擬 PS 工具選取)
        noStroke();
        fill(card.color);
        rect(card.x, card.y + 15, 6, card.height - 30, 3);

        // 圖示 (位置微調)
        fill(COLORS.textDark);
        textSize(38);
        textAlign(LEFT, CENTER);
        text(card.icon, card.x + 25, card.y + card.height / 2);

        // 標題
        fill(COLORS.textDark);
        textSize(18);
        textStyle(BOLD);
        text(card.title, card.x + 85, card.y + card.height / 2 - 12);

        // 描述
        fill(80); // 稍微淡一點的文字顏色
        textSize(12);
        textStyle(NORMAL);
        text(card.description, card.x + 85, card.y + card.height / 2 + 15);
        pop();
    }

    drawMenuScrollbar() {
        const barWidth = 6;
        const x = width - 15;
        const topOffset = 180; // 標題區底部
        const bottomOffset = 50; // 底部留白
        const trackHeight = height - topOffset - bottomOffset; // 捲動條軌道高度

        const contentHeight = this.menuCards[this.menuCards.length - 1].y + this.menuCards[this.menuCards.length - 1].height - this.menuCards[0].y;
        const visibleContentHeight = height - this.menuCards[0].y - bottomOffset; // 從第一張卡片頂部到螢幕底部
        const scrollableHeight = Math.max(0, contentHeight - visibleContentHeight);
        const barHeight = Math.max(30, trackHeight * (visibleContentHeight / contentHeight)); // 捲動把手高度，至少30px
        
        // 捲動軌跡
        fill(240);
        noStroke();
        rect(x, topOffset, barWidth, trackHeight, 3);
        
        // 捲動把手位置計算
        const scrollFrac = map(this.scrollY, 0, -scrollableHeight, 0, 1);
        const y = map(scrollFrac, 0, 1, topOffset, topOffset + trackHeight - barHeight);
        
        fill(200);
        rect(x, y, barWidth, barHeight, 3);
    }

    handleMenuScroll(delta) {
        this.scrollY += delta;
        const contentHeight = this.menuCards[this.menuCards.length - 1].y + this.menuCards[this.menuCards.length - 1].height - this.menuCards[0].y;
        const visibleContentHeight = height - this.menuCards[0].y - 50; // 從第一張卡片頂部到螢幕底部
        const maxScrollY = Math.min(0, -(contentHeight - visibleContentHeight));
        this.scrollY = constrain(this.scrollY, maxScrollY, 0); 
    }

    handleMenuClick(x, y) {
        // 點擊判定時需要扣除目前的捲動偏移量
        const adjustedY = y - this.scrollY;
        this.menuCards.forEach(card => {
            if (
                x > card.x && x < card.x + card.width &&
                adjustedY > card.y && adjustedY < card.y + card.height
            ) {
                currentGame = card.id;
                currentScreen = 'game';
                
                if (currentGame === 1) {
                    this.game1.reset();
                } else if (currentGame === 2) {
                    this.game2.reset();
                } else if (currentGame === 3) {
                    this.game3.reset();
                } else if (currentGame === 4) { // New Game 4
                    this.game4.reset();
                } else if (currentGame === 5) { // New Game 5
                    this.game5.reset();
                }
            }
        });
    }

    drawResultScreen() {
        background(255);

        // 背景漸層
        fill(255, 107, 107, 30);
        rect(0, 0, width, height);

        // 結果卡片
        fill(255);
        stroke(200);
        strokeWeight(2);
        rect(50, 200, 290, 300, 16);

        // 標題
        fill(26, 26, 46);
        textAlign(CENTER, CENTER);
        textSize(32);
        textStyle(BOLD);
        text('遊戲結束!', 195, 250);

        // 得分
        fill(255, 107, 107);
        textSize(48);
        text(this.lastScore, 195, 330);

        // 星級
        fill(255, 230, 109);
        textSize(20);
        const stars = Math.min(5, Math.floor(this.lastScore / 500) + 1);
        let starText = '';
        for (let i = 0; i < stars; i++) starText += '⭐';
        text(starText, 195, 390);

        // 按鈕
        this.drawButton('重新遊玩', 195, 470, 140, 40, COLORS.primary);
        this.drawButton('返回菜單', 195, 530, 140, 40, COLORS.secondary1);
    }

    drawButton(label, x, y, w, h, color) {
        fill(color);
        noStroke();
        rect(x - w / 2, y - h / 2, w, h, 8);

        fill(255);
        textSize(14);
        textStyle(BOLD);
        textAlign(CENTER, CENTER);
        text(label, x, y);
    }

    handleResultScreenClick(x, y) {
        // 重新遊玩按鈕
        const replayBtnX = 195;
        const replayBtnY = 470;
        const replayBtnW = 140;
        const replayBtnH = 40;

        if (x > replayBtnX - replayBtnW / 2 && x < replayBtnX + replayBtnW / 2 &&
            y > replayBtnY - replayBtnH / 2 && y < replayBtnY + replayBtnH / 2) {
            currentScreen = 'game';
            // 根據上次玩的遊戲 ID 重新啟動遊戲
            if (currentGame === 1) this.game1.reset();
            else if (currentGame === 2) this.game2.reset();
            else if (currentGame === 3) this.game3.reset();
            else if (currentGame === 4) this.game4.reset(); // New Game 4
            else if (currentGame === 5) this.game5.reset(); // New Game 5
        }

        // 返回菜單按鈕
        const menuBtnX = 195;
        const menuBtnY = 530;
        const menuBtnW = 140;
        const menuBtnH = 40;
        if (x > menuBtnX - menuBtnW / 2 && x < menuBtnX + menuBtnW / 2 &&
            y > menuBtnY - menuBtnH / 2 && y < menuBtnY + menuBtnH / 2) {
            currentScreen = 'menu';
        }
    }
}