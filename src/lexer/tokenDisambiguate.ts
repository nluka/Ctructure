import TokenArray from './TokenArray';
import TokenType, { isTokenConstant } from './TokenType';
import tokenTypeToNameMap from './tokenTypeToNameMap';

export default function tokenDisambiguate(
  currTokenIndex: number,
  tokens: TokenArray,
): TokenType {
  const prevTokenType = tokens.getTokenDecoded(currTokenIndex - 1)[1];
  const currTokenType = tokens.getTokenDecoded(currTokenIndex)[1];
  const nextTokenType = tokens.getTokenDecoded(currTokenIndex + 1)[1];

  switch (currTokenType) {
    case TokenType.ambiguousPlus: {
      if (
        (prevTokenType === TokenType.identifier ||
          isTokenConstant(prevTokenType)) &&
        (nextTokenType === TokenType.identifier ||
          isTokenConstant(nextTokenType))
      ) {
        return TokenType.operatorBinaryArithmeticAddition;
      }
      return TokenType.operatorUnaryPlus;
    }

    case TokenType.ambiguousMinus: {
      if (
        (prevTokenType === TokenType.identifier ||
          isTokenConstant(prevTokenType)) &&
        (nextTokenType === TokenType.identifier ||
          isTokenConstant(nextTokenType))
      ) {
        return TokenType.operatorBinaryArithmeticSubtraction;
      }
      return TokenType.operatorUnaryMinus;
    }

    case TokenType.ambiguousIncrement: {
      if (prevTokenType === TokenType.identifier) {
        return TokenType.operatorUnaryArithmeticIncrementPostfix;
      }
      if (nextTokenType === TokenType.identifier) {
        return TokenType.operatorUnaryArithmeticIncrementPrefix;
      }
      throw createError(currTokenType, currTokenIndex, tokens);
    }

    case TokenType.ambiguousDecrement: {
      if (prevTokenType === TokenType.identifier) {
        return TokenType.operatorUnaryArithmeticDecrementPostfix;
      }
      if (nextTokenType === TokenType.identifier) {
        return TokenType.operatorUnaryArithmeticDecrementPrefix;
      }
      throw createError(currTokenType, currTokenIndex, tokens);
    }

    case TokenType.ambiguousAsterisk: {
      // Indirection:
      // int *p;
      //     ^
      // CustomType *p;
      //            ^
      // int *p, a;
      //     ^
      // int a, *p = &a;
      //        ^
      // char **argv
      //      ^
      // char **argv
      //       ^
      // [typeKeyword|identifier|comma|indirection] (asterisk) [identifier|asterisk]

      // Dereference:
      // a = *p;
      //     ^
      // a = *p,
      //     ^
      // a = **pp;
      //     ^
      // a = **pp;
      //      ^
      // (*p
      //  ^
      // {*p
      //  ^
      // [*p
      //  ^
      // (**p
      //  ^
      // (**p
      //   ^
      // (a, *p)
      //     ^
      // {a, **pp}
      //     ^
      // {a, **pp}
      //      ^
      // {a, ***pp}
      //      ^
      // a [+-/*] *p
      //          ^
      // [assignmentDirect|
      // dereference|
      // parenLeft|
      // braceLeft|
      // bracketLeft|
      // comma|
      // plus|
      // minus|
      // divide|
      // multiply] (asterisk) [identifier|asterisk]

      // Multiplication:
      // (x * y)
      // (1 * y)
      // (x * 1)
      // (1 * 1)
      //    ^
      // [identifier|constantNumber] (asterisk) [identifier|constantNumber]

      return TokenType.ambiguousAsterisk;
    }

    case TokenType.ambiguousAmpersand: {
      if (
        (prevTokenType === TokenType.identifier ||
          isTokenConstant(prevTokenType)) &&
        (nextTokenType === TokenType.identifier ||
          isTokenConstant(nextTokenType))
      ) {
        return TokenType.operatorBinaryBitwiseAnd;
      }

      if (
        nextTokenType === TokenType.identifier ||
        nextTokenType === TokenType.constantString
      ) {
        return TokenType.operatorUnaryAddressOf;
      }

      throw createError(currTokenType, currTokenIndex, tokens);
    }

    default: {
      throw createError(currTokenType, currTokenIndex, tokens);
    }
  }
}

function createError(
  tokenType: TokenType,
  tokenIndex: number,
  tokens: TokenArray,
) {
  return new Error(
    `${tokenTypeToNameMap.get(tokenType)} at index ${
      tokens.getTokenDecoded(tokenIndex)[1]
    }`,
  );
}
