/* ==========================================================================
   Mduduzi Gwija: portfolio behaviour
   ========================================================================== */

const FORM_ENDPOINT = 'https://formspree.io/f/xldlypeg';
const EMAIL = 'mduduzigwija@gmail.com';

document.documentElement.classList.add('js');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(pointer: fine)').matches;
const motion = !reduceMotion && finePointer;

/* ---------- Footer year ---------- */
document.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });

/* ---------- Cape Town clock ---------- */
(function clock() {
  const els = document.querySelectorAll('[data-clock]');
  if (!els.length) return;
  const fmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Africa/Johannesburg', hour: '2-digit', minute: '2-digit', hour12: false });
  const tick = () => { const t = fmt.format(new Date()); els.forEach(el => { el.textContent = t; }); };
  tick();
  setInterval(tick, 15000);
})();

/* ---------- Toast ---------- */
const toastEl = document.querySelector('.toast');
let toastTimer;
function toast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2400);
}

/* ---------- Header: background on scroll, hide on scroll down, progress bar ---------- */
(function header() {
  const head = document.querySelector('.header');
  const bar = document.querySelector('.progress i');
  let lastY = window.scrollY;
  const onScroll = () => {
    const y = window.scrollY;
    head.classList.toggle('scrolled', y > 10);
    head.classList.toggle('hide', y > 400 && y > lastY && !document.body.classList.contains('locked'));
    lastY = y;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
})();

/* ---------- Mobile menu ---------- */
(function menu() {
  const btn = document.querySelector('.menu-btn');
  const panel = document.getElementById('mobile-menu');
  const setOpen = open => {
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    panel.classList.toggle('open', open);
    panel.setAttribute('aria-hidden', String(!open));
    document.body.classList.toggle('locked', open);
  };
  btn.addEventListener('click', () => setOpen(!panel.classList.contains('open')));
  panel.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setOpen(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && panel.classList.contains('open')) { setOpen(false); btn.focus(); } });
})();

