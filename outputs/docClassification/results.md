# ドキュメント分類結果

- 出力元: `docclassification.js`
- 全体のまとめは `../report_jp.md` を参照
- 一致: 2/10 件（許容カテゴリを含めると 3/10 件）

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

※ トライアルライセンスのため、出力には評価用シート（ランダムな位置に差し込まれるページ）が含まれます。この表ではそのページを除外し、ページ番号を元の PDF に合わせています。
