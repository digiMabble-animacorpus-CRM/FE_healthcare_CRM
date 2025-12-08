let controller = new AbortController();

export function abortAll() {
  controller.abort();
  controller = new AbortController();
}

export function getSignal() {
  return controller.signal;
}
