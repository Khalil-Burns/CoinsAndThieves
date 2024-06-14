let numOfCells = 25;
let numOfThieves = 3;
let thiefPos;
let rows = 5;
let columns = 5;
let gridContainer;
let TIME_INTERVAL_MS = 20;
let fallingCells;
let gravity = 1;
let gameOver;
let openedCells;
let fading;
let prevTime;
let modal;
let gameEndModal;
let confirmResetModal;
let coinCount;
let coinCountDisplay;
let coinBalance = 30;
let coinBalanceDisplay;
let numOfThievesDisplay;
let gameCost = 4;
let coinSpillAudio;
let coinPickupAudio;
let gameOverAudio;
let gameWinAudio;

window.onload = function() {
    gridContainer = document.getElementById('game-container');
    gridContainer.style.width = `${rows * 100}px`;
    gridContainer.style.height = `${columns * 100}px`

    modal = document.getElementById('modal');
    gameEndModal = document.getElementById('game-end-content');
    confirmResetModal = document.getElementById('confirm-reset-modal');

    coinCountDisplay = document.getElementById('numOfCoins');
    coinBalanceDisplay = document.getElementById('coinBalance');
    numOfThievesDisplay = document.getElementById('thieveNum');

    coinPickupAudio = new Audio('sounds/coinPickup.mp3');
    coinSpillAudio = new Audio('sounds/coinSpill.mp3');
    gameOverAudio = new Audio('sounds/gameOver.wav');
    gameWinAudio = new Audio('sounds/gameWin.wav');

    reset();

    setInterval(loop, TIME_INTERVAL_MS);
}

function reset() {

    coinBalance -= gameCost;
    
    let cell;
    let underCell;
    let underCellImage;
    let cellContainer;

    gridContainer.innerHTML = '';

    hideModal();
    coinBalanceDisplay.innerHTML = `  ${coinBalance}`;

    gameOver = false;
    coinCount = 0;
    openedCells = new Set([]);
    fallingCells = new Set([]);
    thiefPos = new Set([]);

    numOfThieves = Math.floor(Math.random() * 6 + 1);
    numOfThievesDisplay.innerHTML = numOfThieves;

    fading = 0;
    prevTime = null;

    stopAudio();

    for (let i = 0; i < numOfThieves; i++) {
        // let pos = Math.floor(Math.random() * numOfCells + 1);
        let pos = Math.floor(Math.random() * rows) * columns + Math.floor(Math.random() * columns + 1)
        if (thiefPos.has(pos)) {
            i--;
            continue;
        }

        thiefPos.add(pos);
    }

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < columns; j++) {
            let cellNum = (i) * columns + (j + 1)
            if (cellNum > numOfCells) {
                continue;
            }

            cellContainer = document.createElement('div');
            cell = document.createElement('div');
            underCell = document.createElement('div');
            underCellImage = document.createElement('img')
            if (thiefPos.has(cellNum)) {
                cell.thief = true;
            }
            else {
                cell.thief = false;
            }
            
            underCellImage.src = `images/${cell.thief?'thief.png':'coin.gif'}`;
            underCellImage.style.width = '100%';
            underCellImage.style.height = '100%';
            underCellImage.id = cellNum + numOfCells;
            underCellImage.posX = 0;
            underCellImage.posY = 0;
            underCellImage.rotation = 0;
            underCellImage.speedX = 0;
            underCellImage.speedY = 0;
            underCellImage.speedAngular = 0;
            underCell.appendChild(underCellImage);

            cellContainer.style.gridArea = `${i + 1} / ${j + 1}`;

            cell.classList.add('cell');
            cell.id = `${cellNum}`;
            cell.posX = 0;
            cell.posY = 0;
            cell.rotation = 0;
            cell.speedX = 0;
            cell.speedY = 0;
            cell.speedAngular = 0;
            cell.addEventListener('mouseover', (event) => {
                if (gameOver) {
                    return;
                }
                event.target.classList.add('hovered-cell');
            });
            cell.addEventListener('mouseout', (event) => {
                if (gameOver) {
                    return;
                }
                event.target.classList.remove('hovered-cell');
            });
            cell.onclick = function(event) {
                if (fallingCells.has(event.target.id)) {
                    return;
                }
                if (gameOver) {
                    return;
                }
                if (event.target.thief) {
                    // gameOver = true;
                    gameOverAudio.play();
                    for (let k of openedCells) {
                        fallingCells.add(`${k}`)
                        let tempUnderCell = document.getElementById(k);
                        tempUnderCell.speedX = Math.random() * 8 - 4;
                        tempUnderCell.speedY = Math.random() * -8 - 8;
                        tempUnderCell.speedAngular = Math.random() * 16 - 8;
                        tempUnderCell.style.zIndex = '3';
                    }
                    fadeOut(event.target.id)
                    coinCount = 0;
                    end();
                }
                else {
                    coinCount++;
                    // stopAudio();
                    coinPickupAudio.pause();
                    coinPickupAudio.currentTime = 0;
                    coinPickupAudio.play();
                }
                openedCells.add(Number(event.target.id) + numOfCells);
                fallingCells.add(event.target.id);
                event.target.speedX = Math.random() * 8 - 4;
                event.target.speedY = Math.random() * -8 - 8;
                event.target.speedAngular = Math.random() * 16 - 8;
                event.target.style.zIndex = '3';
            }
            
            underCell.classList.add('underCell');

            cellContainer.appendChild(cell);
            cellContainer.appendChild(underCell);
            gridContainer.appendChild(cellContainer);
        }
    }
}
function hideModal() {
    modal.style.display = 'none';
    gameEndModal.style.display = 'none';
    confirmResetModal.style.display = 'none';
}
function showConfirmResetModal() {
    hideModal();
    modal.style.display = 'block';
    confirmResetModal.style.display = 'block';
}
function win() {
    // stopAudio();
    gameWinAudio.play();
    end();
}
function end() {
    if (gameOver) {
        return;
    }
    gameOver = true;
    fading = 1;
    prevTime = new Date().getTime();
    fadeOut();
}
function fadeOut(cell) {
    for (let k = 1; k <= numOfCells; k++) {
        if (cell) {
            if (k == Number(cell)) {
                continue;
            }
        }
        let tempUnderCell = document.getElementById(k);
        tempUnderCell.classList.add('fade-out')
    }
}

