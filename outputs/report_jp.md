# 日本語ドキュメント Smart Data Extraction 検証レポート

[English](report.md) | 日本語

- 実行日: 2026-10-20
- 環境: Apryse Server SDK（pdfnet-node 12.1.0）＋ @pdftron/data-extraction 12.1.0、Docker（linux/amd64）、トライアルライセンス
- 対象: `inputs/` 以下の PDF 10 件（うちフォーム PDF `inputs/form/` 4 件）。`contract.pdf` は条文中心の契約書でキーと値・表の構造がないため、KVE と表抽出の対象外とした
- 実行した処理:
  - ドキュメント分類（`docclassification.js` / e_DocClassification）
  - キーバリュー抽出（`keyvalueextraction.js` / e_GenericKeyValue）
  - 表データ抽出（`tabularextraction.js` / e_Tabular、JSON＋XLSX）
  - ドキュメント構造抽出（`docstructureextraction.js` / e_DocStructure）
  - フォームフィールド検出（`formfielddetection.js` / e_Form＋detectAndAddFormFieldsToPDF、フォーム PDF のみ）
- 評価記号（目視・今回の 10 件の中での相対評価）:
  - ◯ 今回の中では最も良い。ただし誤りや欠落があり、人の確認が必要
  - △ 主要部分は取れるが、誤り・欠落が目立つ
  - ▲ 取りこぼし・崩れが多く、ほぼ使えない
  - ☓ 取得できない・不正確
  - \- 対象外
- **いずれの処理も、プロダクションでそのまま使えるレベルには達していない。** ◯ も「実用レベル」を意味しない。分類は「正解／許容（許容カテゴリに一致）／不正解」で示す

## 1. 主な所見

**結論: 今回の日本語ドキュメントでは、分類・KVE・表抽出・構造抽出のいずれもプロダクションレベルとは言えない。** 良い結果が出たのは、罫線のある表形式の帳票やデジタル生成 PDF といった条件の良い一部の書類に限られ、それでも誤りが残る。本番で使う場合は、後処理と人による確認が前提となる。

1. **分類の正解は 2/10 件**（許容カテゴリを含めると 3/10 件）。正解したのは署名証明申請書（form 95.8%）と、OCR したモノレール領収証（receipt 95.2%）。外れたものも 80〜90% 台の高い Confidence が付くため、Confidence の値で誤判定を見分けることはできない。
2. **KVE と表抽出は、罫線のある表形式の帳票でのみ比較的良い結果になった**（バス領収書・電気料金の明細）。それでも誤ペアや空値が混ざる。罫線のない書類やコロン区切りの項目は取りこぼしが多く、9 件中 ◯ は KVE が 1 件、表抽出が 2 件にとどまる。
3. **構造抽出は、デジタル生成 PDF の一部でしか機能しない。OCR 済みのスキャン PDF ではテキストを返さない**。IRIS で OCR して付けた不可視のテキスト層は、KVE・表抽出・分類では使われるが、DocStructure では使われずに画像として扱われた（3 件すべて）。スキャンの契約書だけは内蔵 OCR で読み直されたが、誤字が多い。
4. **フォームフィールド検出は、罫線で囲まれた記入欄はおおむね検出する**（婚姻届・署名証明申請書）。ただしチェックボックスの一部、すでにチェック済みの欄、署名欄の位置づけに誤りがあり、出力 PDF はフィールドの手直しが必要。
5. **日本語のテキスト自体の品質**は、デジタル生成 PDF と IRIS で OCR して手修正した PDF ではほぼ崩れない。精度の差は、主にレイアウトの解釈から生じている。

## 2. 総合結果

