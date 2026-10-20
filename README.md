# Witness

**The flight recorder for AI agents.** Browsy captures the web. Clinqy captures the Mac. Witness turns both into a verifiable run — every action, snapshot, and screen check, sealed with a SHA-256 hash chain.

The hosted app is an **evidence room**: a renderer for sealed JSON runs. The recorder runs locally, next to Chrome and the Mac. There is no backend, no account, and no upload endpoint.

---

## Why

Your agent can open a tab, read a page, click a button, and ask a native app to look at the screen. Most of that work is invisible to cloud tracing. Chat logs show a story; they do not show what the browser actually rendered or what the Mac actually displayed.

Witness records the **cross-surface** part:

- the exact Browsy tool call and its arguments,
- the result, with screenshots and page snapshots as evidence,
- whether the action was read-only, confirmed, or explicitly approved,
- one redacted Clinqy observation when native context matters,
- **and a hash chain over every event**, plus a manifest seal over the run itself.

Anyone can replay the run and re-verify the chain in the browser.

## What is real here

| Run | Mode | What it is |
| --- | --- | --- |
| `run-admin` | **live** | A real Browsy capture against a synthetic vulnerable corpus app. The screenshots are real evidence. A Clinqy look ran, but its raw output is redacted because it observed unrelated private apps. |
| `run-supabase` | **sample** | Synthetic events for an RLS / membership qualification flow. Clearly labeled in the UI. |
| `run-payout` | **sample** | Synthetic events for a cross-app finance check. Clearly labeled in the UI. |

The live run proves an anonymous `GET /api/admin/users` returned a user record with `200 OK`. It is a small, deliberately safe corpus app — not a production endpoint.

## Architecture

```
Job Pilot MCP server (stdio JSON-RPC)
  ├── Browsy    17 tools → Chrome extension → your real tab
  ├── Clinqy     4 tools → native macOS app
  └── 25 tools          → jobs / memory / workflows (local SQLite)
          │
          │   scripts/record-run.mjs
          │   canonicalize + SHA-256 chain
          ▼
   data/runs/*.json  ── export ──▶  Witness viewer (Vercel)
                                          │
                                    verify in browser
                                    (lib/chain.ts)
```

- **Recorder**: Node, local only. Speaks MCP over stdio to the Job Pilot server.
- **Viewer**: Next.js 15 + React 19 + Tailwind. Static content plus a client-side import.
- **Storage**: bundled JSON for published runs; `localStorage` for imported runs. No database.

## Quickstart

```bash
npm install
npm run dev
# http://localhost:3000
```

The three bundled runs are rendered from `data/runs/*.json`. `npm run dev` does not need Job Pilot, Chrome, or Clinqy.

```bash
npm run seal     # re-seal every run in data/runs
npm run build    # prebuild runs seal, then next build
```

## Record a real run

Prerequisites:

- Job Pilot at `~/jobpilot` with its local server (`127.0.0.1:8787`),
- Chrome running with the Job Pilot extension loaded,
- Clinqy installed if you want the optional native check,
- a disposable browser profile and a page you control.

From this repo:

```bash
node scripts/record-run.mjs \
  --task "Verify the admin endpoint" \
  --url http://127.0.0.1:4311/api/admin/users \
  --native \
  --out data/runs/my-run.json \
  --yes
```

Then:

```bash
npm run seal
npm run dev
```

Open the run, inspect the timeline, and use **Export JSON** to share it. To view someone else's export, use **Capture → Import**: the file is read with the File API and stored in `localStorage`. It is never uploaded.

Set `JOBPILOT_MCP` if the server is not at `../jobpilot/server/mcp.js`.

### What the recorder touches

| Tool | Safety | Purpose |
| --- | --- | --- |
| `browser_list_tabs` | read-only | find the disposable tab |
| `browser_open_tab` | confirm | open exactly the URL you passed |
| `browser_wait` | read-only | let the page settle |
| `browser_snapshot` | read-only | DOM evidence |
| `browser_screenshot` | read-only | viewport evidence |
| `clinqy_look` (opt-in) | read-only | one native observation, stored redacted |
| `browser_release` | confirm | clear refs; the tab stays open |

It does **not** call `browser_click`, `browser_type`, `browser_press_key`, `clinqy_run`, `jobpilot_apply`, or any submit/send/pay/delete path. It refuses to open a tab without `--yes`, and it rejects non-http(s) URLs.

## The 21 engine tools

**Browsy (17)** — `browser_list_tabs`, `browser_snapshot`, `browser_get_html`, `browser_screenshot`, `browser_wait`, `browser_open_tab`, `browser_focus_tab`, `browser_close_tab`, `browser_navigate`, `browser_back`, `browser_forward`, `browser_reload`, `browser_click`, `browser_type`, `browser_press_key`, `browser_scroll`, `browser_release`.

**Clinqy (4)** — `clinqy_look`, `clinqy_stats`, `clinqy_run`, `clinqy_open`.

The full MCP server exposes **46 tools**: those 21 plus 17 job tools, 3 memory tools, and 5 workflow tools. The Engines page maps all 21 engine tools and the groups behind the rest.

## Safety model

- **Read** — no state change. Snapshots, HTML, screenshots, waits, tab lists, native observations.
- **Confirm** — a browser mutation. Opening tabs, navigation, typing, keys, scroll, release, Clinqy handoffs.
- **Approve** — a submit/send/pay/delete click or a whole-Mac task. Refused without explicit human approval.

Witness records the approval state, but it is not an approval mechanism. It never submits an application or sends a message on its own.

## Privacy

- The deployed site has **no upload endpoint**. Imports are client-side.
- Published native observations are **redacted**: the run records that Clinqy looked, not what it saw.
- The only network call the viewer can make is `GET /api/live`, which asks `127.0.0.1:8787` for engine status. On Vercel this correctly fails closed; locally it is a bridge.
- The live capture used a disposable Chrome profile and a synthetic corpus app.

## Verify the chain

Each event commits to the previous hash, and the run manifest commits to the title, verdict, mode, tags, and event head:

```
event hash    = SHA-256(prevHash + "|" + canonicalize(event))
manifest hash = SHA-256(canonicalize(run metadata + event head))
```

`canonicalize` sorts object keys and emits compact JSON. The same algorithm exists in:

- `scripts/seal-runs.mjs` (build time),
- `scripts/record-run.mjs` (capture time),
- `lib/chain.ts` (browser verification).

Change one byte in a published event and verification fails at that event. The chain is **tamper-evident**, not a cryptographic signature: it proves the file has not changed since sealing, not who created it.

## Deploy

```bash
npm i -g vercel
vercel --prod
```

No environment variables. The build runs `prebuild` → `seal` → `next build`, so every deployment gets a deterministic chain over the committed runs.

## Repo layout

```
app/                 routes: overview, runs, engines, capture, api/live
components/          shell, run player, verifier, atlas, import UI
data/runs/           sealed run JSON (one live, two sample)
lib/                 types, chain, tool atlas, run helpers
public/evidence/     real screenshots used by the live run
scripts/             seal-runs.mjs, record-run.mjs
```

## Prior work

Witness follows [Reprove](https://github.com/chaitu0608/reprove), a proof-carrying security scanner with deterministic fixes and a clean-control corpus. The live run was captured against Reprove's synthetic vulnerable API.

## Limits

- This is a local-first prototype, not a hosted agent runtime.
- A hash chain is integrity, not identity. Signing and key management are future work.
- The two sample runs are synthetic and labeled as such.
- Browser evidence is a viewport JPEG plus a DOM excerpt, not a full packet capture.
