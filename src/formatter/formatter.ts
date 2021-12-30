import TokenArray from '../lexer/TokenArray';
import { tokenDecode } from '../lexer/tokenDecode';
import tokenDetermineCategory from '../lexer/tokenDetermineCategory';
import { tokenFindLastIndex } from '../lexer/tokenFindLastIndex';
import TokenType from '../lexer/TokenType';
import findEndOfSwitch from './findEndOfSwitch';
import Node, { nodeType } from './node';
import tokenTypeToValueMap from './tokenTypeToValueMap';

export default function formatFile(tokenizedFile: [string, TokenArray]) {
  return formatter(
    tokenizedFile[0],
    tokenizedFile[1].getValues(),
    0,
    tokenizedFile[1].getCount(),
    0,
  );
}

function formatter(
  fileContents: string,
  tokens: Uint32Array,
  startIndex: number,
  endIndex: number,
  blockLevel: number,
): Node {
  const spacing = '  ';
  const root: nodeType = new Node();
  let currNode: nodeType = root,
    previousType: TokenType | null = null,
    context: TokenType | Type | null = null,
    parenCount = 0,
    nextType: TokenType,
    newLine = false,
    startLineIndex: number = 0,
    split: boolean = false;

  for (let i = startIndex; i < endIndex; ++i) {
    if (currNode) {
      const decodedToken: [number, TokenType] = tokenDecode(tokens[i]);
      const type: TokenType = decodedToken[1];
      const position: number = decodedToken[0];
      const currNodeData = tokenTypeToValueMap.get(type);

      if (currNodeData) {
        currNode.addDataPost(currNodeData);
      }
      if (newLine) {
        currNode.addDataPre(`\n${spacing.repeat(blockLevel)}`);
        newLine = false;
        startLineIndex = position;
      }
      switch (type) {
        case TokenType.newline:
          if (previousType === TokenType.newline) {
            newLine = true;
          }
          previousType = TokenType.newline;
          continue;
          break;

        case TokenType.specialComma:
          if (context === Type.varDec) {
            currNode.addDataPost(`\n${spacing.repeat(blockLevel + 1)}`);
          } else if (!split) {
            currNode.addDataPost(' ');
          } else {
            newLine = true;
          }
          break;

        case TokenType.specialSemicolon:
          if (context === TokenType.keywordFor) {
            currNode.addDataPost(' ');
            break;
          }
          nextType = nextTokenTypeNotNewLine(tokens, i);
          if (
            nextType === TokenType.specialBraceRight ||
            context === Type.singleLineIf
          ) {
            --blockLevel;
          }
          newLine = true;
          break;

        case TokenType.specialBracketLeft:
        case TokenType.specialBracketRight:
          break;

        case TokenType.specialParenthesisLeft:
          ++parenCount;
          if (context === Type.varDec) {
            context = Type.funcDec;
          }

          if (
            parenCount === 1 &&
            shouldSplitIntoMultLines(tokens, i, startLineIndex)
          ) {
            currNode.addDataPost(`\n${spacing.repeat(++blockLevel)}`);
            split = true;
          }
          break;

        case TokenType.specialParenthesisRight:
          nextType = nextTokenTypeNotNewLine(tokens, i);
          --parenCount;
          if (parenCount === 0) {
            if (context === TokenType.keywordFor) {
              context = null;
            } else if (context === TokenType.keywordIf) {
              if (nextType !== TokenType.specialBraceLeft) {
                ++blockLevel;
                newLine = true;
                context = Type.singleLineIf;
              } else {
                context = null;
              }
            }
            if (split) {
              currNode.addDataPre(`\n${spacing.repeat(--blockLevel)}`);
              split = false;
            }
          }

          if (nextType === TokenType.specialBraceLeft) {
            currNode.addDataPost(' ');
          } else {
            context = null;
          }
          break;

        case TokenType.specialBraceLeft:
          ++blockLevel;
          newLine = true;
          break;

        case TokenType.specialBraceRight:
          nextType = nextTokenTypeNotNewLine(tokens, i);
          if (nextType === TokenType.specialBraceRight) {
            --blockLevel;
            newLine = true;
          } else if (nextType === TokenType.keywordWhile) {
            currNode.addDataPost(' ');
          } else {
            newLine = true;
          }
          break;

        // Preprocessor (https://www.cprogramming.com/reference/preprocessor/)
        case TokenType.preproOperatorConcat:
        case TokenType.preproDirectiveInclude:
        case TokenType.preproDirectiveDefine:
        case TokenType.preproLineContinuation:
        case TokenType.preproDirectiveUndef:
        case TokenType.preproDirectiveIf:
        case TokenType.preproDirectiveIfdef:
        case TokenType.preproDirectiveIfndef:
        case TokenType.preproMacroFile:
        case TokenType.preproMacroLine:
        case TokenType.preproMacroDate:
        case TokenType.preproMacroTime:
        case TokenType.preproMacroTimestamp:
        case TokenType.preproDirectivePragma:
          context = Type.prepro;
          currNode.addDataPost(' ');
          break;

        // Unary operator:
        case TokenType.operatorUnaryArithmeticIncrementPrefix:
        case TokenType.operatorUnaryArithmeticIncrementPostfix:
        case TokenType.operatorUnaryArithmeticDecrementPrefix:
        case TokenType.operatorUnaryArithmeticDecrementPostfix:
        case TokenType.operatorUnaryBitwiseOnesComplement:
        case TokenType.operatorUnaryLogicalNegation:
        case TokenType.operatorUnaryIndirection:
        case TokenType.operatorUnaryDereference:
          break;

        // Binary operators
        case TokenType.operatorBinaryArithmeticMultiplication:
        case TokenType.operatorBinaryArithmeticAddition:
        case TokenType.operatorBinaryArithmeticSubtraction:
        case TokenType.operatorBinaryArithmeticDivision:
        case TokenType.operatorBinaryArithmeticMultiplication:
        case TokenType.operatorBinaryComparisonEqualTo:
        case TokenType.operatorBinaryComparisonNotEqualTo:
        case TokenType.operatorBinaryComparisonGreaterThan:
        case TokenType.operatorBinaryComparisonGreaterThanOrEqualTo:
        case TokenType.operatorBinaryComparisonLessThan:
        case TokenType.operatorBinaryComparisonLessThanOrEqualTo:
        case TokenType.operatorBinaryLogicalAnd:
        case TokenType.operatorBinaryLogicalOr:
        case TokenType.operatorBinaryBitwiseAnd:
        case TokenType.operatorBinaryBitwiseOr:
        case TokenType.operatorBinaryBitwiseXor:
        case TokenType.operatorBinaryBitwiseShiftLeft:
        case TokenType.operatorBinaryBitwiseShiftRight:
          currNode.setData(` ${currNodeData} `);
          break;
        case TokenType.operatorBinaryAssignmentDirect:
        case TokenType.operatorBinaryAssignmentAddition:
        case TokenType.operatorBinaryAssignmentSubtraction:
        case TokenType.operatorBinaryAssignmentMultiplication:
        case TokenType.operatorBinaryAssignmentDivision:
        case TokenType.operatorBinaryAssignmentModulo:
        case TokenType.operatorBinaryAssignmentBitwiseShiftLeft:
        case TokenType.operatorBinaryAssignmentBitwiseShiftRight:
        case TokenType.operatorBinaryAssignmentBitwiseAnd:
        case TokenType.operatorBinaryAssignmentBitwiseOr:
        case TokenType.operatorBinaryAssignmentBitwiseXor:
          currNode.setData(` ${currNodeData} `);
          break;

        case TokenType.operatorMemberSelectionDirect:
        case TokenType.operatorMemberSelectionIndirect:
          break;

        // Miscellanous operators
        case TokenType.operatorTernaryQuestion:
          currNode.setData(' ? ');
          break;

        case TokenType.operatorTernaryColon:
          if (context === TokenType.keywordCase) {
            ++blockLevel;
            newLine = true;
          } else {
            currNode.setData(' : ');
          }
          break;

        // Keywords (https://en.cppreference.com/w/c/keyword)
        case TokenType.keywordIf:
          context = TokenType.keywordIf;
          currNode.addDataPost(' ');
          break;
        case TokenType.keywordElse:
          currNode.setData(' else ');
          context = TokenType.keywordElse;
          break;

        case TokenType.keywordInt:
        case TokenType.keywordBool:
        case TokenType.keywordFloat:
        case TokenType.keywordDouble:
        case TokenType.keywordChar:
          if (context !== TokenType.keywordFor && context !== Type.funcDec) {
            context = Type.varDec;
          }
          currNode.addDataPost(' ');
          break;

        case TokenType.keywordVoid:
          currNode.addDataPost(' ');
          break;

        case TokenType.keywordSwitch:
          context = TokenType.keywordSwitch;
          currNode.addDataPost(' ');
          const endSwitch = findEndOfSwitch(tokens, i);
          currNode.setChild(
            formatter(fileContents, tokens, i + 1, endSwitch, blockLevel),
          );
          i = endSwitch - 1;
          newLine = true;
          break;

        case TokenType.keywordCase:
          context = TokenType.keywordCase;
          currNode.addDataPost(' ');
          break;

        case TokenType.keywordReturn:
          if (
            nextTokenTypeNotNewLine(tokens, i) !== TokenType.specialSemicolon
          ) {
            currNode.addDataPost(' ');
          }
          break;

        case TokenType.keywordBreak:
        case TokenType.keywordContinue:
          --blockLevel;
          break;

        case TokenType.keywordDefault:
          context = TokenType.keywordCase;
          break;

        case TokenType.keywordFor:
          context = TokenType.keywordFor;
          currNode.addDataPost(' ');
          break;

        case TokenType.keywordWhile:
        case TokenType.keywordDo:
        case TokenType.keywordAlignas:
        case TokenType.keywordAlignof:
        case TokenType.keywordAuto:
        case TokenType.keywordAtomic:
        case TokenType.keywordComplex:
        case TokenType.keywordConst:
        case TokenType.keywordEnum:
        case TokenType.keywordExtern:
        case TokenType.keywordGeneric:
        case TokenType.keywordGoto:
          currNode.addDataPost(' ');
          break;

        // Other
        case TokenType.label:
        case TokenType.constantString:
          setNodesDataFromFileContent(
            currNode,
            fileContents,
            position,
            previousType,
          );
          if (context === Type.prepro) {
            newLine = true;
            context = null;
          }

          break;
        case TokenType.commentSingleline:
          setNodesDataFromFileContent(
            currNode,
            fileContents,
            position,
            previousType,
          );
          if (tokenDecode(tokens[i + 1])[1] === TokenType.newline) {
            newLine = true;
          }
          break;
        case TokenType.constantNumber:
        case TokenType.constantCharacter:
          setNodesDataFromFileContent(
            currNode,
            fileContents,
            position,
            previousType,
          );
          break;

        case TokenType.commentMultiline:
          setNodesDataFromFileContent(
            currNode,
            fileContents,
            position,
            previousType,
          );
          newLine = true;
          break;
        case TokenType.identifier:
          setNodesDataFromFileContent(
            currNode,
            fileContents,
            position,
            previousType,
          );
          const nextTokenType = nextTokenTypeNotNewLine(tokens, i);
          if (
            nextTokenType === TokenType.identifier ||
            nextTokenType === TokenType.ambiguousAsterisk
          ) {
            currNode.addDataPost(' ');
          }
          break;
        case TokenType.preproStandardHeader:
          setNodesDataFromFileContent(
            currNode,
            fileContents,
            position,
            previousType,
          );
          newLine = true;
          context = null;
          break;
      }

      previousType = type;
      currNode.setNext(new Node());
      currNode = currNode.getNext();
    }
  }
  return root;
}

