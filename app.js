// ============ STATE & STORAGE ============
const STORE_KEY = "ehoc_state_v1";

function loadState(){
  try{
    const raw = localStorage.getItem(STORE_KEY);
    if(raw) return JSON.parse(raw);
  }catch(e){}
  return {
    vocab:{},          // id -> {box, due, learned}
    grammarDone:{},    // id -> true
    listenDone:{},     // id -> true
    speakDone:{},      // id -> bestScore
    streak:0,
    lastActiveDate:null,
    activityLog:{}     // "YYYY-MM-DD" -> count
  };
}
let state = loadState();

function saveState(){
  localStorage.setItem(STORE_KEY, JSON.stringify(state));
}

function todayStr(){
  return new Date().toISOString().slice(0,10);
}

function markActivity(){
  const today = todayStr();
  state.activityLog[today] = (state.activityLog[today]||0) + 1;
  if(state.lastActiveDate !== today){
    const yesterday = new Date(Date.now()-86400000).toISOString().slice(0,10);
    if(state.lastActiveDate === yesterday){
      state.streak += 1;
    } else if(state.lastActiveDate !== today){
      state.streak = 1;
    }
    state.lastActiveDate = today;
  }
  saveState();
  renderHomeStats();
}

// ============ TAB NAV ============
function goTab(name){
  document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));
  document.getElementById("screen-"+name).classList.add("active");
  document.querySelectorAll("nav.tabbar button").forEach(b=>b.classList.remove("active"));
  document.querySelector(`nav.tabbar button[data-tab="${name}"]`).classList.add("active");
  if(name==="vocab") renderVocabTab();
  if(name==="grammar") renderGrammarTab();
  if(name==="listen") renderListenTab();
  if(name==="speak") renderSpeakTab();
  if(name==="home") renderHomeStats();
  window.scrollTo(0,0);
}

function showToast(msg){
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(()=>t.classList.remove("show"), 1800);
}

// ============ TTS HELPER ============
function speak(text, rate){
  if(!('speechSynthesis' in window)){
    showToast("Thiết bị không hỗ trợ phát âm thanh.");
    return;
  }
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-US";
  u.rate = rate || 0.95;
  window.speechSynthesis.speak(u);
}

// ============ HOME ============
function renderHomeStats(){
  document.getElementById("streakNum").textContent = state.streak || 0;
  const due = VOCAB_DATA.filter(v=>isDue(v.id)).length;
  document.getElementById("dueNum").textContent = due;
  const learned = Object.values(state.vocab).filter(v=>v.box>=5).length;
  document.getElementById("learnedNum").textContent = learned;

  document.getElementById("homeVocabBadge").textContent = due;
  document.getElementById("homeGrammarBadge").textContent =
    GRAMMAR_DATA.length - Object.keys(state.grammarDone).length;
  document.getElementById("homeListenBadge").textContent =
    LISTEN_DATA.length - Object.keys(state.listenDone).length;
  document.getElementById("homeSpeakBadge").textContent =
    SPEAK_DATA.length - Object.keys(state.speakDone).length;

  const today = new Date();
  const opts = {weekday:'long', day:'numeric', month:'long'};
  document.getElementById("todayStr").textContent =
    "Hôm nay, " + today.toLocaleDateString('vi-VN', opts);

  // week progress: count distinct days active in last 7 days
  let activeDays = 0;
  for(let i=0;i<7;i++){
    const d = new Date(Date.now()-i*86400000).toISOString().slice(0,10);
    if(state.activityLog[d]) activeDays++;
  }
  document.getElementById("weekFill").style.width = (activeDays/7*100)+"%";
  document.getElementById("weekText").textContent =
    activeDays===0 ? "Chưa có hoạt động nào." : `Bạn đã học ${activeDays}/7 ngày trong tuần này.`;
}

// ============ VOCAB (SRS Leitner) ============
let currentTopic = "Tất cả";
let vocabQueue = [];
let vocabIdx = 0;
let vocabFlipped = false;

function getVocabState(id){
  if(!state.vocab[id]) state.vocab[id] = {box:1, due:todayStr(), learned:false};
  return state.vocab[id];
}

