import TokenType from '../lexer/TokenType';

export default function trackIndentationDepthDuringNoFormat(
  tokenTypes: Uint8Array,
  index: number,
  indentationDepth: number,
) {
  for (let i = index + 1; i < tokenTypes.length; ++i) {
    const currType = tokenTypes[i];
    if (currType === TokenType.specialBraceOpening) {
      ++indentationDepth;
    } else if (currType === TokenType.specialBraceClosing) {
      --indentationDepth;
    } else if (currType === TokenType.commentNoFormatMultiline) {
      return indentationDepth;
    }
  }
  return indentationDepth;
}
