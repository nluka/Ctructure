import TokenArray from '../../lexer/TokenArray';
import formatFile from '../formatter';

export default function assert(thing: [[string, TokenArray], string, string]) {
  test(`test type: ${thing[2]}`, () => {
    const stringed = formatFile(thing[0]);
    //console.log(stringed);
    expect(stringed).toBe(thing[1]);
  });
}