function isDue(id){
  const v = getVocabState(id);
  return v.due <= todayStr();
}

function renderTopicPills(){
  const topics = ["Tất cả", ...new Set(VOCAB_DATA.map(v=>v.topic))];
  const wrap = document.getElementById("topicPills");
  wrap.innerHTML = topics.map(t=>
    `<span class="topic-pill ${t===currentTopic?'active':''}" onclick="selectTopic('${t}')">${t}</span>`
  ).join("");
}

function selectTopic(t){
  currentTopic = t;
  renderTopicPills();
  buildVocabQueue();
}

function buildVocabQueue(){
  let pool = VOCAB_DATA.filter(v => currentTopic==="Tất cả" || v.topic===currentTopic);
  vocabQueue = pool.filter(v=>isDue(v.id));
  if(vocabQueue.length===0) vocabQueue = pool; // nothing due -> allow free review
  vocabIdx = 0;
  vocabFlipped = false;
  renderVocabCard();
}

function renderVocabTab(){
  renderTopicPills();
  buildVocabQueue();
}

function renderVocabCard(){
  const area = document.getElementById("vocabArea");
  if(vocabQueue.length===0){
    area.innerHTML = `<div class="card empty-state">🎉 Không còn từ nào để ôn trong chủ đề này hôm nay!</div>`;
    return;
  }
  if(vocabIdx >= vocabQueue.length){
    area.innerHTML = `<div class="card empty-state">✅ Bạn đã ôn hết lượt từ vựng hôm nay.<br><br>
      <button class="btn" onclick="buildVocabQueue()">Ôn lại lượt nữa</button></div>`;
    return;
  }
  const v = vocabQueue[vocabIdx];
  const vs = getVocabState(v.id);
  area.innerHTML = `
    <div class="flash-wrap">
      <div class="progress-bar" style="width:100%;"><div class="fill" style="width:${(vocabIdx/vocabQueue.length*100)}%"></div></div>
      <div class="flashcard" id="flashcardEl" onclick="flipCard()">
        <div class="word">${v.word}</div>
        <div class="phon">${v.phon}</div>
        ${vocabFlipped ? `
          <div class="meaning">${v.meaning}</div>
          <div class="example">"${v.example}"</div>
        ` : `<div class="hint">Nhấn để xem nghĩa 👆</div>`}
      </div>
      <button class="btn secondary" onclick="event.stopPropagation();speak('${v.word.replace(/'/g,"\\'")}')">🔊 Nghe phát âm</button>
      ${vocabFlipped ? `
      <div class="rate-row">
        <button class="rate-again" onclick="rateCard('again')">Quên</button>
        <button class="rate-hard" onclick="rateCard('hard')">Khó</button>
        <button class="rate-good" onclick="rateCard('good')">Dễ</button>
      </div>` : ""}
      <p class="muted">Hộp ${vs.box}/5 · ${vocabIdx+1} / ${vocabQueue.length}</p>
    </div>
  `;
}

function flipCard(){
  vocabFlipped = !vocabFlipped;
  renderVocabCard();
}

function rateCard(result){
  const v = vocabQueue[vocabIdx];
  const vs = getVocabState(v.id);
  let intervalDays;
  if(result==="again"){ vs.box = 1; intervalDays = 0; }
  else if(result==="hard"){ vs.box = Math.max(1, vs.box); intervalDays = vs.box; }
  else { vs.box = Math.min(5, vs.box+1); intervalDays = [1,2,4,7,14][vs.box-1] || 14; }
  const due = new Date(Date.now() + intervalDays*86400000);
  vs.due = due.toISOString().slice(0,10);
  if(vs.box>=5) vs.learned = true;
  saveState();
  markActivity();
  vocabIdx++;
  vocabFlipped = false;
  renderVocabCard();
}

function resetVocabProgress(){
  if(confirm("Đặt lại toàn bộ tiến độ từ vựng?")){
    state.vocab = {};
    saveState();
    buildVocabQueue();
    renderHomeStats();
  }
}

// ============ GRAMMAR ============
let grammarIdx = 0;
let grammarPool = [];

