import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type LocalState = {
  connections?: {
    localBrowser?: { connected?: boolean };
    extension?: { connected?: boolean };
    clinqy?: { connected?: boolean };
  };
};

/**
 * The only network call the viewer makes: ask the local Job Pilot server
 * whether the two engines are alive. On Vercel this fails closed — 127.0.0.1
 * is the visitor's machine, not the deployment's.
 */
export async function GET() {
  try {
    const response = await fetch("http://127.0.0.1:8787/api/state", {
      cache: "no-store",
      signal: AbortSignal.timeout(1500),
    });

    if (!response.ok) {
      throw new Error(`Local runtime returned HTTP ${response.status}`);
    }

    const state = (await response.json()) as LocalState;
    const browsy = Boolean(
      state.connections?.localBrowser?.connected ||
        state.connections?.extension?.connected
    );
    const clinqy = Boolean(state.connections?.clinqy?.connected);

    return NextResponse.json({
      live: true,
      browsy,
      clinqy,
      checkedAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({
      live: false,
      browsy: false,
      clinqy: false,
      checkedAt: new Date().toISOString(),
      error:
        "Local runtime not reachable from this deployment. That is expected on a static host.",
    });
  }
}
