// ============ STORAGE: NHIỀU HỒ SƠ ============
const STORE_KEY = "ehoc_profiles_v2";
const OLD_STORE_KEY = "ehoc_state_v1"; // dữ liệu phiên bản cũ (1 người dùng)

function emptyProfileState(name, avatar){
  return {
    name: name || "Người học",
    avatar: avatar || "🦊",
    vocab:{},          // id -> {box, due, learned}
    grammarDone:{},    // id -> true
    listenDone:{},     // id -> true
    speakDone:{},      // id -> bestScore
    streak:0,
    lastActiveDate:null,
    activityLog:{},    // "YYYY-MM-DD" -> count
    points:0,
    badges:{},         // badgeId -> true
    currentLevel:1     // level đang chọn để học
  };
}

function loadDB(){
  try{
    const raw = localStorage.getItem(STORE_KEY);
    if(raw) return JSON.parse(raw);
  }catch(e){}

  // Di chuyển dữ liệu cũ (1 người dùng) sang hồ sơ đầu tiên nếu có
  let migrated = null;
  try{
    const oldRaw = localStorage.getItem(OLD_STORE_KEY);
    if(oldRaw){
      const old = JSON.parse(oldRaw);
      migrated = Object.assign(emptyProfileState("Người học", "🦊"), old, {points:0, badges:{}});
    }
  }catch(e){}

  const firstId = "p_" + Date.now();
  const db = {
    profiles: migrated ? { [firstId]: migrated } : {},
    currentProfileId: migrated ? firstId : null
  };
  return db;
}

let db = loadDB();

function saveDB(){
  localStorage.setItem(STORE_KEY, JSON.stringify(db));
}

function getProfile(){
  return db.profiles[db.currentProfileId];
}

let state = null; // hồ sơ đang hoạt động (alias để code cũ chạy được)

function setActiveProfile(id){
  db.currentProfileId = id;
  state = db.profiles[id];
  if(!state.currentLevel) state.currentLevel = 1;
  saveDB();
}

function createProfile(name, avatar){
  const id = "p_" + Date.now() + "_" + Math.floor(Math.random()*1000);
  db.profiles[id] = emptyProfileState(name, avatar);
  saveDB();
  return id;
}

function deleteProfile(id){
  delete db.profiles[id];
  if(db.currentProfileId === id){
    db.currentProfileId = null;
  }
  saveDB();
}

function todayStr(){
  return new Date().toISOString().slice(0,10);
}

// ============ ĐIỂM & HUY HIỆU ============
const POINTS = {
  vocabAgain: 1,
  vocabHard: 3,
  vocabGood: 5,
  grammarCorrect: 8,
  grammarWrong: 2,
  listenCorrect: 8,
  speakGood: 10
};

function addPoints(amount){
  state.points = (state.points||0) + amount;
  checkNewBadges();
  checkLevelUnlock();
  saveDB();
}

let lastSeenUnlockedLevel = {};
function checkLevelUnlock(){
  const profileKey = db.currentProfileId;
  const before = lastSeenUnlockedLevel[profileKey] || 1;
  const after = maxUnlockedLevel(state);
  if(after > before){
    const lvl = LEVEL_DATA.find(l=>l.level===after);
    if(lvl) showToast(`🔓 Đã mở khoá ${lvl.name}!`);
  }
  lastSeenUnlockedLevel[profileKey] = after;
}

function countVocabLearned(profile){
  return Object.values(profile.vocab||{}).filter(v=>v.box>=5).length;
}

// ============ LEVEL: MỞ KHOÁ NỘI DUNG ============
// % hoàn thành của 1 level = trung bình % hoàn thành của 4 kỹ năng trong level đó
function levelCompletionPercent(profile, level){
  const vItems = VOCAB_DATA.filter(v=>v.level===level);
  const gItems = GRAMMAR_DATA.filter(g=>g.level===level);
  const lItems = LISTEN_DATA.filter(l=>l.level===level);
  const sItems = SPEAK_DATA.filter(s=>s.level===level);

  const pct = (items, doneCheck)=>{
    if(items.length===0) return 100;
    const done = items.filter(doneCheck).length;
    return Math.round(done/items.length*100);
  };

  const vocabPct = pct(vItems, v=> (profile.vocab[v.id]||{}).box >= 5);
  const grammarPct = pct(gItems, g=> !!profile.grammarDone[g.id]);
  const listenPct = pct(lItems, l=> !!profile.listenDone[l.id]);
  const speakPct = pct(sItems, s=> !!profile.speakDone[s.id]);

  return Math.round((vocabPct + grammarPct + listenPct + speakPct) / 4);
}