/* ---------- Nav: sliding hover pill + active section ---------- */
(function nav() {
  const navbar = document.querySelector('.navbar');
  const pill = navbar.querySelector('.nav-pill');
  const links = [...navbar.querySelectorAll('a')];
  const moveTo = a => {
    if (!a) { pill.style.opacity = '0'; return; }
    pill.style.opacity = '1';
    pill.style.width = `${a.offsetWidth}px`;
    pill.style.transform = `translateX(${a.offsetLeft}px)`;
  };
  links.forEach(a => a.addEventListener('mouseenter', () => moveTo(a)));
  navbar.addEventListener('mouseleave', () => moveTo(navbar.querySelector('a.active')));

  if (!('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${e.target.id}`));
      if (!navbar.matches(':hover')) moveTo(navbar.querySelector('a.active'));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  document.querySelectorAll('main section[id]').forEach(s => io.observe(s));
})();

/* ---------- Split text into letters ---------- */
function splitLetters(el) {
  const text = el.textContent;
  el.textContent = '';
  [...text].forEach((c, i) => {
    const s = document.createElement('span');
    s.className = 'ch';
    s.style.setProperty('--i', i);
    s.textContent = c === ' ' ? ' ' : c;
    s.setAttribute('aria-hidden', 'true');
    el.appendChild(s);
  });
}
document.querySelectorAll('[data-letters]').forEach(splitLetters);

/* ---------- Hero name: intro + letters lift toward the pointer ---------- */
(function heroName() {
  const name = document.querySelector('.hero-name');
  const hero = document.querySelector('.hero');
  if (!reduceMotion) {
    let offset = 0;
    name.querySelectorAll('.line').forEach(line => {
      line.querySelectorAll('.ch').forEach(ch => ch.style.setProperty('--i', offset++));
    });
    name.classList.add('intro');
    requestAnimationFrame(() => requestAnimationFrame(() => name.classList.add('ready')));
    setTimeout(() => name.classList.remove('intro', 'ready'), 2200);
  }
  if (!motion) return;

  const letters = [...name.querySelectorAll('.ch')];
  let raf = null, px = 0, py = 0;
  const apply = () => {
    raf = null;
    letters.forEach(l => {
      const r = l.getBoundingClientRect();
      const dx = px - (r.left + r.width / 2), dy = py - (r.top + r.height / 2);
      const d = Math.hypot(dx, dy);
      const f = Math.max(0, 1 - d / 260);
      l.style.transform = f ? `translateY(${(-f * 18).toFixed(1)}px) scale(${(1 + f * 0.12).toFixed(3)}) rotate(${(dx / 260 * f * -6).toFixed(2)}deg)` : '';
      l.classList.toggle('lit', f > 0.55);
    });
  };
  hero.addEventListener('pointermove', e => {
    px = e.clientX; py = e.clientY;
    hero.style.setProperty('--mx', `${e.clientX - hero.getBoundingClientRect().left}px`);
    hero.style.setProperty('--my', `${e.clientY - hero.getBoundingClientRect().top}px`);
    if (!raf) raf = requestAnimationFrame(apply);
  });
  hero.addEventListener('pointerleave', () => {
    letters.forEach(l => { l.style.transform = ''; l.classList.remove('lit'); });
  });
})();

/* ---------- Rotating role words ---------- */
(function rotator() {
  const el = document.querySelector('[data-rotate]');
  if (!el || reduceMotion) return;
  const words = JSON.parse(el.dataset.rotate);
  let i = 0;
  setInterval(() => {
    el.classList.add('out');
    setTimeout(() => {
      i = (i + 1) % words.length;
      el.textContent = words[i];
      el.classList.remove('out');
      el.classList.add('in');
      void el.offsetWidth; // restart transition from below
      el.classList.remove('in');
    }, 500);
  }, 2600);
})();

/* ---------- Typing code card ---------- */
(function typer() {
  const code = document.querySelector('[data-typer]');
  if (!code) return;
  const tokens = [
    ['k', 'const'], ['', ' me = {\n  name: '], ['s', '"Mduduzi"'], ['', ',\n  city: '], ['s', '"Cape Town"'],
    ['', ',\n  builds: ['], ['s', '"systems"'], ['', ', '], ['s', '"apps"'], ['', '],\n  learning: '], ['b', 'true'],
    ['', ',\n  openToWork: '], ['b', 'true'], ['', '\n};']
  ];
  let typing = false;
  function type() {
    if (typing) return;
    typing = true;
    code.textContent = '';
    if (reduceMotion) {
      tokens.forEach(([cls, text]) => { const s = document.createElement('span'); s.className = cls; s.textContent = text; code.appendChild(s); });
      typing = false;
      return;
    }
    let t = 0, c = 0, span = null;
    (function step() {
      if (t >= tokens.length) { typing = false; return; }
      const [cls, text] = tokens[t];
      if (!span) { span = document.createElement('span'); span.className = cls; code.appendChild(span); }
      span.textContent += text[c++];
      if (c >= text.length) { t++; c = 0; span = null; }
      setTimeout(step, text[c - 1] === '\n' ? 120 : 24 + Math.random() * 36);
    })();
  }
  setTimeout(type, 900);
  code.closest('.hero-photo').addEventListener('mouseenter', type);
})();

/* ---------- 3D tilt + parallax (photos) ---------- */
if (motion) {
  document.querySelectorAll('[data-tilt]').forEach(el => {
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      el.classList.add('tilting');
      el.style.setProperty('--rx', `${(x * 10).toFixed(2)}deg`);
      el.style.setProperty('--ry', `${(-y * 10).toFixed(2)}deg`);
      el.style.setProperty('--px', `${(x * 16).toFixed(1)}px`);
      el.style.setProperty('--py', `${(y * 16).toFixed(1)}px`);
      el.style.setProperty('--gx', `${((x + 0.5) * 100).toFixed(1)}%`);
      el.style.setProperty('--gy', `${((y + 0.5) * 100).toFixed(1)}%`);
    });
    el.addEventListener('pointerleave', () => {
      el.classList.remove('tilting');
      ['--rx', '--ry', '--px', '--py'].forEach(v => el.style.removeProperty(v));
    });
  });
}

/* ---------- Spotlight cards: glow follows the pointer ---------- */
document.addEventListener('pointermove', e => {
  const card = e.target.closest?.('.spot-card');
  if (!card) return;
  const r = card.getBoundingClientRect();
  card.style.setProperty('--sx', `${e.clientX - r.left}px`);
  card.style.setProperty('--sy', `${e.clientY - r.top}px`);
}, { passive: true });

