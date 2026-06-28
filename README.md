# Mor Blogger Widget Compendium

A community library of **installable Blogger widgets** for the
[MorBlogger Theme Editor](https://github.com/MoribundInstitute/mor_blogger_theme_editor) —
the RuneLite-plugin-hub of Blogger gadgets.

Each widget is a self-contained `<b:widget>` blueprint plus a small manifest. A CI
job aggregates every manifest into a single [`index.json`](./index.json), which both
the editor app and the web gallery consume.

## Layout

```
widgets/
  <slug>/
    widget.xml        # the <b:widget> blueprint (MorBlogger blueprint format)
    manifest.json     # card metadata (name, type, description, tags, …)
    screenshot.png    # optional preview image
index.json            # CI-built aggregate of every manifest (DO NOT edit by hand)
scripts/build-index.mjs
site/index.html       # standalone gallery (reads index.json over jsDelivr)
.github/workflows/ci.yml
```

## Adding a widget

See [CONTRIBUTING.md](./CONTRIBUTING.md). In short: add a `widgets/<slug>/` folder
with `widget.xml` + `manifest.json`, open a PR. CI validates it and rebuilds
`index.json` on merge.

### `manifest.json`

```json
{
  "name": "Wikipedia Search",
  "type": "Wikipedia",
  "group": "gadgets",
  "description": "A Wikipedia search box for your sidebar.",
  "author": "MoribundInstitute",
  "version": "1.0.0",
  "tags": ["search", "sidebar", "reference"]
}
```

`slug`, `xml`, and `screenshot` are filled in automatically by the build script
from the folder name — don't set them yourself.

## Tokenized fields

Mark user-customizable values in `widget.xml` so they become editable form fields
in the editor (no raw-XML editing needed):

```xml
<a href='https://wikipedia.org/wiki/' data-mor-field='href|Wiki base URL'> … </a>
<b:widget-setting name='displayMode'
  data-mor-field='text|Display mode|VERTICAL,HORIZONTAL,SIMPLE'>VERTICAL</b:widget-setting>
```

Grammar: `data-mor-field='<attr|text>|<Label>[|opt,opt,…]'`. Use an attribute name
(`href`, `src`) for attribute values, `text` for an element's text content, and an
optional comma list to render a dropdown. The editor strips `data-mor-field` on
export, so it never ships to the live blog.

## Consuming the index

- **App / programmatic:** fetch
  `https://cdn.jsdelivr.net/gh/MoribundInstitute/mor-blogger-widget-compendium@main/index.json`
  and install a widget by writing its `xml` into `workspace/widgets/<group>/<slug>.xml`.
- **Web gallery:** `site/index.html` renders the same `index.json`. Host it on
  GitHub Pages, or drop the `<mor-widget-gallery>` component into the Blogger
  compendium theme (see below).

## jsDelivr caching

`@main` URLs cache ~12h. CI purges `index.json` after each merge. For instant
widget updates, tag releases (`@v1.2.0`) or purge:
`https://purge.jsdelivr.net/gh/MoribundInstitute/mor-blogger-widget-compendium@main/<path>`

## Blogger theme integration

To present this inside the Blogger compendium blog (with native search / labels /
archive), keep one post per widget whose hidden body links its `manifest.json`,
and use the post-driven `<mor-widget-gallery>` variant. The standalone
`site/index.html` here is the simpler, zero-upkeep alternative (single source of
truth = `index.json`).

## Build locally

```
npm run build      # node scripts/build-index.mjs → regenerates index.json
```

## License

MIT © Moribund Institute