function loop() {
    for (let idx of fallingCells) {
        fall(idx);
    }

    if (fading == 1) {
        let curTime = new Date().getTime()
        if (curTime - prevTime >= 1000) {
            fading = 2;
            // stopAudio();
            coinSpillAudio.play();
            for (let i = numOfCells + 1; i <= 2 * numOfCells; i++) {
                if (openedCells.has(i)) {
                    continue;
                }
                if (thiefPos.has(i - numOfCells)) {
                    continue;
                }
                fallingCells.add(`${i}`)
                let tempUnderCell = document.getElementById(i);
                tempUnderCell.speedX = Math.random() * 8 - 4;
                tempUnderCell.speedY = Math.random() * -8 - 8;
                tempUnderCell.speedAngular = Math.random() * 16 - 8;
                tempUnderCell.style.zIndex = '3';
            }
        }
    }
    else if (fading == 2) {
        let curTime = new Date().getTime()
        if (curTime - prevTime >= 2000) {
            hideModal();
            modal.style.display = 'block';
            gameEndModal.style.display = 'block';

            coinCountDisplay.innerHTML = coinCount;
            coinBalance += coinCount;
            fading = 0;
        }
    }
}

function fall(idx) {
    let cell = document.getElementById(`${idx}`);

    let  rect = cell.getBoundingClientRect();
    if ((rect.x + rect.width) < 0 || (rect.x > window.innerWidth || rect.y > window.innerHeight)) {
        fallingCells.delete(idx)
    }

    cell.posX += cell.speedX;
    cell.posY += cell.speedY;
    cell.rotation += cell.speedAngular;
    cell.speedY += gravity;

    cell.style.top = `${cell.posY}px`;
    cell.style.left = `${cell.posX}px`;
    cell.style.transform = `rotate(${cell.rotation}deg)`;
}

function stopAudio() {
    coinSpillAudio.pause();
    coinPickupAudio.pause();
    gameOverAudio.pause();
    gameWinAudio.pause();
    coinSpillAudio.currentTime = 0;
    coinPickupAudio.currentTime = 0;
    gameOverAudio.currentTime = 0;
    gameWinAudio.currentTime = 0;
}