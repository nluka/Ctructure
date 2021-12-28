const regex = /\r/g;

export default function removeCarriageReturns(input: string) {
  return input.replace(regex, '');
}
