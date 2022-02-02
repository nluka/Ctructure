export default function indexOfUnescaped(
  string: string,
  searchChar: string,
  escapeChar: string,
  startIndex = 0,
) {
  let searchCount = 0;
  let index = startIndex;

  while (true) {
    index = string.indexOf(searchChar, searchCount === 0 ? index : index + 1);
    if (index === -1) {
      return -1;
    }
    const isEscaped =
      string.charAt(index - 1) === escapeChar &&
      string.charAt(index - 2) !== escapeChar;
    if (!isEscaped) {
      return index;
    }
    ++searchCount;
  }
}
