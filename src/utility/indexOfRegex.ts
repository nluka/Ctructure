export default function indexOfRegex(
  searchString: string,
  regex: RegExp,
  startIndex: number,
) {
  for (let i = startIndex; i < searchString.length; ++i) {
    if (searchString.charAt(i).match(regex)) {
      return i;
    }
  }
  return null;
}
