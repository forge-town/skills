# issue.html template provenance

- Layout skeleton: lv-editorial-pdf (user-supplied skill) — `assets/handbook.html` natural-flow handbook (mast rule,
  cover title/metadata under an ink rule, chapters with top rules, step rows, thin-rule tables), the type hierarchy in
  `assets/editorial.css` / `references/design-system.md`, and A4 margins 17/18/16 mm. Colors in the document shell
  come from Lieflat Mono rather than a second LV palette. Its master is `assets/reference/reference.html`; no bag imagery,
  LV marks, reference content or data were reused.
- Font: the LV font is not bundled. `issue.css` names `LVEditorial` only so a locally installed copy is used;
  otherwise Helvetica Neue / Arial / PingFang SC / Noto Sans CJK SC. No redistribution right is claimed.
- Product UI prototypes: static visual adaptation of the documented shadcn/ui neutral theme tokens and component
  anatomy (Button, Input/Field, Table, Tabs, Dialog, Sheet, Dropdown Menu, Alert), inspected 2026-10-21 at
  https://ui.shadcn.com/docs/theming and https://ui.shadcn.com/docs/components. Scoped to `.canvas`; this is authored
  static HTML/CSS, not the interactive React/Radix implementation. No shadcn runtime or remote dependency is bundled.
- Task chart: Lieflat Charts F5 Tick Rows (`templates/basics-gallery.html`, card "Six teams, shipped and counted",
  renderer `// ════ C1 · tick rows ════`), Mono tokens. See `scripts/issue-html/third_party/lieflat/` for the
  PolyForm Noncommercial License 1.0.0 and notices.
