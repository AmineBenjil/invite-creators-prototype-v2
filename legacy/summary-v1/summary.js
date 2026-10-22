// Saved copy of the original invite summary pop-up markup (before Figma 15367:8086).
// FACES was 5. Restore by pasting these over the same-named blocks in app.js.
const FACES = 5;

const ICONS = {
  prio: '<img src="assets/prioritize-16-purple.svg" alt="" width="16" height="16">',
  rest: '<img src="assets/card-bullet-16.svg" alt="" width="16" height="16">',
  nofit: '<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3.5 7h7"/></svg>',
};

const rowHtml2 = (kind, title, sub, people, r) => `
  <li class="sum-row ${kind}" style="--r:${r}" title="${esc(people.map(c => c.name).join(', '))}">
    <span class="sum-mark ${kind}">${ICONS[kind]}</span>
    <span class="sum-text"><span class="sum-row-title">${title}</span><span class="sum-row-sub">${sub}</span></span>
    <span class="sum-faces">
      <span class="sum-stack">${people.slice(0, FACES).map(c => `<img src="assets/${c.avatar}.jpg" alt="">`).join('')}</span>
      ${people.length > FACES ? `<span class="sum-more">+${people.length - FACES}</span>` : ''}
    </span>
  </li>`;

// "We'll invite 75 creators to this campaign, including 18 previously approved and 57 new."
// When everyone left is in one group, name it instead: "We'll invite 56 new creators to this campaign."
function inviteLine(d) {
  const kept = [...d.prio, ...d.rest];
  const prev = kept.filter(c => c.source === 'approved').length;
  const fresh = kept.length - prev;
  const who = n => plural(n, 'creator', 'creators');
  if (!prev || !fresh) return `We'll invite ${kept.length} ${prev ? 'previously approved' : 'new'} ${who(kept.length).replace(/^\d+ /, '')} to this campaign.`;
  return `We'll invite ${who(kept.length)} to this campaign, including ${prev} previously approved and ${fresh} new.`;
}

function summaryHtml(d, error) {
  const n = d.prio.length + d.rest.length;
  const parts = [d.prev && `${d.prev} you've worked with`, d.fresh && `${d.fresh} new`].filter(Boolean);
  const rows = [];
  if (d.prio.length) rows.push(['prio', `Prioritized (${d.prio.length})`, 'Invited first', d.prio]);
  if (d.rest.length) rows.push(d.prio.length
    ? ['rest', `Everyone else (${d.rest.length})`, ['Invited right after', ...parts].join(' · '), d.rest]
    : ['rest', `Your matches (${d.rest.length})`, parts.join(' · '), d.rest]);
  if (d.nofit.length) rows.push(['nofit', `Not a fit (${d.nofit.length})`, "Won't get an invite", d.nofit]);
  return `
  <div class="sum-view">
    <div class="sum-top">
      <div class="sum-head">
        <h2 class="sum-title" id="sumTitle">${n ? 'Good to go?' : 'Nobody to invite yet'}</h2>
        <p class="sum-sub">${n ? inviteLine(d) : 'You marked everyone as Not a fit. Go back and keep at least one creator.'}</p>
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

