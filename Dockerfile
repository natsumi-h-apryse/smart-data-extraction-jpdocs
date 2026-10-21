# Smart Data Extraction（Data Extraction モジュール）は Windows / Linux のみ対応で macOS ビルドが無い。
# そのため Mac 上では linux/amd64 コンテナで実行する。
FROM --platform=linux/amd64 node:20-bookworm-slim

WORKDIR /app

# TabularData の XLSX 出力は日本語ファイル名を扱うため UTF-8 ロケールが必要
# （未設定だと boost::filesystem::path codecvt エラーになる）
ENV LANG=C.UTF-8 LC_ALL=C.UTF-8

# AIPageObjectExtractor が必要とするネイティブ共有ライブラリ（slim イメージに無い）
RUN apt-get update \
    && apt-get install -y --no-install-recommends libatomic1 libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# 依存をインストール（package-lock どおりに pdfnet-node 12.1.0 を入れる）
COPY package*.json ./
RUN npm ci

# Linux 版 Data Extraction モジュール。以下を同梱している:
#   - AIPageObjectExtractor: 分類・キーバリュー抽出・フォームフィールド検出
#   - TabularData: 表データ抽出
#   - StructuredOutput: ドキュメント構造抽出
# macOS ではインストールできないため package.json には入れず、ここで追加する。
# バージョンは pdfnet-node に合わせて 12.1.0 に固定する。
# 12.2.0 の AIPageObjectExtractor は Apple Silicon 上の amd64 エミュレーション（Rosetta）で
# Illegal instruction（signal 4）で落ち、分類・KVE が実行できないため。
RUN npm install --no-save @pdftron/data-extraction@12.1.0

# アプリ本体をコピー（node_modules と outputs は .dockerignore で除外）
COPY . .

# 既定はキーバリュー抽出を実行
CMD ["node", "keyvalueextraction.js"]
