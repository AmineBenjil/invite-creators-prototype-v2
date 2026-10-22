# Invite summary pop-up — v2 (saved copy)

The "Good to go?" pop-up with the Prioritize / Everyone else / Not a fit list panel
(Figma 15367:8086, 716px wide), as shipped in commit `fa920d4`. Replaced by the compact
version in Figma 15372:8161. Nothing here is loaded by the prototype.

To revert:

1. **CSS**: in `styles.css`, replace the block from `/* ===== Invite summary pop-up` down to
   `.sum-send:disabled { … }` with `summary.css`.
2. **JS**: in `app.js`, set `const FACES = 4;` and replace `ICONS`, `rowHtml2`,
   `inviteLine` and `summaryHtml` with the versions in `summary.js`.

Or: `git show fa920d4:app.js` / `git show fa920d4:styles.css`.