export function toString(currNode: nodeType) {
  let str: string = '';

  if (currNode?.getData()) {
    str += currNode.getData();
    if (currNode.getChild()) {
      str += toString(currNode.getChild());
    }
    if (currNode.getNext()) {
      str += toString(currNode.getNext());
    }
  }
  return str;
}

function nextTokenTypeNotNewLine(
  tokens: Uint32Array,
  index: number,
): TokenType {
  for (let i = index + 1; i < tokens.length; ++i) {
    const type = tokenDecode(tokens[i])[1];
    if (type !== TokenType.newline) {
      return type;
    }
  }
  return TokenType.specialSemicolon;
}
function shouldSplitIntoMultLines(
  tokens: Uint32Array,
  index: number,
  startLineIndex: number,
): boolean {
  let parenCount = 1;
  for (let i = index + 1; i < tokens.length; ++i) {
    const decodedToken = tokenDecode(tokens[i]);
    if (decodedToken[1] === TokenType.specialParenthesisRight) {
      if (--parenCount === 0) {
        if (decodedToken[0] - startLineIndex > 80) {
          return true;
        } else {
          return false;
        }
      }
    } else if (decodedToken[1] === TokenType.specialParenthesisLeft) {
      ++parenCount;
    }
  }
  return false;
}

function setNodesDataFromFileContent(
  currNode: Node,
  fileContents: string,
  position: number,
  previousType: TokenType | null,
) {
  currNode.addDataPost(
    fileContents.slice(
      position,
      tokenFindLastIndex(
        fileContents,
        position,
        tokenDetermineCategory(fileContents.charAt(position), position),
        previousType,
      ) + 1,
    ),
  );
}

enum Type {
  prepro,
  singleLineIf,
  varDec,
  funcDec,
}
