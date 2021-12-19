// TODO: write tests
export default function removeCarriageReturns(fileContents: string) {
  return fileContents.replace(new RegExp('\r', 'g'), '');
}
