/* ═══════════════════════════════════════════════
   STATE
═══════════════════════════════════════════════ */
let state = {
  clicks: 0,
  session: 0,
  cps: 0,
  multiplier: 1,
  combo: 0,
  comboTimer: null,
  confettiEnabled: true,
  soundEnabled: false,
  autoIntervals: [],
  upgrades: {},
  autos: {},
  notes: [],
  achievementsUnlocked: new Set(),
  startTime: Date.now()
};

/* ═══════════════════════════════════════════════
   UPGRADES DATA
═══════════════════════════════════════════════ */
const UPGRADES = [
  { id: 'multi2',   name: '✨ Double Impact',     cost: 25,   desc: 'Each click counts twice',       effect: () => { state.multiplier *= 2; } },
  { id: 'multi5',   name: '🚀 Quintuple Tap',      cost: 150,  desc: '5× click power unlocked',       effect: () => { state.multiplier *= 5; } },
  { id: 'golden',   name: '🌟 Golden Aura',        cost: 500,  desc: 'Clicks worth 10× more',         effect: () => { state.multiplier *= 10; } },
  { id: 'legendary',name: '👑 Legendary Presence', cost: 2500, desc: '50× multiplier activated',      effect: () => { state.multiplier *= 50; } },
  { id: 'mythic',   name: '🔮 Mythic Nomination',  cost: 10000,desc: '100× — you are unforgettable',  effect: () => { state.multiplier *= 100; } },
];

const AUTO_CLICKERS = [
  { id: 'friend',   name: '👫 Supportive Friend',  cost: 10,   cps: 1,   desc: '+1 impression/sec',          base: 10  },
  { id: 'teacher',  name: '🏫 Class Teacher',       cost: 100,  cps: 5,   desc: '+5 impressions/sec',         base: 100 },
  { id: 'principal',name: '🏛 The Principal',       cost: 500,  cps: 20,  desc: '+20 impressions/sec',        base: 500 },
  { id: 'media',    name: '📺 School Newsletter',   cost: 2000, cps: 100, desc: '+100 impressions/sec',       base: 2000},
  { id: 'viral',    name: '🌐 Goes Viral',          cost: 8000, cps: 500, desc: '+500 impressions/sec',       base: 8000},
];

/* ═══════════════════════════════════════════════
   ACHIEVEMENTS
═══════════════════════════════════════════════ */
const ACHIEVEMENTS = [
  { id: 'first',     icon: '👋', name: 'First Impression',   desc: 'Click once',            check: () => state.clicks >= 1 },
  { id: 'ten',       icon: '🔟', name: 'Ten-fold',           desc: '10 impressions',        check: () => state.clicks >= 10 },
  { id: 'hundred',   icon: '💯', name: 'The Century',        desc: '100 impressions',       check: () => state.clicks >= 100 },
  { id: 'thousand',  icon: '🎯', name: 'Milestone 1K',       desc: '1,000 impressions',     check: () => state.clicks >= 1000 },
  { id: 'tenk',      icon: '🔥', name: 'On Fire',            desc: '10,000 impressions',    check: () => state.clicks >= 10000 },
  { id: 'hundredk',  icon: '💎', name: 'Diamond Nominator',  desc: '100,000 impressions',   check: () => state.clicks >= 100000 },
  { id: 'million',   icon: '👑', name: 'Legendary',          desc: '1,000,000 impressions', check: () => state.clicks >= 1000000 },
  { id: 'combo10',   icon: '⚡', name: 'Lightning Fingers',  desc: 'Reach a ×10 combo',     check: () => state.combo >= 10 },
  { id: 'allup',     icon: '🏆', name: 'Fully Upgraded',     desc: 'Buy all multipliers',   check: () => UPGRADES.every(u => state.upgrades[u.id]) },
];

/* ═══════════════════════════════════════════════
   MILESTONES (shown in sidebar)
═══════════════════════════════════════════════ */
const MILESTONES = [
  { label: '1st Click',    threshold: 1 },
  { label: '100 clicks',   threshold: 100 },
  { label: '1K clicks',    threshold: 1000 },
  { label: '10K clicks',   threshold: 10000 },
  { label: '100K clicks',  threshold: 100000 },
  { label: '1M clicks',    threshold: 1000000 },
];