| ドキュメント | 内容 | テキスト層 | 分類 | KVE | 表抽出 | 構造抽出 | フォーム検出 |
|---|---|---|---|---|---|---|---|
| contract.pdf | 業務委託基本契約書（スキャン） | 既存（スキャン時の OCR） | **不正解**（resume） | - | - | ▲ | - |
| driverslicense-ocr-ed.pdf | 運転免許証（写真） | IRIS OCR＋手修正 | **不正解**（receipt） | △ | △ | ☓ | - |
| form/attorney.pdf | 委任状（未記入テンプレート） | デジタル生成 | **不正解**（patents） | △ | ▲ | ◯ | ▲ |
| form/medicalform_ocr_ed.pdf | 生殖補助医療 診療計画書・同意書（スキャン） | IRIS OCR＋手修正 | 許容（legal_documents） | △ | △ | ☓ | △ |
| form/register_of_marriage.pdf | 婚姻届（在外公館用・A3・未記入） | デジタル生成 | **不正解**（government_tenders） | ▲ | ▲ | ▲ | △ |
| form/syomei.pdf | 署名（及び拇印）証明申請書（未記入） | デジタル生成 | 正解（form） | △ | △ | △ | △ |
| invoice-57-….pdf | ラウンジ利用料の領収書（ファイル名は invoice） | デジタル生成 | **不正解**（scientific_report） | ▲ | ▲ | ◯ | - |
| invoice_B003028840.pdf | 電気料金の請求書 | デジタル生成 | **不正解**（financial_reports） | △ | ◯ | ◯ | - |
| receipt_875103444-発車オーライネット….pdf | 高速バス乗車券の領収書 | デジタル生成 | **不正解**（form） | ◯ | ◯ | ◯ | - |
| receipt_ocr-ed_iris.pdf | 大阪モノレール IC チャージ領収証（写真） | IRIS OCR＋手修正 | 正解（receipt） | △ | ▲ | ☓ | - |

## 3. ドキュメント分類

| ドキュメント | 実際の分類 | 判定（最上位） | Confidence | 一致 | その他の候補 |
|---|---|---|---|---|---|
| contract.pdf | legal_documents | resume | 93.4% | 不正解 | - |
| driverslicense-ocr-ed.pdf | id | receipt | 79.7% | 不正解 | - |
| form/attorney.pdf | legal_documents（form も可） | patents | 45.0% | 不正解 | scientific_report (36.7%) |
| form/medicalform_ocr_ed.pdf | form（legal_documents も可） | legal_documents | 87.3% | 許容 | - |
| form/register_of_marriage.pdf | form（legal_documents も可） | government_tenders | 92.6% | 不正解 | - |
| form/syomei.pdf | form | form | 95.8% | 正解 | - |
| invoice-57-….pdf | receipt | scientific_report | 93.0% | 不正解 | - |
| invoice_B003028840.pdf | invoice | financial_reports | 90.0% | 不正解 | - |
| receipt_875103444-発車オーライネット….pdf | receipt | form | 83.7% | 不正解 | - |
| receipt_ocr-ed_iris.pdf | receipt | receipt | 95.2% | 正解 | - |

## 4. キーバリュー抽出（KVE）

| ドキュメント | 抽出件数 | うち値あり | 評価 | 所見 |
|---|---|---|---|---|
| contract.pdf | 0 | 0 | - | 対象外（条文中心の契約書で、キーと値の構造がない） |
| driverslicense-ocr-ed.pdf | 9 | 8 | △ | 住所・交付・条件・番号・免許日付は正確。氏名は値が空、生年月日・有効期限（ラベルのない欄）は取得されない |
| form/attorney.pdf | 8 | 0 | △ | 未記入のため値は空。住所・氏名・日付のラベルをキーとして検出 |
| form/medicalform_ocr_ed.pdf | 31 | 9 | △ | チェック項目が ☐/☒ 付きのキーとして並び、チェック状態を判別できる。説明日・担当医・妻の氏名・ID は正確。夫の氏名は値が空 |
| form/register_of_marriage.pdf | 38 | 7 | ▲ | 38 件の大半が空値。「の 職 → 令和」「夫 → そ/の/他」など誤ペアが多い |
| form/syomei.pdf | 23 | 11 | △ | 申請人氏名・ｱﾙﾌｧﾍﾞｯﾄ・旅券番号・使用目的・提出先・連絡先をキーとして検出（未記入で値は空）。「形式 → □」「通 → 合」など分割・誤ペアあり |
| invoice-57-….pdf | 5 | 5 | ▲ | No.・合計金額・登録番号は取得。「発行日：…」のようにコロンで区切った項目を取りこぼす |
| invoice_B003028840.pdf | 136 | 63 | △ | 主要項目は正確。横並びの欄で誤ペアあり（計器乗率 → 当月指示数 など）。明細表がペアに展開され 136 件 |
| receipt_875103444-発車オーライネット….pdf | 14 | 14 | ◯ | 表形式の項目名 → 値の 14 件がほぼすべて正確 |
| receipt_ocr-ed_iris.pdf | 5 | 5 | △ | No. → 19888、取引金額 → 金10,000円、ご利用日付 → 2026年10月18日 は正確。カード番号の値に注意書き 2 行が連結、ご利用日付 → 発行駅の誤ペア |

