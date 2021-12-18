/*
  Some notes:
  - any functions/classes/types starting with underscores are considered
    internal, they are only exported to allow testing
  - any variables that are not exported are considered internal and are not
    needed for clients of this module
*/

import { readFileSync } from 'fs';
import TokenArray from './TokenArray';

export enum TokenType {
  // Special
  specialComma,
  specialDot,
  specialSemicolon,
  specialBracketLeft,
  specialBracketRight,
  specialParenLeft,
  specialParenRight,
  specialBraceLeft,
  specialBraceRight,

  // Preprocessor (https://www.cprogramming.com/reference/preprocessor/)
  preproDirectiveNull,
  preproOperatorConcat,
  preproDirectiveInclude,
  preproStandardHeader,
  preproDirectiveDefine,
  preproDirectiveContinuation,
  preproDirectiveUndef,
  preproDirectiveIf,
  preproDirectiveIfdef,
  preproDirectiveIfndef,
  preproMacroError,
  preproMacroFile,
  preproMacroLine,
  preproMacroDate,
  preproMacroTime,
  preproMacroTimestamp,
  preproDirectivePragma,

  // Unary operators
  operatorUnaryIncrement,
  operatorUnaryDecrement,
  operatorUnaryOnesComplement,
  operatorUnaryLogicalNegation,
  operatorUnaryIndirection,
  operatorUnaryDereference,
  // Binary operators
  operatorBinaryAdd,
  operatorBinarySubtract,
  operatorBinaryDivide,
  operatorBinaryMultiply,
  operatorBinaryModulus,
  operatorBinaryEqual,
  operatorBinaryNotEqual,
  operatorBinaryGreater,
  operatorBinaryGreaterEqual,
  operatorBinaryLess,
  operatorBinaryLessEqual,
  operatorBinaryLogicalAnd,
  operatorBinaryLogicalOr,
  operatorBinaryBitwiseAnd,
  operatorBinaryBitwiseOr,
  operatorBinaryBitwiseXor,
  operatorBinaryBitwiseShiftLeft,
  operatorBinaryBitwiseShiftRight,
  operatorBinaryAssignment,
  operatorBinaryAddAssignment,
  operatorBinarySubtractAssignment,
  operatorBinaryMultiplyAssignment,
  operatorBinaryDivideAssignment,
  operatorBinaryModulusAssignment,
  operatorBinaryBitwiseShiftLeftAssignment,
  operatorBinaryBitwiseShiftRightAssignment,
  operatorBinaryBitwiseAndAssignment,
  operatorBinaryBitwiseOrAssignment,
  operatorBinaryBitwiseXorAssignment,
  // Miscellanous operators
  operatorMiscTernaryQuestion,
  operatorMiscTernaryColon,

  // Constants
  constantNumber,
  constantCharacter,
  constantString,

  // Keywords (https://en.cppreference.com/w/c/keyword)
  keywordAlignas,
  keywordAlignof,
  keywordAuto,
  keywordAtomic,
  keywordBool,
  keywordBreak,
  keywordCase,
  keywordChar,
  keywordComplex,
  keywordConst,
  keywordContinue,
  keywordDefault,
  keywordDo,
  keywordDouble,
  keywordElse,
  keywordEnum,
  keywordExtern,
  keywordFloat,
  keywordFor,
  keywordGeneric,
  keywordGoto,
  keywordIf,
  keywordImaginary,
  keywordInt,
  keywordLong,
  keywordNoreturn,
  keywordRegister,
  keywordReturn,
  keywordShort,
  keywordSigned,
  keywordSizeof,
  keywordStatic,
  keywordStaticassert,
  keywordStruct,
  keywordSwitch,
  keywordThreadlocal,
  keywordTypedef,
  keywordUnion,
  keywordUnsigned,
  keywordVoid,
  keywordVolatile,
  keywordWhile,

  // Other
  identifier,
  label,
}

// TODO: write tests (once fully implemented)
/**
 * Tokenizes a file, encoding each token into a 32-bit number (using `_tokenEncode`).
 * Each token stores its starting index in the first 24-bits and the type
 * (`TokenType`) in the remaining 8 bits. Use `tokenDecode` to extract the start
 * index and type for any encoded token.
 * @param filePathname The pathname of the file to tokenize.
 * @returns An array of encoded tokens in their order of appearance in the file.
 */
