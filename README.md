# filex — Spanish language pack (`lang-es`)

The whole [filex](https://github.com/BRF-Tech/filex) interface in Spanish — the file explorer,
the admin panel, the settings dialog and the public pages a share link opens — as a
**language pack**: one `filex-app.json`, no code, installable on any filex server
(v0.43.0 or newer).

> ## ⚠ AI-translated, awaiting review by a native speaker
>
> Every string in this pack was translated by an AI model and checked mechanically, but **no
> native Spanish speaker has reviewed it yet**. It is complete and it renders correctly; it may
> still read unnaturally in places. **Corrections are welcome** — open an issue or a pull request
> against `translations/es.json`, and keep to the terminology in [`glossary.md`](glossary.md)
> (or change the glossary first).

- **Version** 0.1.0 · **catalogue** filex v0.43.0 · **coverage** 100% (3,588 of 3,588 strings,
  227 of them the text the server writes) · 4 extra plural forms
- Neutral, international Spanish, addressing the reader as *usted*.

## Install

On a filex server, an administrator opens **Plugins → Apps → Install an app** and chooses:

- **GitHub** — `BRF-Tech/filex-lang-es` (and a tag or branch, if you like). filex reads
  `filex-app.json` from the repository root; no release is needed.
- **Files** — upload `filex-app.json` and leave the module empty: a language pack has none.

The review says *Language pack* and how much of that server's filex it translates. Then pick
**Español** in **Settings → Preferences → Language**, or in the language row at the bottom of a
public share page.

## Correct a string

1. Edit the value in `translations/es.json` (the English is under the same key in
   `catalogue/filex-catalogue-en.json`; `node scripts/pack.mjs next` shows context for any key
   that is still empty).
2. Rebuild and check:

```bash
node scripts/pack.mjs build                  # translations/es.json → filex-app.json
node scripts/validate.mjs filex-app.json --complete   # what filex accepts (the filex validator)
node scripts/style-check.mjs                 # this pack's own checks: usted, glossary, consistency
node scripts/style-check.mjs --lengths       # …and the strings that grew most, for tight UI
```

3. Commit `translations/es.json` **and** `filex-app.json` together (CI runs
   `node scripts/pack.mjs build --check`, which fails when they disagree).

For the strictest check of admin-panel strings, `npm install` once: both validators then use
vue-i18n's own parser. The last run of both is in [`validate-output.txt`](validate-output.txt).

### The rules a correction must keep

A key's table decides its grammar (`in` in `catalogue/filex-catalogue-context.json`):

| | explorer (plain) | admin (vue-i18n) | both | server |
|---|---|---|---|---|
| where | the file manager | the admin panel | drawn by both | e-mails, notifications, the public pages |
| placeholders | keep `{name}` exactly | keep `{name}` exactly | keep `{name}` exactly | keep `{name}` exactly — **all of them**; one missing and the server sends the English |
| plural | a key per CLDR category: `…_one` beside the plain key (`other`) | the forms in one string, split by a bar: `one \| other` | — | as the explorer |
| `@` | as is | write `{'@'}` | not allowed | as is |
| a literal bar | as is | write `{'\|'}` | not allowed | as is |
| `%` right before `{` | as is | write `{'%'}{percent}` | not allowed | as is |
| `{'…'}` | never — it prints as written | the way to write `@ \| { }` | never | never — it prints as written |

Keep `` `code` `` spans, product names, paths and the `tag:` search prefix as they are.
Full guide: [Writing a language pack](https://docs.filex.sh/PLUGIN-KIT#writing-a-language-pack).

## Keep it current

When a new filex version adds strings:

```bash
node scripts/pack.mjs sync --from v0.44.0   # refresh catalogue/, add the new keys (empty)
```

Translate what is new, bump `version` in `filex-app.json`, build, and use **Upgrade** on the
pack's row in **Plugins → Apps**.

## What is in here

```
filex-app.json                      the pack filex installs (written by `build`)
translations/es.json                the translation — the file you edit
glossary.md                         terminology, voice, and the decisions that were hard
catalogue/                          every string of filex v0.43.0 in English, with context
scripts/pack.mjs                    start · next · build · sync (from the template)
scripts/validate.mjs                the filex validator (copied verbatim from the template)
scripts/style-check.mjs             this pack's own checks
validate-output.txt                 the last run of both validators
.github/workflows/validate.yml      CI
```

Built from [BRF-Tech/filex-lang-template](https://github.com/BRF-Tech/filex-lang-template).

## License

[MIT](LICENSE).
