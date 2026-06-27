// ============ TIỆN ÍCH: TRỘN THỨ TỰ NGẪU NHIÊN ============
// Dùng thuật toán Fisher-Yates để xáo trộn thứ tự bài học mỗi lần vào tab/mở
// lại app, giúp người học không bị quen thứ tự cố định mà phải nhớ lan man.
function shuffleArray(arr){
  const a = arr.slice();
  for(let i = a.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ============ XỬ LÝ BÀN PHÍM ẢO TRÊN ĐIỆN THOẠI ============
// Khi bàn phím ảo mở, trình duyệt thu nhỏ khung nhìn (visualViewport) nhưng
// thanh tabbar (position:fixed) và phần nội dung phía dưới ô nhập vẫn có thể
// bị che. Ta theo dõi visualViewport để: (1) ẩn tạm thanh tabbar dưới đáy,
// (2) cuộn ô input/nút đang active vào vùng nhìn thấy được.
function setupKeyboardAvoidance(){
  if(typeof window === "undefined") return;

  function isTypingTarget(el){
    return el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA");
  }

  function scrollActiveIntoView(){
    const el = document.activeElement;
    if(isTypingTarget(el) && el.scrollIntoView){
      setTimeout(()=>{ el.scrollIntoView({block:"center", behavior:"smooth"}); }, 80);
    }
  }

  document.addEventListener("focusin", (e)=>{
    if(isTypingTarget(e.target)){
      document.body.classList.add("keyboard-open");
      scrollActiveIntoView();
    }
  });
  document.addEventListener("focusout", (e)=>{
    if(isTypingTarget(e.target)){
      document.body.classList.remove("keyboard-open");
    }
  });

  // Một số trình duyệt Android thu nhỏ visualViewport khi mở bàn phím —
  // dùng thêm tín hiệu này để chắc ăn việc cuộn vào vùng nhìn thấy.
  if(window.visualViewport){
    let lastHeight = window.visualViewport.height;
    window.visualViewport.addEventListener("resize", ()=>{
      const shrunk = window.visualViewport.height < lastHeight - 100;
      lastHeight = window.visualViewport.height;
      if(shrunk && isTypingTarget(document.activeElement)){
        scrollActiveIntoView();
      }
    });
  }
}
if(typeof document !== "undefined"){
  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", setupKeyboardAvoidance);
  } else {
    setupKeyboardAvoidance();
  }
}

// ============ STORAGE: NHIỀU HỒ SƠ ============
const STORE_KEY = "ehoc_profiles_v2";
const OLD_STORE_KEY = "ehoc_state_v1"; // dữ liệu phiên bản cũ (1 người dùng)
const BACKUP_KEY = "ehoc_profiles_v2_backup"; // bản sao dự phòng, tự cập nhật ngầm mỗi khi lưu dữ liệu

// Tự động khôi phục dữ liệu từ bản sao dự phòng nếu dữ liệu chính bị mất/hỏng
// (vd: do trình duyệt xoá cache nhầm, lỗi cập nhật phiên bản app...). Hàm này
// chạy ngầm, không cần người dùng làm gì — chỉ can thiệp khi phát hiện dữ
// liệu chính trống/lỗi NHƯNG bản dự phòng vẫn còn dữ liệu hợp lệ.
function restoreFromBackupIfNeeded(){
  try{
    const main = localStorage.getItem(STORE_KEY);
    const backup = localStorage.getItem(BACKUP_KEY);
    if(!backup) return;

    let mainIsEmpty = true;
    if(main){
      const parsed = JSON.parse(main);
      mainIsEmpty = !parsed || !parsed.profiles || Object.keys(parsed.profiles).length === 0;
    }

    if(mainIsEmpty){
      const backupParsed = JSON.parse(backup);
      if(backupParsed && backupParsed.profiles && Object.keys(backupParsed.profiles).length > 0){
        localStorage.setItem(STORE_KEY, backup);
        showToastSafe("🛟 Đã tự khôi phục dữ liệu học từ bản sao dự phòng.");
      }
    }
  }catch(e){
    // Nếu backup cũng hỏng thì bỏ qua, để luồng loadDB() bình thường xử lý tiếp
  }
}

// Gọi showToast an toàn — tại thời điểm này UI có thể chưa render xong
function showToastSafe(msg){
  try{ if(typeof showToast === "function") showToast(msg); }catch(e){}
}

function backupDB(){
  try{
    localStorage.setItem(BACKUP_KEY, JSON.stringify(db));
  }catch(e){}
}

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
    currentLevel:1,    // (cũ, giữ lại để tương thích dữ liệu cũ) level đang chọn chung
    currentLevelVocab:1,   // level đang học riêng cho Từ vựng
    currentLevelGrammar:1, // level đang học riêng cho Ngữ pháp
    currentLevelListen:1,  // level đang học riêng cho Nghe
    currentLevelSpeak:1    // level đang học riêng cho Nói
  };
}

// Khoá level theo từng kỹ năng, dùng trong state.currentLevel<Skill> và các
// hàm levelSkillBreakdown/maxUnlockedLevelForSkill bên dưới.
const SKILL_LEVEL_FIELD = {
  vocab: "currentLevelVocab",
  grammar: "currentLevelGrammar",
  listen: "currentLevelListen",
  speak: "currentLevelSpeak"
};