// Level cao nhất mà hồ sơ đã mở khoá (level 1 luôn mở)
function maxUnlockedLevel(profile){
  const levels = LEVEL_DATA.map(l=>l.level).sort((a,b)=>a-b);
  let unlocked = levels[0] || 1;
  for(let i=0;i<levels.length-1;i++){
    const lvl = levels[i];
    if(levelCompletionPercent(profile, lvl) >= LEVEL_UNLOCK_PERCENT){
      unlocked = levels[i+1];
    } else {
      break;
    }
  }
  return unlocked;
}

function isLevelUnlocked(profile, level){
  return level <= maxUnlockedLevel(profile);
}

function selectLevel(level){
  if(!isLevelUnlocked(state, level)){
    showToast("🔒 Hãy hoàn thành level hiện tại trước khi mở level này.");
    return;
  }
  state.currentLevel = level;
  saveDB();
  goTab(currentTabForLevelSwitch);
}

let currentTabForLevelSwitch = "vocab";

// Render thanh chọn level, dùng chung cho 4 tab (vocab/grammar/listen/speak)
function renderLevelPills(containerId, tabName){
  currentTabForLevelSwitch = tabName;
  const wrap = document.getElementById(containerId);
  if(!wrap) return;
  const unlocked = maxUnlockedLevel(state);
  wrap.innerHTML = LEVEL_DATA.map(l=>{
    const isUnlocked = l.level <= unlocked;
    const isActive = l.level === state.currentLevel;
    const pct = levelCompletionPercent(state, l.level);
    return `<span class="level-pill ${isActive?'active':''} ${isUnlocked?'':'locked'}"
        onclick="selectLevel(${l.level})" title="${isUnlocked ? l.desc : 'Hoàn thành ' + LEVEL_UNLOCK_PERCENT + '% level trước để mở khoá'}">
        ${isUnlocked ? '' : '🔒 '}${l.name}${isUnlocked ? ' · ' + pct + '%' : ''}
      </span>`;
  }).join("");
}

function badgeProgressValue(profile, badge){
  switch(badge.type){
    case "streak": return profile.streak||0;
    case "points": return profile.points||0;
    case "vocabLearned": return countVocabLearned(profile);
    case "grammarDone": return Object.keys(profile.grammarDone||{}).length;
    case "listenDone": return Object.keys(profile.listenDone||{}).length;
    case "speakDone": return Object.keys(profile.speakDone||{}).length;
    default: return 0;
  }
}

function checkNewBadges(){
  const profile = state;
  if(!profile) return;
  const newlyEarned = [];
  BADGE_DATA.forEach(b=>{
    if(profile.badges[b.id]) return;
    if(badgeProgressValue(profile, b) >= b.goal){
      profile.badges[b.id] = true;
      newlyEarned.push(b);
    }
  });
  if(newlyEarned.length>0){
    saveDB();
    newlyEarned.forEach(b=> showToast(`🎉 Đạt huy hiệu: ${b.icon} ${b.name}!`));
  }
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
  checkNewBadges();
  saveDB();
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
  if(name==="group") renderGroupTab();
  window.scrollTo(0,0);
}

function showToast(msg){
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(()=>t.classList.remove("show"), 2200);
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

// ============ HỒ SƠ: CHỌN / TẠO ============
let pendingAvatar = AVATAR_OPTIONS[0];

function renderProfileGate(){
  const ids = Object.keys(db.profiles);
  const wrap = document.getElementById("profileGateArea");
  if(ids.length===0){
    wrap.innerHTML = renderCreateProfileForm();
    bindCreateProfileForm();
    return;
  }
  wrap.innerHTML = `
    <div class="card">
      <h2>Chọn hồ sơ của bạn</h2>
      <div id="profileList">
        ${ids.map(id=>{
          const p = db.profiles[id];
          const learned = countVocabLearned(p);
          return `<div class="profile-row" onclick="chooseProfile('${id}')">
            <div class="avatar-circle">${p.avatar}</div>
            <div class="profile-info">
              <div class="profile-name">${escapeHtml(p.name)}</div>
              <div class="muted" style="font-size:12px;">⭐ ${p.points||0} điểm · 🔥 ${p.streak||0} ngày · 📖 ${learned} từ</div>
            </div>
            <button class="small-btn" onclick="event.stopPropagation();confirmDeleteProfile('${id}')">Xóa</button>
          </div>`;
        }).join("")}
      </div>
      <button class="btn secondary" style="margin-top:10px;" onclick="showCreateProfileForm()">+ Thêm người học mới</button>
    </div>
    <div id="createFormWrap"></div>
  `;
}

function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}

