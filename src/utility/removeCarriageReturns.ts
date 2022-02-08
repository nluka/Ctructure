export default function removeCarriageReturns(input: string) {
  return input.replace(/\r/g, '');
}
