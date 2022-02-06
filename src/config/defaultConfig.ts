import IConfig from './IConfig';

const defaultConfig: IConfig = {
  'formatWorkspaceFiles.showLogs': true,
  'printer.indentationSize': 2,
  'printer.indentationType': 'spaces',
  'printer.lineEndings': 'lf',
  'printer.lineWidth': 80,
  'printer.multiVariableAlwaysNewline': false,
  'printer.multiVariableMatchIndent': true,
};
Object.freeze(defaultConfig);
export default defaultConfig;

export const defaultConfigStringified = `{
  "formatWorkspaceFiles.showLogs": true,
  "printer.indentationSize": 2,
  "printer.indentationType": "spaces",
  "printer.lineEndings": "lf",
  "printer.lineWidth": 80,
  "printer.multiVariableAlwaysNewline": false,
  "printer.multiVariableMatchIndent": true
}
`;