function renderCreateProfileForm(){
  return `
    <div class="card">
      <h2>Tạo hồ sơ học tập</h2>
      <p class="muted">Mỗi người trong nhóm nên có một hồ sơ riêng trên máy này để theo dõi tiến độ và thi đua cùng nhau.</p>
      <input type="text" id="newProfileName" placeholder="Tên của bạn (VD: Linh)" maxlength="20">
      <p class="muted" style="margin:10px 0 6px;">Chọn avatar:</p>
      <div class="avatar-grid" id="avatarGrid">
        ${AVATAR_OPTIONS.map(a=>`<span class="avatar-pick ${a===pendingAvatar?'selected':''}" data-avatar="${a}">${a}</span>`).join("")}
      </div>
      <button class="btn" id="createProfileBtn" style="margin-top:14px;">Tạo hồ sơ</button>
    </div>
  `;
}

function showCreateProfileForm(){
  document.getElementById("createFormWrap").innerHTML = renderCreateProfileForm();
  bindCreateProfileForm();
}

function bindCreateProfileForm(){
  document.querySelectorAll(".avatar-pick").forEach(el=>{
    el.onclick = ()=>{
      pendingAvatar = el.getAttribute("data-avatar");
      document.querySelectorAll(".avatar-pick").forEach(e=>e.classList.remove("selected"));
      el.classList.add("selected");
    };
  });
  const btn = document.getElementById("createProfileBtn");
  if(btn){
    btn.onclick = ()=>{
      const input = document.getElementById("newProfileName");
      const name = input.value.trim();
      if(!name){ showToast("Hãy nhập tên của bạn."); return; }
      const id = createProfile(name, pendingAvatar);
      setActiveProfile(id);
      enterApp();
    };
  }
}

function chooseProfile(id){
  setActiveProfile(id);
  enterApp();
}

function confirmDeleteProfile(id){
  const p = db.profiles[id];
  if(confirm(`Xóa hồ sơ "${p.name}"? Toàn bộ tiến độ sẽ mất.`)){
    deleteProfile(id);
    renderProfileGate();
  }
}

function enterApp(){
  document.getElementById("screen-profileGate").classList.remove("active");
  document.getElementById("mainAppArea").style.display = "block";
  document.getElementById("mainHeader").style.display = "block";
  document.querySelector("nav.tabbar").style.display = "flex";
  goTab("home");
}

function switchProfileFromHeader(){
  document.getElementById("mainAppArea").style.display = "none";
  document.getElementById("mainHeader").style.display = "none";
  document.querySelector("nav.tabbar").style.display = "none";
  document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));
  document.getElementById("screen-profileGate").classList.add("active");
  renderProfileGate();
}

// ============ HOME ============
function renderHomeStats(){
  const p = state;
  document.getElementById("profileNameDisplay").textContent = `${p.avatar} ${p.name}`;
  document.getElementById("streakNum").textContent = p.streak || 0;
  const due = VOCAB_DATA.filter(v=>isDue(v.id)).length;
  document.getElementById("dueNum").textContent = due;
  const learned = countVocabLearned(p);
  document.getElementById("learnedNum").textContent = learned;
  document.getElementById("pointsNum").textContent = p.points || 0;
  const levelEl = document.getElementById("levelNum");
  if(levelEl){
    const lvl = LEVEL_DATA.find(l=>l.level===(p.currentLevel||1));
    levelEl.textContent = lvl ? lvl.name.split(" — ")[0] : (p.currentLevel||1);
  }

  document.getElementById("homeVocabBadge").textContent = due;
  document.getElementById("homeGrammarBadge").textContent =
    GRAMMAR_DATA.length - Object.keys(p.grammarDone).length;
  document.getElementById("homeListenBadge").textContent =
    LISTEN_DATA.length - Object.keys(p.listenDone).length;
  document.getElementById("homeSpeakBadge").textContent =
    SPEAK_DATA.length - Object.keys(p.speakDone).length;

  const today = new Date();
  const opts = {weekday:'long', day:'numeric', month:'long'};
  document.getElementById("todayStr").textContent =
    "Hôm nay, " + today.toLocaleDateString('vi-VN', opts);

  let activeDays = 0;
  for(let i=0;i<7;i++){
    const d = new Date(Date.now()-i*86400000).toISOString().slice(0,10);
    if(p.activityLog[d]) activeDays++;
  }
  document.getElementById("weekFill").style.width = (activeDays/7*100)+"%";
  document.getElementById("weekText").textContent =
    activeDays===0 ? "Chưa có hoạt động nào." : `Bạn đã học ${activeDays}/7 ngày trong tuần này.`;

  renderBadgesPreview();
}

