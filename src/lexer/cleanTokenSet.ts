import TokenSet from './TokenSet';
import TokenType from './TokenType';

export default function cleanTokenSet(tokSet: TokenSet) {
  /*
    check for and fix following sequences:
    `) //comment \n {` becomes `) { //comment \n`
    `= //comment \n {` becomes `= { //comment \n`
  */
  for (let i = 0; i < tokSet.getCount() - 3; ++i) {
    const currTokType = tokSet.getTokenType(i);
    if (currTokType !== TokenType.commentSingleLine) {
      continue;
    }

    const [firstNonNewlineTokBehindType] = tokSet.findFirstTypeMatchBehind(
      i - 1,
      [TokenType.newline],
      false,
    );
    if (
      ![
        TokenType.specialParenthesisClosing,
        TokenType.operatorBinaryAssignmentDirect,
      ].includes(firstNonNewlineTokBehindType)
    ) {
      continue;
    }

    const [firstNonNewlineTokAheadType, firstNonNewlineAheadIndex] =
      // token at i+1 should be a newline since token at i is commentSingleLine,
      // therefore start search at i+2
      tokSet.findFirstTypeMatchBehind(i + 2, [TokenType.newline], false);

    if (firstNonNewlineTokAheadType === TokenType.specialBraceOpening) {
      const commentStartPos = tokSet.getTokenStartPosition(i);
      const newlineStartPos = tokSet.getTokenStartPosition(i + 1);
      const braceStartPos = tokSet.getTokenStartPosition(
        firstNonNewlineAheadIndex,
      );
      tokSet.setToken(i, braceStartPos, TokenType.specialBraceOpening); // brace replaces comment
      tokSet.setToken(i + 1, commentStartPos, TokenType.commentSingleLine); // comment replaces newline
      tokSet.setToken(
        firstNonNewlineAheadIndex,
        newlineStartPos,
        TokenType.newline,
      ); // newline replaces brace
    }
  }
}
