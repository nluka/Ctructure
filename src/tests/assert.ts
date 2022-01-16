import path = require('path');
import format from '../format';

export default function assert(
  filePathname: string,
  expectedFormat: string,
  description: string,
  shouldConsoleLogFormatResult = false,
) {
  test(`${description}`, () => {
    const formatResult = format(path.resolve(__dirname, filePathname));
    if (shouldConsoleLogFormatResult) {
      console.log(formatResult);
    }
    expect(formatResult).toBe(expectedFormat);
  });
}