/* ---------- Magnetic buttons ---------- */
if (motion) {
  document.querySelectorAll('.magnetic').forEach(btn => {
    btn.addEventListener('pointermove', e => {
      const r = btn.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2;
      btn.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
    });
    btn.addEventListener('pointerleave', () => { btn.style.transform = ''; });
  });
}

/* ---------- Custom cursor ---------- */
(function cursor() {
  if (!motion) return;
  const root = document.querySelector('.cursor');
  const dot = root.querySelector('.cursor-dot');
  const ring = root.querySelector('.cursor-ring');
  const label = root.querySelector('.cursor-label');
  document.documentElement.classList.add('has-cursor');
  let x = innerWidth / 2, y = innerHeight / 2, rx = x, ry = y;
  document.addEventListener('pointermove', e => {
    x = e.clientX; y = e.clientY;
    dot.style.transform = `translate(${x}px, ${y}px)`;
    root.classList.remove('is-hidden');
  }, { passive: true });
  document.addEventListener('pointerleave', () => root.classList.add('is-hidden'));
  (function loop() {
    rx += (x - rx) * 0.18; ry += (y - ry) * 0.18;
    ring.style.transform = `translate(${rx}px, ${ry}px)`;
    requestAnimationFrame(loop);
  })();
  document.addEventListener('pointerover', e => {
    const t = e.target.closest('[data-cursor], a, button, .project, input, textarea');
    const text = t?.dataset?.cursor || (t?.classList.contains('project') ? 'View' : '');
    const field = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA');
    root.classList.toggle('is-label', !!text && !field);
    root.classList.toggle('is-hover', !!t && !text && !field);
    root.classList.toggle('is-hidden', field);
    label.textContent = text;
  });
})();

/* ---------- Scroll reveal ---------- */
function observeReveals(scope = document) {
  const els = scope.querySelectorAll('.reveal:not(.in)');
  if (!('IntersectionObserver' in window) || reduceMotion) { els.forEach(el => el.classList.add('in')); return; }
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const siblings = [...e.target.parentElement.children].filter(c => c.classList.contains('reveal'));
      e.target.style.animationDelay = `${Math.min(siblings.indexOf(e.target), 6) * 70}ms`;
      e.target.classList.add('in');
      io.unobserve(e.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  els.forEach(el => io.observe(el));
}

/* ---------- Count-up numbers ---------- */
(function countUp() {
  const els = document.querySelectorAll('[data-count]');
  const run = el => {
    const end = Number(el.dataset.count), suffix = el.dataset.suffix || '';
    if (reduceMotion) { el.textContent = end + suffix; return; }
    const start = performance.now(), dur = 1600;
    const step = now => {
      const p = Math.min(1, (now - start) / dur);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if (!('IntersectionObserver' in window)) { els.forEach(run); return; }
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) { run(e.target); io.unobserve(e.target); }
  }), { threshold: 0.6 });
  els.forEach(el => io.observe(el));
})();

/* ---------- Timeline progress line ---------- */
(function timeline() {
  const tl = document.querySelector('.timeline');
  if (!tl) return;
  const update = () => {
    const r = tl.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (innerHeight * 0.6 - r.top) / r.height));
    tl.style.setProperty('--fill', `${(p * 100).toFixed(1)}%`);
  };
  update();
  window.addEventListener('scroll', update, { passive: true });
})();

/* ---------- Copy email ---------- */
document.querySelectorAll('[data-copy]').forEach(btn => {
  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(btn.dataset.copy);
      toast('Email copied to clipboard ✓');
    } catch {
      window.location.href = `mailto:${btn.dataset.copy}`;
    }
  });
});

/* ---------- Projects ---------- */
const svgText = (x, y, s, fill, size = 16) =>
  `<text x="${x}" y="${y}" fill="${fill}" font-family="JetBrains Mono, monospace" font-size="${size}" letter-spacing="1">${s}</text>`;