## 5. 表データ抽出（Tabular）

| ドキュメント | 表の数 | サイズ（列×行） | 評価 | 所見 |
|---|---|---|---|---|
| contract.pdf | 0 | - | - | 対象外（条文中心の契約書で、表がない） |
| driverslicense-ocr-ed.pdf | 2 | 2×1, 7×12 | △ | 2×1・7×12 の表で項目ごとの行に構造化 |
| form/attorney.pdf | 4 | 2×2, 1×4, 1×1, 2×6 | ▲ | 罫線がなく、テキストのまとまりが表として分割されるだけ |
| form/medicalform_ocr_ed.pdf | 6 | 6×5, 4×22, 1×1, 3×2, 7×7, 1×3 | △ | 罫線構造をおおむね再現（6×5・4×22・7×7 など）。☐/☒ 付きでセル化 |
| form/register_of_marriage.pdf | 4 | 21×26, 16×19, 2×7, 5×5 | ▲ | 21×26・16×19 の巨大な表。赤字の注意書きと本文が混ざり、結合セルが多い |
| form/syomei.pdf | 4 | 1×7, 2×4, 6×9, 1×1 | △ | 形式1/2 の表（2×4）と申請者欄（6×9）を再現 |
| invoice-57-….pdf | 1 | 4×13 | ▲ | 罫線がなく、ページ全体が 4×13 の 1 つの表 |
| invoice_B003028840.pdf | 3 | 8×22, 5×13, 1×2 | ◯ | ご請求明細を 5×13 で正確に再現 |
| receipt_875103444-発車オーライネット….pdf | 3 | 1×3, 2×2, 4×13 | ◯ | 項目名｜値の表（4×13）を正確に再現 |
| receipt_ocr-ed_iris.pdf | 2 | 5×8, 1×6 | ▲ | 罫線がなく、テキストの配置どおりの 5×8・1×6 の表 |

## 6. ドキュメント構造抽出（Document Structure）

