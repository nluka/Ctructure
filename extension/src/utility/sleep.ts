/**
 * @param timeInMs The number of milliseconds to wait before resolving.
 * @returns A promise that resolves itself after `timeInMs` milliseconds.
 */
export default function sleep(timeInMs: number) {
  return new Promise((resolve) => setTimeout(resolve, timeInMs));
}
