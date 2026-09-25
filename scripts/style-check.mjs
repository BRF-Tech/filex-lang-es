#!/usr/bin/env node
/**
 * style-check.mjs — the Spanish pack's own checks, on top of scripts/validate.mjs.
 *
 *   node scripts/style-check.mjs [--file translations/es.json] [--catalogue catalogue]
 *                                [--src <filex checkout>] [--lengths] [--no-compiler]
 *                                [--quiet-warnings]
 *
 * scripts/validate.mjs (the filex validator, copied verbatim from the template) is the
 * authority on what filex accepts. This script adds what a Spanish reviewer cares about:
 *   - values left identical to English that should have been translated;
 *   - informal "tú" forms (the pack addresses the reader as usted) and regional words
 *     glossary.md rules out;
 *   - the same short English label translated two ways (a consistency report);
 *   - the strings that grew most in length (--lengths), for tight UI;
 * and repeats the syntax checks per table (placeholders, plural branches, `@`, code spans,
 * whitespace, trailing `…` / `:`), so a broken string fails here too.
 *
 * English and each key's table come from catalogue/filex-catalogue-en.json and
 * catalogue/filex-catalogue-context.json (`in`: explorer · admin · both). A key in both
 * tables is checked against both grammars.
 *
 * vue-i18n's own parser (@intlify/message-compiler) is used when it is installed here
 * (`npm install`) or found in a filex checkout given with --src; otherwise a built-in
 * checker covers the same rules.
 *
 * Exit code: 0 = no errors (warnings allowed), 1 = errors, 2 = could not run.
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
// The plural rules are the PLATFORM's: imported from the validator filex
// itself runs, never re-implemented here (they moved once already, in
// v0.43.0, from "_one means 1" to the CLDR categories).
import { COUNT_VARS, formOf, impliesNumber, plainTokens, pluralCategories } from './validate.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '..');

/* ── arguments ─────────────────────────────────────────────────────────── */
const argv = process.argv.slice(2);
const flag = (name) => argv.includes(name);
const opt = (name, dflt) => {
  const i = argv.indexOf(name);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : dflt;
};
const CAT = path.resolve(opt('--catalogue', path.join(repo, 'catalogue')));
const SRC = opt('--src', process.env.FILEX_SRC || '');
const FILE = path.resolve(opt('--file', path.join(repo, 'translations', 'es.json')));
const SHOW_LENGTHS = flag('--lengths');
const QUIET_WARN = flag('--quiet-warnings');

/* ── the host's limits (backend/pkg/pluginkit/wire/langpack.go), in bytes ── */
const MAX_KEY_LEN = 128;
const MAX_VALUE_LEN = 4096;
const MAX_LANGUAGE_BYTES = 1048576;

/* ── load English ──────────────────────────────────────────────────────── */
function die(msg) {
  console.error(`style-check: ${msg}`);
  process.exit(2);
}
const enFile = path.join(CAT, 'filex-catalogue-en.json');
const cxFile = path.join(CAT, 'filex-catalogue-context.json');
for (const f of [enFile, cxFile]) if (!fs.existsSync(f)) die(`catalogue file not found: ${f} (use --catalogue)`);
const catEn = JSON.parse(fs.readFileSync(enFile, 'utf8'));
const catCx = JSON.parse(fs.readFileSync(cxFile, 'utf8'));
const webEn = {};
const coreEn = {};
// `server` — the e-mails, the notifications, the no-JS public pages and the
// permission names — is written with the explorer's plain grammar ({name}
// replaced verbatim, no vue-i18n literals), so it is checked as core. Left out
// of this list, all 237 of its keys reported UNKNOWN on a clean pack and a
// MISSING one would never have been caught (v0.43.0 sync).
for (const [k, v] of Object.entries(catEn)) {
  const table = catCx.keys?.[k]?.in;
  if (table === 'admin' || table === 'both') webEn[k] = v;
  if (table === 'explorer' || table === 'both' || table === 'server') coreEn[k] = v;
  if (!table) die(`catalogue context has no table for ${k}`);
}
const LANG = 'es';
const CATS = pluralCategories(LANG);
/** A plural FORM key (`x_few`) of a catalogue key that counts — `x` is its base. */
function pluralBase(key) {
  const f = formOf(key);
  if (!f || !(f.base in catEn) || !catCx.keys?.[f.base]?.plural) return null;
  const table = catCx.keys[f.base].in;
  if (table !== 'explorer' && table !== 'both' && table !== 'server') return null;
  return f;
}