function renderBadgesPreview(){
  const p = state;
  const wrap = document.getElementById("badgesPreview");
  const earned = BADGE_DATA.filter(b=>p.badges[b.id]);
  if(earned.length===0){
    wrap.innerHTML = `<p class="muted">Chưa có huy hiệu nào. Hãy học đều mỗi ngày để mở khóa!</p>`;
    return;
  }
  wrap.innerHTML = earned.map(b=>`<span class="badge-chip" title="${b.desc}">${b.icon} ${b.name}</span>`).join("");
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
  let pool = VOCAB_DATA.filter(v => v.level===state.currentLevel && (currentTopic==="Tất cả" || v.topic===currentTopic));
  vocabQueue = pool.filter(v=>isDue(v.id));
  if(vocabQueue.length===0) vocabQueue = pool;
  vocabIdx = 0;
  vocabFlipped = false;
  renderVocabCard();
}

function renderVocabTab(){
  renderLevelPills("vocabLevelPills", "vocab");
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
      <p class="muted">Hộp ${vs.box}/5 · ${vocabIdx+1} / ${vocabQueue.length} · ⭐ ${state.points||0} điểm</p>
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
  let intervalDays, earned;
  if(result==="again"){ vs.box = 1; intervalDays = 0; earned = POINTS.vocabAgain; }
  else if(result==="hard"){ vs.box = Math.max(1, vs.box); intervalDays = vs.box; earned = POINTS.vocabHard; }
  else { vs.box = Math.min(5, vs.box+1); intervalDays = [1,2,4,7,14][vs.box-1] || 14; earned = POINTS.vocabGood; }
  const due = new Date(Date.now() + intervalDays*86400000);
  vs.due = due.toISOString().slice(0,10);
  if(vs.box>=5) vs.learned = true;
  addPoints(earned);
  markActivity();
  vocabIdx++;
  vocabFlipped = false;
  renderVocabCard();
}

function resetVocabProgress(){
  if(confirm("Đặt lại toàn bộ tiến độ từ vựng?")){
    state.vocab = {};
    saveDB();
    buildVocabQueue();
    renderHomeStats();
  }
}

// ============ GRAMMAR ============
let grammarIdx = 0;
let grammarPool = [];

function renderGrammarTab(){
  renderLevelPills("grammarLevelPills", "grammar");
  const levelItems = GRAMMAR_DATA.filter(g=>g.level===state.currentLevel);
  grammarPool = levelItems.filter(g=>!state.grammarDone[g.id]);
  if(grammarPool.length===0) grammarPool = levelItems.slice();
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
  addPoints(correct ? POINTS.grammarCorrect : POINTS.grammarWrong);
  fb.innerHTML = `<div class="result-banner ${correct?'ok':'bad'}">${correct? '✅ Chính xác! +'+POINTS.grammarCorrect+' điểm' : '❌ Chưa đúng'}</div>
    <p class="muted" style="margin-top:8px;">${g.note}</p>
    <button class="btn" style="margin-top:10px;" onclick="nextGrammar('${g.id}')">Tiếp theo</button>`;
}

function nextGrammar(id){
  state.grammarDone[id] = true;
  markActivity();
  grammarIdx++;
  renderGrammarQuestion();
}

