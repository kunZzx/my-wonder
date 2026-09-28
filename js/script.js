/* =========================================================
   MY WONDER — script.js
   1) Konfigurasi   2) Referensi   3) Navigasi layar
   4) Gerbang sandi 5) Tirai       6) Foto berjalan
   7) Lightbox      8) Hati        9) Musik romantis
   ========================================================= */

/* ---------- 1) KONFIGURASI ---------- */
const CONFIG = {
  PASSWORD: "011029",

  PHOTOS: [
    { src: "assets/foto-1.jpg", label: "Awal cerita" },
    { src: "assets/foto-2.jpg", label: "Tawa kecil" },
    { src: "assets/foto-3.jpg", label: "Jalan pulang" },
    { src: "assets/foto-4.jpg", label: "Selamanya" },
  ],

  MUSIC_FILE: "assets/My-Heart.mp3",
};
/* ---------------------------------- */

/* ---------- 2) Referensi & util ---------- */
const $ = (s) => document.querySelector(s);
const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];

const curtain   = $("#curtain");
const musicBtn  = $("#music-toggle");
const lightbox  = $("#lightbox");
const track     = $("#track");

/* ---------- 3) Navigasi layar ---------- */
function showScreen(id) {
  document.querySelectorAll(".screen").forEach((s) =>
    s.classList.toggle("active", s.id === id)
  );
}

/* ---------- 4) GERBANG SANDI (input tunggal) ---------- */
const pinInput = $("#pin-input");
const pinMsg   = $("#pin-msg");
const gateCard = $("#gate-card");
let unlocked = false;

pinInput.addEventListener("input", () => {
  // hanya terima angka, maksimal 6 digit
  pinInput.value = pinInput.value.replace(/\D/g, "").slice(0, 6);
  pinMsg.textContent = "";
  pinMsg.className = "pin-msg";
  if (pinInput.value.length === 6) attempt(); // otomatis cek saat 6 digit penuh
});

pinInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") attempt();
});

function attempt() {
  if (unlocked) return;
  const val = pinInput.value;
  if (val.length < 6) {
    pinMsg.textContent = "Isi keenam digitnya dulu ya.";
    pinMsg.className = "pin-msg err";
    pinInput.focus();
    return;
  }
  if (val === CONFIG.PASSWORD) unlockSuccess();
  else unlockFail();
}

function unlockFail() {
  gateCard.classList.remove("shake");
  void gateCard.offsetWidth;
  gateCard.classList.add("shake");
  pinMsg.textContent = "Hmm, sandinya belum tepat. Coba ingat-ingat lagi ya.";
  pinMsg.className = "pin-msg err";
  pinInput.value = "";
  pinInput.focus();
}

function unlockSuccess() {
  unlocked = true;
  pinMsg.textContent = "Sandi benar — tirai segera dibuka.";
  pinMsg.className = "pin-msg ok";
  pinInput.classList.add("ok");
  pinInput.disabled = true;

  Music.start();
  Hearts.burst(innerWidth / 2, innerHeight / 2, 14);

  setTimeout(() => {
    curtainThrough(() => {
      showScreen("screen-main");
      musicBtn.hidden = false;
      letterBtn.hidden = false;
      Hearts.burst(innerWidth / 2, innerHeight * 0.42, 26);
    });
  }, 1000);
}

 $("#btn-unlock").addEventListener("click", () => attempt());

// Fokus otomatis ke kolom sandi saat halaman dibuka
setTimeout(() => pinInput.focus(), 500);

/* ---------- 5) TIRAI TRANSISI ---------- */
function curtainThrough(midAction) {
  curtain.classList.add("active", "closing");
  setTimeout(() => {
    midAction();
    requestAnimationFrame(() =>
      requestAnimationFrame(() => curtain.classList.remove("closing"))
    );
    setTimeout(() => curtain.classList.remove("active"), 950);
  }, 920);
}

/* ---------- 6) FOTO BERJALAN (marquee mulus) ---------- */
const SPEED = 42; // px per detik

function photoFigure(p, i) {
  return `
    <figure data-src="${p.src}" data-label="${p.label}">
      <img src="${p.src}" alt="${p.label}" draggable="false" />
      <figcaption><span class="roman">${ROMAN[i] ?? i + 1}</span>${p.label}</figcaption>
    </figure>`;
}

function buildMarquee() {
  const setHTML = CONFIG.PHOTOS.map(photoFigure).join("");

  // ukur lebar satu set dulu
  track.innerHTML = `<div class="m-set">${setHTML}</div>`;
  const setW = track.firstElementChild.getBoundingClientRect().width;
  const need = Math.max(1, Math.ceil(innerWidth / setW));

  // dua paruh identik → animasi -50% berjalan mulus tanpa terputus
  const group = Array.from({ length: need }, () => `<div class="m-set">${setHTML}</div>`).join("");
  track.innerHTML = group + group;
  track.style.animationDuration = `${(setW * need) / SPEED}s`;
}
buildMarquee();

// pasang ulang setelah semua gambar selesai dimuat (lebar jadi akurat)
addEventListener("load", buildMarquee);

