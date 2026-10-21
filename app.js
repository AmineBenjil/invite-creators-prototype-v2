const api = mockApi;
const $ = id => document.getElementById(id);
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

const first = name => name.split(' ')[0];
const STACK = 4;   // avatars shown before the "+N" bubble

// ---------- Creator card + its Not a Fit row ----------
const cardHtml = c => `
  <div class="c-main">
    <div class="c-top">
      <div class="c-who">
        <div class="c-av"><span><img src="assets/${c.avatar}.jpg" alt=""></span></div>
        <div class="c-id">
          <div class="c-line">
            <span class="c-name">${c.name}<img src="assets/card-verified-16.svg" alt="" width="16" height="16"></span>
            <span class="c-handle">${c.handle}</span>
            ${c.source === 'new' ? '<span class="c-new">New</span>' : ''}
          </div>
          <p class="c-bio">${c.bio}</p>
        </div>
      </div>
      <div class="c-social">
        <img src="assets/card-instagram-24.svg" alt="Instagram" width="24" height="24">
        <img src="assets/card-tiktok-24.svg" alt="TikTok" width="24" height="24">
      </div>
    </div>
    ${c.source === 'approved' ? `<div class="c-history"><span class="c-tag">Previously approved</span><p>${c.history}</p></div>` : ''}
    <div class="c-fit">
      <p class="c-fit-head"><img src="assets/card-sparkle-16.svg" alt="" width="16" height="16">Why they fit</p>
      <ul>${c.fits.map(f => `<li><img src="assets/card-bullet-16.svg" alt="" width="16" height="16">${f}</li>`).join('')}</ul>
    </div>
    <div class="c-stats">
      <div class="c-col" style="width:240px">
        <p class="c-label">Social Stats</p>
        <div class="c-box" style="width:240px">
          <div class="c-stat" style="left:15.5px"><small>Followers</small><b>${c.followers}</b></div>
          <div class="c-stat" style="left:124.33px">
            <small>Engagement <img src="assets/card-info-12.svg" alt="" width="12" height="12"></small>
            <b><span class="c-ig12"><img src="assets/card-instagram-12.svg" alt="" width="13" height="13"></span>${c.engagement}</b>
          </div>
        </div>
      </div>
      <div class="c-col c-aud">
        <p class="c-label">Audience</p>
        <div class="c-box">
          <div class="c-stat" style="left:19.5px"><small>Location</small><b>${c.location}</b></div>
          <div class="c-stat mid c-age"><small>Age Range</small><b>${c.age}</b></div>
          <div class="c-stat mid c-gender"><small>Gender</small><b>${c.gender}</b></div>
        </div>
      </div>
    </div>
    <div class="c-recent">
      <p class="c-label">Recent content</p>
      <div class="c-thumbs">${c.content.map(img => `<span><img src="assets/${img}.jpg" alt=""></span>`).join('')}</div>
    </div>
  </div>
  <div class="c-foot">
    <button class="c-btn" data-act="notfit">Not a Fit</button>
    <button class="c-btn${c.priority ? ' prio-on' : ''}" data-act="prio" aria-pressed="${c.priority}">
      <img class="off" src="assets/prioritize-16.svg" alt="" width="16" height="16">
      <img class="on" src="assets/prioritize-16-purple.svg" alt="" width="16" height="16">
      Prioritize
      <span class="tip" role="tooltip">Prioritized creators get their invite first.</span>
    </button>
  </div>`;

const rowHtml = c => `
  <div class="r-who">
    <div class="r-av"><span><img src="assets/${c.avatar}.jpg" alt=""></span></div>
    <p class="r-text"><span class="r-name">${c.name}</span><span class="r-tag">Not a Fit</span></p>
  </div>
  <button class="r-undo" data-act="undo">Undo</button>`;