// ============ LISTEN ============
function renderListenTab(){
  renderLevelPills("listenLevelPills", "listen");
  const area = document.getElementById("listenArea");
  const items = LISTEN_DATA.filter(item=>item.level===state.currentLevel);
  area.innerHTML = items.map(item=>`
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
    ${correct ? '✅ Đúng rồi! +'+POINTS.listenCorrect+' điểm' : '❌ Chưa đúng. Đáp án: '+item.answer}
  </div><p class="muted" style="margin-top:6px;">${item.full}</p>`;
  if(correct){
    state.listenDone[id] = true;
    addPoints(POINTS.listenCorrect);
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
  renderLevelPills("speakLevelPills", "speak");
  const area = document.getElementById("speakArea");
  const supported = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  const items = SPEAK_DATA.filter(item=>item.level===state.currentLevel);
  area.innerHTML = items.map(item=>`
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
    status.innerHTML = `<span style="color:var(--good);font-weight:600;">✅ Tốt! (${pct}% khớp) +${POINTS.speakGood} điểm</span><br>Bạn nói: "${said}"`;
    if(!state.speakDone[id]) addPoints(POINTS.speakGood);
    state.speakDone[id] = Math.max(state.speakDone[id]||0, pct);
    markActivity();
  } else {
    status.innerHTML = `<span style="color:var(--bad);font-weight:600;">❌ Thử lại nhé (${pct}% khớp)</span><br>Bạn nói: "${said}"`;
  }
}

// ============ NHÓM: BẢNG XẾP HẠNG & MỤC TIÊU CHUNG ============
function renderGroupTab(){
  const area = document.getElementById("groupArea");
  const profiles = Object.values(db.profiles);
  const ranked = profiles.slice().sort((a,b)=> (b.points||0) - (a.points||0));
  const totalPoints = profiles.reduce((sum,p)=> sum + (p.points||0), 0);

  // bảng xếp hạng
  const leaderboardHtml = `
    <div class="card">
      <h2>🏆 Bảng xếp hạng nhóm</h2>
      ${ranked.length<=1 ? `<p class="muted">Thêm hồ sơ khác (qua màn hình "Đổi hồ sơ") để so sánh tiến độ giữa các thành viên.</p>` : ""}
      ${ranked.map((p,i)=>{
        const medal = i===0?"🥇":i===1?"🥈":i===2?"🥉":"▫️";
        const isMe = p===state;
        return `<div class="rank-row ${isMe?'me':''}">
          <span class="rank-medal">${medal}</span>
          <span class="rank-avatar">${p.avatar}</span>
          <span class="rank-name">${escapeHtml(p.name)}${isMe?' (bạn)':''}</span>
          <span class="rank-points">⭐ ${p.points||0}</span>
        </div>`;
      }).join("")}
    </div>
  `;

  // mục tiêu chung
  const nextGoal = GROUP_GOALS.find(g=>totalPoints < g.goal);
  const reachedGoals = GROUP_GOALS.filter(g=>totalPoints >= g.goal);
  const goalHtml = `
    <div class="card">
      <h2>🎯 Mục tiêu chung của nhóm</h2>
      <p class="muted">Tổng điểm cả nhóm hiện tại: <strong>${totalPoints} điểm</strong></p>
      ${nextGoal ? `
        <div class="progress-bar" style="margin-top:10px;"><div class="fill" style="width:${Math.min(100, totalPoints/nextGoal.goal*100)}%"></div></div>
        <p class="muted">${nextGoal.icon} Còn ${Math.max(0,nextGoal.goal-totalPoints)} điểm để đạt "${nextGoal.name}"</p>
        <p style="font-size:13px;margin-top:6px;"><strong>Phần thưởng:</strong> ${nextGoal.reward}</p>
      ` : `<p class="muted">🎉 Cả nhóm đã đạt hết các mốc hiện có!</p>`}
      ${reachedGoals.length>0 ? `
        <p class="muted" style="margin-top:12px;">Đã đạt được:</p>
        <div>${reachedGoals.map(g=>`<span class="badge-chip">${g.icon} ${g.name}</span>`).join("")}</div>
      ` : ""}
    </div>
  `;

  // huy hiệu của mình
  const myBadgesHtml = `
    <div class="card">
      <h2>🏅 Huy hiệu của bạn</h2>
      <div class="badge-grid">
        ${BADGE_DATA.map(b=>{
          const earned = !!state.badges[b.id];
          const progress = badgeProgressValue(state, b);
          return `<div class="badge-card ${earned?'earned':''}">
            <div class="badge-icon">${b.icon}</div>
            <div class="badge-name">${b.name}</div>
            <div class="badge-desc">${b.desc}</div>
            ${earned ? `<div class="badge-status">✅ Đạt được</div>` : `<div class="badge-status">${Math.min(progress,b.goal)}/${b.goal}</div>`}
          </div>`;
        }).join("")}
      </div>
    </div>
  `;

  area.innerHTML = leaderboardHtml + goalHtml + myBadgesHtml;
}

// ============ INIT ============
if(db.currentProfileId && db.profiles[db.currentProfileId]){
  state = db.profiles[db.currentProfileId];
  if(!state.currentLevel) state.currentLevel = 1;
  enterApp();
} else {
  renderProfileGate();
}

// register service worker for PWA offline support
if('serviceWorker' in navigator){
  window.addEventListener('load', ()=>{
    navigator.serviceWorker.register('sw.js').catch(()=>{});
  });
}