let rsTimer;
addEventListener("resize", () => {
  clearTimeout(rsTimer);
  rsTimer = setTimeout(buildMarquee, 300);
});

/* ---------- 7) LIGHTBOX ---------- */
track.addEventListener("click", (e) => {
  const fig = e.target.closest("figure");
  if (!fig) return;
  $("#lb-img").src = fig.dataset.src;
  $("#lb-cap").textContent = fig.dataset.label;
  lightbox.classList.add("open");
  lightbox.setAttribute("aria-hidden", "false");
});

function closeLightbox() {
  lightbox.classList.remove("open");
  lightbox.setAttribute("aria-hidden", "true");
}
 $("#lb-close").addEventListener("click", closeLightbox);
lightbox.addEventListener("click", (e) => { if (e.target === lightbox) closeLightbox(); });
addEventListener("keydown", (e) => { if (e.key === "Escape") closeLightbox(); });

/* ---------- 8) HATI BERTERBANGAN ---------- */
const Hearts = (() => {
  const cv = $("#hearts");
  const cx = cv.getContext("2d");
  const RM = false; // paksa efek hati SELALU tampil, abaikan setelan OS

  const COLORS = ["167,77,66", "201,124,110", "226,166,152", "128,52,46", "214,144,128"];
  const AMBIENT_COUNT = 22;
  const MAX_COUNT = 110;

  let W = 0, H = 0, P = [], t = 0;

  function resize() {
    const d = Math.min(2, devicePixelRatio || 1);
    W = innerWidth; H = innerHeight;
    cv.width = W * d; cv.height = H * d;
    cx.setTransform(d, 0, 0, d, 0, 0);
  }

  function make(isBurst) {
    return {
      x: Math.random() * W,
      y: isBurst ? H + 30 : Math.random() * H,
      s: isBurst ? 9 + Math.random() * 14 : 6 + Math.random() * 9,
      vx: isBurst ? (Math.random() - .5) * 4.2 : (Math.random() - .5) * .3,
      vy: isBurst ? -(1.6 + Math.random() * 2.2) : -(.25 + Math.random() * .55),
      r: (Math.random() - .5) * .6,
      vr: (Math.random() - .5) * .012,
      ph: Math.random() * 6.28,
      sw: .4 + Math.random() * .9,
      beat: 1.6 + Math.random() * 1.8,
      a: isBurst ? .55 + Math.random() * .35 : .10 + Math.random() * .20,
      col: COLORS[(Math.random() * COLORS.length) | 0],
      outline: Math.random() < .3,
      glow: !!isBurst,
      burst: !!isBurst,
    };
  }

  function burst(x, y, n = 12) {
    for (let i = 0; i < n; i++) {
      const p = make(true);
      p.x = x + (Math.random() - .5) * 30;
      p.y = y + (Math.random() - .5) * 20;
      P.push(p);
    }
    if (P.length > MAX_COUNT) P.splice(0, P.length - MAX_COUNT);
  }

  function heartPath(c, s) {
    c.moveTo(0, -s * .35);
    c.bezierCurveTo(-s * .55, -s * 1.1, -s * 1.4, -s * .25, 0, s * .85);
    c.bezierCurveTo(s * 1.4, -s * .25, s * .55, -s * 1.1, 0, -s * .35);
  }

  function draw(p) {
    const beat = 1 + .11 * Math.pow(Math.max(0, Math.sin(t * p.beat + p.ph)), 3);
    const s = p.s * beat;

    cx.save();
    cx.translate(p.x, p.y);
    cx.rotate(p.r);
    cx.globalAlpha = Math.max(0, p.a);
    if (p.glow) { cx.shadowColor = `rgba(${p.col},.55)`; cx.shadowBlur = 10; }

    cx.beginPath();
    heartPath(cx, s);
    if (p.outline) {
      cx.strokeStyle = `rgba(${p.col},.9)`;
      cx.lineWidth = 1.3;
      cx.stroke();
    } else {
      cx.fillStyle = `rgb(${p.col})`;
      cx.fill();
    }
    cx.restore();
  }

  function frame() {
    t += .016;
    cx.clearRect(0, 0, W, H);
    for (let i = P.length - 1; i >= 0; i--) {
      const p = P[i];
      p.x += p.vx + Math.sin(t * p.sw + p.ph) * .5;
      p.y += p.vy;
      p.r += p.vr;

      if (p.burst) {
        p.vx *= .985;
        p.vy = Math.min(p.vy + .022, .8);
        p.a -= .006;
        if (p.a <= .02 || p.y > H + 60) { P.splice(i, 1); continue; }
      } else if (p.y < -50) {
        p.y = H + 30;
        p.x = Math.random() * W;
      }

      draw(p);
    }
    requestAnimationFrame(frame);
  }

  if (!RM) {
    resize();
    P = Array.from({ length: AMBIENT_COUNT }, () => make(false));
    requestAnimationFrame(frame);
    addEventListener("resize", resize);
  }

  return { burst: (x, y, n) => { if (!RM) burst(x, y, n); } };
})();