/* ── load the pack ─────────────────────────────────────────────────────── */
if (!fs.existsSync(FILE)) die(`pack not found: ${FILE}`);
let pack;
try {
  pack = JSON.parse(fs.readFileSync(FILE, 'utf8'));
} catch (e) {
  die(`${FILE} is not valid JSON: ${e.message}`);
}
if (!pack || typeof pack !== 'object' || Array.isArray(pack)) die('the pack must be a flat JSON object');

/* ── vue-i18n's message parser: installed here, or from a filex checkout ── */
let parser = null;
let parserNote = 'built-in checker (vue-i18n parser not installed — `npm install`, or pass --src)';
if (!flag('--no-compiler')) {
  const tries = [
    () => createRequire(path.join(repo, 'package.json')).resolve('@intlify/message-compiler/package.json'),
    () => {
      const webReq = createRequire(path.join(path.resolve(SRC), 'web', 'package.json'));
      const vi18n = fs.realpathSync(webReq.resolve('vue-i18n/package.json'));
      const coreBase = fs.realpathSync(createRequire(vi18n).resolve('@intlify/core-base/package.json'));
      return createRequire(coreBase).resolve('@intlify/message-compiler/package.json');
    },
  ];
  for (const t of tries) {
    try {
      if (t === tries[1] && !SRC) continue;
      const mcPkg = t();
      const mc = createRequire(mcPkg)('./dist/message-compiler.cjs');
      const version = JSON.parse(fs.readFileSync(mcPkg, 'utf8')).version;
      parser = (text) => {
        const errors = [];
        const p = mc.createParser({ onError: (e) => errors.push(e.message) });
        return { ast: p.parse(text), errors };
      };
      parserNote = `@intlify/message-compiler ${version} (vue-i18n's own parser)`;
      break;
    } catch {
      /* next */
    }
  }
}

