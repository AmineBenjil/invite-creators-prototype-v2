// Saved copy of the invite summary pop-up with the list panel (Figma 15367:8086), commit fa920d4.
// Restore by pasting these over the same-named blocks in app.js.
const FACES = 4;

// Each mark is a 24px disc with its glyph, straight from Figma 15367:8086
const ICONS = {
  prio: '<img src="assets/sum-prio-24.svg" alt="" width="24" height="24">',
  rest: '<img src="assets/sum-rest-24.svg" alt="" width="24" height="24">',
  nofit: '<img src="assets/sum-nofit-24.svg" alt="" width="24" height="24">',
};

const rowHtml2 = (kind, title, sub, people, r) => `
  <li class="sum-row ${kind}" style="--r:${r}" title="${esc(people.map(c => c.name).join(', '))}">
    <span class="sum-mark">${ICONS[kind]}</span>
    <span class="sum-text"><span class="sum-row-title">${title}</span><span class="sum-row-sub">${sub}</span></span>
    <span class="sum-faces">
      <span class="sum-stack">${people.slice(0, FACES).map(c => `<img src="assets/${c.avatar}.jpg" alt="">`).join('')}</span>
      ${people.length > FACES ? `<span class="sum-more">+${people.length - FACES}</span>` : ''}
    </span>
  </li>`;

// "We'll invite **73 creators** to this campaign, including **16 previously approved** and **57 new**.
//  **2 prioritized creators** get the first chance to accept."
// When everyone left is in one group, name it instead: "We'll invite **56 new creators** to this campaign."
// The prioritized sentence only shows once they've prioritized someone.
function inviteLine(d) {
  const kept = [...d.prio, ...d.rest];
  const prev = kept.filter(c => c.source === 'approved').length;
  const fresh = kept.length - prev;
  const who = n => plural(n, 'creator', 'creators');
  const line = !prev || !fresh
    ? `We'll invite <b>${kept.length} ${prev ? 'previously approved' : 'new'} ${who(kept.length).replace(/^\d+ /, '')}</b> to this campaign.`
    : `We'll invite <b>${who(kept.length)}</b> to this campaign, including <b>${prev} previously approved</b> and <b>${fresh} new</b>.`;
  const p = d.prio.length;
  return p ? `${line} <b>${plural(p, 'prioritized creator', 'prioritized creators')}</b> ${p === 1 ? 'gets' : 'get'} the first chance to accept.` : line;
}

function summaryHtml(d, error) {
  const n = d.prio.length + d.rest.length;
  const parts = [d.prev && `${d.prev} you've worked with`, d.fresh && `${d.fresh} new`].filter(Boolean);
  const rows = [];
  if (d.prio.length) rows.push(['prio', `Prioritize (${d.prio.length})`, 'Invited first', d.prio]);
  if (d.rest.length) rows.push(d.prio.length
    ? ['rest', `Everyone else (${d.rest.length})`, `Invited right after, ${parts.join(', ')}.`, d.rest]
    : ['rest', `Your matches (${d.rest.length})`, `${parts.join(', ')}.`.replace(/^./, ch => ch.toUpperCase()), d.rest]);
  if (d.nofit.length) rows.push(['nofit', `Not a fit (${d.nofit.length})`, "Won't get an invite", d.nofit]);
  return `
  <div class="sum-view">
    <div class="sum-top">
      <div class="sum-head">
        <span class="sum-icon" aria-hidden="true"><img src="assets/confirm-send-48.png" alt="" width="40" height="40"></span>
        <div class="sum-copy">
          <h2 class="sum-title" id="sumTitle">${n ? 'Good to go?' : 'Nobody to invite yet'}</h2>
          <p class="sum-sub">${n ? inviteLine(d) : 'You marked everyone as Not a fit. Go back and keep at least one creator.'}</p>
        </div>
      </div>
      <ul class="sum-rows">${rows.map((row, i) => rowHtml2(...row, i)).join('')}</ul>
    </div>
    ${error ? `<p class="sum-error" role="alert">${error}</p>` : ''}
    <div class="sum-foot">
      <button class="sum-back" data-sum="back">Go back</button>
      <button class="sum-send" data-sum="send"${n ? '' : ' disabled'}>${n ? `Send ${invites(n)}` : 'Send invites'}</button>
    </div>
  </div>`;
}

