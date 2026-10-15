import { useEffect, useState } from "react";

// A page change is a view transition (App.tsx). Its animations run on the
// compositor, so they stay smooth while the new page is being built — as long as
// that building doesn't hold up the transition's very first frame. The costly
// part of a page (compiling WebGL shaders, building metal masks) therefore waits
// until the transition has started, then gets on with it while it plays.

let pending: Promise<void> | null = null;

/** App.tsx: a transition has been asked for; `ready` settles once it's on screen. */
export function markTransition(ready: Promise<unknown>) {
  const settled = ready.then(
    () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())),
    () => undefined,
  );
  pending = settled;
  void settled.then(() => {
    if (pending === settled) pending = null;
  });
}

/** True once heavy set-up may run: straight away normally; during a page change,
 *  a frame after the transition has started. */
export function useTransitionReady() {
  const [ready, setReady] = useState(() => !pending);
  useEffect(() => {
    if (ready) return;
    let live = true;
    void (pending ?? Promise.resolve()).then(() => live && setReady(true));
    return () => {
      live = false;
    };
  }, [ready]);
  return ready;
}
