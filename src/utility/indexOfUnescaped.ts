export default function indexOfUnescaped(
  str: string,
  searchChar: string,
  escapeChar: string,
  startPos = 0,
) {
  for (let pos = startPos; pos < str.length; ++pos) {
    if (str.charAt(pos) !== searchChar) {
      continue;
    }

    let escapeCount = 0;
    for (let i = pos - 1; i >= 0; --i) {
      if (str.charAt(i) === escapeChar) {
        ++escapeCount;
      } else {
        break;
      }
    }

    const isEscaped = !isEven(escapeCount);
    if (!isEscaped) {
      return pos;
    }
  }

  return -1;
}

function isEven(num: number) {
  return num % 2 === 0;
}