/* ═══════════════════════════════════════════════
   INIT
═══════════════════════════════════════════════ */
function init() {
  loadState();
  renderUpgrades();
  renderAutoClickers();
  renderMilestones();
  renderAchievements();
  updateStats();
  renderImpressions();
  renderNotes();
  startAutoTick();
}

/* ═══════════════════════════════════════════════
   CLICK HANDLER
═══════════════════════════════════════════════ */
function handleClick(e) {
  const earned = state.multiplier;
  state.clicks += earned;
  state.session += earned;

  // Combo
  clearTimeout(state.comboTimer);
  state.combo++;
  state.comboTimer = setTimeout(() => { state.combo = 0; updateComboDisplay(); }, 1200);

  updateStats();
  spawnFloat(e, earned);
  flashGlow();
  updateComboDisplay();
  checkAchievements();
  saveState();

  if (state.confettiEnabled && state.clicks % 100 === 0) burstConfetti(8);
}

/* ═══════════════════════════════════════════════
   FLOAT NUMBERS
═══════════════════════════════════════════════ */
function spawnFloat(e, val) {
  const container = document.getElementById('floatContainer');
  const el = document.createElement('div');
  el.className = 'float-num';
  const x = 80 + Math.random() * 100;
  const y = 120 + Math.random() * 40;
  el.style.left = x + 'px';
  el.style.top  = y + 'px';
  el.style.color = state.combo > 5 ? 'var(--gold-dark)' : 'var(--accent)';
  el.style.fontSize = Math.min(0.9 + state.combo * 0.05, 2) + 'rem';
  el.textContent = (val >= 1000 ? formatNum(val) : '+' + val);
  container.appendChild(el);
  setTimeout(() => el.remove(), 950);
}

/* ═══════════════════════════════════════════════
   GLOW FLASH
═══════════════════════════════════════════════ */
function flashGlow() {
  const g = document.getElementById('clickerGlow');
  g.classList.remove('flash');
  void g.offsetWidth;
  g.classList.add('flash');
}

/* ═══════════════════════════════════════════════
   COMBO DISPLAY
═══════════════════════════════════════════════ */
function updateComboDisplay() {
  const el = document.getElementById('comboDisplay');
  if (state.combo >= 3) {
    el.textContent = `🔥 COMBO ×${state.combo}`;
    el.style.opacity = '1';
  } else {
    el.style.opacity = '0';
  }
}

/* ═══════════════════════════════════════════════
   AUTO-CLICKERS
═══════════════════════════════════════════════ */
function startAutoTick() {
  clearInterval(window._autoInterval);
  window._autoInterval = setInterval(() => {
    let totalCps = 0;
    AUTO_CLICKERS.forEach(a => {
      const count = state.autos[a.id] || 0;
      totalCps += a.cps * count;
    });
    state.cps = totalCps;
    if (totalCps > 0) {
      state.clicks += totalCps;
      state.session += totalCps;
      updateStats();
      checkAchievements();
      saveState();
    }
    document.getElementById('cps').textContent = `+${formatNum(totalCps)} / sec`;
  }, 1000);
}

/* ═══════════════════════════════════════════════
   RENDER UPGRADES
═══════════════════════════════════════════════ */
function renderUpgrades() {
  const list = document.getElementById('upgradesList');
  list.innerHTML = '';
  UPGRADES.forEach(u => {
    const btn = document.createElement('button');
    btn.className = 'upgrade-btn' + (state.upgrades[u.id] ? ' purchased' : '');
    btn.disabled = state.upgrades[u.id] || state.clicks < u.cost;
    btn.innerHTML = `
      <div class="up-name">
        ${u.name}
        <span class="up-cost">${state.upgrades[u.id] ? '✓' : formatNum(u.cost) + ' pts'}</span>
      </div>
      <div class="up-desc">${u.desc}</div>
    `;
    if (!state.upgrades[u.id]) {
      btn.onclick = () => buyUpgrade(u);
    }
    list.appendChild(btn);
  });
}

