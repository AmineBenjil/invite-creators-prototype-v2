# Invite Creators — prototype (v2 copy)

Clickable HTML/CSS/JS prototype of Benable's **Invite Creators** modal, built from the Figma designs.

A copy of [invite-creators-prototype](https://github.com/AmineBenjil/invite-creators-prototype) for new explorations. Live: https://invite-creators-prototype-v2.vercel.app

- **Version switch:** a pill at the top of the page picks the popup version (remembered per browser; `#v1` to `#v4` in the URL also work). 
- **V3** (deck expand): each group's bar is the top card of a deck. Closed, two card edges peek out under it; opening spreads the cards out from under the bar while the avatar pile slides away to the left, and closing tucks them back. A "Collapse" button appears in the pinned heading once the bar scrolls away.
- **V4**: V3 without the stacked card edges. Closed, the bar looks like a plain bar; opening and closing from the bar work the same as V3. Collapsing from the pinned heading deep in the list doesn't scroll back up: the cards fade out and the section snaps to its closed state.
- **V1** (Figma 15309:22677): the same approve popup, but opening a group drops its avatar bar and lists the cards inline at full width, with a "Hide …" link next to the heading to collapse it again. Not a Fit and Prioritize choices are shared across all versions.
- **V2: Approve creators popup** (Figma 15308:18705): we've picked 75 creators, split into **Previously approved creators** (18) and **New creators** (57). Each group is a collapsed bar (avatar stack, names, chevron).
- **Previously approved dropdown** (Figma 15314:50788): opens into 18 cards with a "Previously approved" tag and what happened last time.
- **New creators dropdown** (Figma 15313:23476): opens into 57 creator cards. In both lists, **Not a Fit** collapses a card in place into a one-line row with **Undo**; **Prioritize** turns purple. The Approve button counts everyone not marked Not a Fit.
- **V1 Not a fit option:** on V1 a small pill under the version switch picks **Popup** (the default) or **Inline** (Figma 15347:68305). Inline skips the popup: the card collapses right away into a row with a "Not a Fit" chip, and "Tell us why?" opens the feedback popup just to collect the reason. Remembered per browser.
- **Not a fit feedback** (Figma 15343:68271): Not a fit opens a blurred "Help us improve your matches" popup with the creator and an optional "Tell us why..." field. However it closes (Send, Cancel, ✕, Esc or the backdrop) the creator is marked Not a fit; Send also keeps the reason. Undo on the row brings them back.
- **Invite summary** (Figma 15341:25253): **Approve N creators** opens a read-only "Ready to send N invites?" pop-up: Prioritized (invited first), everyone else, and Not a fit, each with faces. **Go back** (or Esc / backdrop) keeps every selection; **Send** closes it and turns the Invite Creators popup itself into the success screen (green check, confetti, "N creators approved", Done). After that the dashboard shows a "N creators approved" card with **View list**, which reopens the list (footer: "N invites sent"). Add `?sendfail=1` to try the failed-send state.
- Everything runs on a fake in-memory backend (`mock-api.js`) and resets on reload.

## Run it

No build step. Serve the folder with any static server, for example:

```bash
python3 -m http.server 5180
```

Then open http://localhost:5180 (add `?notfit=26` to start with 26 new creators marked Not a Fit, which shows the below-50 warning).
