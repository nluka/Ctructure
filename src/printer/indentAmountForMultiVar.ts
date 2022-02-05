export default function getIndentAmountForMultiVar(
  formattedFileStr: string,
): number {
  let startIndex = 0;
  let assignmentFound = false;
  let i = formattedFileStr.length - 1;

  for (let testIndex = i; testIndex >= 0; --testIndex) {
    const char = formattedFileStr.charAt(testIndex);
    if (char === '=' && formattedFileStr.charAt(testIndex - 1) === ' ') {
      assignmentFound = true;
      i = testIndex - 2;
      break;
    } else if (char === '\n') {
      --i;
      break;
    }
  }

  for (; i >= 0; --i) {
    const char = formattedFileStr.charAt(i);
    if (char === ' ' && startIndex === 0) {
      startIndex = i;
    } else if (char === '\n') {
      return startIndex - i;
    }
  }

  return 0;
}
