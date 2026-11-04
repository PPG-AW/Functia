export const REFRESH_EVENT = "functia:refresh";

export function emitRefresh() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(REFRESH_EVENT));
}