/* ── token extraction ──────────────────────────────────────────────────── */
const sortJoin = (arr) => [...arr].sort().join(' ');
const codeSpans = (s) => s.match(/`[^`]*`/g) ?? [];
const angleTokens = (s) => s.match(/<[^<>\s][^<>]*>/g) ?? [];
const literalExprs = (s) => s.match(/\{\s*'[^']*'\s*\}/g) ?? [];

/** Admin SPA: per plural branch, the named/list/literal/linked tokens. */
function webShape(text) {
  if (parser) {
    const { ast, errors } = parser(text);
    const cases = ast.body.type === 1 ? ast.body.cases : [ast.body];
    const shape = cases.map((c) => {
      const toks = [];
      for (const it of c.items ?? []) {
        if (it.type === 4) toks.push(`{${it.key}}`);
        else if (it.type === 5) toks.push(`{${it.index}}`);
        else if (it.type === 9) toks.push(`{'${it.value}'}`);
        else if (it.type === 6) toks.push('@linked');
      }
      return sortJoin(toks);
    });
    return { shape, errors };
  }
  // fallback: split on `|` outside braces
  const branches = [];
  let depth = 0;
  let cur = '';
  for (const ch of text) {
    if (ch === '{') depth++;
    if (ch === '}') depth = Math.max(0, depth - 1);
    if (ch === '|' && depth === 0) {
      branches.push(cur);
      cur = '';
    } else cur += ch;
  }
  branches.push(cur);
  const errors = [];
  if (/@/.test(text.replace(/\{\s*'[^']*'\s*\}/g, ''))) errors.push('bare @ (starts a linked message)');
  return { shape: branches.map((b) => sortJoin(b.match(/\{[^{}]*\}/g) ?? [])), errors };
}
/** Explorer: `{name}` tokens, replaced verbatim by t(). */
const coreShape = (text) => sortJoin(text.match(/\{[A-Za-z0-9_]+\}/g) ?? []);

/* ── what may legitimately stay identical to English ───────────────────── */
// Words that are the same in Spanish UI: product/protocol names, units, acronyms, syntax.
const KEEP_WORDS = new Set(
  (
    'filex OK PIN ID IP URL URLs API MCP REST SSO OIDC LDAP TOTP 2FA RBAC JWT SMTP TLS SSL HTTPS HTTP ' +
    'SFTP FTP FTPS WebDAV NFS NFSv3 SMB CIFS NAS S3 MinIO Hetzner AWS ClamAV clamd ETag MIME SHA-256 SHA ' +
    'HMAC ed25519 PEM PKCS WebAssembly Wasm wasm GitHub Claude rclone restic Cyberduck WinSCP FileZilla ' +
    'PuTTYgen davfs2 sshfs s3fs WinFsp macFUSE Finder Dolphin GNOME PowerShell Markdown CSV PDF PDFs PWA ' +
    'Windows macOS Linux Debian Ubuntu AppImage deb dmg exe Apple Silicon Keycloak Auth0 Authentik Bleve Vue React Go ' +
    'TypeScript JavaScript Python Rust PHP Ruby Java Kotlin Swift YAML XML TOML SQL JSON HTML CSS ' +
    'cron webhook Webhook Webhooks token Token endpoint Endpoint bucket Bucket host Host proxy Proxy ' +
    'StartTLS CIDR DN known_hosts clamdscan clamscan B KB MB GB TB PB MiB px OnlyOffice ONLYOFFICE drawio ' +
    'Admin Hex hex base64 Figma Office Word Excel PowerPoint OpenDocument X-Filex-Token Bearer Authorization ' +
    'Backblaze B2 ms v x y z patch Min Max Enterprise Pro Home ' +
    // ordinary words spelled the same in Spanish
    'Antivirus antivirus Error error No no Megabytes megabytes bytes Normal Local Total General Editor ' +
    'Video Videos Audio Active Directory Personal ' +
    // sample values and input masks
    'fileman foo bar XXXX'
  ).split(/\s+/),
);
// Keys whose English value is also the right Spanish, beyond what KEEP_WORDS covers.
// Keys whose Spanish ending legitimately differs: a letter's salutation takes a colon
// in Spanish ("Hola:"), where English writes a comma.
const ENDING_OK = new Set(['access.ui.mail_hello', 'server.mail.greeting']);
const IDENTICAL_OK = new Set([
  'app.name',
  'apiMcp.fields.usernamesPlaceholder', // sample identifiers ("work, fishapp")
  'conn.tokens.rootPlaceholder', // syntax: storage://folder
  'e2e.recover.recovery_placeholder', // input mask XXXX-XXXX-…
  'archivesAdmin.providerSevenZip', // product name: 7-Zip
]);
function identicalAllowed(key, en) {
  if (IDENTICAL_OK.has(key)) return true;
  const words = en.replace(/\{[^{}]*\}/g, ' ').match(/[A-Za-zÀ-ÿ][A-Za-z0-9À-ÿ_+#-]*/g) ?? [];
  return words.every((w) => KEEP_WORDS.has(w) || KEEP_WORDS.has(w.replace(/s$/, '')));
}

/* ── register / glossary lint (usted, neutral Spanish) ─────────────────── */
const TU_PRONOUNS = /(^|[^\p{L}])(tu|tus|te|ti|contigo|puedes|tienes|quieres|debes|necesitas|estás|eres|has|hayas)(?=[^\p{L}]|$)/iu;
const TU_IMPERATIVE_START =
  /(^|[.!?—:]\s+|^\s*)(Selecciona|Escribe|Elige|Haz|Pulsa|Abre|Usa|Prueba|Introduce|Arrastra|Suelta|Toca|Copia|Pega|Comprueba|Asegúrate|Inténtalo|Vuelve|Espera|Cierra|Pide|Revisa|Añade|Agrega|Crea|Activa|Desactiva|Marca|Borra|Elimina|Indica|Configura|Instala|Descarga|Sube|Mira|Busca|Pregunta|Ejecuta|Registra|Genera|Pon|Ten|Ve|Sal|Di)\s+(el|la|los|las|un|una|lo|le|les|esto|este|esta|aquí|ahí)\b/u;
const GLOSSARY_LINT = [
  [/\bañad/i, 'use "agregar" (neutral), not "añadir"'],
  [/\b(ordenador|computadora)/i, 'use "equipo" for "computer"'],
  [/\bcoste\b/i, 'use "costo"'],
  [/\b(introduzca|introduce|ingrese|ingresa)\b/i, 'use "escriba" for "enter"'],
  [/\bajustes\b/i, 'use "configuración" for "settings"'],
  [/\bfichero/i, 'use "archivo"'],
  [/\bpapelera de reciclaje\b/i, 'use "papelera"'],
];

/**
 * Which CLDR category each `|` branch of an admin plural is read as, for a
 * string with `n` branches — the renderer's rule (packages/core/src/lib/
 * plural.ts): as many branches as the language has categories means those
 * categories in CLDR order; 2 means one|other; 3 the classic zero|one|other.
 */
function branchCategories(n) {
  if (n === CATS.length && n > 1) return CATS;
  if (n === 2) return ['one', 'other'];
  if (n === 3) return ['zero', 'one', 'other'];
  return [];
}

/* ── run ───────────────────────────────────────────────────────────────── */
const errors = [];
const warnings = [];
const err = (key, code, msg) => errors.push({ key, code, msg });
const warn = (key, code, msg) => warnings.push({ key, code, msg });

const expected = new Map(); // key -> [{cat, en}]
for (const [k, v] of Object.entries(webEn)) expected.set(k, [{ cat: 'web', en: v }]);
for (const [k, v] of Object.entries(coreEn)) {
  if (expected.has(k)) expected.get(k).push({ cat: 'core', en: v });
  else expected.set(k, [{ cat: 'core', en: v }]);
}
const collisions = [...expected.entries()].filter(([, s]) => s.length > 1);

const packKeys = Object.keys(pack);
// A plural form for a category the English has no key for (`x_few` in a
// language with `few`) is a real key filex reads — checked against its base's
// English, and never required.
for (const k of packKeys) {
  if (expected.has(k)) continue;
  const f = pluralBase(k);
  if (!f) continue;
  if (!CATS.includes(f.cat)) {
    err(k, 'UNUSED', `${LANG} has no "${f.cat}" plural category (${CATS.join(', ')}) — this form is never shown`);
    continue;
  }
  expected.set(k, [{ cat: 'core', en: catEn[f.base] }]);
}
for (const k of expected.keys()) if (!(k in pack)) err(k, 'MISSING', 'key missing from the pack');
for (const k of packKeys) if (!expected.has(k)) err(k, 'UNKNOWN', 'key not in either English catalogue');

for (const [key, sources] of expected) {
  if (!(key in pack)) continue;
  const es = pack[key];
  if (typeof es !== 'string') {
    err(key, 'TYPE', 'value is not a string');
    continue;
  }
  if (!es.trim()) {
    err(key, 'EMPTY', 'empty value');
    continue;
  }
  if (Buffer.byteLength(key) > MAX_KEY_LEN) err(key, 'LIMIT', `key longer than ${MAX_KEY_LEN} bytes`);
  if (Buffer.byteLength(es) > MAX_VALUE_LEN) err(key, 'LIMIT', `value longer than ${MAX_VALUE_LEN} bytes`);
  // A key both tables draw must read the same through both engines: no `@`, bar or {'…'}.
  if (sources.length > 1 && (/[@|]/.test(es) || literalExprs(es).length))
    err(key, 'SHARED', "a key in both tables may not contain @, | or {'…'}");

  // A shared key has one English in the catalogue; kept for a catalogue that ever differs.
  const englishDiffers = sources.length > 1 && sources[0].en !== sources[1].en;
  const perSource = [];
  for (const { cat, en } of sources) {
    const where = sources.length > 1 ? ` [vs ${cat} English]` : '';
    const before = errors.length;

    if (cat === 'web') {
      const a = webShape(en);
      const b = webShape(es);
      if (b.errors.length && !a.errors.length) err(key, 'SYNTAX', `vue-i18n cannot parse it: ${b.errors.join('; ')}${where}`);
      if (a.shape.length !== b.shape.length)
        err(key, 'PLURAL', `${b.shape.length} plural branch(es), English has ${a.shape.length}${where}`);
      else
        a.shape.forEach((s, i) => {
          if (s === b.shape[i]) return;
          // ⚠ The platform's rule, not a stricter one: every branch of a
          // plural is handed the WHOLE sentence's values, so a branch may leave
          // the count out when its category holds exactly one number — "Se
          // encontró una carpeta", "Ein Ordner gefunden". Comparing branch to
          // branch made those an error while the platform validator, French and
          // Arabic all accepted them (v0.43.0 srcfix sync).
          const cats = branchCategories(b.shape.length);
          const implied = cats[i] ? impliesNumber(LANG, cats[i]) : false;
          const want = s.split(' ').filter(Boolean);
          const got = b.shape[i].split(' ').filter(Boolean);
          const bad = got.filter((t) => !want.includes(t));
          const gone = want.filter((t) => !got.includes(t) && !(implied && COUNT_VARS.includes(t.replace(/^\{|\}$/g, ''))));
          if (bad.length || gone.length)
            err(key, 'PLACEHOLDER', `branch ${i + 1}: has [${b.shape[i]}], English has [${s}]${where}`);
        });
      if (sortJoin(literalExprs(es)) !== sortJoin(literalExprs(en)))
        err(key, 'LITERAL', `{'…'} literals differ from English${where}`);
    } else {
      const form = pluralBase(key);
      if (form) {
        // The platform's rule: every form is handed the whole sentence's
        // values, so it may use any of them; it must keep those the plain
        // key has, except the count when this category holds exactly one
        // number (Spanish `one` is only 1) — and it MAY put the count back
        // where the English form typed a literal digit.
        const allowed = new Set([...plainTokens(catEn[form.base]), ...plainTokens(en)]);
        const implied = impliesNumber(LANG, form.cat);
        const required = plainTokens(catEn[form.base]).filter((t) => !(implied && COUNT_VARS.includes(t)));
        const got = plainTokens(es);
        const bad = got.filter((t) => !allowed.has(t));
        const gone = required.filter((t) => !got.includes(t));
        if (bad.length) err(key, 'PLACEHOLDER', `uses {${bad.join('} {')}}, which the English does not${where}`);
        if (gone.length) err(key, 'PLACEHOLDER', `leaves out {${gone.join('} {')}}${where}`);
      } else if (coreShape(es) !== coreShape(en))
        err(key, 'PLACEHOLDER', `has [${coreShape(es)}], English has [${coreShape(en)}]${where}`);
      if (literalExprs(es).length) err(key, 'AT', `explorer strings print {'…'} literally — write a bare @${where}`);
      if ((es.match(/@/g) ?? []).length !== (en.match(/@/g) ?? []).length)
        err(key, 'AT', `number of @ differs from English${where}`);
    }

    if (sortJoin(codeSpans(es)) !== sortJoin(codeSpans(en))) err(key, 'CODE', `backtick code spans differ from English${where}`);
    if (angleTokens(es).length !== angleTokens(en).length) err(key, 'ANGLE', `<…> tokens differ in number${where}`);
    const lead = (s) => s.match(/^\s*/)[0];
    const trail = (s) => s.match(/\s*$/)[0];
    if (lead(es) !== lead(en) || trail(es) !== trail(en)) err(key, 'SPACE', `leading/trailing whitespace differs${where}`);
    const endEn = en.trimEnd().slice(-1);
    const endEs = es.trimEnd().slice(-1);
    if ((endEn === '…' || endEn === ':') && endEs !== endEn) err(key, 'ENDING', `English ends with "${endEn}", the translation does not${where}`);
    if (endEn !== '…' && endEn !== ':' && (endEs === '…' || endEs === ':') && !ENDING_OK.has(key))
      err(key, 'ENDING', `translation ends with "${endEs}", English does not${where}`);
    if ((endEn === '.') !== (endEs === '.') && !/[.)»”"]$/.test(es.trimEnd()))
      warn(key, 'PERIOD', `terminal period differs from English${where}`);
    if (en.trimEnd().endsWith('?') && !es.includes('¿') && es.trimEnd().endsWith('?')) warn(key, 'QMARK', 'question without opening ¿');
    if (es === en && !identicalAllowed(key, en)) err(key, 'IDENTICAL', `identical to English: ${JSON.stringify(en)}`);
    perSource.push(errors.splice(before));
  }
  if (englishDiffers && perSource.some((e) => e.length === 0)) {
    /* satisfied one of the two English originals */
  } else for (const e of perSource) errors.push(...e);

  const plain = es.replace(/`[^`]*`/g, '').replace(/\{[^{}]*\}/g, '');
  if (TU_PRONOUNS.test(plain)) err(key, 'REGISTER', `informal "tú" form: ${JSON.stringify(es)}`);
  // ⚠ A permission name says what the APP does ("Runs the server's conversion
  // engine"), so its Spanish is third-person indicative — "Ejecuta el motor…" —
  // which reads exactly like a tú imperative. Nothing under server.perm.*
  // addresses the reader, so the heuristic is skipped there.
  if (!key.startsWith('server.perm.') && TU_IMPERATIVE_START.test(plain))
    warn(key, 'REGISTER', `possible "tú" imperative: ${JSON.stringify(es)}`);
  for (const [re, why] of GLOSSARY_LINT) if (re.test(plain)) warn(key, 'GLOSSARY', `${why}: ${JSON.stringify(es)}`);
}

