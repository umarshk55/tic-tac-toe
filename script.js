// 🎵 Audio setup
let ting = new Audio("ting.mp3");
let winSound = new Audio("gameover.mp3");
let bgMusic = new Audio("music.mp3");
bgMusic.loop = true;
bgMusic.volume = 0.15;

// DOM refs
const boxes = Array.from(document.querySelectorAll(".box"));
const info = document.querySelector(".info");
const resetBtn = document.querySelector("#reset");
const restartBtn = document.querySelector("#restart");
const xScoreEl = document.querySelector("#xScore");
const oScoreEl = document.querySelector("#oScore");
const imgBox = document.querySelector(".imgbox img");

// Game state
let turn = "X";
let gameOver = false;
let xScore = 0, oScore = 0;

// Track order of moves so we can remove oldest reliably
let moveOrder = []; // will contain indices of boxes in the order they were filled

const winPatterns = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

const changeTurn = () => turn === "X" ? "O" : "X";

function updateInfo(text){
  info.innerText = text;
}

// attach click handlers (use index so moveOrder works)
boxes.forEach((box, idx) => {
  box.addEventListener("click", () => {
    if (gameOver) return;
    if (box.innerText !== "") return; // ignore non-empty boxes

    // make the move
    box.innerText = turn;
    moveOrder.push(idx);
    ting.currentTime = 0;
    ting.play();

    const winnerFound = checkWin(); // returns true if win

    if (!winnerFound) {
      // if no winner, check for full board
      if (boxes.every(b => b.innerText !== "")) {
        // board is full and no winner → remove oldest move (rotate)
        // small timeout so player sees the last move briefly before it disappears
        setTimeout(() => {
          const oldestIdx = moveOrder.shift(); // index of first filled box
          if (typeof oldestIdx === "number") {
            boxes[oldestIdx].innerText = "";
            // ensure class removal if any (safety)
            boxes[oldestIdx].classList.remove("win");
          }
        }, 120); // tiny delay so the last click is perceptible
      } else {
        // continue game switching turn
        turn = changeTurn();
        updateInfo(`Turn for ${turn}`);
      }
    }
  });
});

function checkWin(){
  let hasWinner = false;

  for (const p of winPatterns){
    const [a,b,c] = p;
    const A = boxes[a].innerText;
    const B = boxes[b].innerText;
    const C = boxes[c].innerText;
    if (A !== "" && A === B && B === C){
      hasWinner = true;
      gameOver = true;

      // visual effects for winning boxes
      boxes[a].classList.add("win");
      boxes[b].classList.add("win");
      boxes[c].classList.add("win");

      // show winner, play sound, update score
      updateInfo(`${A} Won 🏆`);
      info.classList.add("winner-glow");

      imgBox.style.opacity = "1";
      imgBox.style.transform = "scale(1)";

      winSound.currentTime = 0;
      winSound.play();

      if (A === "X") xScore++;
      else oScore++;
      xScoreEl.innerText = xScore;
      oScoreEl.innerText = oScore;

      // after a short delay reset board for next round (full reset)
      setTimeout(() => {
        fullResetAfterWin();
      }, 1800);

      break;
    }
  }

  return hasWinner;
}

function fullResetAfterWin(){
  // fully clear board, clear move order, hide image, ready for next round
  boxes.forEach(b => {
    b.innerText = "";
    b.classList.remove("win");
  });
  moveOrder = [];
  gameOver = false;
  info.classList.remove("winner-glow");
  imgBox.style.opacity = "0";
  imgBox.style.transform = "scale(0.9)";
  // Keep turn starting player as X — you can change if you want alternating starts
  turn = "X";
  updateInfo(`Turn for ${turn}`);
}

// Manual reset (clears board but keeps scores)
resetBtn.addEventListener("click", () => {
  boxes.forEach(b => {
    b.innerText = "";
    b.classList.remove("win");
  });
  moveOrder = [];
  gameOver = false;
  info.classList.remove("winner-glow");
  imgBox.style.opacity = "0";
  imgBox.style.transform = "scale(0.9)";
  turn = "X";
  updateInfo(`Turn for ${turn}`);
});

// Restart match (reset scores + board)
restartBtn.addEventListener("click", () => {
  xScore = 0; oScore = 0;
  xScoreEl.innerText = "0";
  oScoreEl.innerText = "0";
  // reuse reset logic
  resetBtn.click();
});

// optional: music toggle (press M)
document.addEventListener("keydown", (e) => {
  if (e.key.toLowerCase() === "m") {
    if (bgMusic.paused) bgMusic.play();
    else bgMusic.pause();
  }
});
