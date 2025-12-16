let buffer = "";

export function debug(title: string, data?: any) {
  const el = document.getElementById("debug-log");

  const msg =
    "\n=== " +
    title +
    " ===\n" +
    (data !== undefined
      ? typeof data === "string"
        ? data
        : JSON.stringify(data, null, 2)
      : "");

  buffer += msg + "\n";

  if (el) {
    el.textContent = buffer;
  }
}