/* consistency: the same short English label translated two ways */
const byEn = new Map();
for (const [key, sources] of expected) {
  if (!(key in pack)) continue;
  const en = sources[0].en;
  if (en.split(/\s+/).length > 3) continue;
  if (!byEn.has(en)) byEn.set(en, new Map());
  const m = byEn.get(en);
  const es = pack[key];
  if (!m.has(es)) m.set(es, []);
  m.get(es).push(key);
}
const inconsistent = [...byEn.entries()].filter(([, m]) => m.size > 1);

/* ── report ────────────────────────────────────────────────────────────── */
const webKeys = Object.keys(webEn).length;
const srvKeys = Object.keys(catEn).filter((k) => catCx.keys?.[k]?.in === 'server').length;
const coreKeys = Object.keys(coreEn).length - srvKeys;
console.log(`filex Spanish pack — style check`);
console.log(`  catalogue    : ${path.relative(process.cwd(), CAT) || CAT} (filex ${catCx.filex ?? '?'}) — ${Object.keys(catEn).length} strings`);
console.log(`                 admin ${webKeys} (vue-i18n) · explorer ${coreKeys} (plain {name}) · ${collisions.length} in both · server ${srvKeys} (mails, public pages, notifications)`);
console.log(`  plurals      : ${CATS.join(', ')} — ${expected.size - Object.keys(catEn).length} extra form key(s) beyond the catalogue`);
console.log(`  pack         : ${path.relative(process.cwd(), FILE) || FILE}  (${packKeys.length} strings)`);
console.log(`  syntax check : ${parserNote}`);
console.log('');

