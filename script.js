// ----- Levels data -----
const levels = [
  [
    { question: "1 + 1 = ?", choices: ["1","2","3","4"], answerIndex: 1 },
    { question: "2 + 2 = ?", choices: ["2","3","4","5"], answerIndex: 2 }
  ],
  [
    { question: "5 + 5 = ?", choices: ["5","10","15","20"], answerIndex: 1 },
    { question: "10 - 3 = ?", choices: ["7","8","9","6"], answerIndex: 0 }
  ],
  [
    { question: "12 ÷ 4 = ?", choices: ["2","3","4","6"], answerIndex: 1 },
    { question: "3 x 3 = ?", choices: ["6","8","9","12"], answerIndex: 2 }
  ]
];

let currentLevel = 0;
let currentQuestions = [];
let currentIndex = 0;
let score = 0;
let unlockedLevels = [0];
let timer;
let timeLeft = 10;

// ----- DOM -----
const questionElem = document.getElementById('question');
const choicesElem = document.getElementById('choices');
const progressElem = document.getElementById('progress');
const timerElem = document.getElementById('timer');
const nextBtn = document.getElementById('nextBtn');
const resultElem = document.getElementById('result');
const levelBoxes = document.querySelectorAll('.level-box');
const confettiCanvas = document.getElementById('confetti-canvas');
const confettiCtx = confettiCanvas.getContext('2d');

confettiCanvas.width = window.innerWidth;
confettiCanvas.height = window.innerHeight;

// ----- Load level -----
function loadLevel(level) {
  currentLevel = level;
  currentQuestions = levels[level];
  currentIndex = 0;
  score = 0;

  questionElem.style.display='';
  choicesElem.style.display='';
  nextBtn.style.display='';
  progressElem.style.display='';
  timerElem.style.display='';
  resultElem.style.display='none';

  updateLevels();
  renderQuestion();
}

// ----- Update level boxes -----
function updateLevels(unlockIndex = null) {
  levelBoxes.forEach(box => {
    const lvl = Number(box.dataset.level);
    if (unlockedLevels.includes(lvl)) {
      box.classList.remove('locked');
      box.innerText = `Level ${lvl+1} 🔓`;
      if(unlockIndex !== null && lvl === unlockIndex){
        box.classList.add('unlocked');
        setTimeout(()=> box.classList.remove('unlocked'), 700);
      }
    } else {
      box.classList.add('locked');
      box.innerText = `Level ${lvl+1} 🔒`;
    }
  });
}

// ----- Render question -----
function renderQuestion() {
  const q = currentQuestions[currentIndex];
  questionElem.innerText = q.question;
  choicesElem.innerHTML = '';

  timeLeft = 10;
  timerElem.innerText = `Time: ${timeLeft}`;
  clearInterval(timer);
  timer = setInterval(()=>{
    timeLeft--;
    timerElem.innerText = `Time: ${timeLeft}`;
    if(timeLeft <= 0){
      clearInterval(timer);
      selectAnswer(null);
    }
  },1000);

  q.choices.forEach((choice,i)=>{
    const btn = document.createElement('button');
    btn.className = 'choice-btn';
    btn.innerText = choice;
    btn.addEventListener('click', e => selectAnswer(e));
    choicesElem.appendChild(btn);
  });

  progressElem.innerText = `${currentIndex+1} / ${currentQuestions.length}`;
  nextBtn.disabled = true;
}

// ----- Select answer -----
function selectAnswer(e) {
  clearInterval(timer);
  const q = currentQuestions[currentIndex];
  const correctChoice = q.choices[q.answerIndex];

  document.querySelectorAll('.choice-btn').forEach(btn=>{
    btn.disabled=true;
    if(btn.innerText === correctChoice) btn.classList.add('correct');
  });

  if(e && e.currentTarget.innerText === correctChoice) score++;
  else if(e) e.currentTarget.classList.add('wrong');

  nextBtn.disabled=false;
}

