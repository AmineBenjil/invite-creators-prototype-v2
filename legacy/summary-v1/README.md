# Invite summary pop-up — v1 (saved copy)

The "Good to go?" pop-up that opens from **Approve N creators**, as it was before the
redesign in Figma 15367:8086. Nothing here is loaded by the prototype.

To revert:

1. **CSS**: in `styles.css`, replace the block from `/* ===== Invite summary pop-up` down to
   `.sum-send:disabled { … }` with the first part of `summary.css`, and the two
   `@media` blocks just before `/* ===== Not a fit feedback` with the last part.
2. **JS**: in `app.js`, set `const FACES = 5;` and replace `ICONS`, `rowHtml2`,
   `inviteLine` and `summaryHtml` with the versions in `summary.js`.

Or check out the commit made before the redesign: `git show 9fbd61e:app.js`.