// Ketuk ruang kosong layar utama → taburan hati dari titik ketukan
 $("#screen-main").addEventListener("click", (e) => {
  if (!e.target.closest("figure")) Hearts.burst(e.clientX, e.clientY, 8);
});

/* ---------- 9) MUSIK ROMANTIS ---------- */
const Music = (() => {
  let ctx = null, master = null, timer = null;
  let audioEl = null, useFile = null;
  let playing = false, step = 0, nextTime = 0;
  let onState = () => {};

  const TEMPO = 72, EIGHTH = 60 / TEMPO / 2;
  const CHORDS = [
    { bass: 36, notes: [60, 64, 67, 72, 76, 72, 67, 64] },
    { bass: 33, notes: [57, 60, 64, 69, 72, 69, 64, 60] },
    { bass: 41, notes: [53, 57, 60, 65, 69, 65, 60, 57] },
    { bass: 31, notes: [55, 59, 62, 67, 71, 67, 62, 59] },
  ];
  const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);

  function voice(freq, t, dur, vol) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = "sine"; o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(master);
    o.start(t); o.stop(t + dur + 0.1);

    const o2 = ctx.createOscillator(), g2 = ctx.createGain();
    o2.type = "sine"; o2.frequency.value = freq * 2;
    g2.gain.setValueAtTime(0.0001, t);
    g2.gain.exponentialRampToValueAtTime(vol * 0.3, t + 0.008);
    g2.gain.exponentialRampToValueAtTime(0.0001, t + dur * 0.55);
    o2.connect(g2).connect(master);
    o2.start(t); o2.stop(t + dur);
  }

  function schedule() {
    while (nextTime < ctx.currentTime + 0.15) {
      const bar = (step >> 3) % 4, beat = step & 7, ch = CHORDS[bar];
      voice(mtof(ch.notes[beat]), nextTime, 1.9, 0.15);
      if (beat === 0) voice(mtof(ch.bass), nextTime, 2.8, 0.10);
      if (beat === 4) voice(mtof(ch.bass + 12), nextTime, 2.2, 0.05);
      nextTime += EIGHTH;
      step++;
    }
  }

  async function detectSource() {
    if (useFile !== null) return;
    try {
      const r = await fetch(CONFIG.MUSIC_FILE, { method: "HEAD" });
      if (r.ok) {
        audioEl = new Audio(CONFIG.MUSIC_FILE);
        audioEl.loop = true;
        audioEl.volume = 0.75;
        useFile = true;
        return;
      }
    } catch (e) { /* file:// atau file tak ada */ }
    useFile = false;
  }

  async function buildCtx() {
    if (ctx) return;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain();
    master.gain.value = 0.0001;

    const dry = ctx.createBiquadFilter();
    dry.type = "lowpass"; dry.frequency.value = 3600;

    const dly = ctx.createDelay(1);
    dly.delayTime.value = EIGHTH * 3;
    const fb  = ctx.createGain(); fb.gain.value = 0.33;
    const wet = ctx.createGain(); wet.gain.value = 0.40;

    master.connect(dry);  dry.connect(ctx.destination);
    master.connect(dly);
    dly.connect(fb); fb.connect(dly);
    dly.connect(wet); wet.connect(ctx.destination);
  }

  async function start() {
    await detectSource();
    if (useFile) {
      try { await audioEl.play(); playing = true; onState(playing); return; }
      catch (e) { useFile = false; }
    }
    await buildCtx();
    await ctx.resume();
    nextTime = ctx.currentTime + 0.08;
    if (!timer) timer = setInterval(schedule, 30);
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setTargetAtTime(0.5, ctx.currentTime, 0.9);
    playing = true; onState(playing);
  }

  function stop() {
    if (useFile && audioEl) audioEl.pause();
    if (ctx) master.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.3);
    clearInterval(timer); timer = null;
    playing = false; onState(playing);
  }

  return {
    start, stop,
    async toggle() { playing ? stop() : await start(); },
    onState(fn) { onState = fn; },
  };
})();

Music.onState((isPlaying) => {
  musicBtn.classList.toggle("playing", isPlaying);
  $("#ic-on").classList.toggle("hide", !isPlaying);
  $("#ic-off").classList.toggle("hide", isPlaying);
});
musicBtn.addEventListener("click", () => Music.toggle());

/* ---------- 10) SURAT PESAN ---------- */
const letterEl  = $("#letter");
const letterBtn = $("#letter-btn");

function openLetter() {
  letterEl.classList.add("open");
  letterEl.setAttribute("aria-hidden", "false");
  Hearts.burst(innerWidth / 2, innerHeight * 0.3, 12); // hati beterbangan saat surat terbuka
}
function closeLetter() {
  letterEl.classList.remove("open");
  letterEl.setAttribute("aria-hidden", "true");
}

letterBtn.addEventListener("click", openLetter);
 $("#letter-close").addEventListener("click", closeLetter);
letterEl.addEventListener("click", (e) => { if (e.target === letterEl) closeLetter(); });
addEventListener("keydown", (e) => { if (e.key === "Escape") closeLetter(); });