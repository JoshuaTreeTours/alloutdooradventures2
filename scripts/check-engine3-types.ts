import path from "node:path";
import ts from "typescript";

const projectRoot = process.cwd();
const configPath = ts.findConfigFile(projectRoot, ts.sys.fileExists, "tsconfig.json");

if (!configPath) {
  console.error("Unable to locate tsconfig.json");
  process.exit(1);
}

const readResult = ts.readConfigFile(configPath, ts.sys.readFile);
if (readResult.error) {
  const formatted = ts.formatDiagnosticsWithColorAndContext([readResult.error], {
    getCanonicalFileName: fileName => fileName,
    getCurrentDirectory: () => projectRoot,
    getNewLine: () => ts.sys.newLine,
  });
  console.error(formatted);
  process.exit(1);
}

const parsedConfig = ts.parseJsonConfigFileContent(
  readResult.config,
  ts.sys,
  path.dirname(configPath)
);

const engine3Files = parsedConfig.fileNames.filter(fileName => {
  const normalized = fileName.split(path.sep).join("/");
  return normalized.includes("/src/engine3/") && !normalized.endsWith(".test.ts") && !normalized.endsWith(".test.tsx");
});

const program = ts.createProgram({
  rootNames: engine3Files,
  options: parsedConfig.options,
});

const diagnostics = ts.getPreEmitDiagnostics(program);
const scopedDiagnostics = diagnostics.filter(diagnostic => {
  const fileName = diagnostic.file?.fileName;
  if (!fileName) {
    return false;
  }

  return fileName.split(path.sep).join("/").includes("/src/engine3/");
});

if (scopedDiagnostics.length > 0) {
  const formatted = ts.formatDiagnosticsWithColorAndContext(scopedDiagnostics, {
    getCanonicalFileName: fileName => fileName,
    getCurrentDirectory: () => projectRoot,
    getNewLine: () => ts.sys.newLine,
  });

  console.error(formatted);
  process.exit(1);
}

console.log(`Engine3 typecheck passed (${engine3Files.length} files scanned).`);
