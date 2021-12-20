import TokenArray from '../lexer/TokenArray';
import TokenType from '../lexer/TokenType';
import findEnd from './findEnd';
import Node, { nodeType } from './node';

function decodeFile(tokenizedFile: TokenArray) {
  const size = tokenizedFile.getSize();
  const decodedFile = [];
  for (let index = 0; index < size; index++) {
    decodedFile.push(tokenizedFile.getDecoded(index));
  }
  return formatter(decodedFile, 0);
}

//if (0 == 0){if (0 == 0){0 == 0;0 == 0undefined
//if (0 == 0){if (0 == 0){0 == 0;0 == 0undefined

export default function formatter(decodedFile: any[], depth: number): Node {
  // sort tokensizedFile
  const spacing = '  ';
  const size = decodedFile.length;
  const root: nodeType = new Node();
  let currNode: nodeType = root;
  for (let index = 0; index < size; index++) {
    if (currNode) {
      const position = decodedFile[index][0];
      const type = decodedFile[index][1];
      switch (type) {
        case TokenType.specialComma:
          currNode.setData(',');
          break;
        case TokenType.specialSemicolon:
          currNode.setData(';\n');
          break;
        case TokenType.specialBracketLeft:
          currNode.setData('[');
          break;
        case TokenType.specialBracketRight:
          currNode.setData(']');
          break;
        case TokenType.specialParenthesisLeft:
          currNode.setData('(');
          break;
        case TokenType.specialParenthesisRight:
          currNode.setData(')');
          break;
        case TokenType.specialBraceLeft:
          currNode.setData(' {\n');
          const fileEnd = findEnd(decodedFile, index);
          currNode.setChild(
            formatter(decodedFile.slice(index + 1, fileEnd), depth + 1),
          );
          index = fileEnd - 1;
          break;
        case TokenType.specialBraceRight:
          currNode.setData('}\n' /* + spacing.repeat(depth)*/);
          break;

        // Preprocessor (https://www.cprogramming.com/reference/preprocessor/)
        case TokenType.preproOperatorConcat:
          break;
        case TokenType.preproDirectiveInclude:
          break;
        case TokenType.preproStandardHeader:
          break;
        case TokenType.preproDirectiveDefine:
          break;
        case TokenType.preproDirectiveContinuation:
          break;
        case TokenType.preproDirectiveUndef:
          break;
        case TokenType.preproDirectiveIf:
          break;
        case TokenType.preproDirectiveIfdef:
          break;
        case TokenType.preproDirectiveIfndef:
          break;
        case TokenType.preproMacroFile:
          break;
        case TokenType.preproMacroLine:
          break;
        case TokenType.preproMacroDate:
          break;
        case TokenType.preproMacroTime:
          break;
        case TokenType.preproMacroTimestamp:
          break;
        case TokenType.preproDirectivePragma:
          break;

        // Unary operator:
        case TokenType.operatorUnaryArithmeticIncrementPrefix:
        case TokenType.operatorUnaryArithmeticIncrementPostfix:
          currNode.setData('++');
          break;
        case TokenType.operatorUnaryArithmeticDecrementPrefix:
        case TokenType.operatorUnaryArithmeticDecrementPostfix:
          currNode.setData('--');
          break;
        case TokenType.operatorUnaryOnesComplement:
          currNode.setData('~');
          break;
        case TokenType.operatorUnaryLogicalNegation:
          currNode.setData('!');
          break;
        case TokenType.operatorUnaryIndirection:
        case TokenType.operatorUnaryDereference:
        case TokenType.operatorBinaryArithmeticMultiplication:
          currNode.setData('*');
          break;

        //Binary operators
        case TokenType.operatorBinaryArithmeticAddition:
          currNode.setData('+');
          break;
        case TokenType.operatorBinaryArithmeticSubtraction:
          currNode.setData('-');
          break;
        case TokenType.operatorBinaryArithmeticDivision:
          currNode.setData('/');
          break;
        case TokenType.operatorBinaryArithmeticMultiplication:
          currNode.setData('%');
          break;
        case TokenType.operatorBinaryComparisonEqualTo:
          currNode.setData(' == ');
          break;
        case TokenType.operatorBinaryComparisonNotEqualTo:
          currNode.setData(' != ');
          break;
        case TokenType.operatorBinaryComparisonGreaterThan:
          currNode.setData(' > ');
          break;
        case TokenType.operatorBinaryComparisonGreaterThanOrEqualTo:
          currNode.setData(' >= ');
          break;
        case TokenType.operatorBinaryComparisonLessThan:
          currNode.setData(' < ');
          break;
        case TokenType.operatorBinaryComparisonLessThanOrEqualTo:
          currNode.setData(' <= ');
          break;
        case TokenType.operatorBinaryLogicalAnd:
          currNode.setData(' && ');
          break;
        case TokenType.operatorBinaryLogicalOr:
          currNode.setData(' || ');
          break;
        case TokenType.operatorBinaryBitwiseAnd:
          currNode.setData(' & ');
          break;
        case TokenType.operatorBinaryBitwiseOr:
          currNode.setData('|');
          break;
        case TokenType.operatorBinaryBitwiseXor:
          currNode.setData('^');
          break;
        case TokenType.operatorBinaryBitwiseShiftLeft:
          currNode.setData('<<');
          break;
        case TokenType.operatorBinaryBitwiseShiftRight:
          currNode.setData('>>');
          break;
        case TokenType.operatorBinaryAssignmentDirect:
          currNode.setData('=');
          break;
        case TokenType.operatorBinaryAssignmentAddition:
          currNode.setData('+=');
          break;
        case TokenType.operatorBinaryAssignmentSubtraction:
          currNode.setData('-=');
          break;
        case TokenType.operatorBinaryAssignmentMultiplication:
          currNode.setData('*=');
          break;
        case TokenType.operatorBinaryAssignmentDivision:
          currNode.setData('/=');
          break;
        case TokenType.operatorBinaryAssignmentModulo:
          currNode.setData('%=');
          break;
        case TokenType.operatorBinaryAssignmentBitwiseShiftLeft:
          currNode.setData('<<=');
          break;
        case TokenType.operatorBinaryAssignmentBitwiseShiftRight:
          currNode.setData('>>=');
          break;
        case TokenType.operatorBinaryAssignmentBitwiseAnd:
          currNode.setData('&=');
          break;
        case TokenType.operatorBinaryAssignmentBitwiseOr:
          currNode.setData('|=');
          break;
        case TokenType.operatorBinaryAssignmentBitwiseXor:
          currNode.setData('^|=');
          break;
        case TokenType.operatorMemberSelectionDirect:
          currNode.setData('.');
          break;
        case TokenType.operatorMemberSelectionIndirect:
          break;
        //Miscellanous operators
        case TokenType.operatorTernaryQuestion:
          break;
        case TokenType.operatorTernaryColon:
          break;

        //Constants
        case TokenType.constantNumber:
          break;
        case TokenType.constantCharacter:
          break;
        case TokenType.constantString:
          break;

        //Keywords (https://en.cppreference.com/w/c/keyword)
        case TokenType.keywordAlignas:
          break;
        case TokenType.keywordAlignof:
          break;
        case TokenType.keywordAuto:
          break;
        case TokenType.keywordAtomic:
          break;
        case TokenType.keywordBool:
          break;
        case TokenType.keywordBreak:
          break;
        case TokenType.keywordCase:
          break;
        case TokenType.keywordChar:
          break;
        case TokenType.keywordComplex:
          break;
        case TokenType.keywordConst:
          break;
        case TokenType.keywordContinue:
          break;
        case TokenType.keywordDefault:
          break;
        case TokenType.keywordDo:
          break;
        case TokenType.keywordDouble:
          break;
        case TokenType.keywordElse:
          break;
        case TokenType.keywordEnum:
          break;
        case TokenType.keywordExtern:
          break;
        case TokenType.keywordFloat:
          break;
        case TokenType.keywordFor:
          break;
        case TokenType.keywordGeneric:
          break;
        case TokenType.keywordGoto:
          break;
        case TokenType.keywordIf:
          currNode.setData('if ');
          break;

        //Other
        case TokenType.identifier:
          currNode.setData('0');
          break;
        case TokenType.label:
          break;
      }

      currNode.setNext(new Node());
      currNode = currNode.getNext();
    }
  }
  root.setData(spacing.repeat(depth) + root.getData());
  return root;
}

