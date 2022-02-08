export default function indexOfRegex(
  string: string,
  regex: RegExp,
  startPos: number,
) {
  for (let i = startPos; i < string.length; ++i) {
    if (string.charAt(i).match(regex)) {
      return i;
    }
  }
  return null;
}
