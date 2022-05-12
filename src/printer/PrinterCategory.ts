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
  assignmentOverflow = -10,
  typeDefStruct = -11,
}

export default PrinterCategory;
