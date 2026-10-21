import pdfnetModule from "@pdftron/pdfnet-node";
const { PDFNet } = pdfnetModule;
import fs from "fs";
import path from "path";
import { createRequire } from "module";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
// 実行時のカレントディレクトリに依存しないよう、スクリプトのあるフォルダを基準にする
const scriptDir = path.dirname(fileURLToPath(import.meta.url));

// Document Classification は Data Extraction（AIPageObjectExtractor）モジュールが必要。
// Windows / Linux のみ対応（macOS ビルドなし）のため、Mac では Docker（linux/amd64）上で実行すること。
// Lib パスは「環境変数 → npm パッケージ → ローカル手動DL版」の順で探索する。
const resolveModuleLibPaths = () => {
  const candidates = [];

  if (process.env.DATA_EXTRACTION_MODULE_LIB) {
    candidates.push(process.env.DATA_EXTRACTION_MODULE_LIB);
  }

  try {
    const pkgJson = require.resolve("@pdftron/data-extraction/package.json");
    const pkgDir = path.dirname(pkgJson);
    candidates.push(pkgDir, path.join(pkgDir, "lib"), path.join(pkgDir, "Lib"));
  } catch {
    // 未インストールなら無視
  }

  candidates.push(
    path.join(scriptDir, "DataExtractionModuleLinux/Lib/"),
    path.join(scriptDir, "DataExtractionModuleMac/Lib/"),
  );

  return candidates.filter((p) => fs.existsSync(p));
};

// 入力 PDF（第1引数で単一ファイル指定可。省略時は inputs/ 以下の全 PDF） / 出力 JSON
// OCR 言語は環境変数 OCR_LANG で指定（例: "jpn", "jpn eng"）。未指定ならモジュール既定（英語）。
// 指定した場合は言語ごとに出力フォルダを分ける（例: outputs/docClassification_jpn）
const ocrLang = process.env.OCR_LANG?.trim();
const inputDir = path.join(scriptDir, "inputs");
const outputDir = path.join(
  scriptDir,
  "outputs",
  ocrLang ? `docClassification_${ocrLang.replace(/\s+/g, "_")}` : "docClassification",
);
// inputs/ 以下の PDF をサブフォルダ（form/ など）も含めて再帰的に列挙する
const listPdfs = (dir) =>
  fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((e) => {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) return listPdfs(p);
      return e.name.toLowerCase().endsWith(".pdf") ? [p] : [];
    })
    .sort();
const inputPaths = process.argv[2]
  ? [path.resolve(process.argv[2])]
  : listPdfs(inputDir);
const outputPathFor = (inputPath) =>
  process.argv[3] && inputPaths.length === 1
    ? path.resolve(process.argv[3])
    : path.join(
        outputDir,
        `${path.basename(inputPath, path.extname(inputPath))}_classification.json`,
      );

const main = async () => {
  for (const libPath of resolveModuleLibPaths()) {
    await PDFNet.addResourceSearchPath(libPath);
  }

  const engine =
    PDFNet.DataExtractionModule.DataExtractionEngine.e_DocClassification;
  if (!(await PDFNet.DataExtractionModule.isModuleAvailable(engine))) {
    throw new Error(
      "Data Extraction モジュール（AIPageObjectExtractor）が見つかりません。\n" +
        "このモジュールは Windows / Linux のみ対応で macOS ビルドはありません。\n" +
        "Mac では Docker（linux/amd64）で実行してください:\n" +
        "  docker build -t sde-jp .\n" +
        '  docker run --rm --env-file .env -v "$PWD/outputs:/app/outputs" sde-jp node docclassification.js\n' +
        "Linux 環境では `npm install @pdftron/data-extraction` で導入できます。",
    );
  }

  fs.mkdirSync(outputDir, { recursive: true });

  // オプション: 閾値（既定 0.25）未満のクラスは出力 JSON に含まれない
  const options = new PDFNet.DataExtractionModule.DataExtractionOptions();
  options.setMinimumConfidenceThreshold(0.25);
  if (ocrLang) {
    options.setLanguage(ocrLang);
    console.log(`OCR 言語: ${ocrLang}`);
  }
  // 対象ページを絞る場合: options.setPages("1-3");

  for (const inputPath of inputPaths) {
    try {
      await classify(inputPath, engine, options);
    } catch (error) {
      // 暗号化PDFなどで失敗しても残りのファイルは処理を続ける
      console.error(`❌ 失敗: ${path.basename(inputPath)}:`, error.message || error);
    }
  }
};

const classify = async (inputPath, engine, options) => {
  if (!fs.existsSync(inputPath)) {
    throw new Error(`入力PDFが存在しません: ${inputPath}`);
  }
  const outputPath = outputPathFor(inputPath);

  console.log(`\nドキュメント分類開始: ${inputPath}`);

  const jsonString = await PDFNet.DataExtractionModule.extractDataAsString(
    inputPath,
    engine,
    options,
  );
  const result = JSON.parse(jsonString);
  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
  console.log("✅ JSON 出力:", outputPath);

  // 出力は pages[].documentClasses[]（type / confidence）構造。ページ毎の分類結果を表示
  console.log("----- ページ毎の分類結果 -----");
  for (const page of result.pages || []) {
    const classes = [...(page.documentClasses || [])].sort(
      (a, b) => b.confidence - a.confidence,
    );
    const summary = classes.length
      ? classes
          .map((c) => `${c.type} (${(c.confidence * 100).toFixed(1)}%)`)
          .join(", ")
      : "（閾値以上のクラスなし）";
    console.log(`Page ${page.properties?.pageNumber}: ${summary}`);
  }

  return result;
};

// ライセンスキーは .env の APRYSE_LICENSE_KEY から読み込む（docker run --env-file .env で渡す）
const licenseKey = process.env.APRYSE_LICENSE_KEY;
if (!licenseKey) {
  console.error("APRYSE_LICENSE_KEY が設定されていません。.env を作成してください（.env.example を参照）。");
  process.exit(1);
}

PDFNet.runWithCleanup(
  main,
  licenseKey,
)
  .catch((error) => {
    console.error("詳細エラー:", error);
    console.error("スタック:", error.stack);
  })
  .then(() => PDFNet.shutdown());