// ----- Next question -----
nextBtn.addEventListener('click', ()=>{
  currentIndex++;
  if(currentIndex < currentQuestions.length){
    renderQuestion();
  } else {
    showResults();
  }
});

// ----- Show results -----
function showResults() {
  questionElem.style.display='none';
  choicesElem.style.display='none';
  nextBtn.style.display='none';
  progressElem.style.display='none';
  timerElem.style.display='none';

  resultElem.style.display='block';

  let html = `<h2>You scored ${score} / ${currentQuestions.length}</h2>`;

  const nextLevelAvailable = score === currentQuestions.length && currentLevel+1 < levels.length;
  const lastLevelCompleted = score === currentQuestions.length && currentLevel+1 >= levels.length;

  if(lastLevelCompleted){
    html += `
      <h3>🎉 Congratulations! You cleared all levels. Thank you for playing!</h3>
      <a href="https://omarnouraldin.github.io/my-portfolio/" target="_blank">Go back to my website</a>
    `;
  } else if(nextLevelAvailable){
    html += `<button id="nextLevelBtn">Next Level</button>`;
  } else {
    html += `<button id="restartBtn">Restart</button>`;
  }

  resultElem.innerHTML = html;

  if(nextLevelAvailable){
    document.getElementById('nextLevelBtn').addEventListener('click', ()=>{
      unlockedLevels.push(currentLevel+1);
      triggerConfetti();
      updateLevels(currentLevel+1); // animation for unlock
      loadLevel(currentLevel+1);
    });
  } else if(!lastLevelCompleted){
    document.getElementById('restartBtn').addEventListener('click', ()=>{
      loadLevel(currentLevel);
    });
  }
}

// ----- Level box clicks -----
levelBoxes.forEach(box=>{
  box.addEventListener('click', ()=>{
    const lvl = Number(box.dataset.level);
    if(unlockedLevels.includes(lvl)) loadLevel(lvl);
    else alert('🔒 This level is locked!');
  });
});

// ----- Confetti -----
let confettiActive = false;
function triggerConfetti(){
  if(confettiActive) return;
  confettiActive = true;

  const confettis = [];
  for(let i=0;i<150;i++){
    confettis.push({
      x: Math.random()*window.innerWidth,
      y: Math.random()*window.innerHeight - window.innerHeight,
      r: Math.random()*6+4,
      d: Math.random()*150,
      color: `hsl(${Math.random()*360}, 100%, 50%)`,
      tilt: Math.random()*10-10,
      tiltAngleIncrement: Math.random()*0.07+0.05,
      tiltAngle: 0
    });
  }

  let startTime = null;

  function draw(timestamp){
    if(!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;
    confettiCtx.clearRect(0,0,window.innerWidth, window.innerHeight);

    confettis.forEach((c)=>{
      c.tiltAngle += c.tiltAngleIncrement;
      c.y += (Math.cos(c.d) + 3 + c.r/2)/2;
      c.tilt = Math.sin(c.tiltAngle)*15;
      confettiCtx.fillStyle = c.color;
      confettiCtx.beginPath();
      confettiCtx.moveTo(c.x+c.tilt+ c.r/2, c.y);
      confettiCtx.lineTo(c.x+c.tilt, c.y+c.tilt+ c.r/2);
      confettiCtx.lineTo(c.x+c.tilt- c.r/2, c.y);
      confettiCtx.lineTo(c.x+c.tilt, c.y-c.tilt- c.r/2);
      confettiCtx.closePath();
      confettiCtx.fill();
    });

    if(elapsed < 3000) requestAnimationFrame(draw);
    else {
      confettiCtx.clearRect(0,0,window.innerWidth, window.innerHeight);
      confettiActive = false;
    }
  }

  requestAnimationFrame(draw);
}

// ----- Initial load -----
updateLevels();
loadLevel(0);