const itemHtml = (c, i) => `<div class="nc ${c.notFit ? 'row' : 'card'}${c.source === 'approved' ? ' ap' : ''}" data-id="${c.id}" style="--i:${Math.min(i, REVEAL_CAP)}">${c.notFit ? rowHtml(c) : cardHtml(c)}</div>`;

// Swap a card and its row in place: the slot animates its height, nothing around it jumps
function setItem(el, c) {
  const from = el.offsetHeight;
  clearTimeout(el._t);
  el.style.height = '';
  el.classList.remove('anim');
  el.innerHTML = c.notFit ? rowHtml(c) : cardHtml(c);
  el.classList.toggle('row', c.notFit);
  el.classList.toggle('card', !c.notFit);
  if (reduceMotion) return;
  const to = el.offsetHeight;
  el.style.height = from + 'px';
  el.querySelectorAll(':scope > *').forEach(n => n.classList.add('nc-in'));
  void el.offsetHeight;   // commit the start height before animating
  el.classList.add('anim');
  el.style.height = to + 'px';
  const done = () => { clearTimeout(el._t); el.style.height = ''; el.classList.remove('anim'); };
  el._t = setTimeout(done, 400);   // fallback if transitionend never fires
  el.ontransitionend = e => { if (e.propertyName === 'height') done(); };
}

// ---------- Opening animations ----------
const LOAD_MS = 500;      // first open: skeletons stand in this long
const REVEAL_CAP = 5;     // cards past this one share the last delay (they're below the fold anyway)
const REVEAL_MS = 1400;   // long enough for the last card's parts to settle

const b = (w, h, r = 6, extra = '') => `<b class="sk-b" style="width:${w};height:${h}px;border-radius:${r}px;${extra}"></b>`;
const skeletonHtml = approved => `
  <div class="nc card sk${approved ? ' ap' : ''}" aria-hidden="true">
    <div class="c-main">
      <div class="sk-row">
        ${b('40px', 40, 100)}
        <div class="sk-col">${b('180px', 14)}${b(approved ? '320px' : '260px', 10)}${approved ? '' : b('200px', 10)}</div>
        <div class="sk-row" style="margin-left:auto; gap:8px">${b('24px', 24, 100)}${b('24px', 24, 100)}</div>
      </div>
      ${approved ? `<div class="sk-row">${b('141px', 25, 100)}${b('300px', 10)}</div>` : ''}
      <div class="sk-col" style="gap:${approved ? 12 : 10}px">${b('90px', 12)}${b('440px', 10)}${b('410px', 10)}${b('380px', 10)}</div>
      <div class="sk-row" style="gap:${approved ? 20 : 16}px">${b('240px', 52, 12)}${b('auto', 52, 12, 'flex:1')}</div>
      <div class="sk-col" style="gap:12px">${b('90px', 12)}
        <div class="sk-row" style="gap:12px">${Array.from({ length: 7 }, () => b('auto', approved ? 108 : 86, 8, 'flex:1')).join('')}</div>
      </div>
    </div>
    <div class="c-foot"><span class="sk-row" style="gap:32px; padding-right:16px">${b('64px', 14)}${b('84px', 14)}</span></div>
  </div>`;

// Replays the staggered entrance: cards rise one after another, then each card's parts settle in order
function reveal(panel) {
  clearTimeout(panel._reveal);
  panel.classList.remove('reveal');
  void panel.offsetWidth;   // restart the animations
  panel.classList.add('reveal');
  panel._reveal = setTimeout(() => panel.classList.remove('reveal'), REVEAL_MS);
}

function openGroup(group, open) {
  const panel = group.querySelector('.g-panel');
  group.classList.toggle('open', open);
  group.querySelector('.g-bar').setAttribute('aria-expanded', open);
  clearTimeout(panel._load);
  if (!open) { panel.classList.remove('loading', 'reveal'); return; }
  if (group.dataset.loaded || reduceMotion) { group.dataset.loaded = 1; reveal(panel); return; }
  // First open: show skeletons briefly, as if the profiles were loading
  panel.classList.add('loading');
  panel._load = setTimeout(() => {
    group.dataset.loaded = 1;
    panel.classList.remove('loading');
    reveal(panel);
  }, LOAD_MS);
}