// Small animated illustrations; elements with hv-* classes move on hover.
const ART = {
  imbizo: () => {
    const bars = [70, 120, 90, 150, 110, 170, 130].map((h, i) =>
      `<rect class="hv-grow" style="--i:${i}" x="${430 + i * 42}" y="${360 - h}" width="28" height="${h}" rx="4" fill="${i % 2 ? '#b79cff' : '#94e1b4'}"/>`).join('');
    const pins = [[150, 150], [220, 230], [120, 290], [270, 320], [190, 360]].map(([x, y], i) =>
      `<g class="hv-pop" style="--i:${i}"><circle cx="${x}" cy="${y}" r="12" fill="#94e1b4"/><circle cx="${x}" cy="${y}" r="4" fill="#0b1a14"/></g>`).join('');
    return `<rect width="800" height="450" fill="#10201b"/>
      <path d="M80 120 L330 90 L360 200 L320 380 L150 410 L70 300 Z" fill="#183229" stroke="#2d5a49" stroke-width="2"/>
      ${pins}
      <path class="hv-draw" d="M150 150 L220 230 L120 290 L270 320 L190 360" fill="none" stroke="#b79cff" stroke-width="2.5" stroke-dasharray="600"/>
      <rect x="400" y="70" width="330" height="320" rx="18" fill="#0b1513" stroke="#2d5a49"/>
      ${svgText(428, 108, 'ONE PROFILE, MANY UNIS', '#94e1b4', 14)}
      ${bars}`;
  },
  leave: () => {
    const cells = [];
    for (let r = 0; r < 4; r++) for (let c = 0; c < 7; c++) {
      const booked = (r === 1 && c > 0 && c < 5) || (r === 2 && c < 2);
      cells.push(`<rect ${booked ? `class="hv-pop" style="--i:${r * 7 + c}"` : ''} x="${110 + c * 52}" y="${150 + r * 52}" width="42" height="42" rx="8" fill="${booked ? '#94e1b4' : '#1c2a27'}"/>`);
      if (booked) cells.push(`<rect x="${110 + c * 52}" y="${150 + r * 52}" width="42" height="42" rx="8" fill="none" stroke="#2d5a49"/>`);
    }
    return `<rect width="800" height="450" fill="#121a24"/>
      <rect x="80" y="70" width="420" height="330" rx="20" fill="#0c131b" stroke="#24364a"/>
      ${svgText(110, 116, 'LEAVE · OCTOBER', '#b79cff', 15)}
      ${cells.join('')}
      <g class="hv-slide" style="--i:4"><rect x="540" y="120" width="190" height="64" rx="14" fill="#1b2633"/>${svgText(558, 158, 'Z1(a) ✓', '#94e1b4', 16)}</g>
      <g class="hv-slide" style="--i:6"><rect x="540" y="200" width="190" height="64" rx="14" fill="#1b2633"/>${svgText(558, 238, 'APPROVED', '#b79cff', 16)}</g>
      <g class="hv-slide" style="--i:8"><rect x="540" y="280" width="190" height="64" rx="14" fill="#1b2633"/>${svgText(558, 318, '21 DAYS LEFT', '#f2f5f3', 14)}</g>`;
  },
  lease: () => {
    const wins = [];
    for (let r = 0; r < 5; r++) for (let c = 0; c < 3; c++)
      wins.push(`<rect class="hv-pop" style="--i:${(r * 3 + c) % 8}" x="${118 + c * 54}" y="${150 + r * 44}" width="34" height="26" rx="4" fill="#f5c451"/><rect x="${118 + c * 54}" y="${150 + r * 44}" width="34" height="26" rx="4" fill="none" stroke="#3a3420"/>`);
    const rows = [0, 1, 2, 3].map(i => `<rect x="440" y="${150 + i * 54}" width="140" height="12" rx="6" fill="#2e2a20"/>
      <rect class="hv-grow" style="--i:${i}" x="620" y="${140 + i * 54}" width="80" height="28" rx="14" fill="${i === 2 ? '#b79cff' : '#94e1b4'}"/>`).join('');
    return `<rect width="800" height="450" fill="#1c1912"/>
      <rect x="95" y="120" width="210" height="300" fill="#2a251a"/>
      ${wins.join('')}
      <rect x="400" y="80" width="330" height="320" rx="18" fill="#141209" stroke="#3a3420"/>
      ${svgText(430, 118, 'LEASE REGISTER', '#f5c451', 14)}
      ${rows}`;
  },
  flow: () => {
    const nodes = [['ENQUIRY', 90], ['LOG', 290], ['ROUTE', 490]].map(([t, x], i) =>
      `<g class="hv-up" style="transition-delay:${i * 90}ms"><rect x="${x}" y="185" width="160" height="80" rx="18" fill="${i === 1 ? '#94e1b4' : '#1e1a2e'}" stroke="#4a3f7a"/>${svgText(x + 26, 232, t, i === 1 ? '#0b1a14' : '#f2f5f3', 16)}</g>`).join('');
    return `<rect width="800" height="450" fill="#15121f"/>
      <path class="hv-draw" d="M250 225 H290 M450 225 H490" stroke="#b79cff" stroke-width="3" fill="none"/>
      ${nodes}
      <g class="hv-pop" style="--i:5"><circle cx="690" cy="225" r="34" fill="#b79cff"/><path d="M675 226 l10 10 l20 -22" stroke="#15121f" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>
      ${svgText(90, 330, 'HOD ENQUIRIES · TRACKED', '#8a7fb8', 14)}`;
  },
  sharepoint: () => {
    const tiles = [0, 1, 2, 3, 4, 5].map(i => {
      const x = 120 + (i % 3) * 190, y = 110 + Math.floor(i / 3) * 130;
      return `<g class="hv-pop" style="--i:${i}"><rect x="${x}" y="${y}" width="160" height="100" rx="16" fill="${i === 0 ? '#94e1b4' : '#132126'}" stroke="#244148"/>
        <rect x="${x + 20}" y="${y + 24}" width="${70 + (i * 13) % 50}" height="10" rx="5" fill="${i === 0 ? '#0b1a14' : '#2c4a52'}"/>
        <rect x="${x + 20}" y="${y + 46}" width="50" height="8" rx="4" fill="${i === 0 ? '#0b1a14' : '#24393f'}"/></g>`;
    }).join('');
    return `<rect width="800" height="450" fill="#0d181b"/>${tiles}
      <g class="hv-spin"><circle cx="700" cy="390" r="22" fill="none" stroke="#b79cff" stroke-width="5" stroke-dasharray="10 7"/></g>`;
  },
  novela: () => `<rect width="800" height="450" fill="#000"/>
      <text x="400" y="250" text-anchor="middle" font-family="Bricolage Grotesque, Impact, sans-serif" font-weight="800" font-size="150" fill="#fff" letter-spacing="-4">NOVELA</text>
      <g class="hv-slide"><rect x="270" y="300" width="260" height="46" rx="23" fill="#fc74dd"/>${svgText(318, 329, "LET'S TALK →", '#1d1a1a', 16)}</g>
      <g class="hv-pop"><circle cx="660" cy="110" r="26" fill="#ff4c33"/></g>
      ${svgText(120, 110, 'CPT · WEB · SYSTEMS · DATA', '#888', 13)}`
};

