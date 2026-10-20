# Vouch

**Agent work, with receipts.**

Vouch is a local-first flight recorder for agent work across the browser and the
Mac. It records an explicit sequence of tool calls, captures the evidence each
call produced, seals the run into a SHA-256 chain, and renders the result as a
reviewable artifact.

- **Live:** [vouch-chaitu0608.vercel.app](https://vouch-chaitu0608.vercel.app)
- **Source:** [github.com/chaitu0608/vouch](https://github.com/chaitu0608/vouch)

> Browser agents stop at the tab. Desktop agents stop at the app. Vouch records
> both, with the receipt.

## Why this exists

A prompt and a tool name are not a record of what happened. The consequential
part — the logged-in tab, the native window, the approval before a submit — is
exactly what ordinary observability never sees.

A screenshot is not a sequence. A chat transcript is not an artifact. Vouch
turns the run itself into the durable object:

- every tool call, with arguments and a result excerpt;
- the surface it happened on: browser or native;
- the evidence it produced, including screenshots and redacted native markers;
- the approval state beside the action;
- a hash chain and a manifest that fail if the file is edited.

## What is in the box

### Two surfaces

| Surface | Tools | Runtime |
| --- | --- | --- |
| Browser | 17 | Real Chrome session with the extension |
| Native | 4 | macOS accessibility / OCR runtime |
| **Total** | **21** | One local MCP bridge |

The browser surface sees the actual tab: tabs, DOM snapshots, screenshots,
navigation, clicks, typing, keys, scrolling, and ref release. No headless clone
and no separate login state.

The native surface sees the Mac: screen observation, runtime stats, a gated
native task, and one fixed handoff. Raw screen output is always replaced by a
redaction marker before it reaches the artifact.

### One artifact

```json
{
  "id": "run-admin",
  "mode": "live",
  "events": [
    {
      "tool": "browser_snapshot",
      "surface": "web",
      "readOnly": true,
      "status": "ok",
      "args": { "tabId": 42 },
      "evidence": [{ "kind": "screenshot", "src": "/evidence/admin-route.jpg" }],
      "prevHash": "GENESIS",
      "hash": "…"
    }
  ],
  "integrity": {
    "algorithm": "SHA-256",
    "head": "…",
    "events": 10,
    "manifest": "…"
  }
}
```

The viewer is static. It reads bundled JSON or a file you drop in. The import
never leaves the browser; it uses the File API and `localStorage`.

## Quick start

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. The three bundled runs are available without a
local bridge, Chrome, or the native runtime.

### Verify a run offline

```bash
npm run verify -- data/runs/run-admin.json
# ok · run-admin.json · 10 events · chain intact · manifest matches
```

`npm run verify:all` checks every bundled run. The same algorithm runs in the
browser in `lib/chain.ts`.

### Diff two runs

```bash
npm run diff -- data/runs/run-a.json data/runs/run-b.json
npm run diff -- data/runs/run-a.json data/runs/run-b.json --fail
```

The diff walks the run metadata and every event: title, surface, arguments,
result excerpt, evidence, approval state, and status. Use `--fail` in CI when a
re-record is expected to be identical.

### Record a run

You need:

1. The local MCP bridge running.
2. Chrome with the browser extension loaded.
3. The native runtime, only if you want the optional screen observation.

Then:

```bash
node scripts/record-run.mjs \
  --task "Verify the admin endpoint" \
  --url http://127.0.0.1:4311/api/admin/users \
  --native \
  --out data/runs/my-run.json \
  --yes
```

`--yes` acknowledges the two confirmed browser mutations: opening the tab and
releasing the refs. There is no click, type, submit, send, or arbitrary native
task in the recorder.

Set `VOUCH_MCP` to point at the bridge entry point if it is not in the default
local location.

### Seal and publish

```bash
npm run seal   # recompute the chain and manifest for every JSON file
npm run build  # prebuild runs seal automatically
```

Commit the sealed JSON and any evidence images under `public/evidence/`. The
static pages are generated at build time.

## Architecture

```text
local bridge (MCP, stdio)
  ├── browser surface ── 17 tools ──► Chrome extension ──► your real tab
  └── native surface  ──  4 tools ──► macOS runtime
             │
             ▼
      Vouch recorder
      (explicit sequence)
             │
             ▼
      data/runs/*.json
      SHA-256 chain + manifest
             │
             ▼
      static viewer on Vercel
      replay · inspect · verify · export
```

The bridge enforces its own read/confirm/approve gates. The recorder stores the
approval state; it is not an approval mechanism.

## Safety model

Every tool has one of three classes:

- **Read-only** — page structure, screenshot, tab inventory, native observation,
  runtime stats.
- **Confirm** — opening or navigating a tab, typing, pressing a key, scrolling,
  releasing refs, fixed native handoff.
- **Approve** — submit/send/pay/delete clicks, or a whole-Mac native task.

The shipped recorder only calls read-only tools plus two confirmed browser
mutations (`open`, `release`). It has no submit path, no message sender, and no
arbitrary native task.

Additional boundaries:

- raw native observations are **redacted before sealing**;
- runs are labeled `live`, `sample`, or `imported`;
- the hosted viewer cannot execute anything;
- `/api/live` fails closed on Vercel because `127.0.0.1` is the visitor's
  machine, not the deployment's;
- there is no account, database, upload endpoint, or telemetry.

## Scope

Vouch v0.1 is **a recorder, not a proxy**. It drives a known sequence and records
each call. It does not intercept an arbitrary agent session, choose the next
tool call, widen a permission, or retry a mutation. That boundary keeps the run
small enough to read, diff, and trust.

The native surface is optional. If it is unavailable, the browser record is
unaffected and the run contains a blocked native event only when one was
requested.

## Bundled runs

| Run | Mode | What it shows |
| --- | --- | --- |
| `run-admin` | **live** | A real browser capture against a synthetic vulnerable corpus app, with a redacted native observation. |
| `run-supabase` | sample | A read-only job qualification across both surfaces. |
| `run-payout` | sample | A cross-app finance check that finds a mismatch and stops before editing. |

Samples are labeled as samples everywhere. The live run is the one to inspect
for real evidence.

## Project map

```text
app/                    Next.js App Router pages and metadata
components/             viewer, run player, tool atlas, import, UI
components/bencho/      adapted MIT blocks with attribution
data/runs/              sealed run JSON
lib/chain.ts            canonicalization and in-browser verifier
lib/tools.ts            the 21-tool surface
public/evidence/        screenshot evidence
scripts/record-run.mjs  local recorder
scripts/seal-runs.mjs   chain + manifest sealer
scripts/verify-run.mjs  offline verifier
scripts/diff-runs.mjs   event-level run diff
```

## Design

Warm paper, black ink, a single vermilion signal accent. Instrument Sans for the
interface, Instrument Serif for the display, JetBrains Mono for the evidence.
The layout is deliberately quiet: the artifact is the loudest thing on the page.

Three adapted [Bencho](https://bencho.dev) blocks are used under the MIT license:
a step rail for run playback, a reviewer checklist, and stacked tool-mix bars.
Attribution is in [`components/bencho/LICENSE`](components/bencho/LICENSE).

## Deploy

```bash
npx vercel --prod
```

The viewer is fully static; only `/api/live` is dynamic and it fails closed on a
hosted deployment. No environment variables are required.

## License

Source is available for review and reuse. The bundled run data is synthetic
except for the live capture; evidence images are from a disposable local corpus.
