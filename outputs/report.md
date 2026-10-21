# Smart Data Extraction on Japanese Documents — Evaluation Report

- Run date: 2026-10-20
- Environment: Apryse Server SDK (pdfnet-node 12.1.0) + @pdftron/data-extraction 12.1.0, Docker (linux/amd64), trial license
- Targets: 10 PDFs under `inputs/` (including 4 form PDFs under `inputs/form/`). `contract.pdf` is a contract made up mostly of clauses, with no key-value or table structure, so it was excluded from KVE and table extraction
- Tasks run:
  - Document classification (`docclassification.js` / e_DocClassification)
  - Key-value extraction (`keyvalueextraction.js` / e_GenericKeyValue)
  - Table extraction (`tabularextraction.js` / e_Tabular, JSON + XLSX)
  - Document structure extraction (`docstructureextraction.js` / e_DocStructure)
  - Form field detection (`formfielddetection.js` / e_Form + detectAndAddFormFieldsToPDF, form PDFs only)
- Rating symbols (visual inspection; relative to the 10 documents in this evaluation):
  - ◯ Best among the results here, but still contains errors or omissions and needs human review
  - △ Main parts are captured, but errors and omissions are noticeable
  - ▲ Many omissions or broken structure; barely usable
  - ☓ Not captured, or inaccurate
  - \- Not applicable
- **None of the tasks reached a level that can be used in production as is.** ◯ does not mean "production-ready." Classification is shown as Correct / Acceptable (matches an acceptable category) / Incorrect

## 1. Key findings

**Conclusion: For the Japanese documents in this evaluation, none of classification, KVE, table extraction or structure extraction can be called production-level.** Good results were limited to a few documents under favorable conditions, such as tabular forms with ruled lines and digitally generated PDFs, and even those still contain errors. Production use would require post-processing and human review.

1. **Classification was correct for only 2 of 10 documents** (3 of 10 including acceptable categories). The correct ones were the signature certificate application (form, 95.8%) and the OCR'd monorail receipt (receipt, 95.2%). Incorrect results also came with high confidence in the 80–90% range, so the confidence value cannot be used to detect misclassification.
2. **KVE and table extraction gave relatively good results only on tabular forms with ruled lines** (the bus receipt and the electricity bill details). Even there, wrong pairs and empty values appear. Documents without ruled lines and colon-separated fields have many omissions; out of 9 documents, only 1 got ◯ for KVE and 2 for table extraction.
3. **Structure extraction works only on some digitally generated PDFs, and returns no text for OCR'd scanned PDFs.** The invisible text layer added by IRIS OCR is used by KVE, table extraction and classification, but DocStructure ignored it and treated the pages as images (all 3 documents). Only the scanned contract was re-read with the built-in OCR, and the result has many misrecognized characters.
4. **Form field detection mostly finds input fields enclosed by ruled lines** (marriage registration form, signature certificate application). However, some checkboxes, already-checked fields and the placement of signature fields are wrong, so the output PDF needs manual fixes to its fields.

## 2. Overall results

| Document                                  | Content                                                         | Text layer                  | Classification                 | KVE | Table | Structure | Form fields |
| ----------------------------------------- | --------------------------------------------------------------- | --------------------------- | ------------------------------ | --- | ----- | --------- | ----------- |
| contract.pdf                              | Master service agreement (scanned)                              | Existing (OCR at scan time) | **Incorrect** (resume)             | -   | -     | ▲         | -           |
| driverslicense-ocr-ed.pdf                 | Driver's license (photo)                                        | IRIS OCR + manual fixes     | **Incorrect** (receipt)            | △   | △     | ☓         | -           |
| form/attorney.pdf                         | Power of attorney (blank template)                              | Digitally generated         | **Incorrect** (patents)            | △   | ▲     | ◯         | ▲           |
| form/medicalform_ocr_ed.pdf               | Assisted reproductive treatment plan and consent form (scanned) | IRIS OCR + manual fixes     | Acceptable (legal_documents)   | △   | △     | ☓         | △           |
| form/register_of_marriage.pdf             | Marriage registration form (for overseas missions, A3, blank)   | Digitally generated         | **Incorrect** (government_tenders) | ▲   | ▲     | ▲         | △           |
| form/syomei.pdf                           | Application for signature (and thumbprint) certificate (blank)  | Digitally generated         | Correct (form)                 | △   | △     | △         | △           |
| invoice-57-….pdf                          | Receipt for a lounge fee (file name says invoice)               | Digitally generated         | **Incorrect** (scientific_report)  | ▲   | ▲     | ◯         | -           |
| invoice_B003028840.pdf                    | Electricity bill                                                | Digitally generated         | **Incorrect** (financial_reports)  | △   | ◯     | ◯         | -           |
| receipt_875103444-発車オーライネット….pdf | Receipt for a highway bus ticket                                | Digitally generated         | **Incorrect** (form)               | ◯   | ◯     | ◯         | -           |
| receipt_ocr-ed_iris.pdf                   | Osaka Monorail IC card top-up receipt (photo)                   | IRIS OCR + manual fixes     | Correct (receipt)              | △   | ▲     | ☓         | -           |