const PROJECTS = [
  {
    title: 'ImbizoConnect', cat: 'web', art: 'imbizo', where: 'Concept · independent build', year: '2026', wide: true,
    desc: 'A concept platform I designed and built: students create one profile and apply to several South African universities from one place, with an APS calculator, fee summary and a mock admissions portal. Fully working demo with made-up students.',
    tags: ['JavaScript', 'Supabase', 'PostgreSQL RLS', 'Tests'],
    links: [['Live demo', 'https://mduduzigwija.github.io/ImbizoConnect/demo/']]
  },
  {
    title: 'Leave Management / HR App', cat: 'web', art: 'leave', where: 'Independent build', year: '2026',
    desc: 'Leave and HR records for South African workplaces: the public service Z1(a) process or paperless BCEA leave. Fills in the real Word forms, applies SA leave rules and public holidays, and enforces permissions in the database.',
    tags: ['JavaScript', 'Supabase', 'docxtemplater', 'Playwright'],
    links: [['Live demo', 'https://mduduzigwija.github.io/Leave-Management-App/demo/']]
  },
  {
    title: 'Lease Register', cat: 'workplace', art: 'lease', where: 'Built at work', year: 'Public sector',
    desc: 'An internal app for a property management team, letting property officers track the status of leases held for the departments they serve. Replaced scattered spreadsheets with one register.',
    tags: ['Power Apps', 'Power Automate', 'Microsoft Lists'],
    note: 'Internal tool, not public'
  },
  {
    title: 'HOD Enquiry Tracker', cat: 'workplace', art: 'flow', where: 'Built at work', year: 'Public sector',
    desc: 'A Power Automate flow that logs and tracks enquiries to the Head of Department, improving traceability and cutting out manual errors.',
    tags: ['Power Automate', 'SharePoint'],
    note: 'Internal tool, not public'
  },
  {
    title: 'SharePoint Systems', cat: 'workplace', art: 'sharepoint', where: 'Ongoing at work', year: 'Now',
    desc: 'Designing and developing SharePoint sites for my organisation: restructuring libraries, capturing metadata and setting up lists so teams can find and share information easily.',
    tags: ['SharePoint', 'Metadata', 'Microsoft Lists'],
    note: 'Internal, ongoing'
  },
  {
    title: 'Novela Solutions Africa', cat: 'web', art: 'novela', where: 'My studio', year: '2026', wide: true,
    desc: 'The website for my independent studio: a stretching wordmark, animated showreel, filterable case studies and a 4-step project brief form. Hand-coded, no framework.',
    tags: ['HTML', 'CSS', 'JavaScript', 'Formspree'],
    links: [['Visit site', 'https://mduduzigwija.github.io/novela-solutions/']]
  }
];

