export default function indexOfRegex(
  str: string,
  regex: RegExp,
  startPos: number,
): number | -1 {
  for (let i = startPos; i < str.length; ++i) {
    if (str.charAt(i).match(regex)) {
      return i;
    }
  }
  return -1;
}
