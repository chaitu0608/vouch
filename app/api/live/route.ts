import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type LocalState = {
  connections?: Record<string, { connected?: boolean } | undefined>;
};

/**
 * The only network call the viewer makes: ask the local bridge whether the
 * two surfaces are alive. On Vercel this fails closed — 127.0.0.1 is the
 * visitor's machine, not the deployment's.
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
    const connections = state.connections ?? {};
    const browser = Boolean(
      connections.localBrowser?.connected || connections.extension?.connected
    );
    const native = Object.entries(connections)
      .filter(([key]) => key !== "localBrowser" && key !== "extension")
      .some(([, value]) => Boolean(value?.connected));

    return NextResponse.json({
      live: true,
      browser,
      native,
      checkedAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({
      live: false,
      browser: false,
      native: false,
      checkedAt: new Date().toISOString(),
      error:
        "Local bridge not reachable from this deployment. That is expected on a static host.",
    });
  }
}