function toString(currNode: nodeType) {
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

const file: TokenArray = new TokenArray(32);
file.push(TokenType.keywordIf);
file.push(TokenType.specialParenthesisLeft);
file.push(TokenType.identifier);
file.push(TokenType.operatorBinaryComparisonEqualTo);
file.push(TokenType.identifier);
file.push(TokenType.specialParenthesisRight);
file.push(TokenType.specialBraceLeft);
file.push(TokenType.keywordIf);
file.push(TokenType.specialParenthesisLeft);
file.push(TokenType.identifier);
file.push(TokenType.operatorBinaryComparisonEqualTo);
file.push(TokenType.identifier);
file.push(TokenType.specialParenthesisRight);
file.push(TokenType.specialBraceLeft);
file.push(TokenType.identifier);
file.push(TokenType.operatorBinaryComparisonEqualTo);
file.push(TokenType.identifier);
file.push(TokenType.specialSemicolon);
file.push(TokenType.identifier);
file.push(TokenType.operatorBinaryComparisonEqualTo);
file.push(TokenType.identifier);
file.push(TokenType.specialSemicolon);
file.push(TokenType.specialBraceRight);
file.push(TokenType.identifier);
file.push(TokenType.operatorBinaryComparisonEqualTo);
file.push(TokenType.identifier);
file.push(TokenType.specialSemicolon);
file.push(TokenType.identifier);
file.push(TokenType.operatorBinaryComparisonEqualTo);
file.push(TokenType.identifier);
file.push(TokenType.specialSemicolon);
file.push(TokenType.specialBraceRight);

console.log(toString(decodeFile(file)));

// case TokenType.keywordImaginary:
//   break;
// case TokenType.keywordInt:
//   break;
// case TokenType.keywordLong:
//   break;
// case TokenType.keywordNoreturn:
//   break;
// case TokenType.keywordRegister:
//   break;
// case TokenType.keywordReturn:
//   break;
// case TokenType.keywordShort:
//   break;
// case TokenType.keywordSigned:
//   break;
// case TokenType.keywordSizeof:
//   break;
// case TokenType.keywordStatic:
//   break;
// case TokenType.keywordStaticassert:
//   break;
// case TokenType.keywordStruct:
//   break;
// case TokenType.keywordSwitch:
//   break;
// case TokenType.keywordThreadlocal:
//   break;
// case TokenType.keywordTypedef:
//   break;
// case TokenType.keywordUnion:
//   break;
// case TokenType.keywordUnsigned:
//   break;
// case TokenType.keywordVoid:
//   break;
// case TokenType.keywordVolatile:
//   break;
// case TokenType.keywordWhile:
//   break;
