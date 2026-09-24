# filex — Spanish glossary (es)

The terminology used across `translations/es.json`. One English concept → one Spanish term,
everywhere in the product. When a term below does not fit a sentence, rephrase the sentence —
do not switch terms.

## Voice and register

- **Neutral, international Spanish.** No regionalisms (no *vosotros*, no *ordenador*/*computadora*
  — see "computer" below; *agregar* rather than the Spain-marked *añadir*; *escriba* rather than
  *introduzca* / *ingrese*; *costo* rather than *coste*).
- **Usted**, consistently: *Escriba su contraseña*, *Su cuenta*, *Pídale a un administrador…*.
  Never *tú*.
- **Buttons and menu items are infinitives**: *Guardar*, *Eliminar*, *Cambiar nombre*,
  *Crear enlace*. Headings and labels are nouns: *Configuración*, *Papelera*, *Versiones*.
- **Status words agree with an implied masculine subject** (*el archivo*, *el elemento*) unless
  the sentence names a feminine one: *Activado*, *Guardado*, *Copiado*, *Cancelado*.
- **Sentence case** for everything (Spanish does not title-case): *Atajos de teclado*, not
  *Atajos De Teclado*, even where the English is Title Case ("Keyboard Shortcuts").
- Opening **¿ ¡** on every question/exclamation: *¿Eliminar?*, *¿Seguro?*.
- **Quotation marks**: keep exactly the characters the English uses (“ ” or " "), so the UI's
  typography does not change under the translation.
- *solo* without accent (RAE 2010): *Solo lectura*, *solo administradores*.
- Keep UI labels short. Spanish runs 20–30 % longer than English; in buttons, tabs, chips and
  column headers prefer the shortest natural wording (see the length notes in the README).

## Syntax that must survive (never translated)

| What | Rule |
|---|---|
| `{placeholder}` | kept verbatim; words around it are translated |
| `a \| b` (admin SPA plurals) | exactly TWO branches, `one \| other` — Spanish's CLDR categories, singular first |
| `key` / `key_one` (explorer / server plurals) | one key per CLDR category; the plain key is `other` (see “Plurals” below) |
| `{'@'}` | kept exactly (vue-i18n literal); never a bare `@` in an admin-SPA string |
| `@` in explorer strings | literal, never escaped (the explorer's `t()` is a plain replace) |
| the 55 keys in both tables | no `@`, no bar, no `{'…'}` at all — one value is drawn by both engines |
| `%` right before `{` (admin) | write `{'%'}{percent}`; `%{x}` is vue-i18n's old modulo form and eats the `%` |
| `` `code` `` spans, `<…>` tokens, env vars, CLI flags, paths, key combos | verbatim |
| `tag:` search syntax | verbatim — the server parses it (`tag:factura` is fine; `etiqueta:` would not work) |
| a syntax token in angle brackets (`root:<storage>://<folder>`) | **translated**, like the Turkish catalogue's `root:<depo>://<klasör>` — it describes what the reader types, it is not a literal (Burak, 2026-09-23). The number of `<…>` tokens must stay the same |

| `plugin:<driver>`, `name://folder`, `storage://folder`, `main://projects/acme` | verbatim |
| leading/trailing spaces, trailing `…` `:` | kept |

## Product and proper names — untouched

filex, ONLYOFFICE / OnlyOffice (as the English writes it), draw.io / diagrams.net, WebDAV, SFTP, FTP, FTPS,
NFS / NFSv3, SMB / CIFS, NAS, S3, MinIO, Hetzner, AWS, Backblaze B2, ClamAV, clamd, MCP, API,
REST, PIN, OIDC, LDAP, Active Directory, SSO, TOTP, 2FA, RBAC, JWT, SMTP, TLS, HTTPS, CIDR, DN,
ETag, MIME, SHA-256, HMAC, ed25519, PEM, PKCS#8, WebAssembly, Wasm, GitHub, Claude, rclone,
restic, Cyberduck, WinSCP, FileZilla, PuTTYgen, davfs2, sshfs, s3fs, WinFsp, macFUSE, Finder,
GNOME Files, Dolphin, PowerShell, Markdown, CSV, PDF, PWA, Windows, macOS, Linux, Keycloak,
Auth0, Authentik, Bleve, Vue, React, Go, cron, webhook, token, endpoint, bucket, host, proxy.

## Terms

| English | Spanish | Notes |
|---|---|---|
| file | archivo | |
| folder | carpeta | directory → directorio |
| item (a file or folder) | elemento | 1 elemento / {n} elementos |
| storage (a mounted backend) | almacenamiento (pl. almacenamientos) | "Add storage" → *Agregar almacenamiento* |
| drive | unidad | Windows "drive letter" → *letra de unidad*; macOS/WebDAV mounted drive → *la unidad*. ⚠ a drive on the READER’s own machine only — never a filex storage. v0.43.0 removed that sense from the English ("Drives" in the destination picker became "Storages"), so no string here may borrow it back |
| mount / mounted | montar / montaje / montado | "mount point" → *punto de montaje* |
| connection | conexión | "How to connect" → *Cómo conectarse* |
| share (verb) | compartir | |
| share / share link | enlace compartido | admin "Shares" → *Enlaces compartidos*; "My shares" → *Mis enlaces* |
| shared with me | compartido conmigo | |
| SMB share (a network share) | recurso compartido | only for SMB/CIFS; not a share link |
| link | enlace | "Copy link" → *Copiar enlace* |
| request files / file request | solicitar archivos / solicitud de archivos | |
| upload link, request link, drop link | enlace de subida / enlace de solicitud | |
| upload (verb / noun) | subir / subida | "Uploaded" → *Subido* |
| download (verb / noun) | descargar / descarga | |
| sync | sincronizar / sincronización | "Sync runs" → *Ejecuciones de sincronización* |
| trash | papelera | "Move to trash" → *Mover a la papelera*; "Empty trash" → *Vaciar la papelera* |
| delete / delete permanently | eliminar / eliminar definitivamente | |
| purge | purgar | |
| remove | quitar | (for detaching things: a key, a tag, a plugin) |
| restore | restaurar | |
| rename | cambiar nombre | |
| version | versión | "Version history" → *Historial de versiones* |
| snapshot | instantánea | |
| tag (noun / verb) | etiqueta / etiquetar | ⚠ never use *etiqueta* for "label" |
| label (a name you give a token/key/export) | descripción | UI label/caption → *texto*, *título* |
| star / starred / unstar | destacar / destacados / quitar de destacados | column "Star" → *Destacado* |
| recent | recientes | |
| home | inicio | |
| app (WebAssembly app) | aplicación (pl. aplicaciones) | "Apps" → *Aplicaciones* |
| plugin (storage plugin) | complemento | "Storage plugins" → *Complementos de almacenamiento* |
| driver | controlador | |
| manifest | manifiesto | |
| signature / sign | firma / firmar | "signed app" → *aplicación firmada* |
| signer | firmante | |
| requester | solicitante | |
| filled by | completado por | |
| initials | iniciales | |
| box (a field placed on a PDF) | recuadro | |
| field | campo | |
| permission | permiso | |
| grant (noun) / grant (verb) | permiso / conceder | "Grant revoked" → *Permiso revocado* |
| access | acceso | "People with access" → *Personas con acceso* |
| revoke | revocar | |
| owner | propietario | |
| administrator / admin | administrador / admin | "Admin panel" → *Panel de administración*; "Admins only" → *Solo administradores* |
| operator | operador | |
| instance | instancia | |
| tenant / multi-tenant | inquilino / multiinquilino | |
| user / account | usuario / cuenta | |
| role: Administrator / User / Viewer | Administrador / Usuario / Lector | |
| permission level: Viewer / Editor / Owner | Lector / Editor / Propietario | |
| viewer (the preview component) | visor | |
| sign in / sign out / sign-in | iniciar sesión / cerrar sesión / inicio de sesión | "Log out" → *Cerrar sesión* |
| username / password | nombre de usuario / contraseña | |
| email (v0.43.0 respelt English's "e-mail") | correo electrónico | *correo* in tight labels and compounds; no Spanish string says *e-mail* |
| two-factor authentication / 2FA | autenticación de dos factores / 2FA | "second factor" → *segundo factor* |
| recovery code / recovery key | código de recuperación / clave de recuperación | |
| key escrow / escrow key | custodia de claves / clave de custodia | |
| encrypted / encrypt / decrypt | cifrado / cifrar / descifrar | "end-to-end encrypted" → *cifrado de extremo a extremo* |
| lock / locked / unlock | bloquear / bloqueado / desbloquear | file lock → *bloqueo* |
| permission (what an API key may do) | permiso (pl. *permisos*) | ⚠ v0.43.0 retired English's "scope" for this: one term on every screen — the column, the field, the hint, the refusal from the server |
| API key (the ONE term since v0.43.0 — English retired "API token") | clave de API (pl. *claves de API*) | every screen: *Claves de API*, *Nueva clave de API*, *clave de API creada* |
| token (somebody else's — a Bearer token, an OIDC *token endpoint*, a plugin's remote token) | token | the only surviving use; never for a filex API key |
| access key / secret key | clave de acceso / clave secreta | |
| secret (a webhook/client secret) | secreto | |
| scope (OIDC only) | ámbito | ⚠ ONLY the OIDC scope names an identity provider defines (`authProviders.fields.scopes`). What an API key may do is a **permission** since v0.43.0, and `search.scope` ("Look in") is no longer a scope at all |
| claim (OIDC) | claim | "Role claim" → *Claim de rol* |
| header (HTTP) | encabezado | |
| endpoint | endpoint | kept, as in the S3/AWS consoles |
| bucket | bucket | kept |
| export (NFS) | exportación | |
| path / root | ruta / raíz | |
| host / port | host / puerto | |
| quota | cuota | |
| retention | retención | |
| job / queue / queued | tarea / cola / en cola | |
| operation | operación | operations tray → *bandeja de operaciones* |
| audit log | registro de auditoría | |
| log | registro | |
| replica / replication | réplica / replicación | |
| webhook | webhook | |
| search index | índice de búsqueda | |
| storage scan / scan exclusions | escaneo / rutas excluidas del escaneo | the walk over a storage (*Escanear cada*); a virus scan stays *análisis* |
| catalogue (what the scan records) | catálogo | "not catalogued" → *no se incorporan al catálogo* |
| pattern (glob) | patrón (glob) | *Patrón de ruta*; the pattern itself (`.git`, `*.tmp`, `downloads/incomplete/**`) stays as written |
| emptying the trash / server log | vaciado de la papelera / registro del servidor | "Emptying the trash…" → *Vaciando la papelera…* |
| preview | vista previa | |
| details panel (inspector) | panel de detalles | |
| command palette | paleta de comandos | |
| keyboard shortcut | atajo de teclado | |
| tour | recorrido | |
| explorer | explorador | |
| desktop app | aplicación de escritorio | |
| computer | equipo | neutral; avoids *ordenador* / *computadora* |
| settings / preferences | configuración / preferencias | |
| appearance / theme / palette | apariencia / tema / paleta | |
| branding | marca | |
| dashboard | panel principal | |
| usage & cost | uso y costo | |
| update (software) / upgrade | actualización / actualizar | |
| default | predeterminado | "Reset to default" → *Restablecer valores predeterminados* |
| custom / customize | personalizado / personalizar | |
| enable / disable / enabled / disabled / on / off | activar / desactivar / activado / desactivado | |
| healthy / reachable / unreachable | operativo / accesible / inaccesible | |
| pending / running / failed / done | pendiente / en ejecución / fallido / completado | "Done" button → *Listo* |
| retry / try again | reintentar / volver a intentarlo | |
| dismiss | descartar | |
| undo | deshacer | |
| refresh / reload | actualizar / recargar | |
| reset | restablecer | |
| enter (type into a field) | escribir | *Escriba un número…* |
| click / right-click / tap / tick | hacer clic / hacer clic con el botón derecho / tocar / marcar | |
| drag / drop | arrastrar / soltar | |
| required / optional | obligatorio / opcional | |
| probe (conformance) | prueba | "Conformance report" → *Informe de conformidad* |
| wake-up (scheduled app) | activación | |
| payload / severity | carga útil / gravedad | |
| language pack | paquete de idioma | |
| string (a translatable text) | cadena | "{count} strings" → *{count} cadenas* |
| translated (coverage) | traducido | "{percent}% translated" → *{percent}% traducido* |
| grant (verb, in the share dialog) | dar acceso / conceder | "Create user + grant" → *Crear usuario y dar acceso* |
| e-mail salutation "Hello," | *Hola:* | Spanish letters take a colon after the salutation |
| slot (a free concurrency slot) | espacio (libre) | not *hueco* (Spain-colloquial) |
| mouse | — | avoided: *ratón* is Spain-only, *mouse* Latin-American. Rephrased ("al hacer clic", "con el puntero") |
| backend | backend | kept, as developers say it |

## Plurals — Spanish's CLDR categories

Since filex v0.43.0 every table picks a form by the **CLDR category** of the count in the reader's
language (`Intl.PluralRules` in the browser, `x/text` on the server). Spanish has **two**: `one`
(exactly 1) and `other` (everything else, 0 included).

| Where | How the forms are written |
|---|---|
| explorer / server keys | `key_one` beside the plain key, **which is `other`** (there is no `key_other`) |
| admin keys (vue-i18n) | **two** forms in ONE string, split by a bar: `one | other`. ⚠ Never three — at three branches the renderer switches to the classic rule and sends 0 to the first one |

- **Every form keeps the count placeholder** — `"{n} elemento"`, never `"1 elemento"`. A literal
  digit is the bug v0.43.0 fixed in filex's own English and Turkish, and the ten `server.*`
  `_one` forms whose English still types `1` are written with `{count}` here anyway (the server
  always fills it; `srvtext.Plural` sets `count` before every other value).
- **A form is written only where the words change.** `"{n}%"`, `"{n} / {m}"`, `"Página {n} de {m}"`,
  `"{i} de {n}"`, `"Versión {n}"`, `"Mostrar {count} más"` read the same for every count and
  deliberately have no `_one`; the validator lists them under `--plurals` and that is expected.
- **Never write `_zero`, `_two`, `_few` or `_many`.** Spanish has no such category; the validator
  reports the key as `UNUSED` and filex never shows it. (Modern CLDR does list `many` for Spanish,
  but only for exact millions — filex deliberately treats Spanish as `one` / `other`.)

## Decisions that were hard (and why)

- **storage → *almacenamiento*.** Long (15 letters) but the only term that means a mounted backend
  and not a physical disk. One tile cannot fit the plural: the dashboard stat card
  (`dashboard.stats.storages`, uppercase, no wrap, overflow visible) has a 72 px label box at
  1024 px and 114 px at 1280 px, and *ALMACENAMIENTOS* measures 120 px — it spills out of the
  card at every width. There the label is the abbreviation **Almacen.** (61 px), which is the
  same width the English *Storages* takes. ⚠ It was *Unidades* until v0.43.0; that was the one
  place this pack called a storage a drive, and the release removed exactly that word from the
  English, so the tile now abbreviates the real term instead of borrowing a wrong one.
- **plugin → *complemento*, app → *aplicación*.** filex has two kinds of extension and English keeps them
  apart as "plugin" (a storage driver) and "app" (a WebAssembly app). Leaving *plugin* in English would
  have blurred that; *complemento* / *aplicación* keep the split visible.
- **label ≠ tag.** *Etiqueta* is reserved for tags (a user-facing feature). A token's/key's "label" is
  *Descripción*; an app's "Label" field beside "Name" is *Título*.
- **share (link) vs SMB share.** A share link is *enlace compartido*; the SMB/CIFS network share is
  *recurso compartido* — the term Spanish Windows uses.
- **Sync runs in the side nav → *Sincronizaciones*.** *Ejecuciones de sincronización* is kept for the page
  title, but was cut with an ellipsis in the 240 px admin side nav (measured).
- **Auth providers in the side nav → *Proveedores de acceso*** (page title keeps *Proveedores de autenticación*).
- **Active syncs tile → *Sinc. activas*.** The only abbreviation in the pack: a single 16-letter word
  (*Sincronizaciones*) clipped in the tile at 1280 px; two short words wrap like "TAREAS EN COLA".
- **Client software instructions** (FileZilla, WinSCP, Cyberduck) use the menu names of their Spanish
  builds (*Archivo → Gestor de sitios → Nuevo sitio*, *Nuevo marcador*). Option strings a Spanish build may
  not translate stay in English inside quotes ("Use virtual host style"). **A reviewer should verify
  these against the current Spanish builds.**
- **Windows / macOS names** are the Spanish system names (*Este equipo*, *Conectar a unidad de red…*,
  *Símbolo del sistema*, *Ir → Conectarse al servidor…*, *Ubicaciones*, *Configuración del Sistema*).
- **Gender agreement** follows the thing described, so the same English word can have two forms:
  *Activado* (webhook, plugin) vs *Activada* (rule, app, 2FA); *Instalado* (plugin) vs *Instalada* (app).
- **Dash style.** English " — " is kept in some explanatory sentences and turned into ":" in others; both
  read naturally in Spanish UI text. A native reviewer may want to unify it.
- **"Done"**: *Listo* on a button that closes a step, *Completado* as a status.