export function tokenizeFile(filePathname: string): TokenArray {
  const fileContents = _removeCarriageReturns(
    readFileSync(filePathname).toString(),
  );
  const tokenizer = new _Tokenizer(fileContents);
  // TODO: figure out good formula for initial size of TokenArray
  const tokens = new TokenArray(fileContents.length);

  // while (1) {
  for (let i = 0; i < 1; ++i) {
    const extractedToken = tokenizer.extractNextTokenEncoded();
    if (extractedToken === null) {
      break;
    }
    tokens.push(extractedToken);
  }

  // console.log('token count =', tokens.getCount());
  // for (let i = 0; i < tokens.getCount(); ++i) {
  //   const [startIndex, type] = tokenDecode(tokens.getAtIndex(i));
  //   console.log(`tokens[${i}]: ${startIndex} ${type}`);
  // }

  return tokens;
}

// TODO: write tests
export function _removeCarriageReturns(fileContents: string) {
  return fileContents.replace(new RegExp('\r', 'g'), '');
}

export class _Tokenizer {
  private cursorPosition = 0;

  constructor(private fileContents: string) {}

  public extractNextTokenEncoded(): number | null {
    const isThereAnotherToken = this.moveToNextToken();
    if (!isThereAnotherToken) {
      return null;
    }

    const tokenCategory = _determineTokenCategory(
      this.fileContents.charAt(this.cursorPosition),
      this.cursorPosition,
    );

    const tokenLastIndex = _determineTokenLastIndex(
      this.fileContents,
      this.cursorPosition,
      tokenCategory,
    );

    const tokenType = _determineTokenType(
      this.fileContents,
      this.cursorPosition,
      tokenLastIndex,
      tokenCategory,
    );

    const encodedToken = _tokenEncode(this.cursorPosition, tokenType);
    return encodedToken;
  }

  /**
   * Moves `this.cursorPosition` to the starting index of the next token (or
   * the end of file if no more tokens exist).
   * @returns True if another token exists, false otherwise.
   */
  private moveToNextToken(): boolean {
    const currentChar = this.fileContents.charAt(this.cursorPosition);

    while (1) {
      if (this.cursorPosition >= this.fileContents.length) {
        // Reached end of file
        return false;
      }
      if (!currentChar.match(/[ \\n\\t]/)) {
        // Reached next token
        return true;
      }
      ++this.cursorPosition;
    }

    return false; // to satisfy tsc
  }
}

export enum _TokenCategory {
  special,
  prepro,
  preproOrOperator,
  operator,
  constant,
  preproMacroOrKeywordOrIdentifierOrLabel,
}

/**
 * Determines the category of a token based on its first character.
 * @param tokenFirstChar A string whose first char is the first char of the token.
 * @param tokenStartIndex The starting index of the token.
 * @returns The category of the token - throws `TokenCategoryDeterminationError`
 * if category cannot be determined.
 */
