export default function removeCarriageReturns(input: string) {
  if (input.includes('\r')) {
    return input.replace(/\r/g, '');
  } else {
    // There are no carriage returns to remove, do nothing
    return input;
  }
}