// ---------- Groups ----------
const groupHtml = g => {
  const n = g.creators.length;
  const shown = g.creators.slice(0, STACK);
  return `
  <section class="group" data-id="${g.id}">
    <div class="g-head">
      <div class="g-text">
        <p class="g-title">${g.title} <span class="dot">· </span><span class="num">${n}</span></p>
        <p class="g-sub">${g.sub}</p>
      </div>
      <button class="g-hide">${g.hide}<img src="assets/chevron-up-12.svg" alt="" width="12" height="12"></button>
    </div>
    <div class="g-box">
      <button class="g-bar" aria-expanded="false">
        <span class="g-summary">
          <span class="g-stack">
            ${shown.map(c => `<span class="g-av"><img src="assets/${c.avatar}.jpg" alt=""></span>`).join('')}
            ${n > STACK ? `<span class="g-more"><span>+${n - STACK}</span></span>` : ''}
          </span>
          <span class="g-names"><b>${first(g.creators[0].name)}, ${first(g.creators[1].name)} </b>and ${n - 2} others</span>
        </span>
        <span class="g-chev">
          <img class="down" src="assets/chevron-down-16.svg" alt="" width="16" height="16">
          <img class="up" src="assets/chevron-up-16.svg" alt="" width="16" height="16">
        </span>
      </button>
      <div class="g-panel">${[0, 1, 2].map(() => skeletonHtml(g.id === 'approved')).join('')}${g.creators.map(itemHtml).join('')}</div>
    </div>
  </section>`;
};

const renderCount = () => document.querySelectorAll('.js-approve').forEach(el => { el.textContent = api.approvedCount(); });

// V1 and V2 render the same groups; each popup keeps its own open/loaded state
const groups = api.groups().map(g => ({ ...g, hide: g.id === 'approved' ? 'Hide previously approved' : 'Hide new creators' }));
document.querySelectorAll('.modal:not(.v3) .groups').forEach(el => { el.innerHTML = groups.map(groupHtml).join(''); });
document.querySelectorAll('.js-total').forEach(el => { el.textContent = groups.reduce((n, g) => n + g.creators.length, 0); });
renderCount();

document.querySelectorAll('.groups').forEach(list => list.addEventListener('click', e => {
  const toggle = e.target.closest('.g-bar, .g-hide');
  if (toggle) {
    const group = toggle.closest('.group');
    openGroup(group, !group.classList.contains('open'));
    return;
  }
  const btn = e.target.closest('[data-act]');
  const item = btn && btn.closest('.nc');
  if (!item) return;
  const id = item.dataset.id;
  const act = btn.dataset.act;
  // A creator's state is shared, so every version shows the same choice
  const copies = document.querySelectorAll(`.nc[data-id="${id}"]`);
  if (act === 'prio') {
    const on = !btn.classList.contains('prio-on');
    api.setPriority(id, on);
    copies.forEach(el => {
      const b = el.querySelector('[data-act=prio]');
      if (!b) return;
      b.classList.toggle('prio-on', on);
      b.setAttribute('aria-pressed', on);
    });
  } else {
    api.setNotFit(id, act === 'notfit');
    copies.forEach(el => setItem(el, api.get(id)));
    renderCount();
    decks.forEach(d => d.sync());
  }
}));

