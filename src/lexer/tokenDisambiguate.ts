import findFirstTokenTypeMatchAhead from './findFirstTokenTypeMatchAhead';
import findFirstTokenTypeMatchBehind from './findFirstTokenTypeMatchBehind';
import TokenArray from './TokenArray';
import TokenType, { isTokenConstant } from './TokenType';
import tokenTypeToNameMap from './tokenTypeToNameMap';

export default function tokenDisambiguate(
  currTokenIndex: number,
  tokens: TokenArray,
): TokenType {
  const currTokenType = tokens.getTokenDecoded(currTokenIndex)[1];

  const firstNonNewlineTokenLeading = findFirstTokenTypeMatchBehind(
    tokens,
    currTokenIndex - 1,
    [TokenType.newline],
    false,
  );
  const firstNonNewlineTokenTrailing = findFirstTokenTypeMatchAhead(
    tokens,
    currTokenIndex + 1,
    [TokenType.newline],
    false,
  );
  if (
    firstNonNewlineTokenLeading === null ||
    firstNonNewlineTokenTrailing === null
  ) {
    throw createError(currTokenType, currTokenIndex, tokens);
  }
  const prevTokenType = firstNonNewlineTokenLeading[1];
  const nextTokenType = firstNonNewlineTokenTrailing[1];

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
      if (nextTokenType === TokenType.identifier) {
        return TokenType.operatorUnaryArithmeticIncrementPrefix;
      }
      if (prevTokenType === TokenType.identifier) {
        return TokenType.operatorUnaryArithmeticIncrementPostfix;
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
      /* INDIRECTION CASES: */
      // [typeKeyword|
      // typeQualifierKeyword|
      // identifier|
      // anySpecial|
      // anyBinaryOperator|
      // indirection|
      // anyTernaryOperator]   -> these are all the things that can come directly before
      //   (asterisk)          -> this is the asterisk we are disambiguating
      // [identifier|          -> these are all the things that can come directly after
      // typeQualifierKeyword|
      // anySpecial|
      // anyBinaryOperator|
      // indirection|
      // anyTernaryOperator|
      // anyMemberAccessOperator|
      // constantString]

      /* MULTIPLICATION CASES: */
      // [identifier|constantNumber] -> these are all the things that can come directly before
      // (asterisk)                  -> this is the asterisk we are disambiguating
      // [identifier|constantNumber] -> these are all the things that can come directly after

      if (
        prevTokenType === TokenType.constantNumber ||
        nextTokenType === TokenType.constantNumber
      ) {
        return TokenType.operatorBinaryArithmeticMultiplication;
      }

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
