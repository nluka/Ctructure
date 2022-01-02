import findFirstTokenTypeMatchAhead from './findFirstTokenTypeMatchAhead';
import findFirstTokenTypeMatchBehind from './findFirstTokenTypeMatchBehind';
import TokenArray from './TokenArray';
import TokenType, {
  isTokenBinaryOperator,
  isTokenConstant,
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
  const firstTokenTypeBehindCurr = firstNonNewlineOrCommentTokenBehindCurr[1];
  const firstTokenTypeAfterCurr = firstNonNewlineOrCommentTokenAfterCurr[1];

  switch (currTokenType) {
    case TokenType.ambiguousPlus: {
      if (
        (firstTokenTypeBehindCurr === TokenType.identifier ||
          isTokenConstant(firstTokenTypeBehindCurr)) &&
        (firstTokenTypeAfterCurr === TokenType.identifier ||
          isTokenConstant(firstTokenTypeAfterCurr))
      ) {
        return TokenType.operatorBinaryArithmeticAddition;
      }
      return TokenType.operatorUnaryPlus;
    }

    case TokenType.ambiguousMinus: {
      if (
        (firstTokenTypeBehindCurr === TokenType.identifier ||
          isTokenConstant(firstTokenTypeBehindCurr)) &&
        (firstTokenTypeAfterCurr === TokenType.identifier ||
          isTokenConstant(firstTokenTypeAfterCurr))
      ) {
        return TokenType.operatorBinaryArithmeticSubtraction;
      }
      return TokenType.operatorUnaryMinus;
    }

    case TokenType.ambiguousIncrement: {
      if (firstTokenTypeAfterCurr === TokenType.identifier) {
        return TokenType.operatorUnaryArithmeticIncrementPrefix;
      }
      if (firstTokenTypeBehindCurr === TokenType.identifier) {
        return TokenType.operatorUnaryArithmeticIncrementPostfix;
      }
      throw createErr();
    }

    case TokenType.ambiguousDecrement: {
      if (firstTokenTypeBehindCurr === TokenType.identifier) {
        return TokenType.operatorUnaryArithmeticDecrementPostfix;
      }
      if (firstTokenTypeAfterCurr === TokenType.identifier) {
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
        firstTokenTypeBehindCurr === TokenType.constantNumber ||
        firstTokenTypeAfterCurr === TokenType.constantNumber
      ) {
        return TokenType.operatorBinaryArithmeticMultiplication;
      }

      if (
        // Prev
        isTokenTypeOrTypeQualifierKeyword(firstTokenTypeBehindCurr) ||
        isTokenSpecial(firstTokenTypeBehindCurr) ||
        isTokenBinaryOperator(firstTokenTypeBehindCurr) ||
        isTokenTernaryOperatorComponent(firstTokenTypeBehindCurr) ||
        firstTokenTypeBehindCurr === TokenType.operatorUnaryIndirection ||
        // Next
        isTokenTypeQualifierKeyword(firstTokenTypeAfterCurr) ||
        firstTokenTypeAfterCurr === TokenType.operatorUnaryIndirection ||
        firstTokenTypeAfterCurr === TokenType.constantString
      ) {
        return TokenType.operatorUnaryIndirection;
      }

      if (
        firstTokenTypeBehindCurr === TokenType.identifier &&
        firstTokenTypeAfterCurr === TokenType.identifier
      ) {
        return TokenType.ambiguousAsterisk;
        // const secondNonNewlineOrCommentTokenAfterCurr =
        //   findFirstTokenTypeMatchAhead(
        //     tokens,
        //     currTokenIndex + 2,
        //     tokenTypesNewlineOrComment,
        //     false,
        //   );
        // if (secondNonNewlineOrCommentTokenAfterCurr === null) {
        //   throw createErr();
        // }
        // const secondTokenTypeAfterCurr =
        //   secondNonNewlineOrCommentTokenAfterCurr[1];
        // if (secondTokenTypeAfterCurr === TokenType.specialParenthesisLeft) {
        //   return TokenType.operatorUnaryIndirection;
        // }

        // const secondNonNewlineOrCommentTokenBehindCurr =
        //   findFirstTokenTypeMatchBehind(
        //     tokens,
        //     currTokenIndex - 2,
        //     tokenTypesNewlineOrComment,
        //     false,
        //   );
        // if (secondNonNewlineOrCommentTokenBehindCurr === null) {
        //   throw createErr();
        // }
        // const secondTokenTypeBehindCurr =
        //   secondNonNewlineOrCommentTokenBehindCurr[1];

        // if (
        //   isTokenMemberSelectionOperator(secondTokenTypeBehindCurr) ||
        //   [
        //     TokenType.specialParenthesisRight,
        //     TokenType.specialBraceRight,
        //     TokenType.specialBracketRight,
        //   ].includes(secondTokenTypeBehindCurr)
        // ) {
        //   throw createError(currTokenType, currTokenIndex, tokens);
        // }

        // if (
        //   isTokenBinaryOperator(secondTokenTypeBehindCurr) ||
        //   isTokenMemberSelectionOperator(secondTokenTypeBehindCurr) ||
        //   isTokenTernaryOperatorComponent(secondTokenTypeBehindCurr) ||
        //   [
        //     TokenType.specialComma,
        //     TokenType.specialParenthesisLeft,
        //     TokenType.specialBraceLeft,
        //     TokenType.specialBracketLeft,
        //   ].includes(secondTokenTypeBehindCurr)
        // ) {
        //   return TokenType.operatorBinaryArithmeticMultiplication;
        // }
        // return TokenType.operatorUnaryIndirection;
      }

      throw createErr();
    }

    case TokenType.ambiguousAmpersand: {
      if (
        (firstTokenTypeBehindCurr === TokenType.identifier ||
          isTokenConstant(firstTokenTypeBehindCurr)) &&
        (firstTokenTypeAfterCurr === TokenType.identifier ||
          isTokenConstant(firstTokenTypeAfterCurr))
      ) {
        return TokenType.operatorBinaryBitwiseAnd;
      }

      if (
        firstTokenTypeAfterCurr === TokenType.identifier ||
        firstTokenTypeAfterCurr === TokenType.constantString
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
