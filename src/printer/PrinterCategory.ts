enum PrinterCategory {
  prepro = -1,
  singleLineIf = -2,
  typeOrIdentifier = -3,
  doubleTypeOrIdentifier = -4,
  variableDecl = -5,
  multiVariableDecl = -6,
  array = -7,
  arrayWithComment = -8,
  functionDecl = -9,
  functionCall = -10,
  assignmentOverflow = -11,
  typeDefStruct = -12,
}

export default PrinterCategory;