export function _determineTokenCategory(
  tokenFirstChar: string,
  tokenStartIndex: number,
): _TokenCategory {
  if (tokenFirstChar.match(/^#/)) {
    return _TokenCategory.prepro;
  }
  if (tokenFirstChar.match(/^[<\\]/)) {
    return _TokenCategory.preproOrOperator;
  }
  if (tokenFirstChar.match(/^[a-zA-Z_]/)) {
    return _TokenCategory.preproMacroOrKeywordOrIdentifierOrLabel;
  }
  if (tokenFirstChar.match(/^[0-9'"]/)) {
    return _TokenCategory.constant;
  }
  if (tokenFirstChar.match(/^[+\-~!*/%=>&|^?:]/)) {
    return _TokenCategory.operator;
  }
  if (tokenSpecialValueToTypeMap.get(tokenFirstChar) !== undefined) {
    return _TokenCategory.special;
  }

  throw new TokenCategoryDeterminationError(tokenStartIndex, tokenFirstChar);
}

export class TokenCategoryDeterminationError {
  constructor(
    public readonly tokenStartIndex: number,
    public readonly tokenFirstChar: string,
  ) {}
}

// TODO: implement
export function _determineTokenLastIndex(
  fileContents: string,
  startIndex: number,
  category: _TokenCategory,
): number {
  throw new Error('not implemented');
}

const tokenSpecialValueToTypeMap = new Map<string, TokenType>([
  ['.', TokenType.specialDot],
  [',', TokenType.specialComma],
  [';', TokenType.specialSemicolon],
  ['[', TokenType.specialBracketLeft],
  [']', TokenType.specialBracketRight],
  ['(', TokenType.specialParenLeft],
  [')', TokenType.specialParenRight],
  ['{', TokenType.specialBraceLeft],
  ['}', TokenType.specialBraceRight],
]);

const tokenPreprocessorValueToTypeMap = new Map<string, TokenType>([
  ['#include', TokenType.preproDirectiveInclude],
  ['#define', TokenType.preproDirectiveDefine],
  ['#undef', TokenType.preproDirectiveUndef],
  ['#if', TokenType.preproDirectiveIf],
  ['#ifdef', TokenType.preproDirectiveIfdef],
  ['#ifndef', TokenType.preproDirectiveIfndef],
  ['#error', TokenType.preproMacroError],
  ['__FILE__', TokenType.preproMacroFile],
  ['__LINE__', TokenType.preproMacroLine],
  ['__DATE__', TokenType.preproMacroDate],
  ['__TIME__', TokenType.preproMacroTime],
  ['__TIMESTAMP__', TokenType.preproMacroTimestamp],
  ['#pragma', TokenType.preproDirectivePragma],
]);

const tokenKeywordValueToTypeMap = new Map<string, TokenType>([
  ['_Alignas', TokenType.keywordAlignas],
  ['alignas', TokenType.keywordAlignof],
  ['auto', TokenType.keywordAuto],
  ['_Atomic', TokenType.keywordAtomic],
  ['atomic', TokenType.keywordAtomic],
  ['_Bool', TokenType.keywordBool],
  ['bool', TokenType.keywordBool],
  ['auto', TokenType.keywordAuto],
  ['break', TokenType.keywordBreak],
  ['case', TokenType.keywordCase],
  ['char', TokenType.keywordChar],
  ['_Complex', TokenType.keywordChar],
  ['complex', TokenType.keywordChar],
  ['const', TokenType.keywordConst],
  ['continue', TokenType.keywordContinue],
  ['default', TokenType.keywordDefault],
  ['do', TokenType.keywordDo],
  ['double', TokenType.keywordDouble],
  ['else', TokenType.keywordElse],
  ['enum', TokenType.keywordEnum],
  ['extern', TokenType.keywordExtern],
  ['float', TokenType.keywordFloat],
  ['for', TokenType.keywordFor],
  ['_Generic', TokenType.keywordGeneric],
  ['generic', TokenType.keywordGeneric],
  ['goto', TokenType.keywordGoto],
  ['if', TokenType.keywordIf],
  ['_Imaginary', TokenType.keywordImaginary],
  ['imaginary', TokenType.keywordImaginary],
  ['int', TokenType.keywordInt],
  ['long', TokenType.keywordLong],
  ['_Noreturn', TokenType.keywordNoreturn],
  ['noreturn', TokenType.keywordNoreturn],
  ['register', TokenType.keywordRegister],
  ['return', TokenType.keywordReturn],
  ['short', TokenType.keywordShort],
  ['signed', TokenType.keywordSigned],
  ['sizeof', TokenType.keywordSizeof],
  ['static', TokenType.keywordStatic],
  ['_Static_assert', TokenType.keywordStaticassert],
  ['static_assert', TokenType.keywordStaticassert],
  ['struct', TokenType.keywordStruct],
  ['_Thread_local', TokenType.keywordThreadlocal],
  ['thread_local', TokenType.keywordThreadlocal],
  ['switch', TokenType.keywordSwitch],
  ['typedef', TokenType.keywordTypedef],
  ['union', TokenType.keywordUnion],
  ['unsigned', TokenType.keywordUnsigned],
  ['void', TokenType.keywordVoid],
  ['volatile', TokenType.keywordVolatile],
  ['while', TokenType.keywordWhile],
]);

// TODO: implement
export function _determineTokenType(
  fileContents: string,
  startIndex: number,
  lastIndex: number,
  category: _TokenCategory,
): TokenType {
  // const rawToken = fileContents.slice(startIndex, lastIndex + 1);
  throw new Error('not implemented');
}

/**
 * Encodes the start index (left 24 bits) and type (right 8 bits) into a single
 * number which can then be decoded with `tokenDecode`.
 * @param startIndex The startIndex of the token.
 * @param type The type of the token.
 * @returns The encoded token.
 */
export function _tokenEncode(startIndex: number, type: TokenType): number {
  let encodedToken = 0;
  encodedToken = (encodedToken | startIndex) << 8; // encode startIndex into leftmost 24 bits
  encodedToken = encodedToken | type; // encode type into rightmost 8 bits
  return encodedToken;
}

/**
 * Extracts the start index and type from an encoded token.
 * @param token The encoded token to decode.
 * @returns The start index and the token type as an array of 2 elements.
 */
export function tokenDecode(token: number): [number, TokenType] {
  const extractedStartIndex = (token & 0xffffff00) >>> 8; // extract leftmost 24 bits
  const extractedType = token & 0x000000ff; // extract rightmost 8 bits
  return [extractedStartIndex, extractedType];
}