// White background + stroke only once a heading is actually pinned to the top
document.querySelectorAll('.modal').forEach(modal => {
  const body = modal.querySelector('.m-body');
  if (!body) return;
  const markStuck = () => {
    const top = body.getBoundingClientRect().top;
    modal.querySelectorAll('.group').forEach(g => {
      const head = g.querySelector('.g-head');
      const stuck = g.classList.contains('open') && body.scrollTop > 0 && Math.abs(head.getBoundingClientRect().top - top) < 1;
      head.classList.toggle('stuck', stuck);
    });
  };
  body.addEventListener('scroll', markStuck, { passive: true });
  body.addEventListener('click', () => setTimeout(markStuck));
});

// ---------- V3: deck expand ----------
// Each group is a deck: the bar is the top card, the creator cards sit tucked under it and spread out on open.
// The bar's avatar pile slides out to the left as the label rolls in; each card keeps its own avatar.
const EASE = 'cubic-bezier(.32, .72, 0, 1)';
const deckHtml = g => {
  const n = g.creators.length;
  return `
  <section class="group" data-id="${g.id}">
    <div class="g-head">
      <div class="g-text">
        <p class="g-title">${g.title} <span class="dot">· </span><span class="num">${n}</span></p>
        <p class="g-sub">${g.sub}</p>
      </div>
      <button class="g-collapse" tabindex="-1">Collapse<img src="assets/chevron-up-16.svg" alt="" width="16" height="16"></button>
    </div>
    <div class="deck">
      <button class="known" aria-expanded="false">
        <span class="g-summary">
          <span class="g-stack kn-stack">
            ${g.creators.slice(0, STACK).map(c => `<span class="g-av"><img src="assets/${c.avatar}.jpg" alt=""></span>`).join('')}
            <span class="g-more"><span></span></span>
          </span>
          <span class="kn-text"><span class="l l-closed"></span><span class="l l-open"></span></span>
        </span>
        <span class="g-chev"><img src="assets/chevron-down-16.svg" alt="" width="16" height="16"></span>
      </button>
      <div class="clip"><div class="list">${g.creators.map(itemHtml).join('')}</div></div>
    </div>
  </section>`;
};

const v3 = $('modal-v3');
const v3Body = v3.querySelector('.m-body');
v3.querySelector('.groups').innerHTML = groups.map(deckHtml).join('');

