import pdfnetModule from "@pdftron/pdfnet-node";
const { PDFNet } = pdfnetModule;
import fs from "fs";
import path from "path";
import { createRequire } from "module";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
// 実行時のカレントディレクトリに依存しないよう、スクリプトのあるフォルダを基準にする
const scriptDir = path.dirname(fileURLToPath(import.meta.url));

// Data Extraction（AIPageObjectExtractor / KVE）モジュールは Windows / Linux のみ対応。
// macOS ビルドは存在しないため、Mac では Docker（linux/amd64）上で実行すること。
// モジュールの Lib パスは以下の優先順で探索する:
//   1. 環境変数 DATA_EXTRACTION_MODULE_LIB
//   2. npm パッケージ @pdftron/data-extraction （Dockerfile でインストール）
//   3. DataExtractionModule*/Lib （手動ダウンロード時。スクリプト横 → リポジトリ直下）
const resolveModuleLibPaths = () => {
  const candidates = [];

  if (process.env.DATA_EXTRACTION_MODULE_LIB) {
    candidates.push(process.env.DATA_EXTRACTION_MODULE_LIB);
  }

  // npm パッケージのインストール先を解決
  try {
    const pkgJson = require.resolve("@pdftron/data-extraction/package.json");
    const pkgDir = path.dirname(pkgJson);
    candidates.push(pkgDir, path.join(pkgDir, "lib"), path.join(pkgDir, "Lib"));
  } catch {
    // 未インストールなら無視
  }

  // 手動ダウンロード版
  candidates.push(
    path.join(scriptDir, "DataExtractionModuleLinux/Lib/"),
    path.join(scriptDir, "DataExtractionModuleMac/Lib/"),
  );

  return candidates.filter((p) => fs.existsSync(p));
};

// 入力 PDF（第1引数で単一ファイル指定可。省略時は inputs/ 以下の全 PDF） / 出力 JSON
const inputDir = path.join(scriptDir, "inputs");
const outputDir = path.join(scriptDir, "outputs", "keyValueExtraction");
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
        `${path.basename(inputPath, path.extname(inputPath))}_keyvalue.json`,
      );

// テキスト層があるか（OCR 済み or デジタル生成 PDF か）を判定する。
// 内蔵 OCR（Tesseract）は日本語の精度が低いため、テキスト層のない画像 PDF は処理しない。
const hasTextLayer = async (inputPath) => {
  const doc = await PDFNet.PDFDoc.createFromFilePath(inputPath);
  await doc.initSecurityHandler();
  const extractor = await PDFNet.TextExtractor.create();
  for (const itr = await doc.getPageIterator(); await itr.hasNext(); await itr.next()) {
    await extractor.begin(await itr.current());
    if ((await extractor.getAsText()).trim().length > 0) return true;
  }
  return false;
};

const main = async () => {
  for (const libPath of resolveModuleLibPaths()) {
    await PDFNet.addResourceSearchPath(libPath);
  }

  // KVE（キーバリュー抽出）には AIPageObjectExtractor モジュールが必要
  const engine =
    PDFNet.DataExtractionModule.DataExtractionEngine.e_GenericKeyValue;
  if (!(await PDFNet.DataExtractionModule.isModuleAvailable(engine))) {
    throw new Error(
      "Data Extraction モジュール（AIPageObjectExtractor）が見つかりません。\n" +
        "このモジュールは Windows / Linux のみ対応で macOS ビルドはありません。\n" +
        "Mac では Docker（linux/amd64）で実行してください:\n" +
        "  docker build -t sde-jp .\n" +
        '  docker run --rm --env-file .env -v "$PWD/outputs:/app/outputs" sde-jp node keyvalueextraction.js\n' +
        "Linux 環境では `npm install @pdftron/data-extraction` で導入できます。",
    );
  }

  fs.mkdirSync(outputDir, { recursive: true });

  for (const inputPath of inputPaths) {
    try {
      await extract(inputPath, engine);
    } catch (error) {
      // 1ファイル失敗しても残りのファイルは処理を続ける
      console.error(`❌ 失敗: ${path.basename(inputPath)}:`, error.message || error);
    }
  }
};

const extract = async (inputPath, engine) => {
  if (!fs.existsSync(inputPath)) {
    throw new Error(`入力PDFが存在しません: ${inputPath}`);
  }
  if (!(await hasTextLayer(inputPath))) {
    console.log(`\n⏭  スキップ（テキスト層なし・未OCR）: ${path.basename(inputPath)}`);
    return;
  }
  const outputPath = outputPathFor(inputPath);

  console.log(`\nキーバリュー抽出開始: ${inputPath}`);

  // JSON 文字列としてキーバリューを抽出
  const jsonString = await PDFNet.DataExtractionModule.extractDataAsString(
    inputPath,
    engine,
  );

  // パースして JSON として扱う
  const result = JSON.parse(jsonString);

  // ファイルへ保存
  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));

  console.log("✅ 抽出成功:", outputPath);

  // 抽出件数をページ毎に表示（KVE の JSON は pages[].keyValueElements[] 構造）
  for (const page of result.pages || []) {
    console.log(
      `Page ${page.properties?.pageNumber}: ${(page.keyValueElements || []).length} 件`,
    );
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
