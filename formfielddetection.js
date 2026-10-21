import pdfnetModule from "@pdftron/pdfnet-node";
const { PDFNet } = pdfnetModule;
import fs from "fs";
import path from "path";
import { createRequire } from "module";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
// 実行時のカレントディレクトリに依存しないよう、スクリプトのあるフォルダを基準にする
const scriptDir = path.dirname(fileURLToPath(import.meta.url));

// フォームフィールド検出は Data Extraction（AIPageObjectExtractor / Form エンジン）モジュールが必要。
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

// 入力 PDF（第1引数で単一ファイル指定可。省略時は inputs/form/ 内の全 PDF）
// 出力: フィールド検出結果の JSON と、検出したフィールドを追加した PDF
const inputDir = path.join(scriptDir, "inputs", "form");
const outputDir = path.join(scriptDir, "outputs", "formFieldDetection");
const inputPaths = process.argv[2]
  ? [path.resolve(process.argv[2])]
  : fs
      .readdirSync(inputDir)
      .filter((f) => f.toLowerCase().endsWith(".pdf"))
      .sort()
      .map((f) => path.join(inputDir, f));
const outputPathsFor = (inputPath) => {
  const baseName = path.basename(inputPath, path.extname(inputPath));
  return {
    json: path.join(outputDir, `${baseName}_formfields.json`),
    pdf: path.join(outputDir, `${baseName}_formfields.pdf`),
  };
};

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

  const engine = PDFNet.DataExtractionModule.DataExtractionEngine.e_Form;
  if (!(await PDFNet.DataExtractionModule.isModuleAvailable(engine))) {
    throw new Error(
      "Data Extraction モジュール（AIPageObjectExtractor）が見つかりません。\n" +
        "このモジュールは Windows / Linux のみ対応で macOS ビルドはありません。\n" +
        "Mac では Docker（linux/amd64）で実行してください:\n" +
        "  docker build -t sde-jp .\n" +
        '  docker run --rm --env-file .env -v "$PWD/outputs:/app/outputs" sde-jp node formfielddetection.js\n' +
        "Linux 環境では `npm install @pdftron/data-extraction` で導入できます。",
    );
  }

  fs.mkdirSync(outputDir, { recursive: true });

  for (const inputPath of inputPaths) {
    try {
      await detect(inputPath, engine);
    } catch (error) {
      // 1ファイル失敗しても残りのファイルは処理を続ける
      console.error(`❌ 失敗: ${path.basename(inputPath)}:`, error.message || error);
    }
  }
};

const detect = async (inputPath, engine) => {
  if (!fs.existsSync(inputPath)) {
    throw new Error(`入力PDFが存在しません: ${inputPath}`);
  }
  if (!(await hasTextLayer(inputPath))) {
    console.log(`\n⏭  スキップ（テキスト層なし・未OCR）: ${path.basename(inputPath)}`);
    return;
  }
  const { json: jsonOutputPath, pdf: pdfOutputPath } = outputPathsFor(inputPath);

  console.log(`\nフォームフィールド検出開始: ${inputPath}`);

  // ① 検出結果を JSON で取得（フィールドの種類・位置）
  const jsonString = await PDFNet.DataExtractionModule.extractDataAsString(
    inputPath,
    engine,
  );
  const result = JSON.parse(jsonString);
  fs.writeFileSync(jsonOutputPath, JSON.stringify(result, null, 2));
  console.log("✅ JSON 出力:", jsonOutputPath);

  // ② 検出したフィールドを実際の AcroForm フィールドとして PDF に追加
  const doc = await PDFNet.PDFDoc.createFromFilePath(inputPath);
  await doc.initSecurityHandler();
  await PDFNet.DataExtractionModule.detectAndAddFormFieldsToPDF(doc);
  await doc.save(pdfOutputPath, PDFNet.SDFDoc.SaveOptions.e_linearized);
  console.log("✅ フィールド追加 PDF 出力:", pdfOutputPath);

  // 追加されたフィールドの種類別件数を表示
  const counts = {};
  for (const itr = await doc.getFieldIteratorBegin(); await itr.hasNext(); await itr.next()) {
    const type = await (await itr.current()).getType();
    counts[type] = (counts[type] || 0) + 1;
  }
  // Field.Type: 0=ボタン 1=チェックボックス 2=ラジオ 3=テキスト 4=選択 5=署名
  console.log("追加フィールド（Field.Type 別件数）:", JSON.stringify(counts));

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