function buyUpgrade(u) {
  if (state.clicks < u.cost || state.upgrades[u.id]) return;
  state.clicks -= u.cost;
  state.upgrades[u.id] = true;
  u.effect();
  document.getElementById('multiplier').textContent = 'x' + formatNum(state.multiplier);
  renderUpgrades();
  updateStats();
  checkAchievements();
  saveState();
  if (state.confettiEnabled) burstConfetti(15);
}

/* ═══════════════════════════════════════════════
   RENDER AUTO-CLICKERS
═══════════════════════════════════════════════ */
function renderAutoClickers() {
  const list = document.getElementById('autoList');
  list.innerHTML = '';
  AUTO_CLICKERS.forEach(a => {
    const count = state.autos[a.id] || 0;
    const cost  = Math.ceil(a.base * Math.pow(1.15, count));
    const btn   = document.createElement('button');
    btn.className = 'upgrade-btn';
    btn.disabled  = state.clicks < cost;
    btn.innerHTML = `
      <div class="up-name">
        ${a.name}
        ${count > 0 ? `<span class="up-count">${count}</span>` : ''}
        <span class="up-cost">${formatNum(cost)} pts</span>
      </div>
      <div class="up-desc">${a.desc}</div>
    `;
    btn.onclick = () => buyAuto(a);
    list.appendChild(btn);
  });
}

function buyAuto(a) {
  const count = state.autos[a.id] || 0;
  const cost  = Math.ceil(a.base * Math.pow(1.15, count));
  if (state.clicks < cost) return;
  state.clicks -= cost;
  state.autos[a.id] = count + 1;
  renderAutoClickers();
  updateStats();
  saveState();
}

/* ═══════════════════════════════════════════════
   UPDATE STATS
═══════════════════════════════════════════════ */
function updateStats() {
  document.getElementById('totalClicks').textContent  = formatNum(Math.floor(state.clicks));
  document.getElementById('sessionClicks').textContent = formatNum(Math.floor(state.session));
  document.getElementById('multiplier').textContent   = 'x' + formatNum(state.multiplier);

  // Enable/disable upgrade buttons
  document.querySelectorAll('.upgrade-btn:not(.purchased)').forEach(btn => {
    // handled per-render; re-render to refresh
  });
  renderUpgrades();
  renderAutoClickers();
  renderMilestones();
  renderImpressions();
}

/* ═══════════════════════════════════════════════
   MILESTONES
═══════════════════════════════════════════════ */
function renderMilestones() {
  const list = document.getElementById('milestonesList');
  list.innerHTML = '';
  MILESTONES.forEach(m => {
    const done = state.clicks >= m.threshold;
    const li   = document.createElement('li');
    li.className = 'milestone-item' + (done ? ' done' : '');
    li.innerHTML = `<span class="mcheck">${done ? '✔' : '○'}</span>${m.label}`;
    list.appendChild(li);
  });
}

/* ═══════════════════════════════════════════════
   ACHIEVEMENTS
═══════════════════════════════════════════════ */
function checkAchievements() {
  let newUnlock = false;
  ACHIEVEMENTS.forEach(a => {
    if (!state.achievementsUnlocked.has(a.id) && a.check()) {
      state.achievementsUnlocked.add(a.id);
      newUnlock = true;
      showAchievementToast(a);
    }
  });
  if (newUnlock) renderAchievements();
}

function renderAchievements() {
  const grid = document.getElementById('achievementGrid');
  if (!grid) return;
  grid.innerHTML = '';
  ACHIEVEMENTS.forEach(a => {
    const unlocked = state.achievementsUnlocked.has(a.id);
    const card = document.createElement('div');
    card.className = 'ach-card ' + (unlocked ? 'unlocked' : 'locked');
    card.innerHTML = `
      <div class="ach-icon">${a.icon}</div>
      <div class="ach-name">${a.name}</div>
      <div class="ach-desc">${a.desc}</div>
    `;
    grid.appendChild(card);
  });
}

