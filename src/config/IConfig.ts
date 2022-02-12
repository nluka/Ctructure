export default interface IConfig {
  'formatAllWorkspaceFolders.showLogs': boolean;
  'formatWorkspaceFolder.showLogs': boolean;
  'printer.indentationSize': 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  'printer.indentationType': 'tabs' | 'spaces';
  'printer.lineEndings': 'lf' | 'crlf';
  'printer.lineWidth': number; // must be >0
  'printer.multiVariableAlwaysNewline': boolean;
  'printer.multiVariableMatchIndent': boolean;
}