function makeDeck(sec, g) {
  const deck = sec.querySelector('.deck'), bar = deck.querySelector('.known');
  const clip = deck.querySelector('.clip'), list = deck.querySelector('.list');
  const head = sec.querySelector('.g-head'), collapseBtn = sec.querySelector('.g-collapse');
  const D = { open: false, busy: false };
  const items = () => [...list.children];
  // The clip's top edge sits INSET px below the bar's top: still hidden behind the bar, but it can't
  // bleed through the bar's half-pixel edge. Every measure below is from the clip's top.
  const INSET = 2;
  const barH = () => bar.offsetHeight - INSET;
  const closedH = () => barH() + 16;   // +16 leaves room for the two peeking card edges
  // Extra clip room so card shadows (0 4px 24px) aren't sliced off; a matching negative margin keeps layout unchanged
  const SHADOW = 28;
  const clipClosed = () => closedH() + SHADOW;

  function labels() {
    const left = g.creators.filter(c => !api.get(c.id).notFit);
    const named = left.slice(0, 2).map(c => first(c.name));
    const rest = left.length - named.length;
    bar.querySelector('.l-closed').innerHTML = `<b>${named.join(', ')} </b>${rest > 0 ? `and ${rest} others` : ''}`;
    bar.querySelector('.l-open').innerHTML = `<b>Showing all ${left.length}</b> · Collapse`;
    bar.querySelector('.g-more span').textContent = '+' + Math.max(0, left.length - STACK);
    sec.querySelector('.num').textContent = left.length;
  }

  // The clip is pulled up behind the bar; the list is pushed down by the same amount plus the card gap
  function layout() {
    clip.style.marginTop = -barH() + 'px';
    clip.style.marginBottom = -SHADOW + 'px';
    list.style.paddingTop = barH() + 16 + 'px';
    list.style.paddingBottom = 12 + SHADOW + 'px';
  }

  // Closed rest pose: bottom-aligned just under the bar, the first two peeking out as stack edges
  function pose(el, i) {
    const edge = i === 0 ? 8 : 15, sc = i === 0 ? .965 : .93;
    return { transform: `translateY(${barH() + edge - (el.offsetTop + el.offsetHeight)}px) scale(${sc})`, opacity: i < 2 ? 1 : 0 };
  }

  function restClosed() {
    layout();
    clip.style.height = clipClosed() + 'px';
    const all = items(), n = all.length;
    all.forEach((el, i) => {
      el.style.zIndex = n - i;
      if (i < 2) { const p = pose(el, i); el.style.transform = p.transform; el.style.opacity = p.opacity; }
      else { el.style.transform = ''; el.style.opacity = 0; }
    });
  }
  function restOpen() {
    layout();
    clip.style.height = 'auto';
    items().forEach((el, i, all) => { el.style.zIndex = all.length - i; el.style.transform = ''; el.style.opacity = ''; });
  }

  function checkBar() {
    const off = D.open && bar.getBoundingClientRect().bottom < head.getBoundingClientRect().bottom + 4;
    sec.classList.toggle('bar-off', off);
  }
  function setOpenClasses(o) {
    D.open = o;
    deck.classList.toggle('is-open', o);
    sec.classList.toggle('open', o);
    bar.setAttribute('aria-expanded', String(o));
    collapseBtn.tabIndex = o ? 0 : -1;
    checkBar();
  }
  v3Body.addEventListener('scroll', checkBar, { passive: true });

  async function open() {
    if (D.busy || D.open) return;
    D.busy = true;
    if (reduceMotion) {
      setOpenClasses(true); restOpen();
      await clip.animate([{ opacity: 0 }, { opacity: 1 }], 160).finished;
      D.busy = false; return;
    }
    const dur = 560, stag = 42;
    deck.style.setProperty('--d', dur + 'ms');
    const all = items();
    const from = all.map((el, i) => pose(el, i));
    const fullH = list.offsetHeight;
    // Only animate what can be seen; cards further down just sit in layout
    const visible = v3Body.getBoundingClientRect().bottom - clip.getBoundingClientRect().top + 40;
    const target = Math.min(fullH, Math.max(visible, clipClosed()));
    const moving = all.filter(el => el.offsetTop < target);
    all.forEach(el => { el.style.transform = ''; el.style.opacity = ''; });
    setOpenClasses(true);
    clip.style.height = target + 'px';
    const anims = [clip.animate([{ height: clipClosed() + 'px' }, { height: target + 'px' }],
      { duration: Math.min(dur + stag * (moving.length - 1), dur * 1.25), easing: EASE })];
    moving.forEach((el, i) => anims.push(el.animate([
      { transform: from[i].transform, opacity: from[i].opacity },
      { opacity: 1, offset: .3 },
      { transform: 'none', opacity: 1 }
    ], { duration: dur, delay: i * stag, easing: EASE, fill: 'backwards' })));
    await Promise.all(anims.map(a => a.finished));
    anims.forEach(a => a.cancel());
    restOpen();
    D.busy = false;
    checkBar();
  }

  async function close() {
    if (D.busy || !D.open) return;
    D.busy = true;
    if (reduceMotion) { setOpenClasses(false); restClosed(); D.busy = false; return; }
    // Bring the bar back into view first, so the cards have somewhere to go
    const br0 = bar.getBoundingClientRect(), bb = v3Body.getBoundingClientRect();
    const headH = head.offsetHeight;
    if (br0.top < bb.top + headH - 20 || br0.top > bb.bottom - 120) {
      const top = v3Body.scrollTop + br0.top - bb.top - headH - 8;
      await new Promise(res => {
        let done = false;
        const fin = () => { if (!done) { done = true; res(); } };
        v3Body.addEventListener('scrollend', fin, { once: true });
        setTimeout(fin, 700);
        v3Body.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
      });
    }
    const dur = 460, stag = 30;
    deck.style.setProperty('--d', dur + 'ms');
    const all = items();
    const cur = Math.min(list.offsetHeight, Math.max(clipClosed(), v3Body.getBoundingClientRect().bottom - clip.getBoundingClientRect().top + 40));
    const moving = all.filter(el => el.offsetTop < cur);
    const to = moving.map((el, i) => pose(el, i));
    const k = moving.length;
    clip.style.height = cur + 'px';
    setOpenClasses(false);
    const anims = [clip.animate([{ height: cur + 'px' }, { height: clipClosed() + 'px' }],
      { duration: dur + stag * Math.min(k - 1, 4), easing: EASE, fill: 'forwards' })];
    moving.forEach((el, i) => anims.push(el.animate([   // lowest card goes first
      { transform: 'none', opacity: 1 },
      { opacity: 1, offset: .75 },
      { transform: to[i].transform, opacity: to[i].opacity }
    ], { duration: dur, delay: (k - 1 - i) * stag, easing: EASE, fill: 'forwards' })));
    await Promise.all(anims.map(a => a.finished));
    anims.forEach(a => a.cancel());
    restClosed();
    D.busy = false;
  }

  bar.addEventListener('click', () => (D.open ? close() : open()));
  collapseBtn.addEventListener('click', close);

  labels();
  restClosed();
  let syncT;
  return {
    relayout() { if (!D.busy) (D.open ? restOpen() : restClosed()); },
    // A creator changed (here or in another version): refresh the labels, then re-pose once the row/card swap settles
    sync() { labels(); clearTimeout(syncT); syncT = setTimeout(() => this.relayout(), 450); },
  };
}

