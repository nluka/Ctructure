import findFirstTokenTypeMatchAhead from './findFirstTokenTypeMatchAhead';
import findFirstTokenTypeMatchBehind from './findFirstTokenTypeMatchBehind';
import TokenArray from './TokenArray';
import TokenType, {
  isTokenBinaryOperator,
  isTokenConstant,
  isTokenMemberSelectionOperator,
  isTokenSpecial,
  isTokenTernaryOperatorComponent,
  isTokenTypeOrTypeQualifierKeyword,
  isTokenTypeQualifierKeyword,
} from './TokenType';
import tokenTypeToNameMap from './tokenTypeToNameMap';

const tokenTypesNewlineOrComment: TokenType[] = [
  TokenType.newline,
  TokenType.commentSingleline,
  TokenType.commentMultiline,
];

export default function tokenDisambiguate(
  currTokenIndex: number,
  tokens: TokenArray,
): TokenType {
  const createErr = () => createError(currTokenType, currTokenIndex, tokens);

  const currTokenType = tokens.getTokenDecoded(currTokenIndex)[1];

  const firstNonNewlineOrCommentTokenBehindCurr = findFirstTokenTypeMatchBehind(
    tokens,
    currTokenIndex - 1,
    tokenTypesNewlineOrComment,
    false,
  );
  const firstNonNewlineOrCommentTokenAfterCurr = findFirstTokenTypeMatchAhead(
    tokens,
    currTokenIndex + 1,
    tokenTypesNewlineOrComment,
    false,
  );
  if (
    firstNonNewlineOrCommentTokenBehindCurr === null ||
    firstNonNewlineOrCommentTokenAfterCurr === null
  ) {
    throw createErr();
  }
  const prevTokenType = firstNonNewlineOrCommentTokenBehindCurr[1];
  const nextTokenType = firstNonNewlineOrCommentTokenAfterCurr[1];

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
      throw createErr();
    }

    case TokenType.ambiguousDecrement: {
      if (prevTokenType === TokenType.identifier) {
        return TokenType.operatorUnaryArithmeticDecrementPostfix;
      }
      if (nextTokenType === TokenType.identifier) {
        return TokenType.operatorUnaryArithmeticDecrementPrefix;
      }
      throw createErr();
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
      // indirection|
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

      if (
        // Prev
        isTokenTypeOrTypeQualifierKeyword(prevTokenType) ||
        isTokenSpecial(prevTokenType) ||
        isTokenBinaryOperator(prevTokenType) ||
        isTokenTernaryOperatorComponent(prevTokenType) ||
        prevTokenType === TokenType.operatorUnaryIndirection ||
        // Next
        isTokenTypeQualifierKeyword(nextTokenType) ||
        nextTokenType === TokenType.operatorUnaryIndirection ||
        nextTokenType === TokenType.constantString
      ) {
        return TokenType.operatorUnaryIndirection;
      }

      if (
        prevTokenType === TokenType.identifier &&
        nextTokenType === TokenType.identifier
      ) {
        const firstNonNewlineOrCommentTokenBehindPrev =
          findFirstTokenTypeMatchBehind(
            tokens,
            currTokenIndex - 2,
            tokenTypesNewlineOrComment,
            false,
          );
        if (firstNonNewlineOrCommentTokenBehindPrev === null) {
          throw createErr();
        }

        const leadingPrevTokenType = firstNonNewlineOrCommentTokenBehindPrev[1];
        if (
          isTokenMemberSelectionOperator(leadingPrevTokenType) ||
          [
            TokenType.specialParenthesisRight,
            TokenType.specialBraceRight,
            TokenType.specialBracketRight,
          ].includes(leadingPrevTokenType)
        ) {
          throw createError(currTokenType, currTokenIndex, tokens);
        }

        if (
          isTokenBinaryOperator(leadingPrevTokenType) ||
          isTokenTernaryOperatorComponent(leadingPrevTokenType) ||
          [
            TokenType.specialComma,
            TokenType.specialParenthesisLeft,
            TokenType.specialBraceLeft,
            TokenType.specialBracketLeft,
          ].includes(leadingPrevTokenType)
        ) {
          return TokenType.operatorBinaryArithmeticMultiplication;
        }
        return TokenType.operatorUnaryIndirection;
      }

      throw createErr();
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

      throw createErr();
    }

    default:
      throw createErr();
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
