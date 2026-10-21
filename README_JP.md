# sde-jp — Smart Data Extraction 日本語ドキュメント検証

[English](README.md) | 日本語

Apryse Server SDK の Smart Data Extraction（Data Extraction モジュール）を、日本語のドキュメントに対して実行・評価するためのサンプルです。

| スクリプト | 処理 | エンジン |
|---|---|---|
| `docclassification.js` | ドキュメント分類 | `e_DocClassification` |
| `keyvalueextraction.js` | キーバリュー抽出（KVE） | `e_GenericKeyValue` |
| `tabularextraction.js` | 表データ抽出（JSON＋XLSX） | `e_Tabular` |
| `docstructureextraction.js` | ドキュメント構造抽出 | `e_DocStructure` |
| `formfielddetection.js` | フォームフィールド検出（`inputs/form/` のみ） | `e_Form`＋`detectAndAddFormFieldsToPDF` |

検証結果のまとめは [`outputs/report_jp.md`](outputs/report_jp.md) を参照してください。

## フォルダ構成

```
sde-jp/
├── .env.example          # ライセンスキーの雛形（コピーして .env を作成）
├── Dockerfile
├── package.json
├── *.js                  # 各処理のスクリプト
├── inputs/               # 入力 PDF（サブフォルダも対象）
│   └── form/             # フォーム PDF（フォームフィールド検出の対象）
└── outputs/
    ├── report.md         # 全体の検証レポート（英語）
    ├── report_jp.md      # 全体の検証レポート（日本語）
    ├── docClassification/
    ├── keyValueExtraction/
    ├── tabularExtraction/
    ├── docStructureExtraction/
    └── formFieldDetection/
```

各出力フォルダには、ドキュメントごとの JSON（表抽出は XLSX、フォーム検出はフィールドを追加した PDF も）と、結果の詳細 `results.md` が入ります。

## 必要なもの

- Docker（Mac の場合は Docker Desktop）

Data Extraction モジュールは **Windows / Linux（x64）のみ対応** で、macOS 版はありません。そのため、Mac では `linux/amd64` の Docker コンテナで実行します。

## 実行方法

最初に `.env.example` をコピーして `.env` を作り、`APRYSE_LICENSE_KEY` にライセンスキーを設定します。`.env` は `.gitignore` と `.dockerignore` で除外しているので、Git にもイメージにも含まれません。実行時に `--env-file .env` でコンテナに渡します。

```sh
cp .env.example .env
# .env を編集して APRYSE_LICENSE_KEY=<ライセンスキー> を設定
```

```sh
# イメージを作成（初回と、スクリプトや inputs を変更したとき）
npm run docker:build

# 各処理を実行（結果は outputs/ 以下に出力）
npm run classify       # ドキュメント分類
npm run kve            # キーバリュー抽出
npm run tabular        # 表データ抽出
npm run docstructure   # ドキュメント構造抽出
npm run formfields     # フォームフィールド検出
```

`npm run` を使わない場合は、次のように実行します。

```sh
docker build -t sde-jp .
docker run --rm --env-file .env -v "$PWD/outputs:/app/outputs" sde-jp node docclassification.js
```

1 ファイルだけ処理する場合は、スクリプトの後ろに入力 PDF のパスを付けます（コンテナ内のパス）。

```sh
docker run --rm --env-file .env -v "$PWD/outputs:/app/outputs" sde-jp \
  node keyvalueextraction.js inputs/receipt_ocr-ed_iris.pdf
```

`inputs/` はイメージに含めているため、入力 PDF を追加・変更したらイメージを作り直してください。

## 注意事項

- **テキスト層のない PDF はスキップします。**
- **トライアルライセンスの評価用シート:** トライアルでは、出力にランダムな位置で評価用のページが 1 枚差し込まれます（フォーム検出の出力 PDF にも入ります）。`results.md` と `report_jp.md` では、このページを除外して集計しています。
- **ライセンスキー:** 各スクリプトは環境変数 `APRYSE_LICENSE_KEY` からキーを読み込みます。未設定の場合はエラーで終了します。キーを変更するときは `.env` を書き換えてください（イメージの作り直しは不要です）。
- **バージョンは 12.1.0 に固定しています。** `@pdftron/data-extraction` 12.2.0 の AIPageObjectExtractor（分類・KVE・フォーム検出）は、Apple Silicon の Mac 上の amd64 エミュレーション（Rosetta）で `Illegal instruction`（signal 4）になり実行できないためです。x86_64 の実機（Linux / Windows / クラウド VM）であれば 12.2.0 も使える見込みです（未検証）。その場合は `package.json` と `Dockerfile` のバージョンを合わせて変更してください。
- **XLSX 出力と日本語ファイル名:** コンテナを UTF-8 ロケールにしないと、表抽出の XLSX 出力が失敗します（`Dockerfile` で `LANG=C.UTF-8` を設定済み）。
