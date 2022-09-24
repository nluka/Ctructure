import IConfig from './IConfig';

const defaultConfig: IConfig = {
  'formatAllWorkspaceFolders.showLogs': true,
  'formatWorkspaceFolder.showLogs': true,
  'printer.indentationSize': 2,
  'printer.indentationType': 'spaces',
  'printer.lineEndings': 'lf',
  'printer.lineWidth': 80,
  'printer.multiVariableAlwaysNewline': false,
  'printer.multiVariableMatchIndent': false,
};
Object.freeze(defaultConfig);
export default defaultConfig;

export const defaultConfigStringified = `{
  "formatAllWorkspaceFolders.showLogs": true,
  "formatWorkspaceFolder.showLogs": true,
  "printer.indentationSize": 2,
  "printer.indentationType": "spaces",
  "printer.lineEndings": "lf",
  "printer.lineWidth": 80,
  "printer.multiVariableAlwaysNewline": false,
  "printer.multiVariableMatchIndent": false
}
`;
