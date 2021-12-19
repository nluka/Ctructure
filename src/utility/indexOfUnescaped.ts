export default function indexOfUnescaped(
  searchString: string,
  searchChar: string,
  startIndex: number,
) {
  let searchCount = 0;
  let index = startIndex;
  while (1) {
    index = searchString.indexOf(
      searchChar,
      searchCount === 0 ? index : index + 1,
    );
    if (index === -1) {
      return -1;
    }
    const isEscaped = searchString.charAt(index - 1) === '\\';
    if (!isEscaped) {
      return index;
    }
    ++searchCount;
  }
  return -1; // to satisfy tsc
}