## 3. Document classification

| Document                                  | Actual category                        | Prediction (top)   | Confidence | Match      | Other candidates          |
| ----------------------------------------- | -------------------------------------- | ------------------ | ---------- | ---------- | ------------------------- |
| contract.pdf                              | legal_documents                        | resume             | 93.4%      | Incorrect  | -                         |
| driverslicense-ocr-ed.pdf                 | id                                     | receipt            | 79.7%      | Incorrect  | -                         |
| form/attorney.pdf                         | legal_documents (form also acceptable) | patents            | 45.0%      | Incorrect  | scientific_report (36.7%) |
| form/medicalform_ocr_ed.pdf               | form (legal_documents also acceptable) | legal_documents    | 87.3%      | Acceptable | -                         |
| form/register_of_marriage.pdf             | form (legal_documents also acceptable) | government_tenders | 92.6%      | Incorrect  | -                         |
| form/syomei.pdf                           | form                                   | form               | 95.8%      | Correct    | -                         |
| invoice-57-….pdf                          | receipt                                | scientific_report  | 93.0%      | Incorrect  | -                         |
| invoice_B003028840.pdf                    | invoice                                | financial_reports  | 90.0%      | Incorrect  | -                         |
| receipt_875103444-発車オーライネット….pdf | receipt                                | form               | 83.7%      | Incorrect  | -                         |
| receipt_ocr-ed_iris.pdf                   | receipt                                | receipt            | 95.2%      | Correct    | -                         |

## 4. Key-value extraction (KVE)

| Document                                  | Pairs extracted | With values | Rating | Notes                                                                                                                                                                                                                            |
| ----------------------------------------- | --------------- | ----------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| contract.pdf                              | 0               | 0           | -      | Not applicable (a contract made up of clauses, with no key-value structure)                                                                                                                                                      |
| driverslicense-ocr-ed.pdf                 | 9               | 8           | △      | Address, issue date, conditions, number and license dates are correct. The name has an empty value; date of birth and expiry date (unlabeled fields) are not captured                                                            |
| form/attorney.pdf                         | 8               | 0           | △      | Values are empty because the form is blank. Address, name and date labels are detected as keys                                                                                                                                   |
| form/medicalform_ocr_ed.pdf               | 31              | 9           | △      | Check items appear as keys with ☐/☒, so the check state can be read. Explanation date, physician, wife's name and ID are correct. The husband's name has an empty value                                                          |
| form/register_of_marriage.pdf             | 38              | 7           | ▲      | Most of the 38 pairs have empty values. Many wrong pairs, such as "の 職 → 令和" and "夫 → そ/の/他"                                                                                                                             |
| form/syomei.pdf                           | 23              | 11          | △      | Applicant name, name in alphabet, passport number, purpose of use, submission destination and contact are detected as keys (values empty because the form is blank). Some split or wrong pairs, such as "形式 → □" and "通 → 合" |
| invoice-57-….pdf                          | 5               | 5           | ▲      | No., total amount and registration number are captured. Colon-separated fields such as "発行日：…" (issue date) are missed                                                                                                       |
| invoice_B003028840.pdf                    | 136             | 63          | △      | Main fields are correct. Wrong pairs in side-by-side fields (e.g. meter multiplier → current reading). The details table is expanded into pairs, giving 136                                                                      |
| receipt_875103444-発車オーライネット….pdf | 14              | 14          | ◯      | Nearly all 14 item name → value pairs in the tabular layout are correct                                                                                                                                                          |
| receipt_ocr-ed_iris.pdf                   | 5               | 5           | △      | No. → 19888, transaction amount → 金10,000円 and date of use → 2026年10月18日 are correct. Two lines of notes are concatenated into the card number value; wrong pair for date of use → issuing station                          |

