# Invite Creators — prototype (v2 copy)

Clickable HTML/CSS/JS prototype of Benable's **Invite Creators** modal, built from the Figma designs.

A copy of [invite-creators-prototype](https://github.com/AmineBenjil/invite-creators-prototype) for new explorations. Live: https://invite-creators-prototype-v2.vercel.app

- **Suggestions deck:** swipe through suggested creators (‹ ›, Add, ⚡ priority invite, Not a Fit). Added creators fly into the shortlist panel and leave the deck.
- **Creators you know:** the "8 creators on your list" bar opens an editor. A pill at the top of the page switches between three versions to A/B test:
  - **V1 — Inline edit:** the bar expands into a swipeable card deck.
  - **V2 — Edit popup:** a popup table; changes apply on Save.
  - **V3 — Inline table:** the bar expands into a table.
- **Shortlist panel:** "We added for you" (split into Priority and Standard), then Priority and Invites for new creators, newest first. Hover a normal invite to make it a priority invite.
- Everything runs on a fake in-memory backend (`mock-api.js`) and resets on reload.

## Run it

No build step. Serve the folder with any static server, for example:

```bash
python3 -m http.server 5173
```

Then open http://localhost:5173 (add `#v2` or `#v3` to start on that version).
