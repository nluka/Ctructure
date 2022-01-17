export default function indexOfRegex(string: string, regex: RegExp, startIndex: number) {
  for (let i = startIndex; i < string.length; ++i) {
    if (string.charAt(i).match(regex)) {
      return i;
    }
  }
  return null;
}