function showAchievementToast(a) {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
    background: linear-gradient(135deg, #2d6a4f, #1b4332);
    color: #fff; border-radius: 12px; padding: 14px 24px;
    font-family: var(--font-body, sans-serif); font-size: 0.9rem;
    box-shadow: 0 8px 32px rgba(0,0,0,0.25); z-index: 9998;
    display: flex; align-items: center; gap: 10px;
    animation: note-in 0.3s ease-out;
  `;
  toast.innerHTML = `<span style="font-size:1.5rem">${a.icon}</span><div><strong>Achievement Unlocked!</strong><br>${a.name}</div>`;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3200);
}

/* ═══════════════════════════════════════════════
   IMPRESSIONS TAB
═══════════════════════════════════════════════ */
function renderImpressions() {
  const grid = document.getElementById('impressionsGrid');
  if (!grid) return;
  const elapsed = Math.floor((Date.now() - state.startTime) / 1000);
  const data = [
    { icon: '👆', label: 'Total Clicks',      value: formatNum(Math.floor(state.clicks)) },
    { icon: '⚡', label: 'Multiplier',         value: 'x' + formatNum(state.multiplier) },
    { icon: '🤖', label: 'Auto CPS',           value: formatNum(state.cps) },
    { icon: '🏅', label: 'Achievements',       value: state.achievementsUnlocked.size + ' / ' + ACHIEVEMENTS.length },
    { icon: '⏱',  label: 'Time Playing',      value: formatTime(elapsed) },
    { icon: '🔥', label: 'Peak Combo',         value: 'x' + state.combo },
  ];
  grid.innerHTML = '';
  data.forEach(d => {
    grid.innerHTML += `
      <div class="impression-card">
        <div class="imp-icon">${d.icon}</div>
        <div class="imp-label">${d.label}</div>
        <div class="imp-value">${d.value}</div>
      </div>
    `;
  });
}

/* ═══════════════════════════════════════════════
   NOTES
═══════════════════════════════════════════════ */
function addNote() {
  const title = document.getElementById('noteTitle').value.trim();
  const body  = document.getElementById('noteBody').value.trim();
  const tag   = document.getElementById('noteTag').value;
  if (!body) return;
  const note = {
    id: Date.now(),
    title: title || 'Untitled',
    body,
    tag,
    time: new Date().toLocaleString('en-GB', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' })
  };
  state.notes.unshift(note);
  document.getElementById('noteTitle').value = '';
  document.getElementById('noteBody').value  = '';
  renderNotes();
  saveState();
}

function deleteNote(id) {
  state.notes = state.notes.filter(n => n.id !== id);
  renderNotes();
  saveState();
}

function renderNotes() {
  const feed = document.getElementById('notesFeed');
  if (!feed) return;
  if (state.notes.length === 0) {
    feed.innerHTML = '<div class="notes-empty">No notes yet — write something! 📝</div>';
    return;
  }
  feed.innerHTML = '';
  state.notes.forEach(n => {
    const card = document.createElement('div');
    card.className = 'note-card';
    card.innerHTML = `
      <div class="note-card-header">
        <div class="note-card-title">${n.tag} ${n.title}</div>
        <div style="display:flex;align-items:center;gap:8px">
          <span class="note-card-time">${n.time}</span>
          <button class="note-delete" onclick="deleteNote(${n.id})" title="Delete">✕</button>
        </div>
      </div>
      <div class="note-card-body">${escapeHtml(n.body)}</div>
    `;
    feed.appendChild(card);
  });
}

/* ═══════════════════════════════════════════════
   TAB SWITCHING
═══════════════════════════════════════════════ */
function switchTab(name, btn) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(b => b.classList.remove('active'));
  document.getElementById('tab-' + name).classList.add('active');
  btn.classList.add('active');
  if (name === 'impressions') { renderImpressions(); renderAchievements(); }
  if (name === 'notes') renderNotes();
}

/* ═══════════════════════════════════════════════
   SETTINGS TOGGLES
═══════════════════════════════════════════════ */
function toggleDark() {
  document.body.classList.toggle('dark', document.getElementById('darkToggle').checked);
}

function toggleConfetti() {
  state.confettiEnabled = document.getElementById('confettiToggle').checked;
}

function toggleSound() {
  state.soundEnabled = document.getElementById('soundToggle').checked;
}

function resetGame() {
  if (!confirm('Reset all progress? This cannot be undone.')) return;
  localStorage.removeItem('classDashState');
  location.reload();
}

/* ═══════════════════════════════════════════════
   SAVE / LOAD
═══════════════════════════════════════════════ */
function saveState() {
  const s = {
    clicks: state.clicks,
    session: state.session,
    multiplier: state.multiplier,
    upgrades: state.upgrades,
    autos: state.autos,
    notes: state.notes,
    achievements: [...state.achievementsUnlocked],
    startTime: state.startTime
  };
  try { localStorage.setItem('classDashState', JSON.stringify(s)); } catch(e) {}
}

function loadState() {
  try {
    const raw = localStorage.getItem('classDashState');
    if (!raw) return;
    const s = JSON.parse(raw);
    state.clicks      = s.clicks      || 0;
    state.session     = s.session     || 0;
    state.upgrades    = s.upgrades    || {};
    state.autos       = s.autos       || {};
    state.notes       = s.notes       || [];
    state.startTime   = s.startTime   || Date.now();
    state.achievementsUnlocked = new Set(s.achievements || []);

    // Re-apply multiplier effects
    state.multiplier = 1;
    UPGRADES.forEach(u => { if (state.upgrades[u.id]) u.effect(); });
  } catch(e) {}
}

/* ═══════════════════════════════════════════════
   CONFETTI
═══════════════════════════════════════════════ */
const confettiCanvas = document.getElementById('confettiCanvas');
const ctx = confettiCanvas.getContext('2d');
let confettiParticles = [];

function resizeCanvas() {
  confettiCanvas.width  = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function burstConfetti(count) {
  const colors = ['#e85d04','#f4a261','#f9c74f','#2d6a4f','#90e0ef','#ff6b6b','#c77dff'];
  for (let i = 0; i < count; i++) {
    confettiParticles.push({
      x: Math.random() * confettiCanvas.width,
      y: -10,
      r: 4 + Math.random() * 6,
      d: Math.random() * 0.5 + 0.3,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 3,
      vy: 2 + Math.random() * 3,
      rot: Math.random() * Math.PI * 2,
      rotV: (Math.random() - 0.5) * 0.15,
      shape: Math.random() > 0.5 ? 'rect' : 'circle',
      alpha: 1
    });
  }
}

function drawConfetti() {
  ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  confettiParticles.forEach(p => {
    ctx.save();
    ctx.globalAlpha = p.alpha;
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.fillStyle = p.color;
    if (p.shape === 'circle') {
      ctx.beginPath();
      ctx.arc(0, 0, p.r, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillRect(-p.r, -p.r / 2, p.r * 2, p.r);
    }
    ctx.restore();
    p.x   += p.vx;
    p.y   += p.vy;
    p.rot += p.rotV;
    p.vy  += 0.05;
    if (p.y > confettiCanvas.height * 0.85) p.alpha -= 0.03;
  });
  confettiParticles = confettiParticles.filter(p => p.alpha > 0);
  requestAnimationFrame(drawConfetti);
}

drawConfetti();

// Launch welcome confetti burst
setTimeout(() => { if (state.confettiEnabled) burstConfetti(25); }, 600);

/* ═══════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════ */
function formatNum(n) {
  if (n >= 1e12) return (n / 1e12).toFixed(1) + 'T';
  if (n >= 1e9)  return (n / 1e9).toFixed(1) + 'B';
  if (n >= 1e6)  return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3)  return (n / 1e3).toFixed(1) + 'K';
  return Math.floor(n).toString();
}

function formatTime(s) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${sec}s`;
  return `${sec}s`;
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ═══════════════════════════════════════════════
   BOOT
═══════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', init);
