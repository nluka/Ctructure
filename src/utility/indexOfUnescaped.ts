export default function indexOfUnescaped(
  string: string,
  searchChar: string,
  startIndex: number,
) {
  let searchCount = 0;
  let index = startIndex;

  while (true) {
    index = string.indexOf(searchChar, searchCount === 0 ? index : index + 1);
    if (index === -1) {
      return -1;
    }
    const isEscaped = string.charAt(index - 1) === '\\';
    if (!isEscaped) {
      return index;
    }
    ++searchCount;
  }
}