const decks = [...v3.querySelectorAll('.group')].map((sec, i) => makeDeck(sec, groups[i]));
let relayoutT;
new ResizeObserver(() => { clearTimeout(relayoutT); relayoutT = setTimeout(() => decks.forEach(d => d.relayout()), 80); }).observe(v3Body);
document.fonts && document.fonts.ready.then(() => decks.forEach(d => d.relayout()));

// ---------- Modal open / close (shows the selected version's popup) ----------
const overlay = $('overlay');
const modals = { v1: $('modal-v1'), v2: $('modal-v2'), v3: $('modal-v3') };
let version = 'v2';
let isOpen = true;
const setOpen = open => {
  isOpen = open;
  overlay.classList.toggle('hidden', !open);
  Object.entries(modals).forEach(([v, m]) => { m.hidden = !(open && v === version); });
};
document.querySelectorAll('.m-close').forEach(b => b.addEventListener('click', () => setOpen(false)));
overlay.addEventListener('click', () => setOpen(false));
$('openModal').addEventListener('click', () => setOpen(true));
document.querySelectorAll('.approve-btn').forEach(b => b.addEventListener('click', () => setOpen(false)));
document.addEventListener('keydown', e => { if (e.key === 'Escape') setOpen(false); });

// ---------- Prototype version switch (V1 / V2 / V3), remembered per browser ----------
try { version = localStorage.getItem('invite-version') || 'v2'; } catch {}
const hashVersion = location.hash.match(/v[123]/);   // #v1 / #v2 / #v3 pick a version
if (hashVersion) version = hashVersion[0];
function setVersion(v) {
  version = v;
  try { localStorage.setItem('invite-version', v); } catch {}
  document.querySelector('.ver').dataset.on = v;
  document.querySelectorAll('.ver-opt').forEach(b => b.setAttribute('aria-checked', b.dataset.ver === v));
  setOpen(isOpen);
}
document.querySelectorAll('.ver-opt').forEach(b => b.addEventListener('click', () => setVersion(b.dataset.ver)));
setVersion(version);
if (location.hash) history.replaceState(null, '', location.pathname + location.search);