function renderGrammarTab(){
  grammarPool = GRAMMAR_DATA.filter(g=>!state.grammarDone[g.id]);
  if(grammarPool.length===0) grammarPool = GRAMMAR_DATA.slice();
  grammarIdx = 0;
  renderGrammarQuestion();
}

function renderGrammarQuestion(){
  const area = document.getElementById("grammarArea");
  if(grammarIdx >= grammarPool.length){
    area.innerHTML = `<div class="card empty-state">🎉 Bạn đã hoàn thành hết bài ngữ pháp hôm nay!<br><br>
      <button class="btn" onclick="renderGrammarTab()">Làm lại</button></div>`;
    return;
  }
  const g = grammarPool[grammarIdx];
  area.innerHTML = `
    <div class="card">
      <div class="progress-bar"><div class="fill" style="width:${(grammarIdx/grammarPool.length*100)}%"></div></div>
      <h2>${g.question}</h2>
      <div id="optsWrap">
        ${g.options.map((opt,i)=>`<button class="opt-btn" onclick="answerGrammar(${i})">${opt}</button>`).join("")}
      </div>
      <div id="grammarFeedback"></div>
      <p class="muted">${grammarIdx+1} / ${grammarPool.length}</p>
    </div>
  `;
}

function answerGrammar(choice){
  const g = grammarPool[grammarIdx];
  const buttons = document.querySelectorAll("#optsWrap .opt-btn");
  buttons.forEach((b,i)=>{
    b.onclick = null;
    if(i===g.answer) b.classList.add("correct");
    if(i===choice && choice!==g.answer) b.classList.add("wrong");
  });
  const fb = document.getElementById("grammarFeedback");
  const correct = choice===g.answer;
  fb.innerHTML = `<div class="result-banner ${correct?'ok':'bad'}">${correct? '✅ Chính xác!' : '❌ Chưa đúng'}</div>
    <p class="muted" style="margin-top:8px;">${g.note}</p>
    <button class="btn" style="margin-top:10px;" onclick="nextGrammar('${g.id}')">Tiếp theo</button>`;
}

function nextGrammar(id){
  state.grammarDone[id] = true;
  saveState();
  markActivity();
  grammarIdx++;
  renderGrammarQuestion();
}

// ============ LISTEN ============
function renderListenTab(){
  const area = document.getElementById("listenArea");
  area.innerHTML = LISTEN_DATA.map(item=>`
    <div class="card">
      <div class="row-between">
        <strong>${state.listenDone[item.id] ? "✅" : "🎧"}</strong>
        <button class="small-btn" onclick="speak('${item.full.replace(/'/g,"\\'")}', 0.85)">🔊 Nghe</button>
      </div>
      <div class="listen-text" id="lt-${item.id}">${item.text}</div>
      <input type="text" id="li-${item.id}" placeholder="Nhập từ còn thiếu...">
      <button class="btn" style="margin-top:8px;" onclick="checkListen('${item.id}')">Kiểm tra</button>
      <div id="lf-${item.id}"></div>
    </div>
  `).join("");
}

function checkListen(id){
  const item = LISTEN_DATA.find(x=>x.id===id);
  const input = document.getElementById("li-"+id).value.trim().toLowerCase();
  const fb = document.getElementById("lf-"+id);
  const correct = input === item.answer.toLowerCase();
  fb.innerHTML = `<div class="result-banner ${correct?'ok':'bad'}">
    ${correct ? '✅ Đúng rồi!' : '❌ Chưa đúng. Đáp án: '+item.answer}
  </div><p class="muted" style="margin-top:6px;">${item.full}</p>`;
  if(correct){
    state.listenDone[id] = true;
    saveState();
    markActivity();
  }
}

// ============ SPEAK ============
let recognizer = null;
let recordingId = null;

function getRecognizer(){
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if(!SR) return null;
  const r = new SR();
  r.lang = "en-US";
  r.interimResults = false;
  r.maxAlternatives = 1;
  return r;
}

