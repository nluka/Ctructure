import TokenArray from '../../lexer/TokenArray';
import formatFile, { toString } from '../formatter';
import testInfoAntC from './antC';
import testInfoAntH from './antH';
import testInfoCommandC from './command_line_argsC';
import testInfoEmptyC from './empty';
import testInfoHandleAddC from './handle_addC';
import testInfoHandleChangeC from './handle_changeC';
import testInfoHeaderGH from './header_w_guardsH';
import testInfoMainC from './mainC';
import testInfoMovieC from './movieC';
import testInfoMovieH from './movieH';
import testInfoMovieOPC from './movie_operationsC';
import testInfoParserC from './parserC';
import testInfoStrC from './strC';
import testInfoStrH from './strH';

export default function assert(thing: [[string, TokenArray], string, string]) {
  test(`test type: ${thing[2]}`, () => {
    const stringed = toString(formatFile(thing[0]));
    //console.log(stringed);
    expect(stringed).toBe(thing[1]);
  });
}

assert(testInfoAntC);
assert(testInfoAntH);
assert(testInfoCommandC);
assert(testInfoEmptyC);
assert(testInfoHandleAddC);
assert(testInfoHandleChangeC);
assert(testInfoHeaderGH);
assert(testInfoMainC);
assert(testInfoMovieC);
assert(testInfoMovieH);
assert(testInfoMovieOPC);
assert(testInfoParserC);
assert(testInfoStrC);
assert(testInfoStrH);