| ドキュメント | 検出要素 | 評価 | 所見 |
|---|---|---|---|
| contract.pdf | paragraph 16, list 4, heading 2 | ▲ | 条見出し・段落・リストを認識。ただしページ画像を内蔵 OCR で読み直すため誤字が多い（例: InspireHigh → Tnsp{re High） |
| driverslicense-ocr-ed.pdf | group 1 | ☓ | テキスト 0 件。カード画像と顔写真の group のみ（OCR テキスト層を使わない） |
| form/attorney.pdf | paragraph 10, heading 1 | ◯ | タイトルを heading、ほかを段落として正しく認識 |
| form/medicalform_ocr_ed.pdf | group 1 | ☓ | テキスト 0 件。ページ全体が画像の group のみ（OCR テキスト層を使わない） |
| form/register_of_marriage.pdf | paragraph 77, textbox 6, graphic 4, heading 1, group 1, table 1 | ▲ | 表・テキストボックスは検出するが、印刷されない赤字の注意書きと本文が重なり、読み順が崩れる |
| form/syomei.pdf | paragraph 7, table 1, group 1 | △ | 上半分の段落と形式の表は正確。下半分の記入欄は 1 つの group にまとまり、読み順が崩れる |
| invoice-57-….pdf | paragraph 9, heading 2, group 1, textbox 1 | ◯ | 見出し・段落を正確に認識。KVE で落ちた発行日・税の内訳も段落として取得 |
| invoice_B003028840.pdf | paragraph 14, textbox 4, heading 2, image 1, table 1 | ◯ | 明細を table（31 行）、請求金額・需要者情報を textbox で取得 |
| receipt_875103444-発車オーライネット….pdf | paragraph 7, image 2, table 2 | ◯ | 2 つの表を table として認識し、読み順も自然 |
| receipt_ocr-ed_iris.pdf | group 1 | ☓ | テキスト 0 件。画像の group のみ（OCR テキスト層を使わない） |

## 7. フォームフィールド検出（フォーム PDF のみ）

| ドキュメント | 追加フィールド | 評価 | 所見 |
|---|---|---|---|
| form/attorney.pdf | テキスト 6 | ▲ | 日付欄・住所欄は検出。(1)(2) の権限記入欄と委任者の氏名欄は未検出で、「以上」の付近に不要な欄がある |
| form/medicalform_ocr_ed.pdf | チェックボックス 20, テキスト 8, 署名 1 | △ | 空欄の ☐ は大半を検出（チェック済みの ☒ と一部の ☐ は未検出）。「その他」の括弧内・自由記述欄は適切。署名フィールドが夫の氏名欄に置かれ、自署欄（グレー塗り）はテキスト扱い |
| form/register_of_marriage.pdf | テキスト 48, チェックボックス 8, 署名 1 | △ | 氏名・生年月日・住所・本籍・父母・証人欄・その他欄など大半の記入欄を正確に検出。(7) の夫/妻チェック欄 8 個も検出。□夫の氏/妻の氏・初婚/再婚・死別/離別は未検出。上部の注意書きの上に不要な欄、署名フィールドが事件簿番号欄にある |
| form/syomei.pdf | チェックボックス 5, テキスト 16 | △ | 形式1/2 のチェック、氏名・ｱﾙﾌｧﾍﾞｯﾄ・旅券番号・現住所・使用目的・提出先・連絡先・備考は正確。必要通数/合計の欄がずれる、有/無がテキスト扱い、「日本」に誤ったチェック、冒頭の申請日は未検出 |

フィールドを追加した PDF: `formFieldDetection/<名前>_formfields.pdf`

## 8. 処理ごとの向き・不向き（今回の結果からの見立て）

いずれの用途も、現状はプロダクションでそのまま使えるレベルではない。

| 用途 | 向いている処理 | 注意点 |
|---|---|---|
| 書類の種類の自動振り分け | 分類 | 日本語書類では正解率が低い。現状は単独で使えない |
| 帳票から特定項目の値を取る | KVE | 罫線のある表形式でも誤ペア・空値が混ざる。後処理と人の確認が必須 |
| 表を Excel / CSV にする | 表抽出 | 罫線のある表でのみ比較的良い。罫線のない書類はページ全体が 1 つの表になるなど使えない |
| 全文テキスト化・RAG 用のチャンク分割 | 構造抽出 | デジタル生成 PDF の一部のみ。フォームは読み順が崩れ、スキャン PDF は事前に OCR しても使えない |
| 紙の様式を入力可能な PDF フォームにする | フォーム検出 | 罫線で囲まれた記入欄はおおむね検出。チェックボックス・署名欄は手直しが必要 |

## 9. 補足

- **トライアル版:** 各処理の出力には評価用シートがランダムな位置に 1 ページ差し込まれる（フォーム検出の出力 PDF にも入る）。このレポートでは除外して集計した。
- **OCR 済みの 3 件:** `driverslicense-ocr-ed.pdf`・`medicalform_ocr_ed.pdf`・`receipt_ocr-ed_iris.pdf` は、IRIS で日本語 OCR し、JSON を手修正して適用したもの（`ocr_iris.js` → JSON 修正 → `applyOcrJson.js`）。
- **個人情報を含むドキュメント:** 運転免許証（`driverslicense-ocr-ed.pdf`）と電気料金の請求書（`invoice_B003028840.pdf`）は個人情報を含むため、入力 PDF と各処理の出力ファイル（JSON・XLSX）はすべて `.gitignore` で除外し、リポジトリには含めていない。各 `results.md` でも抽出結果の詳細は省略し、このレポートには評価と所見のみを記載している。
- **バージョン:** data-extraction 12.2.0 は Apple Silicon 上の amd64 エミュレーションで分類・KVE が Illegal instruction で落ちるため、Dockerfile で 12.1.0 に固定している。
- **詳細:** 処理ごとの全件の結果は各フォルダの `results.md` を参照。