## 5. Table extraction (Tabular)

| Document                                  | Tables | Size (cols × rows)            | Rating | Notes                                                                                         |
| ----------------------------------------- | ------ | ----------------------------- | ------ | --------------------------------------------------------------------------------------------- |
| contract.pdf                              | 0      | -                             | -      | Not applicable (a contract made up of clauses, with no tables)                                |
| driverslicense-ocr-ed.pdf                 | 2      | 2×1, 7×12                     | △      | Structured into rows per item in 2×1 and 7×12 tables                                          |
| form/attorney.pdf                         | 4      | 2×2, 1×4, 1×1, 2×6            | ▲      | No ruled lines; blocks of text are merely split into tables                                   |
| form/medicalform_ocr_ed.pdf               | 6      | 6×5, 4×22, 1×1, 3×2, 7×7, 1×3 | △      | Mostly reproduces the ruled-line structure (6×5, 4×22, 7×7, etc.). Cells include ☐/☒          |
| form/register_of_marriage.pdf             | 4      | 21×26, 16×19, 2×7, 5×5        | ▲      | Huge 21×26 and 16×19 tables. Red instructions are mixed with the body, with many merged cells |
| form/syomei.pdf                           | 4      | 1×7, 2×4, 6×9, 1×1            | △      | Reproduces the format 1/2 table (2×4) and the applicant section (6×9)                         |
| invoice-57-….pdf                          | 1      | 4×13                          | ▲      | No ruled lines; the whole page becomes a single 4×13 table                                    |
| invoice_B003028840.pdf                    | 3      | 8×22, 5×13, 1×2               | ◯      | Accurately reproduces the billing details as 5×13                                             |
| receipt_875103444-発車オーライネット….pdf | 3      | 1×3, 2×2, 4×13                | ◯      | Accurately reproduces the item name ｜ value table (4×13)                                     |
| receipt_ocr-ed_iris.pdf                   | 2      | 5×8, 1×6                      | ▲      | No ruled lines; 5×8 and 1×6 tables that simply follow the text placement                      |

## 6. Document structure extraction (Document Structure)

