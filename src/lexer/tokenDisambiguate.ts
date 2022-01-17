import findFirstTokenTypeMatchAhead from './findFirstTokenTypeMatchAhead';
import findFirstTokenTypeMatchBehind from './findFirstTokenTypeMatchBehind';
import TokenArray from './TokenArray';
import tokenDetermineLineNumAndColNum from './tokenDetermineLineNumAndCol';
import TokenType, {
  isTokenBinaryOperator,
  isTokenNonMultiplicationOrIndirectionBinaryOperator,
  isTokenSpecialNonClosing,
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
        isTokenBinaryOperator(firstTokenTypeBehindCurr) ||
        firstTokenTypeBehindCurr === TokenType.specialBracketOpening ||
        firstTokenTypeBehindCurr === TokenType.specialParenthesisOpening ||
        firstTokenTypeBehindCurr === TokenType.keywordReturn
      ) {
        return TokenType.operatorUnaryPlus;
      }
      return TokenType.operatorBinaryArithmeticAddition;
    }

    case TokenType.ambiguousMinus: {
      if (
        isTokenBinaryOperator(firstTokenTypeBehindCurr) ||
        firstTokenTypeBehindCurr === TokenType.specialBracketOpening ||
        firstTokenTypeBehindCurr === TokenType.specialParenthesisOpening ||
        firstTokenTypeBehindCurr === TokenType.keywordReturn
      ) {
        return TokenType.operatorUnaryMinus;
      }
      return TokenType.operatorBinaryArithmeticSubtraction;
    }

    case TokenType.ambiguousIncrement: {
      if (
        firstTokenTypeAfterCurr === TokenType.identifier ||
        firstTokenTypeAfterCurr === TokenType.specialParenthesisOpening
      ) {
        return TokenType.operatorUnaryArithmeticIncrementPrefix;
      }
      if (
        firstTokenTypeBehindCurr === TokenType.identifier ||
        firstTokenTypeBehindCurr === TokenType.specialParenthesisClosing
      ) {
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
      if (
        isTokenSpecialNonClosing(firstTokenTypeBehindCurr) ||
        isTokenNonMultiplicationOrIndirectionBinaryOperator(
          firstTokenTypeBehindCurr,
        ) ||
        firstTokenTypeBehindCurr === TokenType.keywordSizeof
      ) {
        return TokenType.operatorUnaryDereference;
      }
      return TokenType.operatorBinaryMultiplicationOrIndirection;
    }

    case TokenType.ambiguousAmpersand: {
      if (
        firstTokenTypeBehindCurr === TokenType.constantNumber ||
        firstTokenTypeBehindCurr === TokenType.constantCharacter ||
        firstTokenTypeAfterCurr === TokenType.constantNumber ||
        firstTokenTypeAfterCurr === TokenType.constantCharacter ||
        firstTokenTypeBehindCurr === TokenType.identifier ||
        firstTokenTypeBehindCurr === TokenType.specialParenthesisClosing ||
        firstTokenTypeBehindCurr === TokenType.specialBracketClosing
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
  const [lineNum, colNum] = tokenDetermineLineNumAndColNum(tokenIndex, tokens);
  return new Error(
    `${tokenTypeToNameMap.get(tokenType)} at line ${lineNum} col ${colNum}`,
  );
}
