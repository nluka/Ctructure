import G = require('glob');
import TokenArray from '../lexer/TokenArray';
import { tokenDecode } from '../lexer/tokenDecode';
import tokenDetermineCategory from '../lexer/tokenDetermineCategory';
import { tokenFindLastIndex } from '../lexer/tokenFindLastIndex';
import TokenType from '../lexer/TokenType';
import findEndOfBlock from './findEndOfBlock';
import Node, { nodeType } from './node';
import tokenTypeToValueMap from './tokenTypeToValueMap';

export default function formatFile(tokenizedFile: [string, TokenArray]) {
  // const g = tokenizedFile[1].getValues().slice(0, 10);
  // for (const thing of g) {
  //   console.log(
  //     tokenTypeToValueMap.get(tokenDecode(thing)[1]),
  //     tokenDecode(thing)[1],
  //   );
  // }

  return formatter(
    tokenizedFile[0],
    tokenizedFile[1],
    0,
    tokenizedFile[1].getCount(),
    0,
    null,
  );
}

function formatter(
  fileContents: string,
  tokenArray: TokenArray,
  startIndex: number,
  endIndex: number,
  blockLevel: number,
  startingContext: TokenType | Type | null,
): Node {
  let tokens: Uint32Array = tokenArray.getValues();
  const spacing = '  ';
  const root: nodeType = new Node();
  let currNode: nodeType = root,
    previousType: TokenType | null = null,
    context: TokenType | Type | null = startingContext,
    parenCount = 0,
    nextType: TokenType | Type,
    newLine = false,
    startLineIndex: number = tokenDecode(tokens[startIndex])[0],
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
          if (endIndex !== tokenArray.getCount() && i === endIndex - 1) {
            currNode.setData('');
          } else if (
            previousType === TokenType.newline ||
            context === Type.prepro
          ) {
            context = null;
            newLine = true;
          }
          if (context !== Type.singleLineIf) {
            context = null;
          }
          previousType = TokenType.newline;
          continue;

        case TokenType.specialComma:
          if (!split && parenCount === 0 && context === Type.varDec) {
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
            nextType === TokenType.keywordCase ||
            nextType === TokenType.keywordDefault
          ) {
            --blockLevel;
            newLine = true;
          } else if (context === Type.singleLineIf) {
            currNode.addDataPost(`\n${spacing.repeat(--blockLevel)}`);
          } else if (nextType !== TokenType.commentSingleline) {
            newLine = true;
          } else if (tokenDecode(tokens[i + 1])[1] === TokenType.newline) {
            newLine = true;
          } else {
            currNode.addDataPost(' ');
          }
          context = null;
          break;

        case TokenType.specialBracketLeft:
        case TokenType.specialBracketRight:
          break;

        case TokenType.specialParenthesisLeft:
          if (
            ++parenCount === 1 &&
            shouldSplitIntoMultLines(tokens, i, startLineIndex)
          ) {
            currNode.addDataPost(`\n${spacing.repeat(++blockLevel)}`);
            split = true;
          }
          if (context === Type.typeOrIdentifier) {
            context = null;
          }
          break;

        case TokenType.specialParenthesisRight:
          nextType = nextTokenTypeNotNewLine(tokens, i);
          if (--parenCount === 0) {
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
          }
          break;

        case TokenType.specialBraceLeft:
          if (context === Type.varDec) {
            currNode.addDataPost(' ');
            break;
          }
          ++blockLevel;
          newLine = true;
          break;

        case TokenType.specialBraceRight:
          nextType = nextTokenTypeNotNewLine(tokens, i);
          if (nextType === TokenType.specialBraceRight) {
            --blockLevel;
            newLine = true;
          } else if (context === Type.varDec) {
            currNode.addDataPre(' ');
          } else if (context === TokenType.keywordDo) {
            currNode.addDataPost(' ');
            context = null;
          } else {
            context = null;
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
        case TokenType.preproDirectiveEndif:
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
        case TokenType.operatorBinaryArithmeticModulo:
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
        case TokenType.ambiguousPlus:
          if (context === Type.typeOrIdentifier) {
            context = null;
          }
          currNode.setData(` ${currNodeData} `);
          break;

        case TokenType.ambiguousMinus:
        case TokenType.ambiguousAmpersand:
        case TokenType.ambiguousDecrement:
        case TokenType.ambiguousIncrement:
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
          if (context === Type.typeOrIdentifier) {
            context = null;
          }
          break;

        // Miscellanous operators
        case TokenType.operatorTernaryQuestion:
          currNode.setData(' ? ');
          break;

        case TokenType.operatorTernaryColon:
          if (
            context === TokenType.keywordCase ||
            context === TokenType.keywordDefault
          ) {
            ++blockLevel;
            newLine = true;
            context = null;
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
        case TokenType.keywordVoid:
          if (context === null) {
            context = Type.typeOrIdentifier;
          }
          if (
            nextTokenTypeNotNewLine(tokens, i) !==
            TokenType.specialParenthesisRight
          ) {
            currNode.addDataPost(' ');
          }
          break;

        case TokenType.keywordSwitch:
          context = TokenType.keywordSwitch;
          currNode.addDataPost(' ');
          const endSwitch = findEndOfBlock(tokens, i);
          currNode.setChild(
            formatter(
              fileContents,
              tokenArray,
              i + 1,
              endSwitch,
              blockLevel,
              TokenType.keywordSwitch,
            ),
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
          break;

        case TokenType.keywordDefault:
          context = TokenType.keywordDefault;
          break;

        case TokenType.keywordFor:
          context = TokenType.keywordFor;
          currNode.addDataPost(' ');
          break;

        case TokenType.keywordDo:
          context = TokenType.keywordDo;
          currNode.addDataPost(' ');
          const endDoWhile = findEndOfBlock(tokens, i);
          currNode.setChild(
            formatter(
              fileContents,
              tokenArray,
              i + 1,
              endDoWhile,
              blockLevel,
              TokenType.keywordDo,
            ),
          );
          i = endDoWhile - 1;
          newLine = true;
          break;

        case TokenType.keywordWhile:
          context = TokenType.keywordWhile;
          currNode.addDataPost(' ');
          break;

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
        case TokenType.keywordTypedef:
          currNode.addDataPost(' ');
          break;

        case TokenType.keywordStruct:
          context = TokenType.keywordStruct;
          currNode.addDataPost(' ');
          const endStruct = findEndOfBlock(tokens, i);
          currNode.setChild(
            formatter(
              fileContents,
              tokenArray,
              i + 1,
              endStruct + 1,
              blockLevel,
              TokenType.keywordStruct,
            ),
          );
          i = endStruct;
          previousType = type;
          currNode.setNext(new Node());
          currNode = currNode.getNext();
          if (
            nextTokenTypeNotNewLine(tokens, i) !== TokenType.specialSemicolon
          ) {
            currNode?.setData(' ');
          }
          continue;

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
          nextType = nextTokenTypeNotNewLine(tokens, i);
          if (
            nextType === TokenType.specialBraceRight ||
            nextType === TokenType.keywordCase ||
            nextType === TokenType.keywordDefault ||
            context === Type.singleLineIf
          ) {
            --blockLevel;
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
          if (context === Type.prepro && nextTokenType !== Type.prepro) {
            currNode.addDataPost(' ');
          } else if (context === null) {
            if (nextTokenType === TokenType.specialParenthesisLeft) {
              context = Type.funcCall;
            } else {
              context = Type.typeOrIdentifier;
            }
          } else if (context === Type.typeOrIdentifier) {
            if (
              nextTokenType === Type.assignment ||
              nextTokenType === TokenType.specialComma ||
              nextTokenType === TokenType.specialBracketLeft
            ) {
              context = Type.varDec;
            } else if (nextTokenType === TokenType.specialParenthesisLeft) {
              context = Type.funcDec;
            }
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

// function nextTokenTypeNotNewLine(
//   tokens: Uint32Array,
//   index: number,
// ): TokenType | Type {
//   for (let i = index + 1; i < tokens.length; ++i) {
//     const type = tokenDecode(tokens[i])[1];
//     if (
//       type !== TokenType.newline &&
//       type !== TokenType.commentMultiline &&
//       type !== TokenType.commentSingleline
//     ) {
//       if (type > 90 && type < 102) {
//         return Type.assignment;
//       } else if (type < 19) {
//         return Type.prepro;
//       }
//       return type;
//     }
//   }
//   return TokenType.operatorBinaryAssignmentSubtraction;
// }

function nextTokenTypeNotNewLine(
  tokens: Uint32Array,
  index: number,
): TokenType | Type {
  for (let i = index + 1; i < tokens.length; ++i) {
    const type = tokenDecode(tokens[i])[1];
    if (type !== TokenType.newline) {
      if (type > 90 && type < 102) {
        return Type.assignment;
      } else if (type < 19) {
        return Type.prepro;
      }
      return type;
    }
  }
  return TokenType.operatorBinaryAssignmentSubtraction;
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
      --parenCount;
      if (decodedToken[0] - startLineIndex > 80) {
        return true;
      } else if (parenCount === 0) {
        return false;
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
  typeOrIdentifier,
  varDec,
  funcDec,
  funcCall,
  assignment,
}