// Đảm bảo hồ sơ cũ (tạo trước khi có tính năng tách level) có đủ 4 field
// currentLevel<Skill>, lấy giá trị từ currentLevel chung làm điểm khởi đầu
// để không bị "tụt lùi" so với tiến độ đã có.
function ensurePerSkillLevels(profile){
  const fallback = profile.currentLevel || 1;
  Object.values(SKILL_LEVEL_FIELD).forEach(field=>{
    if(!profile[field]) profile[field] = fallback;
  });
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

restoreFromBackupIfNeeded();
let db = loadDB();
backupDB(); // lưu ngay 1 bản dự phòng đầu phiên, phòng trường hợp dữ liệu chính bị mất giữa phiên dùng

function saveDB(){
  localStorage.setItem(STORE_KEY, JSON.stringify(db));
  backupDB();
}

function getProfile(){
  return db.profiles[db.currentProfileId];
}

// ----- SAO LƯU / KHÔI PHỤC RA FILE (.json) -----
// Khác với backupDB() (bản sao ngầm trong cùng localStorage, chỉ chống mất
// dữ liệu do lỗi tạm trên CÙNG máy/trình duyệt), tính năng này xuất dữ liệu
// ra một file thật để người dùng tự lưu ở nơi khác (Drive, email, USB...),
// nhờ đó khôi phục được cả khi đổi máy, đổi trình duyệt, hoặc xoá hết dữ
// liệu trang web.
function exportBackupFile(){
  try{
    const payload = {
      app: "ehoc_backup",
      version: 1,
      exportedAt: new Date().toISOString(),
      db: db
    };
    const json = JSON.stringify(payload, null, 2);
    const blob = new Blob([json], {type: "application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const stamp = new Date().toISOString().slice(0,10);
    a.href = url;
    a.download = `ehoc-backup-${stamp}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(()=> URL.revokeObjectURL(url), 1000);
    showToastSafe("✅ Đã tải file sao lưu. Hãy lưu file này ở nơi an toàn (Drive, email...).");
  }catch(e){
    showToastSafe("❌ Không thể tạo file sao lưu: " + e.message);
  }
}

function importBackupFile(evt){
  const input = evt && evt.target ? evt.target : document.getElementById("restoreFileInput");
  const file = input && input.files && input.files[0];
  if(!file) return;

  const reader = new FileReader();
  reader.onload = function(){
    try{
      const parsed = JSON.parse(reader.result);
      // Hỗ trợ cả file mới (có bọc {app, version, db}) và trường hợp người
      // dùng vô tình đưa thẳng nội dung db (không có bọc ngoài).
      const incomingDb = (parsed && parsed.db && parsed.db.profiles) ? parsed.db : parsed;

      if(!incomingDb || typeof incomingDb !== "object" || !incomingDb.profiles){
        showToastSafe("❌ File không hợp lệ — không tìm thấy dữ liệu hồ sơ.");
        return;
      }

      const profileCount = Object.keys(incomingDb.profiles).length;
      const ok = confirm(
        `Khôi phục sẽ THAY THẾ toàn bộ dữ liệu hiện tại trên máy này bằng dữ liệu trong file (${profileCount} hồ sơ). Bạn chắc chắn muốn tiếp tục?`
      );
      if(!ok){ input.value=""; return; }

      db = incomingDb;
      if(!db.currentProfileId || !db.profiles[db.currentProfileId]){
        db.currentProfileId = Object.keys(db.profiles)[0] || null;
      }
      saveDB();

      if(db.currentProfileId && db.profiles[db.currentProfileId]){
        state = db.profiles[db.currentProfileId];
        if(!state.currentLevel) state.currentLevel = 1;
        ensurePerSkillLevels(state);
      } else {
        state = null;
      }

      showToastSafe("✅ Đã khôi phục dữ liệu thành công!");
      input.value = "";

      // Vẽ lại toàn bộ UI từ trạng thái mới
      if(state){
        if(typeof enterApp === "function") enterApp();
      } else if(typeof renderProfileGate === "function"){
        renderProfileGate();
      }
    }catch(e){
      showToastSafe("❌ File sao lưu bị lỗi hoặc không đúng định dạng.");
    }
  };
  reader.onerror = function(){
    showToastSafe("❌ Không đọc được file đã chọn.");
  };
  reader.readAsText(file);
}

let state = null; // hồ sơ đang hoạt động (alias để code cũ chạy được)

function setActiveProfile(id){
  db.currentProfileId = id;
  state = db.profiles[id];
  if(!state.currentLevel) state.currentLevel = 1;
  ensurePerSkillLevels(state);
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

const SKILL_LABEL = { vocab:"Từ vựng", grammar:"Ngữ pháp", listen:"Nghe", speak:"Nói" };

// Theo dõi mốc mở khoá đã thấy của TỪNG kỹ năng riêng, để báo toast đúng khi
// 1 kỹ năng vừa mở level mới (không còn gộp chung 1 mốc cho cả 4 kỹ năng).
let lastSeenUnlockedLevel = {}; // profileKey -> { vocab:n, grammar:n, listen:n, speak:n }
function checkLevelUnlock(){
  const profileKey = db.currentProfileId;
  if(!lastSeenUnlockedLevel[profileKey]) lastSeenUnlockedLevel[profileKey] = {};
  const seen = lastSeenUnlockedLevel[profileKey];
  Object.keys(SKILL_LEVEL_FIELD).forEach(skill=>{
    const before = seen[skill] || 1;
    const after = maxUnlockedLevelForSkill(state, skill);
    if(after > before){
      const lvl = LEVEL_DATA.find(l=>l.level===after);
      if(lvl) showToast(`🔓 ${SKILL_LABEL[skill]}: đã mở khoá ${lvl.name}!`);
    }
    seen[skill] = after;
  });
}

function countVocabLearned(profile){
  return Object.values(profile.vocab||{}).filter(v=>v.box>=5).length;
}

// ============ PHÂN TÍCH QUÁ TRÌNH HỌC (cho gợi ý AI) ============
// Tổng hợp số liệu học từ vựng theo từng chủ đề (topic) + tốc độ học + streak,
// dùng làm input gửi cho AI phân tích, và cũng dùng cho fallback rule-based
// khi chưa cấu hình được Worker AI (xem renderLearningAnalysis()).
function buildLearningStats(profile){
  const p = profile;
  const byTopic = {}; // topic -> {total, learned, avgBox}
  VOCAB_DATA.forEach(v=>{
    if(!byTopic[v.topic]) byTopic[v.topic] = {topic:v.topic, total:0, learned:0, boxSum:0};
    const t = byTopic[v.topic];
    t.total++;
    const entry = p.vocab[v.id];
    const box = entry ? entry.box : 1;
    t.boxSum += box;
    if(entry && entry.box>=5) t.learned++;
  });
  const topics = Object.values(byTopic).map(t=>({
    topic: t.topic,
    total: t.total,
    learned: t.learned,
    percent: t.total ? Math.round((t.learned/t.total)*100) : 0,
    avgBox: t.total ? +(t.boxSum/t.total).toFixed(2) : 1
  })).sort((a,b)=> a.percent - b.percent);

  // Tốc độ học trung bình/ngày dựa trên activityLog 14 ngày gần nhất
  let activeDays = 0, totalActivity = 0;
  for(let i=0;i<14;i++){
    const d = new Date(Date.now()-i*86400000).toISOString().slice(0,10);
    const c = p.activityLog[d] || 0;
    if(c>0){ activeDays++; totalActivity += c; }
  }
  const avgPerActiveDay = activeDays ? Math.round(totalActivity/activeDays) : 0;

  return {
    learnedTotal: countVocabLearned(p),
    vocabTotal: VOCAB_DATA.length,
    streak: p.streak || 0,
    activeDaysLast14: activeDays,
    avgPerActiveDay,
    topics, // sắp xếp từ yếu nhất -> mạnh nhất
    weakestTopics: topics.slice(0,3),
    strongestTopics: topics.slice(-3).reverse()
  };
}

// Fallback rule-based: dùng khi chưa cấu hình Worker AI hoặc gọi AI bị lỗi.
// Không gọi API ngoài, chỉ suy luận từ buildLearningStats() bằng if/else.
function fallbackLearningAnalysis(stats){
  const lines = [];
  const weak = stats.weakestTopics.filter(t=>t.total>0);
  const strong = stats.strongestTopics.filter(t=>t.total>0 && t.percent>=50);

  if(weak.length){
    const w = weak[0];
    lines.push(`📌 Chủ đề yếu nhất: "${w.topic}" (${w.learned}/${w.total} từ, ${w.percent}%). Nên ưu tiên ôn lại chủ đề này trước.`);
  }
  if(strong.length){
    const s = strong[0];
    lines.push(`💪 Chủ đề mạnh nhất: "${s.topic}" (${s.percent}%). Bạn đang làm tốt, có thể giảm thời gian ôn chủ đề này.`);
  }
  if(stats.avgPerActiveDay > 0){
    if(stats.avgPerActiveDay < 5){
      lines.push(`🐢 Tốc độ học hiện tại khá chậm (~${stats.avgPerActiveDay} hoạt động/ngày học). Thử tăng dần để đạt mốc tiếp theo nhanh hơn.`);
    } else if(stats.avgPerActiveDay > 30){
      lines.push(`⚡ Bạn học khá nhanh (~${stats.avgPerActiveDay} hoạt động/ngày học). Nhớ ôn lại đều để nhớ lâu, đừng chỉ học từ mới.`);
    } else {
      lines.push(`✅ Tốc độ học ổn định (~${stats.avgPerActiveDay} hoạt động/ngày học). Cứ giữ nhịp này.`);
    }
  } else {
    lines.push(`📅 Chưa có hoạt động học trong 14 ngày qua. Hãy bắt đầu học lại để AI có dữ liệu phân tích chính xác hơn.`);
  }
  if(stats.streak>=3){
    lines.push(`🔥 Streak ${stats.streak} ngày — duy trì rất tốt!`);
  }
  return lines.join("\n");
}

let lastLearningAnalysisText = ""; // cache để tab Từ vựng dùng lại, không gọi AI 2 lần
let learningAnalysisBusy = false;

async function renderLearningAnalysis(forceRefresh){
  const textEl = document.getElementById("learningAnalysisText");
  const vocabHintEl = document.getElementById("vocabAnalysisHint");
  if(!textEl && !vocabHintEl) return;

  if(!forceRefresh && lastLearningAnalysisText){
    if(textEl) textEl.textContent = lastLearningAnalysisText;
    if(vocabHintEl) vocabHintEl.textContent = "💡 " + lastLearningAnalysisText.split("\n")[0].replace(/^📌\s*/,"");
    return;
  }

  const stats = buildLearningStats(state);

  if(textEl) textEl.textContent = "🤖 Đang phân tích quá trình học...";
  if(learningAnalysisBusy) return;
  learningAnalysisBusy = true;

  let result;
  try{
    if(!getAiWorkerUrl()) throw new Error("CHƯA_CẤU_HÌNH");
    const prompt = "Đây là số liệu học tập của tôi (JSON): " + JSON.stringify(stats) +
      "\nHãy phân tích điểm mạnh/điểm yếu theo chủ đề và đề xuất cách học hiệu quả hơn, viết ngắn gọn bằng tiếng Việt (tối đa 5 câu).";
    result = await callAiWorker("analyze", {stats}, prompt, []);
  }catch(e){
    result = fallbackLearningAnalysis(stats);
  }
  learningAnalysisBusy = false;

  lastLearningAnalysisText = result;
  if(textEl) textEl.textContent = result;
  if(vocabHintEl) vocabHintEl.textContent = "💡 " + result.split("\n")[0].replace(/^📌\s*/,"");
}

// ============ CỘT MỐC THÀNH THẠO GIAO TIẾP (theo số từ đã thuộc) ============
// Các mốc tham khảo phổ biến trong nghiên cứu học ngôn ngữ: ~250 từ đủ cho
// giao tiếp những nhu cầu cơ bản nhất, ~500 từ giao tiếp tự tin hơn trong đời
// sống hàng ngày, ~1000 từ được xem là mốc "giao tiếp thành thạo" cho hầu hết
// tình huống thường gặp, ~2000 từ tiến gần tới mức đọc hiểu/giao tiếp tự nhiên.
const MASTERY_MILESTONES = [
  {count:250,  label:"Giao tiếp cơ bản",   desc:"Đủ vốn từ cho các câu giao tiếp đơn giản hàng ngày."},
  {count:500,  label:"Giao tiếp tự tin",   desc:"Diễn đạt được nhiều tình huống quen thuộc một cách tự nhiên hơn."},
  {count:1000, label:"Giao tiếp thành thạo", desc:"Mốc được xem là đủ để giao tiếp thành thạo trong đời sống hàng ngày."},
  {count:2000, label:"Gần như người bản xứ", desc:"Vốn từ rộng, hiểu và diễn đạt linh hoạt trong hầu hết tình huống."}
];

function renderMasteryMilestones(){
  const textEl = document.getElementById("masteryMilestoneText");
  const fillEl = document.getElementById("masteryMilestoneFill");
  const listEl = document.getElementById("masteryMilestoneList");
  if(!textEl || !fillEl || !listEl) return;

  const learned = countVocabLearned(state);
  const next = MASTERY_MILESTONES.find(m => learned < m.count);

  if(!next){
    const last = MASTERY_MILESTONES[MASTERY_MILESTONES.length-1];
    textEl.textContent = `🏆 Bạn đã học ${learned} từ — vượt mốc "${last.label}" (${last.count} từ)!`;
    fillEl.style.width = "100%";
  } else {
    const prev = MASTERY_MILESTONES.slice().reverse().find(m => learned >= m.count);
    const base = prev ? prev.count : 0;
    const pct = Math.round(((learned - base) / (next.count - base)) * 100);
    textEl.textContent = `Đã học ${learned}/${next.count} từ để đạt mốc "${next.label}"`;
    fillEl.style.width = Math.max(0, Math.min(100, pct)) + "%";
  }

  listEl.innerHTML = MASTERY_MILESTONES.map(m=>{
    const reached = learned >= m.count;
    return `<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid var(--border,#eee);">
        <div>
          <div style="font-weight:600;">${reached ? "✅" : "⬜"} ${m.label} <span class="muted" style="font-weight:400;">(${m.count} từ)</span></div>
          <div class="muted" style="font-size:13px;">${m.desc}</div>
        </div>
        <div style="white-space:nowrap;font-weight:600;color:${reached ? 'var(--good,#2e7d32)' : 'var(--muted,#888)'};">${Math.min(learned, m.count)}/${m.count}</div>
      </div>`;
  }).join("");
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

// Mở khoá level kế tiếp của MỘT kỹ năng chỉ đòi hỏi chính kỹ năng đó đạt
// 100% ở level hiện tại — tách biệt hoàn toàn với 3 kỹ năng còn lại. Ví dụ
// học xong 100% Từ vựng A1 thì Từ vựng có thể lên A2 ngay, không cần chờ
// Ngữ pháp/Nghe/Nói.
const SKILL_ITEMS_AND_CHECK = {
  vocab:   (level)=> ({ items: VOCAB_DATA.filter(v=>v.level===level),   done: (profile,v)=> (profile.vocab[v.id]||{}).box >= 5 }),
  grammar: (level)=> ({ items: GRAMMAR_DATA.filter(g=>g.level===level), done: (profile,g)=> !!profile.grammarDone[g.id] }),
  listen:  (level)=> ({ items: LISTEN_DATA.filter(l=>l.level===level),  done: (profile,l)=> !!profile.listenDone[l.id] }),
  speak:   (level)=> ({ items: SPEAK_DATA.filter(s=>s.level===level),   done: (profile,s)=> !!profile.speakDone[s.id] })
};

function skillCompletionPercent(profile, skill, level){
  const { items, done } = SKILL_ITEMS_AND_CHECK[skill](level);
  if(items.length===0) return 100;
  const doneCount = items.filter(it=>done(profile,it)).length;
  return Math.round(doneCount/items.length*100);
}

function isSkillFullyDone(profile, skill, level){
  return skillCompletionPercent(profile, skill, level) >= 100;
}

// % hoàn thành của 1 level = trung bình % hoàn thành của 4 kỹ năng trong
// level đó. Chỉ dùng để HIỂN THỊ (ví dụ trên trang Chính), không dùng để mở
// khoá level nữa (mở khoá nay tách riêng theo từng kỹ năng).
function levelCompletionPercent(profile, level){
  const vocabPct = skillCompletionPercent(profile, "vocab", level);
  const grammarPct = skillCompletionPercent(profile, "grammar", level);
  const listenPct = skillCompletionPercent(profile, "listen", level);
  const speakPct = skillCompletionPercent(profile, "speak", level);
  return Math.round((vocabPct + grammarPct + listenPct + speakPct) / 4);
}

// Level cao nhất mà MỘT kỹ năng cụ thể đã mở khoá (level 1 luôn mở)
function maxUnlockedLevelForSkill(profile, skill){
  const levels = LEVEL_DATA.map(l=>l.level).sort((a,b)=>a-b);
  let unlocked = levels[0] || 1;
  for(let i=0;i<levels.length-1;i++){
    const lvl = levels[i];
    if(isSkillFullyDone(profile, skill, lvl)){
      unlocked = levels[i+1];
    } else {
      break;
    }
  }
  return unlocked;
}

function isLevelUnlockedForSkill(profile, skill, level){
  return level <= maxUnlockedLevelForSkill(profile, skill);
}

function selectLevel(skill, level){
  if(!isLevelUnlockedForSkill(state, skill, level)){
    showToast(`🔒 Hãy hoàn thành 100% ${SKILL_LABEL[skill]} ở level hiện tại trước khi mở level này.`);
    return;
  }
  state[SKILL_LEVEL_FIELD[skill]] = level;
  state.currentLevel = level; // giữ đồng bộ field cũ để các nơi khác (vd trang Chính) vẫn hiển thị hợp lý
  saveDB();
  goTab(currentTabForLevelSwitch);
}

let currentTabForLevelSwitch = "vocab";

// Render thanh chọn level, dùng riêng cho từng tab theo kỹ năng tương ứng
// (vocab/grammar/listen/speak) — mỗi tab tự mở khoá độc lập.
function renderLevelPills(containerId, tabName){
  currentTabForLevelSwitch = tabName;
  const skill = tabName; // tabName trùng tên kỹ năng: vocab/grammar/listen/speak
  const wrap = document.getElementById(containerId);
  if(!wrap) return;
  const unlocked = maxUnlockedLevelForSkill(state, skill);
  const activeLevel = state[SKILL_LEVEL_FIELD[skill]] || 1;
  wrap.innerHTML = LEVEL_DATA.map(l=>{
    const isUnlocked = l.level <= unlocked;
    const isActive = l.level === activeLevel;
    const pct = skillCompletionPercent(state, skill, l.level);
    return `<span class="level-pill ${isActive?'active':''} ${isUnlocked?'':'locked'}"
        onclick="selectLevel('${skill}', ${l.level})" title="${isUnlocked ? l.desc : 'Hoàn thành 100% ' + SKILL_LABEL[skill] + ' của level trước để mở khoá'}">
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
  if(name==="aichat") renderAiChatTab();
  window.scrollTo(0,0);
}

function showToast(msg){
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(()=>t.classList.remove("show"), 2200);
}

// ============ TTS HELPER ============
// Ưu tiên các giọng đọc tiếng Anh tự nhiên (Google/Microsoft Natural/Online) thay vì
// giọng robot mặc định của hệ thống. Người dùng cũng có thể tự chọn giọng yêu thích,
// lựa chọn được lưu theo từng máy/trình duyệt (localStorage), không tốn phí.
let cachedVoices = [];
let preferredVoiceName = localStorage.getItem("ehoc_tts_voice") || "";

// Thứ tự ưu tiên: tên giọng chứa các từ khoá này thường nghe tự nhiên hơn giọng robot mặc định
const VOICE_QUALITY_HINTS = [
  "Google US English", "Google UK English Female", "Google UK English Male",
  "Microsoft Aria", "Microsoft Jenny", "Microsoft Guy", "Microsoft Online",
  "Natural", "Samantha", "Daniel"
];

function refreshVoiceList(){
  if(!('speechSynthesis' in window)) return [];
  const voices = window.speechSynthesis.getVoices() || [];
  cachedVoices = voices.filter(v => /^en/i.test(v.lang));
  return cachedVoices;
}

function pickBestEnglishVoice(){
  const voices = cachedVoices.length ? cachedVoices : refreshVoiceList();
  if(voices.length === 0) return null;

  if(preferredVoiceName){
    const chosen = voices.find(v => v.name === preferredVoiceName);
    if(chosen) return chosen;
  }

  for(const hint of VOICE_QUALITY_HINTS){
    const match = voices.find(v => v.name.indexOf(hint) !== -1);
    if(match) return match;
  }

  return voices.find(v => v.lang === "en-US") || voices[0];
}

function setPreferredVoice(name){
  preferredVoiceName = name || "";
  localStorage.setItem("ehoc_tts_voice", preferredVoiceName);
}

function renderVoicePicker(){
  const sel = document.getElementById("ttsVoiceSelect");
  if(!sel) return;
  const voices = cachedVoices.length ? cachedVoices : refreshVoiceList();
  if(voices.length === 0){
    sel.innerHTML = `<option value="">(Không có giọng đọc khả dụng)</option>`;
    return;
  }
  sel.innerHTML = voices.map(v=>{
    const label = v.name + (v.lang ? " (" + v.lang + ")" : "");
    return `<option value="${escapeHtml(v.name)}">${escapeHtml(label)}</option>`;
  }).join("");

  const best = pickBestEnglishVoice();
  sel.value = preferredVoiceName && voices.some(v=>v.name===preferredVoiceName)
    ? preferredVoiceName
    : (best ? best.name : "");
}

if(typeof window !== "undefined" && 'speechSynthesis' in window){
  refreshVoiceList();
  window.speechSynthesis.onvoiceschanged = ()=>{
    refreshVoiceList();
    renderVoicePicker();
  };
}

function speak(text, rate){
  if(!('speechSynthesis' in window)){
    showToast("Thiết bị không hỗ trợ phát âm thanh.");
    return;
  }
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-US";
  u.rate = rate || 0.95;
  u.pitch = 1;
  const voice = pickBestEnglishVoice();
  if(voice) u.voice = voice;
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

  renderMasteryMilestones();
  renderBadgesPreview();
  renderLearningAnalysis(false);
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

// ============ VOCAB (SRS Leitner + gõ nghĩa để kiểm tra) ============
let currentTopic = "Tất cả";
let vocabQueue = [];
let vocabIdx = 0;
let vocabChecked = false; // đã bấm "Kiểm tra" cho từ hiện tại chưa
let vocabWasCorrect = false;
let vocabFuzzyInfo = null; // {pct, correctAnswer} khi đúng nhờ gần đúng (có lỗi chính tả nhỏ)
let vocabLastUserAnswer = ""; // lưu lại nội dung đã gõ để hiển thị so sánh sau khi input bị thay bằng feedback
// Cấp độ gợi ý đã dùng cho từ hiện tại (0 = chưa dùng, reset mỗi khi sang từ mới):
//   1 = che chữ (chỉ hiện chữ cái đầu + số ký tự còn lại, vd "g _ _ v _ s")
//   2 = câu hỏi liên tưởng (dựa vào chủ đề + câu ví dụ có sẵn, không lộ đáp án)
//   3 = hiện đáp án đầy đủ
// Điểm thưởng giảm dần theo cấp cao nhất đã dùng — khuyến khích tự nhớ trước.
let vocabHintLevel = 0;

// Chế độ của thẻ từ hiện tại — random xen kẽ mỗi thẻ:
//  "en2vi": hiện từ tiếng Anh, gõ nghĩa tiếng Việt (chế độ gốc)
//  "vi2en": hiện nghĩa tiếng Việt, gõ ĐÚNG CHÍNH TẢ từ tiếng Anh (rèn chính tả)
let vocabCardMode = "en2vi";

// ----- Bài kiểm tra tổng hợp sau khi ôn xong 1 lượt từ vựng -----
let vocabQuizWords = [];   // các từ vừa ôn trong lượt này, dùng để tạo bài kiểm tra
let vocabQuizQueue = [];   // câu hỏi trắc nghiệm đã trộn cho lượt kiểm tra
let vocabQuizIdx = 0;
let vocabQuizScore = 0;
let vocabQuizAnswered = false;

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
  let pool = VOCAB_DATA.filter(v => v.level===state.currentLevelVocab && (currentTopic==="Tất cả" || v.topic===currentTopic));
  vocabQueue = pool.filter(v=>isDue(v.id));
  if(vocabQueue.length===0) vocabQueue = pool;
  vocabQueue = shuffleArray(vocabQueue);
  vocabIdx = 0;
  vocabChecked = false;
  vocabHintLevel = 0;
  vocabCardMode = Math.random() < 0.5 ? "en2vi" : "vi2en";
  renderVocabCard();
}

// Che chữ: chỉ hiện chữ cái đầu, các chữ còn lại thay bằng "_", giữ khoảng
// trắng/dấu trong cụm từ nhiều tiếng để người học thấy được cấu trúc.
// VD: "gloves" -> "g _ _ _ _ _", "ice cream" -> "i _ _   _ _ _ _ _".
function maskWord(word){
  return word.split("").map((ch,i)=>{
    if(ch === " ") return " ";
    return i===0 ? ch : "_";
  }).join(" ");
}

// Sinh câu hỏi liên tưởng (cấp 2) hoàn toàn từ dữ liệu sẵn có (topic + example
// câu trong data.js), không gọi AI. Ẩn từ/nghĩa mục tiêu trong câu ví dụ bằng
// "_____" để không lộ đáp án, kèm gợi ý chủ đề để kích thích liên tưởng.
function buildAssociativeHint(v, askingForWord){
  // askingForWord=true: người học cần đoán từ tiếng Anh (chế độ vi2en) -> ẩn v.word trong example
  // askingForWord=false: người học cần đoán nghĩa tiếng Việt (chế độ en2vi) -> chỉ gợi ngữ cảnh, không ẩn gì thêm vì example là tiếng Anh
  const topic = v.topic || "chủ đề này";
  if(askingForWord){
    const escapedWord = v.word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(escapedWord, "i");
    const maskedExample = v.example.replace(re, "_____");
    return `🤔 Từ này thuộc chủ đề "${topic}". Nó xuất hiện trong câu: "${maskedExample}"`;
  }
  return `🤔 Từ này thuộc chủ đề "${topic}". Hãy nghĩ xem trong ngữ cảnh "${topic.toLowerCase()}", từ "${v.word}" thường được dùng để nói về điều gì.`;
}

// Tăng cấp gợi ý lên 1 (tối đa 3) cho từ hiện tại. Điểm thưởng giảm dần theo
// cấp cao nhất đã dùng (xem checkVocabAnswer) — khuyến khích người học tự
// suy nghĩ/liên tưởng trước khi xin gợi ý mạnh hơn.
function useVocabHint(){
  if(vocabChecked || vocabHintLevel >= 3) return;
  vocabHintLevel++;
  renderVocabCard();
}

function renderVocabTab(){
  renderLevelPills("vocabLevelPills", "vocab");
  renderTopicPills();
  buildVocabQueue();
  renderLearningAnalysis(false);
}

// Chuẩn hoá chuỗi để so khớp linh hoạt: bỏ hoa/thường, dấu câu, khoảng trắng thừa
function normalizeAnswer(s){
  return (s||"")
    .toLowerCase()
    .normalize("NFC")
    .replace(/[.,!?;:"'()\-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function renderVocabCard(){
  const area = document.getElementById("vocabArea");
  if(vocabQueue.length===0){
    area.innerHTML = `<div class="card empty-state">🎉 Không còn từ nào để ôn trong chủ đề này hôm nay!</div>`;
    return;
  }
  if(vocabIdx >= vocabQueue.length){
    area.innerHTML = `<div class="card empty-state">✅ Bạn đã ôn hết lượt từ vựng hôm nay.<br><br>
      <button class="btn" onclick="startVocabQuiz()">📝 Làm bài kiểm tra</button>
      <button class="small-btn" style="margin-top:10px;" onclick="buildVocabQueue()">Ôn lại lượt nữa</button></div>`;
    return;
  }
  const v = vocabQueue[vocabIdx];
  const vs = getVocabState(v.id);
  const isVi2En = vocabCardMode === "vi2en";

  // Nội dung gợi ý theo cấp hiện tại (0 = chưa xin gợi ý).
  let hintHtml = "";
  if(!vocabChecked && vocabHintLevel === 0){
    hintHtml = `<div class="hint">${isVi2En ? "Gõ đúng chính tả từ tiếng Anh này 👇" : "Gõ nghĩa tiếng Việt của từ này 👇"}</div>`;
  } else if(!vocabChecked && vocabHintLevel === 1){
    hintHtml = `<div class="hint">🔡 Gợi ý (che chữ): <strong>${escapeHtml(maskWord(isVi2En ? v.word : v.meaning))}</strong></div>`;
  } else if(!vocabChecked && vocabHintLevel === 2){
    hintHtml = `<div class="hint">${escapeHtml(maskWord(isVi2En ? v.word : v.meaning))}</div>
      <div class="hint" style="margin-top:6px;font-size:14px;">${escapeHtml(buildAssociativeHint(v, isVi2En))}</div>`;
  } else if(!vocabChecked && vocabHintLevel >= 3){
    hintHtml = `<div class="hint">💡 Đáp án: <strong>${escapeHtml(isVi2En ? v.word : v.meaning)}</strong></div>`;
  }

  const hintButtonLabels = {
    0: "💡 Gợi ý cấp 1: che chữ (giảm nhẹ điểm thưởng)",
    1: "🤔 Gợi ý cấp 2: câu hỏi liên tưởng (giảm thêm điểm thưởng)",
    2: "❗ Gợi ý cấp 3: hiện đáp án (mất điểm thưởng)"
  };

  area.innerHTML = `
    <div class="flash-wrap">
      <div class="progress-bar" style="width:100%;"><div class="fill" style="width:${(vocabIdx/vocabQueue.length*100)}%"></div></div>
      <div class="mode-badge" style="text-align:center;font-size:12px;color:var(--muted, #888);margin-bottom:4px;">
        ${isVi2En ? "✏️ Chế độ: Gõ từ tiếng Anh" : "📝 Chế độ: Gõ nghĩa tiếng Việt"}
      </div>
      <div class="flashcard" id="flashcardEl">
        ${isVi2En ? `
          <div class="word">${escapeHtml(v.meaning)}</div>
          ${vocabChecked ? `
            <div class="meaning">${v.word}</div>
            <div class="phon">${v.phon}</div>
            <div class="example">"${v.example}"</div>
          ` : hintHtml}
        ` : `
          <div class="word">${v.word}</div>
          <div class="phon">${v.phon}</div>
          ${vocabChecked ? `
            <div class="meaning">${v.meaning}</div>
            <div class="example">"${v.example}"</div>
          ` : hintHtml}
        `}
      </div>
      <button class="btn secondary" onclick="speak('${v.word.replace(/'/g,"\\'")}')">🔊 Nghe phát âm</button>
      ${!vocabChecked ? `
      <div class="vocab-input-row">
        <input type="text" id="vocabAnswerInput" placeholder="${isVi2En ? 'Nhập từ tiếng Anh...' : 'Nhập nghĩa tiếng Việt...'}"
          onkeydown="if(event.key==='Enter') checkVocabAnswer();" autocomplete="off" autocapitalize="off">
        <button class="vocab-check-btn" onclick="checkVocabAnswer()">Kiểm tra</button>
      </div>
      ${vocabHintLevel < 3 ? `<button class="small-btn" style="margin-top:8px;" onclick="useVocabHint()">${hintButtonLabels[vocabHintLevel]}</button>` : ""}
      ` : `
      <div class="vocab-feedback ${vocabWasCorrect ? 'correct' : 'wrong'}">
        ${vocabWasCorrect
          ? (vocabFuzzyInfo
              ? `⚠️ Gần đúng (${vocabFuzzyInfo.pct}% khớp) — chú ý chính tả!`
              : '✅ Chính xác!')
          : (vocabFuzzyInfo
              ? `❌ Chưa đúng (${vocabFuzzyInfo.pct}% khớp) — học lại từ này nhé.`
              : '❌ Chưa đúng — học lại từ này nhé.')}
      </div>
      ${vocabFuzzyInfo ? `
        <p class="muted" style="text-align:center;margin-top:2px;">
          Đáp án chuẩn: <span style="font-family:monospace;font-size:15px;">${highlightDiff(vocabLastUserAnswer, vocabFuzzyInfo.correctAnswer)}</span>
          <br>(chữ <span style="color:var(--bad);text-decoration:underline;font-weight:700;">gạch đỏ</span> là vị trí bạn gõ sai/khác)
        </p>
      ` : ""}
      <button class="vocab-next-btn" onclick="nextVocabCard()">Tiếp tục →</button>
      `}
      <p class="muted">Hộp ${vs.box}/5 · ${vocabIdx+1} / ${vocabQueue.length} · ⭐ ${state.points||0} điểm</p>
    </div>
  `;
  if(!vocabChecked){
    const inputEl = document.getElementById("vocabAnswerInput");
    if(inputEl) inputEl.focus();
  }
}

// Một số nghĩa có nhiều cách dịch, viết dạng "A/B" (vd "cơm/gạo" = "cơm"
// HOẶC "gạo"; "trễ/muộn" = "trễ" HOẶC "muộn"). Trả về true nếu userAnswer
// khớp với TOÀN BỘ chuỗi gốc, HOẶC khớp với một trong các phần tách bởi "/".
// Lưu ý: với các từ như "anh/em trai", người học cần gõ đúng "anh/em trai"
// hoặc chọn 1 trong 2 phần ghép đủ nghĩa — phần "trai" không tách riêng vì
// không tự mang nghĩa hoàn chỉnh.
function answerMatchesMeaning(userAnswer, rawMeaning){
  const fullMatch = normalizeAnswer(rawMeaning);
  if(userAnswer === fullMatch) return true;
  if(!rawMeaning.includes("/")) return false;

  const parts = rawMeaning.split("/").map(p=>normalizeAnswer(p)).filter(p=>p.length>0);
  if(parts.includes(userAnswer)) return true;

  // Xử lý riêng mẫu "A/B chung" khi B có dạng "tiền tố + từ chung" còn A là
  // tiền tố đơn (vd "anh/em trai" -> "anh trai" hoặc "em trai"; "em/chị gái"
  // -> "em gái" hoặc "chị gái"). Chỉ áp dụng khi có đúng 2 phần và phần sau
  // có nhiều hơn 1 từ.
  if(parts.length === 2){
    const rawParts = rawMeaning.split("/");
    const before = rawParts[0].trim();
    const afterWords = rawParts[1].trim().split(/\s+/);
    if(before.split(/\s+/).length === 1 && afterWords.length > 1){
      const sharedSuffix = afterWords.slice(1).join(" ");
      const combined = normalizeAnswer(before + " " + sharedSuffix);
      if(userAnswer === combined) return true;
    }
  }
  return false;
}

// Khoảng cách Levenshtein (số bước chỉnh sửa: thêm/xoá/đổi 1 ký tự) giữa 2 chuỗi.
function levenshteinDistance(a, b){
  const m = a.length, n = b.length;
  if(m===0) return n;
  if(n===0) return m;
  const dp = new Array(n+1);
  for(let j=0;j<=n;j++) dp[j] = j;
  for(let i=1;i<=m;i++){
    let prev = dp[0];
    dp[0] = i;
    for(let j=1;j<=n;j++){
      const tmp = dp[j];
      if(a[i-1] === b[j-1]){
        dp[j] = prev;
      } else {
        dp[j] = Math.min(prev+1, dp[j]+1, dp[j-1]+1);
      }
      prev = tmp;
    }
  }
  return dp[n];
}

// Bỏ dấu tiếng Việt (dấu thanh + dấu mũ/móc) để so sánh phụ âm/nguyên âm gốc,
// giúp lỗi "quên gõ dấu" (vd "chi gai" vs "chị gái") không bị tính nặng như
// gõ sai hẳn ký tự khác.
function stripDiacritics(s){
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D");
}

// % giống nhau giữa 2 chuỗi đã chuẩn hoá, dựa trên khoảng cách Levenshtein.
// Nếu bản bỏ dấu khớp tuyệt đối (chỉ thiếu/sai dấu thanh), coi là lỗi nhỏ rất
// nhẹ (95%) thay vì tính theo Levenshtein thô trên ký tự Unicode có dấu (mỗi
// dấu thanh khác nhau bị tính là 1 bước chỉnh sửa, nặng tay với từ ngắn).
function similarityPercent(a, b){
  if(a.length===0 && b.length===0) return 100;
  if(stripDiacritics(a) === stripDiacritics(b) && a !== b) return 95;
  const dist = levenshteinDistance(a, b);
  const maxLen = Math.max(a.length, b.length, 1);
  return Math.round((1 - dist/maxLen) * 100);
}

// So sánh userAnswer với từng đáp án hợp lệ (tách theo logic answerMatchesMeaning)
// và trả về đáp án có % giống cao nhất, kèm % đó. Dùng để báo "gần đúng".
function closestMeaningCandidates(rawMeaning){
  const candidates = [normalizeAnswer(rawMeaning)];
  if(rawMeaning.includes("/")){
    rawMeaning.split("/").map(p=>normalizeAnswer(p)).filter(p=>p.length>0).forEach(p=>{
      if(!candidates.includes(p)) candidates.push(p);
    });
    const rawParts = rawMeaning.split("/");
    if(rawParts.length===2){
      const before = rawParts[0].trim();
      const afterWords = rawParts[1].trim().split(/\s+/);
      if(before.split(/\s+/).length===1 && afterWords.length>1){
        const sharedSuffix = afterWords.slice(1).join(" ");
        const combined = normalizeAnswer(before + " " + sharedSuffix);
        if(!candidates.includes(combined)) candidates.push(combined);
      }
    }
  }
  return candidates;
}

function bestMatchInfo(userAnswer, rawMeaning){
  const candidates = closestMeaningCandidates(rawMeaning);
  let best = {answer: candidates[0], pct: -1, dist: Infinity};
  candidates.forEach(c=>{
    const pct = similarityPercent(userAnswer, c);
    const dist = levenshteinDistance(userAnswer, c);
    if(pct > best.pct) best = {answer: c, pct, dist};
  });
  return best;
}

// Cho phép "gần đúng" khi: đạt ngưỡng % HOẶC chỉ lệch tối đa 1 ký tự edit
// (thêm/xoá/đổi 1 chữ) — vì với từ tiếng Việt ngắn (3-8 ký tự), 1 lỗi gõ vẫn
// kéo % giống xuống dưới ngưỡng do trọng số mỗi ký tự khá lớn.
function isFuzzyAcceptable(best){
  if(best.pct >= VOCAB_FUZZY_THRESHOLD) return true;
  if(best.dist <= 1) return true;
  return false;
}

// Đánh dấu vị trí ký tự khác nhau giữa userAnswer và đáp án đúng (so khớp
// theo vị trí, đơn giản và dễ hiểu cho người học — không cần thuật toán
// alignment phức tạp). Trả về HTML với ký tự sai/thiếu được bôi đỏ.
function highlightDiff(userAnswer, correctAnswer){
  const maxLen = Math.max(userAnswer.length, correctAnswer.length);
  let html = "";
  for(let i=0;i<maxLen;i++){
    const cu = userAnswer[i];
    const cc = correctAnswer[i];
    if(cc === undefined) break; // đáp án ngắn hơn, phần dư của user bỏ qua khi hiển thị đáp án
    if(cu === cc){
      html += escapeHtml(cc);
    } else {
      html += `<span style="color:var(--bad);text-decoration:underline;font-weight:700;">${escapeHtml(cc)}</span>`;
    }
  }
  return html;
}

const VOCAB_FUZZY_THRESHOLD = 80; // % giống tối thiểu để chấp nhận là "gần đúng"

function checkVocabAnswer(){
  if(vocabChecked) return;
  const v = vocabQueue[vocabIdx];
  const inputEl = document.getElementById("vocabAnswerInput");
  const userAnswer = normalizeAnswer(inputEl ? inputEl.value : "");
  vocabLastUserAnswer = userAnswer;

  vocabFuzzyInfo = null; // {pct, correctAnswer} khi đúng nhờ gần đúng, null khi khớp tuyệt đối hoặc sai hẳn

  if(vocabCardMode === "vi2en"){
    // Chế độ rèn chính tả: so khớp trực tiếp với từ tiếng Anh (v.word), không
    // cần xử lý "A/B" như nghĩa tiếng Việt vì v.word luôn là 1 từ/cụm đơn.
    const targetWord = normalizeAnswer(v.word);
    const exactMatch = userAnswer.length>0 && userAnswer === targetWord;
    if(exactMatch){
      vocabWasCorrect = true;
    } else if(userAnswer.length>0){
      const pct = similarityPercent(userAnswer, targetWord);
      const dist = levenshteinDistance(userAnswer, targetWord);
      const best = {answer: targetWord, pct, dist};
      if(isFuzzyAcceptable(best)){
        vocabWasCorrect = true;
        vocabFuzzyInfo = {pct: best.pct, correctAnswer: best.answer, isWrong:false};
      } else {
        vocabWasCorrect = false;
        vocabFuzzyInfo = {pct: best.pct, correctAnswer: best.answer, isWrong:true};
      }
    } else {
      vocabWasCorrect = false;
    }
  } else {
    const exactMatch = userAnswer.length>0 && answerMatchesMeaning(userAnswer, v.meaning);
    if(exactMatch){
      vocabWasCorrect = true;
    } else if(userAnswer.length>0){
      const best = bestMatchInfo(userAnswer, v.meaning);
      if(isFuzzyAcceptable(best)){
        vocabWasCorrect = true;
        vocabFuzzyInfo = {pct: best.pct, correctAnswer: best.answer, isWrong:false};
      } else {
        vocabWasCorrect = false;
        // Vẫn lưu gợi ý gần nhất để hiển thị vị trí sai, dù chưa đạt ngưỡng đúng
        vocabFuzzyInfo = {pct: best.pct, correctAnswer: best.answer, isWrong:true};
      }
    } else {
      vocabWasCorrect = false;
    }
  }
  vocabChecked = true;

  const vs = getVocabState(v.id);
  let intervalDays, earned;
  if(vocabWasCorrect){
    vs.box = Math.min(5, vs.box+1);
    intervalDays = [1,2,4,7,14][vs.box-1] || 14;
    // Điểm thưởng giảm dần theo cấp gợi ý cao nhất đã dùng — khuyến khích
    // người học tự suy nghĩ/liên tưởng trước khi xin gợi ý mạnh hơn:
    //   cấp 0 (không xin gợi ý): điểm đầy đủ
    //   cấp 1 (che chữ): giảm nhẹ (75%)
    //   cấp 2 (câu hỏi liên tưởng): giảm vừa (50%)
    //   cấp 3 (đáp án đầy đủ): giảm nhiều (25%)
    const hintMultiplier = [1, 0.75, 0.5, 0.25][vocabHintLevel] ?? 0.25;
    earned = Math.round(POINTS.vocabGood * hintMultiplier);
    if(vs.box>=5) vs.learned = true;
  } else {
    vs.box = 1;
    intervalDays = 0;
    earned = POINTS.vocabAgain;
    // Sai thì học lại từ này ngay trong cùng lượt: đưa về cuối hàng đợi
    vocabQueue.push(v);
  }
  const due = new Date(Date.now() + intervalDays*86400000);
  vs.due = due.toISOString().slice(0,10);
  addPoints(earned);
  markActivity();
  renderVocabCard();
  renderLevelPills("vocabLevelPills", "vocab"); // cập nhật % ngay, không cần đợi đổi tab
}

function nextVocabCard(){
  vocabIdx++;
  vocabChecked = false;
  vocabHintLevel = 0;
  vocabCardMode = Math.random() < 0.5 ? "en2vi" : "vi2en";
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

// ----- CÔNG CỤ TEST NHANH (dùng để kiểm tra % và mở khoá level ngay, không
// cần chờ học/ôn nhiều ngày). Đánh dấu toàn bộ từ vựng ở level hiện tại là đã
// thuộc (box=5), giúp xem ngay % lên 100% và level kế tiếp được mở khoá. -----
function devCompleteVocabLevel(){
  if(!confirm("Đánh dấu TOÀN BỘ từ vựng ở level hiện tại là đã thuộc (chỉ dùng để test)?")) return;
  const items = VOCAB_DATA.filter(v=>v.level===state.currentLevelVocab);
  items.forEach(v=>{
    state.vocab[v.id] = {box:5, due: todayStr(), learned:true};
  });
  saveDB();
  checkLevelUnlock();
  renderLevelPills("vocabLevelPills", "vocab");
  buildVocabQueue();
  showToastSafe(`✅ Đã đánh dấu ${items.length} từ ở level hiện tại là đã thuộc (chỉ để test).`);
}

// ----- BÀI KIỂM TRA TỔNG HỢP TỪ VỰNG -----
// Trắc nghiệm 4 lựa chọn: chọn nghĩa tiếng Việt đúng của từ. Dùng các từ vừa
// ôn trong lượt này làm câu hỏi, lấy nghĩa của các từ khác (cùng level) làm
// phương án nhiễu cho đa dạng.
function startVocabQuiz(){
  vocabQuizWords = vocabQueue.slice();
  vocabQuizQueue = shuffleArray(vocabQuizWords);
  vocabQuizIdx = 0;
  vocabQuizScore = 0;
  vocabQuizAnswered = false;
  renderVocabQuizQuestion();
}

function buildQuizChoices(correctWord){
  const distractPool = VOCAB_DATA.filter(v => v.level===state.currentLevelVocab && v.id !== correctWord.id);
  const shuffledPool = shuffleArray(distractPool);
  const distractors = shuffledPool.slice(0, 3).map(v=>v.meaning);
  const choices = shuffleArray([correctWord.meaning, ...distractors]);
  return choices;
}

function renderVocabQuizQuestion(){
  const area = document.getElementById("vocabArea");
  if(vocabQuizIdx >= vocabQuizQueue.length){
    renderVocabQuizResult();
    return;
  }
  const v = vocabQuizQueue[vocabQuizIdx];
  const choices = buildQuizChoices(v);
  area.innerHTML = `
    <div class="card">
      <div class="progress-bar"><div class="fill" style="width:${(vocabQuizIdx/vocabQuizQueue.length*100)}%"></div></div>
      <p class="muted">📝 Bài kiểm tra từ vựng · Câu ${vocabQuizIdx+1}/${vocabQuizQueue.length}</p>
      <h2>${v.word} <span style="font-size:13px;color:var(--muted);font-weight:400;">${v.phon}</span></h2>
      <p class="muted">Từ này có nghĩa là gì?</p>
      <div id="vocabQuizOpts">
        ${choices.map((c,i)=>`<button class="opt-btn" onclick="answerVocabQuiz(${i}, '${v.id}')">${escapeHtml(c)}</button>`).join("")}
      </div>
      <div id="vocabQuizFeedback"></div>
    </div>
  `;
  area.dataset.quizChoices = JSON.stringify(choices);
  area.dataset.quizCorrect = v.meaning;
}

function answerVocabQuiz(choiceIdx, wordId){
  if(vocabQuizAnswered) return;
  vocabQuizAnswered = true;

  const v = vocabQuizQueue[vocabQuizIdx];
  const area = document.getElementById("vocabArea");
  const choices = JSON.parse(area.dataset.quizChoices || "[]");
  const chosenMeaning = choices[choiceIdx];
  const correct = chosenMeaning === v.meaning;

  if(correct){
    vocabQuizScore++;
    // Trả lời đúng trong bài kiểm tra cũng tính là 1 lần nhớ đúng, tăng box
    // Leitner của từ này — để % hoàn thành level phản ánh đúng việc đã ôn
    // qua bài kiểm tra, không chỉ riêng lúc gõ nghĩa ở thẻ từ.
    const vs = getVocabState(v.id);
    vs.box = Math.min(5, vs.box+1);
    const intervalDays = [1,2,4,7,14][vs.box-1] || 14;
    const due = new Date(Date.now() + intervalDays*86400000);
    vs.due = due.toISOString().slice(0,10);
    if(vs.box>=5) vs.learned = true;
    saveDB();
    checkLevelUnlock();
    renderLevelPills("vocabLevelPills", "vocab"); // cập nhật % ngay khi làm quiz
  }

  const buttons = document.querySelectorAll("#vocabQuizOpts .opt-btn");
  buttons.forEach((b,i)=>{
    b.onclick = null;
    if(choices[i] === v.meaning) b.classList.add("correct");
    if(i===choiceIdx && !correct) b.classList.add("wrong");
  });

  const fb = document.getElementById("vocabQuizFeedback");
  fb.innerHTML = `<div class="result-banner ${correct?'ok':'bad'}">${correct ? '✅ Chính xác!' : '❌ Chưa đúng — đáp án: '+escapeHtml(v.meaning)}</div>
    <button class="btn" style="margin-top:10px;" onclick="nextVocabQuizQuestion()">Tiếp theo →</button>`;
}

function nextVocabQuizQuestion(){
  vocabQuizIdx++;
  vocabQuizAnswered = false;
  renderVocabQuizQuestion();
}

function vocabQuizGrade(pct){
  if(pct >= 90) return {label:"🏆 Xuất sắc!", cls:"ok"};
  if(pct >= 70) return {label:"👍 Khá tốt!", cls:"warn"};
  return {label:"💪 Cần cố gắng hơn", cls:"bad"};
}

function renderVocabQuizResult(){
  const area = document.getElementById("vocabArea");
  const total = vocabQuizQueue.length;
  const pct = total>0 ? Math.round((vocabQuizScore/total)*100) : 0;
  const grade = vocabQuizGrade(pct);

  // Điểm thưởng tỉ lệ theo % đúng, tối đa bằng tổng điểm "Tốt" của tất cả từ trong bài kiểm tra
  const bonus = Math.round((pct/100) * total * POINTS.vocabGood);
  if(bonus > 0) addPoints(bonus);
  markActivity();

  area.innerHTML = `
    <div class="card empty-state">
      <h2 style="margin-top:0;">${grade.label}</h2>
      <div class="result-banner ${grade.cls}" style="font-size:22px;">${pct}%</div>
      <p class="muted" style="margin-top:8px;">Đúng ${vocabQuizScore}/${total} câu</p>
      ${bonus > 0 ? `<p class="muted">⭐ +${bonus} điểm thưởng</p>` : ""}
      <button class="btn" style="margin-top:14px;" onclick="buildVocabQueue()">Ôn lượt mới</button>
      <button class="small-btn" style="margin-top:10px;" onclick="startVocabQuiz()">Làm lại bài kiểm tra</button>
    </div>
  `;
}

// ============ GRAMMAR ============
let grammarIdx = 0;
let grammarPool = [];

function renderGrammarTab(){
  renderLevelPills("grammarLevelPills", "grammar");
  const levelItems = GRAMMAR_DATA.filter(g=>g.level===state.currentLevelGrammar);
  grammarPool = levelItems.filter(g=>!state.grammarDone[g.id]);
  if(grammarPool.length===0) grammarPool = levelItems.slice();
  grammarPool = shuffleArray(grammarPool);
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
  const items = shuffleArray(LISTEN_DATA.filter(item=>item.level===state.currentLevelListen));
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
let currentIpaFilter = "Tất cả";

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
  syncSpeakModeTabsUI();
  if(speakMode === "roleplay"){
    startRoleplay();
    return;
  }
  if(speakMode === "ipa"){
    renderIpaTab();
    return;
  }
  const area = document.getElementById("speakArea");
  const supported = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  const items = shuffleArray(SPEAK_DATA.filter(item=>item.level===state.currentLevelSpeak));
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

// So khớp câu mẫu với câu nhận diện được theo TỪNG TỪ, dùng thuật toán
// alignment đơn giản (LCS - longest common subsequence theo thứ tự từ) để
// biết từ nào trong câu mẫu đã được nói đúng/đủ, từ nào bị thiếu/đọc sai.
// Trả về {pct, words:[{word, ok}]} — words giữ đúng thứ tự câu mẫu.
function alignSpokenWords(expectedText, saidText){
  const expected = normalize(expectedText).split(/\s+/).filter(Boolean);
  const said = normalize(saidText).split(/\s+/).filter(Boolean);
  const n = expected.length, m = said.length;

  // dp[i][j] = độ dài LCS giữa expected[0..i) và said[0..j)
  const dp = Array.from({length:n+1}, ()=>new Array(m+1).fill(0));
  for(let i=1;i<=n;i++){
    for(let j=1;j<=m;j++){
      if(expected[i-1]===said[j-1]) dp[i][j] = dp[i-1][j-1]+1;
      else dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1]);
    }
  }
  // Truy vết để biết từ nào trong expected khớp được với said
  const matched = new Array(n).fill(false);
  let i=n, j=m;
  while(i>0 && j>0){
    if(expected[i-1]===said[j-1]){
      matched[i-1] = true;
      i--; j--;
    } else if(dp[i-1][j] >= dp[i][j-1]){
      i--;
    } else {
      j--;
    }
  }
  const words = expected.map((w,idx)=>({word:w, ok:matched[idx]}));
  const okCount = matched.filter(Boolean).length;
  const pct = n>0 ? Math.round(okCount/n*100) : 0;
  return {pct, words};
}

function scoreSpeak(id, said){
  const item = SPEAK_DATA.find(x=>x.id===id);
  const align = alignSpokenWords(item.text, said);
  const status = document.getElementById("sp-"+id);
  const pct = align.pct;
  const wordsHtml = align.words.map(w=>
    `<span style="display:inline-block;margin:2px 3px;padding:2px 8px;border-radius:8px;font-size:13px;font-weight:600;
      background:${w.ok ? '#e6f7ed' : '#fdeaec'};color:${w.ok ? 'var(--good)' : 'var(--bad)'};">
      ${w.ok ? '✓' : '✗'} ${escapeHtml(w.word)}
    </span>`
  ).join("");
  if(pct >= 70){
    status.innerHTML = `<span style="color:var(--good);font-weight:600;">✅ Tốt! (${pct}% khớp) +${POINTS.speakGood} điểm</span>
      <div style="margin-top:6px;">${wordsHtml}</div>
      <p class="muted" style="margin-top:4px;">Bạn nói: "${escapeHtml(said)}"</p>`;
    if(!state.speakDone[id]) addPoints(POINTS.speakGood);
    state.speakDone[id] = Math.max(state.speakDone[id]||0, pct);
    markActivity();
  } else {
    status.innerHTML = `<span style="color:var(--bad);font-weight:600;">❌ Thử lại nhé (${pct}% khớp)</span>
      <div style="margin-top:6px;">${wordsHtml}</div>
      <p class="muted" style="margin-top:4px;">Bạn nói: "${escapeHtml(said)}" — từ có dấu ✗ là từ bạn đọc thiếu hoặc chưa rõ.</p>`;
  }
}

// ============ AI: CẤU HÌNH WORKER PROXY ============
const AI_WORKER_KEY = "ehoc_ai_worker_url";

function getAiWorkerUrl(){
  return localStorage.getItem(AI_WORKER_KEY) || "";
}

function setAiWorkerUrl(url){
  localStorage.setItem(AI_WORKER_KEY, url.trim());
}

function promptSetupAiWorker(){
  const current = getAiWorkerUrl();
  const url = prompt(
    "Dán URL Cloudflare Worker (backend giữ API key Claude) vào đây.\nVí dụ: https://ten-worker.ten-subdomain.workers.dev",
    current
  );
  if(url !== null){
    setAiWorkerUrl(url);
    showToast(url.trim() ? "✅ Đã lưu địa chỉ AI." : "Đã xoá địa chỉ AI.");
  }
  return getAiWorkerUrl();
}

async function callAiWorker(mode, extra, message, history){
  const url = getAiWorkerUrl();
  if(!url){
    throw new Error("CHƯA_CẤU_HÌNH");
  }
  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(Object.assign({
      mode,
      level: state.currentLevel || 1,
      message,
      history: history || [],
    }, extra || {})),
  });
  const data = await resp.json().catch(()=>({}));
  if(!resp.ok || data.error){
    throw new Error(data.error || ("Lỗi server (" + resp.status + ")"));
  }
  return data.reply;
}

// ============ NHẬP BẰNG GIỌNG NÓI CHO CHAT AI / ROLEPLAY ============
// Dùng lại Web Speech API (getRecognizer()) đã có cho phần luyện nói —
// chỉ khác là kết quả được điền vào ô input chat thay vì chấm điểm phát âm.
let chatRecognizer = null;
let chatRecordingInputId = null;

function toggleChatVoiceInput(inputId, btnId){
  if(chatRecordingInputId === inputId){
    if(chatRecognizer) chatRecognizer.stop();
    return;
  }
  if(chatRecognizer){ try{ chatRecognizer.stop(); }catch(e){} }

  const btn = document.getElementById(btnId);
  const status = document.getElementById(inputId === "aiChatInput" ? "aiChatMicStatus" : "roleplayMicStatus");

  chatRecognizer = getRecognizer();
  if(!chatRecognizer){
    if(status) status.textContent = "⚠️ Trình duyệt này không hỗ trợ nhận diện giọng nói (vd: Safari trên iPhone). Hãy gõ chữ thay vào đó.";
    showToast("Không hỗ trợ nhận diện giọng nói trên thiết bị này.");
    return;
  }

  chatRecordingInputId = inputId;
  if(btn) btn.classList.add("recording");
  if(status) status.textContent = "🎙️ Đang nghe... hãy nói câu của bạn.";

  chatRecognizer.onresult = (e)=>{
    const said = e.results[0][0].transcript;
    const input = document.getElementById(inputId);
    if(input) input.value = said;
    if(status) status.textContent = "✅ Đã nhận: \"" + said + "\" — bấm Gửi hoặc sửa lại nếu cần.";
  };
  chatRecognizer.onerror = (e)=>{
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
    if(status) status.textContent = msg;
    if(btn) btn.classList.remove("recording");
    chatRecordingInputId = null;
  };
  chatRecognizer.onend = ()=>{
    if(btn) btn.classList.remove("recording");
    chatRecordingInputId = null;
  };

  try{
    chatRecognizer.start();
  }catch(e){
    if(status) status.textContent = "⚠️ Không thể bắt đầu ghi âm, hãy thử lại.";
    if(btn) btn.classList.remove("recording");
    chatRecordingInputId = null;
  }
}

// Tự đọc to câu trả lời của AI (tuỳ chọn, lưu trạng thái bật/tắt theo từng hồ sơ trình duyệt)
let autoSpeakAiChat = localStorage.getItem("ehoc_autospeak_aichat") === "1";
let autoSpeakRoleplay = localStorage.getItem("ehoc_autospeak_roleplay") === "1";

function setAutoSpeakAiChat(checked){
  autoSpeakAiChat = checked;
  localStorage.setItem("ehoc_autospeak_aichat", checked ? "1" : "0");
}
function setAutoSpeakRoleplay(checked){
  autoSpeakRoleplay = checked;
  localStorage.setItem("ehoc_autospeak_roleplay", checked ? "1" : "0");
}

// Đọc to câu trả lời của AI, bỏ phần "📝 Nhận xét:"/"📝 Gợi ý:" (tiếng Việt) — chỉ đọc phần tiếng Anh
function speakAiReply(content){
  const [main] = splitAiNote(content);
  if(main) speak(main, 0.95);
}

// ============ AI CHAT TỰ DO (tab Chat AI) ============
let aiChatHistory = []; // [{role:"user"|"assistant", content:"..."}]
let aiChatBusy = false;

function renderAiChatSetupNote(){
  const wrap = document.getElementById("aiChatSetupNote");
  if(!wrap) return;
  const url = getAiWorkerUrl();
  wrap.innerHTML = url
    ? `<p class="ai-setup-note">🔗 Đang dùng AI server: <code>${escapeHtml(url)}</code> · <span style="color:var(--primary);cursor:pointer;text-decoration:underline;" onclick="promptSetupAiWorker();renderAiChatSetupNote();">Đổi địa chỉ</span></p>`
    : `<p class="ai-setup-note">⚠️ Chưa cấu hình AI server. <span style="color:var(--primary);cursor:pointer;text-decoration:underline;" onclick="promptSetupAiWorker();renderAiChatSetupNote();">Nhấn vào đây để nhập địa chỉ Cloudflare Worker</span> (xem hướng dẫn deploy đi kèm).</p>`;
}

function renderAiChatHistory(){
  const wrap = document.getElementById("aiChatHistory");
  if(!wrap) return;
  if(aiChatHistory.length===0){
    wrap.innerHTML = `<div class="chat-bubble note">Hãy bắt đầu trò chuyện bằng tiếng Anh ở dưới 👇</div>`;
    return;
  }
  wrap.innerHTML = aiChatHistory.map(m=>
    `<div class="chat-bubble ${m.role==='user'?'user':'ai'}">${escapeHtml(m.content)}</div>`
  ).join("") + (aiChatBusy ? `<div class="chat-bubble ai typing-dots">AI đang trả lời...</div>` : "");
  wrap.scrollTop = wrap.scrollHeight;
}

function renderAiChatTab(){
  renderAiChatSetupNote();
  renderAiChatHistory();
  const cb = document.getElementById("aiChatAutoSpeak");
  if(cb) cb.checked = autoSpeakAiChat;
  renderVoicePicker();
}

async function sendAiChat(){
  if(aiChatBusy) return;
  const input = document.getElementById("aiChatInput");
  const text = input.value.trim();
  if(!text) return;

  if(!getAiWorkerUrl()){
    promptSetupAiWorker();
    if(!getAiWorkerUrl()) return;
    renderAiChatSetupNote();
  }

  aiChatHistory.push({role:"user", content:text});
  input.value = "";
  aiChatBusy = true;
  renderAiChatHistory();

  try{
    const reply = await callAiWorker("chat", {}, text, aiChatHistory.slice(0,-1));
    aiChatHistory.push({role:"assistant", content:reply});
    markActivity();
    if(autoSpeakAiChat) speakAiReply(reply);
  }catch(err){
    const msg = err.message === "CHƯA_CẤU_HÌNH"
      ? "⚠️ Chưa cấu hình AI server."
      : "⚠️ Lỗi: " + err.message;
    aiChatHistory.push({role:"assistant", content:msg});
  }finally{
    aiChatBusy = false;
    renderAiChatHistory();
  }
}

function resetAiChat(){
  aiChatHistory = [];
  renderAiChatHistory();
}

// ============ AI ROLEPLAY (trong tab Nói) ============
let speakMode = "practice"; // "practice" hoặc "roleplay"
let roleplayCurrent = null;
let roleplayHistory = [];
let roleplayBusy = false;

// 3 chế độ trong tab Nói: practice (luyện câu mẫu) / roleplay (AI đóng vai) / ipa (bảng IPA)
const SPEAK_MODE_HINTS = {
  practice: "Nhấn 🔊 để nghe mẫu, sau đó nhấn mic và đọc theo.",
  roleplay: "AI sẽ đóng vai một nhân vật và trò chuyện cùng bạn. Hãy trả lời bằng tiếng Anh.",
  ipa: "Học bảng phiên âm IPA — bấm 🔊 để nghe từng âm.",
};

function syncSpeakModeTabsUI(){
  const mode = speakMode;
  const hint = document.getElementById("speakModeHint");
  const speakArea = document.getElementById("speakArea");
  const roleplayArea = document.getElementById("roleplayArea");
  const ipaArea = document.getElementById("ipaArea");
  const tabsWrap = document.getElementById("speakModeTabs");

  if(hint) hint.textContent = SPEAK_MODE_HINTS[mode] || "";
  if(speakArea) speakArea.style.display = mode === "practice" ? "block" : "none";
  if(roleplayArea) roleplayArea.style.display = mode === "roleplay" ? "block" : "none";
  if(ipaArea) ipaArea.style.display = mode === "ipa" ? "block" : "none";

  if(tabsWrap){
    tabsWrap.querySelectorAll(".speak-mode-tab").forEach(btn=>{
      btn.classList.toggle("active", btn.getAttribute("data-mode") === mode);
    });
  }
}

function setSpeakMode(mode){
  speakMode = mode;
  syncSpeakModeTabsUI();

  if(mode === "roleplay") startRoleplay();
  if(mode === "ipa") renderIpaTab();
}

// ============ BẢNG PHIÊN ÂM IPA ============
function renderIpaTab(){
  const area = document.getElementById("ipaArea");
  if(!area) return;
  const groups = ["Tất cả", ...new Set(IPA_DATA.map(x=>x.group))];
  const pillsHtml = groups.map(g=>
    `<span class="topic-pill ${g===currentIpaFilter?'active':''}" onclick="selectIpaFilter('${g}')">${g}</span>`
  ).join("");

  const items = IPA_DATA.filter(x=> currentIpaFilter==="Tất cả" || x.group===currentIpaFilter);
  const cardsHtml = items.map(x=>`
    <div class="card" style="padding:14px;">
      <div class="row-between">
        <div>
          <span style="font-size:22px;font-weight:700;color:var(--primary-dark);">${x.ipa}</span>
          <span class="muted" style="margin-left:8px;">${x.group}</span>
        </div>
        <button class="small-btn" onclick="speak('${x.example.replace(/'/g,"\\'")}')">🔊 Nghe</button>
      </div>
      <p style="margin:8px 0 2px;font-size:15px;"><strong>Ví dụ:</strong> ${escapeHtml(x.example)}</p>
      <p class="muted" style="margin:2px 0;">Cách đọc: ${escapeHtml(x.tip)}</p>
      ${x.note ? `<p class="muted" style="margin:2px 0;color:var(--warn);">⚠️ ${escapeHtml(x.note)}</p>` : ""}
    </div>
  `).join("");

  area.innerHTML = `
    <div class="card">
      <h2>🔤 Bảng phiên âm IPA</h2>
      <p class="muted">Học từng âm, nghe mẫu và đọc theo. Chú ý các âm hay bị nhầm lẫn (có dấu ⚠️).</p>
      <div>${pillsHtml}</div>
    </div>
    ${cardsHtml}
  `;
}

function selectIpaFilter(g){
  currentIpaFilter = g;
  renderIpaTab();
}

function startRoleplay(){
  const pool = ROLEPLAY_DATA.filter(r=>r.level===state.currentLevelSpeak);
  if(pool.length===0){
    document.getElementById("roleplayArea").innerHTML = `<div class="card empty-state">Chưa có tình huống roleplay cho level này.</div>`;
    return;
  }
  roleplayCurrent = pool[Math.floor(Math.random()*pool.length)];
  roleplayHistory = [{role:"assistant", content: roleplayCurrent.opener}];
  renderRoleplayArea();
  if(autoSpeakRoleplay) speakAiReply(roleplayCurrent.opener);
}

function renderRoleplayArea(){
  const area = document.getElementById("roleplayArea");
  if(!roleplayCurrent){
    area.innerHTML = "";
    return;
  }
  area.innerHTML = `
    <div class="role-card">
      <div class="role-title">${roleplayCurrent.icon} AI đóng vai: ${escapeHtml(roleplayCurrent.role)}</div>
      <div class="role-scenario">${escapeHtml(roleplayCurrent.scenario)}</div>
    </div>
    <div id="roleplaySetupNote"></div>
    <div class="card">
      <div class="chat-wrap" style="height:auto;min-height:260px;">
        <div class="chat-history" id="roleplayHistoryWrap"></div>
        <div class="chat-input-row">
          <input type="text" id="roleplayInput" placeholder="Type your answer in English..." onkeydown="if(event.key==='Enter')sendRoleplayReply()">
          <button class="chat-mic-btn" id="roleplayMicBtn" onclick="toggleChatVoiceInput('roleplayInput','roleplayMicBtn')" title="Nói bằng giọng nói">🎤</button>
          <button class="btn" onclick="sendRoleplayReply()">Gửi</button>
        </div>
        <p class="muted" id="roleplayMicStatus" style="min-height:18px;margin:4px 0 0;font-size:12px;"></p>
      </div>
      <label class="ai-voice-toggle"><input type="checkbox" id="roleplayAutoSpeak" onchange="setAutoSpeakRoleplay(this.checked)"> 🔊 Tự đọc to câu trả lời của AI</label>
      <button class="small-btn" style="margin-top:10px;" onclick="startRoleplay()">🔄 Đổi tình huống khác</button>
    </div>
  `;
  renderRoleplaySetupNote();
  renderRoleplayHistory();
  const cb = document.getElementById("roleplayAutoSpeak");
  if(cb) cb.checked = autoSpeakRoleplay;
}

function renderRoleplaySetupNote(){
  const wrap = document.getElementById("roleplaySetupNote");
  if(!wrap) return;
  const url = getAiWorkerUrl();
  wrap.innerHTML = url ? "" :
    `<p class="ai-setup-note">⚠️ Chưa cấu hình AI server. <span style="color:var(--primary);cursor:pointer;text-decoration:underline;" onclick="promptSetupAiWorker();renderRoleplaySetupNote();">Nhấn để nhập địa chỉ Cloudflare Worker</span>.</p>`;
}

function renderRoleplayHistory(){
  const wrap = document.getElementById("roleplayHistoryWrap");
  if(!wrap) return;
  wrap.innerHTML = roleplayHistory.map(m=>{
    if(m.role === "assistant" && m.content.includes("📝")){
      const [main, note] = splitAiNote(m.content);
      return `<div class="chat-bubble ai">${escapeHtml(main)}</div>` +
        (note ? `<div class="chat-bubble note">${escapeHtml(note)}</div>` : "");
    }
    return `<div class="chat-bubble ${m.role==='user'?'user':'ai'}">${escapeHtml(m.content)}</div>`;
  }).join("") + (roleplayBusy ? `<div class="chat-bubble ai typing-dots">AI đang trả lời...</div>` : "");
  wrap.scrollTop = wrap.scrollHeight;
}

// Tách phần hội thoại và phần "📝 Nhận xét:" / "📝 Gợi ý:" trong câu trả lời AI
function splitAiNote(content){
  const idx = content.indexOf("📝");
  if(idx === -1) return [content, ""];
  return [content.slice(0, idx).trim(), content.slice(idx).trim()];
}

async function sendRoleplayReply(){
  if(roleplayBusy || !roleplayCurrent) return;
  const input = document.getElementById("roleplayInput");
  const text = input.value.trim();
  if(!text) return;

  if(!getAiWorkerUrl()){
    promptSetupAiWorker();
    if(!getAiWorkerUrl()) return;
    renderRoleplaySetupNote();
  }

  roleplayHistory.push({role:"user", content:text});
  input.value = "";
  roleplayBusy = true;
  renderRoleplayHistory();

  try{
    const reply = await callAiWorker("roleplay", {
      role: roleplayCurrent.role,
      scenario: roleplayCurrent.scenario,
    }, text, roleplayHistory.slice(0,-1));
    roleplayHistory.push({role:"assistant", content:reply});
    if(!state.speakDone["rp_"+roleplayCurrent.id]){
      state.speakDone["rp_"+roleplayCurrent.id] = true;
      addPoints(POINTS.speakGood);
    }
    markActivity();
    if(autoSpeakRoleplay) speakAiReply(reply);
  }catch(err){
    const msg = err.message === "CHƯA_CẤU_HÌNH"
      ? "⚠️ Chưa cấu hình AI server."
      : "⚠️ Lỗi: " + err.message;
    roleplayHistory.push({role:"assistant", content:msg});
  }finally{
    roleplayBusy = false;
    renderRoleplayHistory();
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
  ensurePerSkillLevels(state);
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