| Document                                  | Detected elements                                               | Rating | Notes                                                                                                                                                                                |
| ----------------------------------------- | --------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| contract.pdf                              | paragraph 16, list 4, heading 2                                 | ▲      | Recognizes article headings, paragraphs and lists, but the page image is re-read with the built-in OCR, so there are many misrecognized characters (e.g. InspireHigh → Tnsp{re High) |
| driverslicense-ocr-ed.pdf                 | group 1                                                         | ☓      | No text. Only a group of the card image and face photo (the OCR text layer is not used)                                                                                              |
| form/attorney.pdf                         | paragraph 10, heading 1                                         | ◯      | Correctly recognizes the title as a heading and the rest as paragraphs                                                                                                               |
| form/medicalform_ocr_ed.pdf               | group 1                                                         | ☓      | No text. Only a group of the whole page as an image (the OCR text layer is not used)                                                                                                 |
| form/register_of_marriage.pdf             | paragraph 77, textbox 6, graphic 4, heading 1, group 1, table 1 | ▲      | Detects tables and text boxes, but the non-printing red instructions overlap the body and the reading order breaks                                                                   |
| form/syomei.pdf                           | paragraph 7, table 1, group 1                                   | △      | Paragraphs in the upper half and the format table are correct. Input fields in the lower half are lumped into one group and the reading order breaks                                 |
| invoice-57-….pdf                          | paragraph 9, heading 2, group 1, textbox 1                      | ◯      | Accurately recognizes headings and paragraphs. The issue date and tax breakdown missed by KVE are captured as paragraphs                                                             |
| invoice_B003028840.pdf                    | paragraph 14, textbox 4, heading 2, image 1, table 1            | ◯      | Captures the details as a table (31 rows) and the billing amount and customer information as text boxes                                                                              |
| receipt_875103444-発車オーライネット….pdf | paragraph 7, image 2, table 2                                   | ◯      | Recognizes both tables as tables, with a natural reading order                                                                                                                       |
| receipt_ocr-ed_iris.pdf                   | group 1                                                         | ☓      | No text. Only a group of the image (the OCR text layer is not used)                                                                                                                  |

## 7. Form field detection (form PDFs only)

| Document                      | Fields added                     | Rating | Notes                                                                                                                                                                                                                                                                                                                                                                                      |
| ----------------------------- | -------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| form/attorney.pdf             | text 6                           | ▲      | Date and address fields are detected. The (1)(2) authority fields and the principal's name field are missed, and there is an unneeded field near "以上" (end)                                                                                                                                                                                                                              |
| form/medicalform_ocr_ed.pdf   | checkbox 20, text 8, signature 1 | △      | Most empty ☐ are detected (checked ☒ and some ☐ are missed). Fields inside the "その他" (other) parentheses and free-text fields are appropriate. The signature field is placed on the husband's name field, and the handwritten signature field (gray) is treated as text                                                                                                                 |
| form/register_of_marriage.pdf | text 48, checkbox 8, signature 1 | △      | Most input fields — name, date of birth, address, registered domicile, parents, witnesses, other — are detected accurately, as are the 8 husband/wife checkboxes in (7). The husband's/wife's surname, first/re-marriage and bereavement/divorce checkboxes are missed. There is an unneeded field over the instructions at the top, and the signature field sits on the case number field |
| form/syomei.pdf               | checkbox 5, text 16              | △      | Format 1/2 checkboxes, name, name in alphabet, passport number, current address, purpose of use, submission destination, contact and remarks are correct. The required copies / total fields are misaligned, yes/no is treated as text, "日本" (Japan) gets a wrong checkbox, and the application date at the top is missed                                                                |

PDFs with fields added: `formFieldDetection/<name>_formfields.pdf`

## 8. Suitability by use case (based on these results)

None of the use cases is currently at a level that can be used in production as is.

| Use case                                    | Task                 | Caveats                                                                                                                              |
| ------------------------------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Automatically sorting documents by type     | Classification       | Low accuracy on Japanese documents. Cannot be used on its own at present                                                             |
| Pulling specific values from forms          | KVE                  | Wrong pairs and empty values appear even in tabular forms with ruled lines. Post-processing and human review are required            |
| Converting tables to Excel / CSV            | Table extraction     | Relatively good only for tables with ruled lines. Unusable for documents without ruled lines (e.g. the whole page becomes one table) |
| Full-text extraction and chunking for RAG   | Structure extraction | Only some digitally generated PDFs. Reading order breaks on forms, and scanned PDFs cannot be used even after OCR                    |
| Turning paper forms into fillable PDF forms | Form field detection | Mostly detects input fields enclosed by ruled lines. Checkboxes and signature fields need manual fixes                               |

## 9. Notes

- **Trial version:** A trial evaluation page is inserted at a random position in each task's output (including the form field detection output PDFs). This report excludes it from the counts.
- **The 3 OCR'd documents:** `driverslicense-ocr-ed.pdf`, `medicalform_ocr_ed.pdf` and `receipt_ocr-ed_iris.pdf` were OCR'd in Japanese with IRIS, and the resulting JSON was manually corrected and applied (`ocr_iris.js` → JSON fixes → `applyOcrJson.js`).
- **Documents containing personal information:** The driver's license (`driverslicense-ocr-ed.pdf`) and the electricity bill (`invoice_B003028840.pdf`) contain personal information, so their input PDFs and all output files from each task (JSON, XLSX) are excluded via `.gitignore` and are not in the repository. The extraction details are also omitted from each `results.md`; this report includes only ratings and notes.
- **Version:** data-extraction 12.2.0 crashes with Illegal instruction in classification and KVE under amd64 emulation on Apple Silicon, so the Dockerfile pins 12.1.0.
- **Details:** Full per-document results for each task are in the `results.md` in each folder (in Japanese).
