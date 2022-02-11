export default function addCarriageReturns(input: string) {
  return input.replace(/\n/g, '\r\n').replace(/\r{2,}/g, '\r');
}
