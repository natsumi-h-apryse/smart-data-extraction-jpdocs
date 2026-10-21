import pdfnetModule from "@pdftron/pdfnet-node";
const { PDFNet } = pdfnetModule;
import fs from "fs";
import path from "path";
import { createRequire } from "module";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
// 実行時のカレントディレクトリに依存しないよう、スクリプトのあるフォルダを基準にする
const scriptDir = path.dirname(fileURLToPath(import.meta.url));

// Tabular Data モジュールは Windows / Linux のみ対応（macOS ビルドなし）。
// Mac では Docker（linux/amd64）上で実行すること。
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

// 入力 PDF（第1引数で単一ファイル指定可。省略時は inputs/ 以下の全 PDF）。出力は JSON と XLSX。
const inputDir = path.join(scriptDir, "inputs");
const outputDir = path.join(scriptDir, "outputs", "tabularExtraction");
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
const single = inputPaths.length === 1;
const outputPathsFor = (inputPath) => {
  const baseName = path.basename(inputPath, path.extname(inputPath));
  return {
    json:
      single && process.argv[3]
        ? path.resolve(process.argv[3])
        : path.join(outputDir, `${baseName}_tabular.json`),
    xlsx:
      single && process.argv[4]
        ? path.resolve(process.argv[4])
        : path.join(outputDir, `${baseName}_tabular.xlsx`),
  };
};

// テキスト層があるか（OCR 済み or デジタル生成 PDF か）を判定する。
// 内蔵 OCR（Tesseract）は日本語非対応/精度が低いため、テキスト層のない画像 PDF は処理しない。
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

  // 表構造の抽出には Tabular Data モジュールが必要
  const engine = PDFNet.DataExtractionModule.DataExtractionEngine.e_Tabular;
  if (!(await PDFNet.DataExtractionModule.isModuleAvailable(engine))) {
    throw new Error(
      "Tabular Data モジュールが見つかりません。\n" +
        "このモジュールは Windows / Linux のみ対応で macOS ビルドはありません。\n" +
        "Mac では Docker（linux/amd64）で実行してください:\n" +
        "  docker build -t sde-jp .\n" +
        '  docker run --rm --env-file .env -v "$PWD/outputs:/app/outputs" sde-jp node tabularextraction.js\n' +
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
  const { json: jsonOutputPath, xlsx: xlsxOutputPath } = outputPathsFor(inputPath);

  console.log(`\n表データ抽出開始: ${inputPath}`);

  // 表構造を JSON 文字列として抽出（行・列・セルが保持される）
  const jsonString = await PDFNet.DataExtractionModule.extractDataAsString(
    inputPath,
    engine,
  );
  const result = JSON.parse(jsonString);
  fs.writeFileSync(jsonOutputPath, JSON.stringify(result, null, 2));
  console.log("✅ JSON 出力:", jsonOutputPath);

  // Excel (XLSX) としても出力
  await PDFNet.DataExtractionModule.extractToXLSX(inputPath, xlsxOutputPath);
  console.log("✅ XLSX 出力:", xlsxOutputPath);

  // 抽出できた表の概要を表示（Tabular の JSON は pages[].elements[].trs[] 構造）
  const tables = [];
  for (const page of result.pages || []) {
    for (const el of page.elements || []) {
      tables.push({
        page: page.properties?.pageNumber,
        columns: el.columnWidths?.length ?? 0,
        rows: el.trs?.length ?? 0,
      });
    }
  }
  console.log("----- 抽出した表の概要 -----");
  console.log(JSON.stringify(tables));

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
