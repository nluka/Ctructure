export default interface IConfig {
  indentationSize: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  indentationType: 'tabs' | 'spaces';
  lineWidth: number;
  lineEndings: 'LF' | 'CRLF';
  multiVariableAlwaysNewline: boolean;
  multiVariableMatchIndent: boolean;
  logToFile: boolean;
}
