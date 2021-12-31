import TokenArray from './TokenArray';
import TokenType, {
  isTokenConstant,
  isTokenKeywordTypeOrTypeQualifier,
} from './TokenType';
import tokenTypeToNameMap from './tokenTypeToNameMap';

export default function tokenDisambiguate(
  tokenIndex: number,
  tokens: TokenArray,
): TokenType {
  const prevTokenType = tokens.getTokenDecoded(tokenIndex - 1)[1];
  const currTokenType = tokens.getTokenDecoded(tokenIndex)[1];
  const nextTokenType = tokens.getTokenDecoded(tokenIndex + 1)[1];

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
      throw createError(currTokenType, tokenIndex, tokens);
    }

    case TokenType.ambiguousDecrement: {
      if (prevTokenType === TokenType.identifier) {
        return TokenType.operatorUnaryArithmeticDecrementPostfix;
      }
      if (nextTokenType === TokenType.identifier) {
        return TokenType.operatorUnaryArithmeticDecrementPrefix;
      }
      throw createError(currTokenType, tokenIndex, tokens);
    }

    case TokenType.ambiguousAsterisk: {
      if (
        isTokenKeywordTypeOrTypeQualifier(prevTokenType) ||
        prevTokenType === TokenType.operatorUnaryIndirection ||
        prevTokenType === TokenType.ambiguousAsterisk
      ) {
        return TokenType.operatorUnaryIndirection;
      }

      if (
        (prevTokenType === TokenType.identifier ||
          prevTokenType === TokenType.constantNumber) &&
        (nextTokenType === TokenType.identifier ||
          nextTokenType === TokenType.constantNumber)
      ) {
        return TokenType.operatorBinaryArithmeticMultiplication;
      }

      if (
        nextTokenType === TokenType.identifier ||
        nextTokenType === TokenType.constantString
      ) {
        return TokenType.operatorUnaryDereference;
      }

      throw createError(currTokenType, tokenIndex, tokens);
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

      throw createError(currTokenType, tokenIndex, tokens);
    }

    default: {
      throw createError(currTokenType, tokenIndex, tokens);
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