const liveObserver = !finePointer && 'IntersectionObserver' in window
  ? new IntersectionObserver(entries => entries.forEach(e => e.target.classList.toggle('live', e.isIntersecting)), { threshold: 0.45 })
  : null;

(function projects() {
  const grid = document.querySelector('[data-projects]');
  const card = p => `<article class="project spot-card reveal${p.wide ? ' wide' : ''}">
      <div class="p-art" aria-hidden="true"><svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice">${ART[p.art]()}</svg></div>
      <div class="p-body">
        <p class="p-meta mono"><b>${p.where}</b><span>${p.year}</span></p>
        <h3>${p.title}</h3>
        <p>${p.desc}</p>
        <ul class="tags">${p.tags.map(t => `<li>${t}</li>`).join('')}</ul>
        <div class="p-links">${(p.links || []).map(([t, href]) => `<a class="p-link" href="${href}" target="_blank" rel="noopener" data-cursor="Open">${t} <i class="bx bx-up-right-arrow-alt"></i></a>`).join('')}${p.note ? `<span class="p-note mono"><i class="bx bx-lock-alt"></i>${p.note}</span>` : ''}</div>
      </div>
    </article>`;

  function render(filter) {
    const list = filter === 'all' ? PROJECTS : PROJECTS.filter(p => p.cat === filter);
    // In filtered views, only keep a wide card when it doesn't leave a gap.
    grid.innerHTML = list.map(p => card(filter === 'all' ? p : { ...p, wide: false })).join('');
    observeReveals(grid);
    if (liveObserver) grid.querySelectorAll('.project').forEach(el => liveObserver.observe(el));
  }

  document.querySelectorAll('[data-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.getAttribute('aria-pressed') === 'true') return;
      document.querySelectorAll('[data-filter]').forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
      grid.querySelectorAll('.project').forEach(p => p.classList.add('leaving'));
      setTimeout(() => render(btn.dataset.filter), reduceMotion ? 0 : 220);
    });
  });
  render('all');
})();

observeReveals();

/* ---------- Contact form (Formspree, no page reload) ---------- */
(function form() {
  const f = document.getElementById('contact-form');
  const status = f.querySelector('.form-status');
  const btn = f.querySelector('button[type="submit"]');
  f.addEventListener('submit', async e => {
    e.preventDefault();
    if (!f.reportValidity()) return;
    btn.disabled = true;
    status.className = 'form-status mono';
    status.textContent = 'Sending…';
    try {
      const data = new FormData(f);
      data.append('_replyto', data.get('email'));
      const res = await fetch(FORM_ENDPOINT, { method: 'POST', body: data, headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error(res.status);
      f.reset();
      status.classList.add('ok');
      status.textContent = 'Thanks! Your message is on its way. I reply within 24 hours.';
      toast('Message sent ✓');
    } catch {
      status.classList.add('err');
      status.innerHTML = `Something went wrong. Please email me directly at <a href="mailto:${EMAIL}" class="inline-link">${EMAIL}</a>.`;
    } finally {
      btn.disabled = false;
    }
  });
})();
