# Contributing a widget

1. **Create a folder** under `widgets/` named with a lowercase slug, e.g.
   `widgets/recent-comments/`.

2. **Add `widget.xml`** — a single Blogger `<b:widget>…</b:widget>` blueprint. It
   must start with `<b:widget`. Tokenize customizable values with `data-mor-field`
   (see the README) so users can edit them as form fields in the app.

3. **Add `manifest.json`** with at least `name`, `type`, and `description`:

   ```json
   {
     "name": "Recent Comments",
     "type": "HTML",
     "group": "content",
     "description": "Shows the latest comments across your blog.",
     "author": "your-github-handle",
     "version": "1.0.0",
     "tags": ["comments", "sidebar"]
   }
   ```

   Do **not** set `slug`, `xml`, or `screenshot` — the build script derives them.

4. **(Optional) Add `screenshot.png`** (or `.jpg`/`.webp`/`.svg`) in the same
   folder; it's auto-linked into the card.

5. **Open a PR.** CI runs `node scripts/build-index.mjs`, which fails if:
   - `manifest.json` is missing / invalid JSON / missing a required key, or
   - `widget.xml` is missing or doesn't start with `<b:widget`.

   On merge to `main`, CI regenerates and commits `index.json` and purges the
   jsDelivr cache. You never edit `index.json` yourself.

## Tips

- Test the blueprint by pasting `widget.xml` into the editor's **+ New Widget →
  Code** tab and checking the Settings form picks up your `data-mor-field`s.
- Keep one widget per folder so each is a small, reviewable PR.
- Prefer real, copy-pasteable Blogger widget XML — don't invent attributes Blogger
  won't accept on upload.