const packBytes = Object.entries(pack).reduce((n, [k, v]) => n + Buffer.byteLength(k) + Buffer.byteLength(String(v)), 0);
if (packBytes > MAX_LANGUAGE_BYTES) err('(pack)', 'LIMIT', `${packBytes} bytes — filex takes at most ${MAX_LANGUAGE_BYTES} per language`);

const group = (list) => {
  const m = new Map();
  for (const x of list) m.set(x.code, (m.get(x.code) ?? 0) + 1);
  return [...m.entries()].map(([c, n]) => `${c}=${n}`).join(' ') || 'none';
};
console.log(`Errors  : ${errors.length} (${group(errors)})`);
console.log(`Warnings: ${warnings.length} (${group(warnings)})`);
console.log(`Consistency: ${inconsistent.length} short English labels translated more than one way (see below)`);
for (const e of errors) console.log(`  ERROR ${e.code.padEnd(11)} ${e.key}: ${e.msg}`);
if (!QUIET_WARN) {
  for (const w of warnings) console.log(`  warn  ${w.code.padEnd(11)} ${w.key}: ${w.msg}`);
  if (inconsistent.length) {
    console.log('');
    console.log('Same English, different Spanish (review — context may justify it):');
    for (const [en, m] of inconsistent) {
      console.log(`  ${JSON.stringify(en)}`);
      for (const [es, keys] of m) console.log(`      ${JSON.stringify(es)}  <- ${keys.slice(0, 4).join(', ')}${keys.length > 4 ? ` (+${keys.length - 4})` : ''}`);
    }
  }
}