function renderSpeakTab(){
  const area = document.getElementById("speakArea");
  const supported = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  area.innerHTML = SPEAK_DATA.map(item=>`
    <div class="card">
      <div class="row-between">
        <strong>${state.speakDone[item.id] ? "✅ Hoàn thành" : "🎙️ Chưa làm"}</strong>
        <button class="small-btn" onclick="speak('${item.text.replace(/'/g,"\\'")}', 0.85)">🔊 Nghe mẫu</button>
      </div>
      <p style="font-size:15px;margin:10px 0;">"${item.text}"</p>
      ${supported ? `
        <button class="mic-btn" id="mic-${item.id}" onclick="toggleRecord('${item.id}')">🎤</button>
        <p class="muted center" id="sp-${item.id}">Nhấn micro và đọc câu trên.</p>
      ` : `<p class="muted center">⚠️ Thiết bị/trình duyệt này không hỗ trợ nhận diện giọng nói. Bạn vẫn có thể luyện bằng cách nghe và đọc theo.</p>`}
    </div>
  `).join("");
}

function toggleRecord(id){
  if(recordingId === id){
    if(recognizer) recognizer.stop();
    return;
  }
  if(recognizer){ try{ recognizer.stop(); }catch(e){} }

  const btn = document.getElementById("mic-"+id);
  const status = document.getElementById("sp-"+id);

  recognizer = getRecognizer();
  if(!recognizer){
    status.textContent = "⚠️ Trình duyệt này không hỗ trợ nhận diện giọng nói.";
    showToast("Không hỗ trợ nhận diện giọng nói trên thiết bị này.");
    return;
  }

  recordingId = id;
  btn.classList.add("recording");
  status.textContent = "Đang nghe... hãy đọc câu trên.";

  recognizer.onresult = (e)=>{
    const said = e.results[0][0].transcript;
    scoreSpeak(id, said);
  };
  recognizer.onerror = (e)=>{
    let msg = "Không nghe rõ, hãy thử lại.";
    if(e.error === "not-allowed" || e.error === "service-not-allowed"){
      msg = "⚠️ Chưa được cấp quyền micro. Vào Cài đặt > Safari (hoặc Cài đặt trang web) để cho phép Microphone, rồi tải lại trang.";
    } else if(e.error === "no-speech"){
      msg = "Không nghe thấy gì, hãy thử nói to và rõ hơn.";
    } else if(e.error === "audio-capture"){
      msg = "⚠️ Không tìm thấy micro trên thiết bị này.";
    } else if(e.error === "network"){
      msg = "⚠️ Lỗi kết nối mạng khi nhận diện giọng nói, hãy thử lại.";
    }
    status.textContent = msg;
    btn.classList.remove("recording");
    recordingId = null;
  };
  recognizer.onend = ()=>{
    btn.classList.remove("recording");
    recordingId = null;
  };

  try{
    recognizer.start();
  }catch(err){
    status.textContent = "⚠️ Không thể khởi động micro: " + err.message;
    btn.classList.remove("recording");
    recordingId = null;
  }
}

function normalize(str){
  return str.toLowerCase().replace(/[^\w\s]/g,"").trim();
}

function similarity(a,b){
  const wa = normalize(a).split(/\s+/);
  const wb = normalize(b).split(/\s+/);
  let match = 0;
  wa.forEach(w=>{ if(wb.includes(w)) match++; });
  return match / Math.max(wa.length, 1);
}

function scoreSpeak(id, said){
  const item = SPEAK_DATA.find(x=>x.id===id);
  const score = similarity(item.text, said);
  const status = document.getElementById("sp-"+id);
  const pct = Math.round(score*100);
  if(score >= 0.7){
    status.innerHTML = `<span style="color:var(--good);font-weight:600;">✅ Tốt! (${pct}% khớp)</span><br>Bạn nói: "${said}"`;
    state.speakDone[id] = Math.max(state.speakDone[id]||0, pct);
    saveState();
    markActivity();
  } else {
    status.innerHTML = `<span style="color:var(--bad);font-weight:600;">❌ Thử lại nhé (${pct}% khớp)</span><br>Bạn nói: "${said}"`;
  }
}

// ============ INIT ============
renderHomeStats();

// register service worker for PWA offline support
if('serviceWorker' in navigator){
  window.addEventListener('load', ()=>{
    navigator.serviceWorker.register('sw.js').catch(()=>{});
  });
}
