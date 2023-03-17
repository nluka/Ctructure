export default function getIndentationOfFirstVar(formattedFileStr: string): number {
  let startPos = 0;
  let i = formattedFileStr.length - 1;

  for (let testIndex = i; testIndex >= 0; --testIndex) {
    const char = formattedFileStr.charAt(testIndex);
    if (char === '=' && formattedFileStr.charAt(testIndex - 1) === ' ') {
      i = testIndex - 2;
      break;
    } else if (char === '\n') {
      --i;
      break;
    }
  }

  for (; i >= 0; --i) {
    const char = formattedFileStr.charAt(i);
    if (char === ' ' && startPos === 0) {
      startPos = i;
    } else if (char === '\n') {
      break;
    }
  }

  return startPos - i;
}