/* ── length report ─────────────────────────────────────────────────────── */
if (SHOW_LENGTHS) {
  const TIGHT = /(^|\.)(col|cols|tabs?|filter|sort|ctx|toolbar|sidenav|opc|nav|state|states|statuses|caps|badge|kinds|stats|actions|legs|mode|severity|roles|perm|sum|where|scope|access\.sum)(\.|$)|(^common\.)|(_short$)|(badge)/;
  const rows = [];
  for (const [key, sources] of expected) {
    const en = sources[0].en;
    const es = pack[key];
    if (typeof es !== 'string') continue;
    if (en.length > 28 || /[.!?]\s|[.!?]$/.test(en.trim())) continue;
    const tight = TIGHT.test(key);
    const grow = es.length - en.length;
    if (es.length > Math.max(Math.ceil(en.length * 1.3), en.length + 5)) rows.push({ key, en, es, grow, tight });
  }
  rows.sort((a, b) => Number(b.tight) - Number(a.tight) || b.grow - a.grow);
  const all = [...expected.values()].map((s) => s[0].en);
  const esAll = [...expected.keys()].map((k) => pack[k] ?? '');
  const sum = (a) => a.reduce((x, y) => x + y.length, 0);
  console.log('');
  console.log(`Length: Spanish is ${((sum(esAll) / sum(all) - 1) * 100).toFixed(1)}% longer than English overall.`);
  console.log(`Short labels (English <= 28 chars) that grew by > 30% and > 5 chars: ${rows.length}; tight-UI ones first:`);
  for (const r of rows.slice(0, 80))
    console.log(`  ${r.tight ? 'TIGHT' : '     '} +${String(r.grow).padStart(2)}  ${r.key}: ${JSON.stringify(r.en)} -> ${JSON.stringify(r.es)}`);
}

process.exit(errors.length ? 1 : 0);
