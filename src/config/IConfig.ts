export default interface IConfig {
  lineEndings: 'unix' | 'windows';
  indentationType: 'tabs' | 'spaces';
  indentationSize: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  multiVariableNewLine: boolean;
}
