# Smart Data Extraction on Japanese Documents

Samples for running and evaluating Smart Data Extraction (the Data Extraction module) in the Apryse Server SDK against Japanese documents.

| Script | Task | Engine |
|---|---|---|
| `docclassification.js` | Document classification | `e_DocClassification` |
| `keyvalueextraction.js` | Key-value extraction (KVE) | `e_GenericKeyValue` |
| `tabularextraction.js` | Table extraction (JSON + XLSX) | `e_Tabular` |
| `docstructureextraction.js` | Document structure extraction | `e_DocStructure` |
| `formfielddetection.js` | Form field detection (`inputs/form/` only) | `e_Form` + `detectAndAddFormFieldsToPDF` |

For a summary of the evaluation results, see [`outputs/report.md`](outputs/report.md).

## Folder structure

```
sde-jp/
├── .env.example          # License key template (copy it to create .env)
├── Dockerfile
├── package.json
├── *.js                  # Scripts for each task
├── inputs/               # Input PDFs (subfolders included)
│   └── form/             # Form PDFs (used for form field detection)
└── outputs/
    ├── report.md         # Overall evaluation report (English)
    ├── report_jp.md      # Overall evaluation report (Japanese)
    ├── docClassification/
    ├── keyValueExtraction/
    ├── tabularExtraction/
    ├── docStructureExtraction/
    └── formFieldDetection/
```

Each output folder contains a JSON file per document (plus XLSX for table extraction, and a PDF with the added fields for form field detection), along with a detailed `results.md`.

## Requirements

- Docker (Docker Desktop on Mac)

The Data Extraction module **supports only Windows / Linux (x64)**; there is no macOS build. On Mac, the scripts therefore run in a `linux/amd64` Docker container.

## Usage

First, copy `.env.example` to `.env` and set `APRYSE_LICENSE_KEY` to your license key. `.env` is excluded by `.gitignore` and `.dockerignore`, so it is not included in Git or in the image. It is passed to the container at run time with `--env-file .env`.

```sh
cp .env.example .env
# Edit .env and set APRYSE_LICENSE_KEY=<your license key>
```

```sh
# Build the image (first time, and whenever scripts or inputs change)
npm run docker:build

# Run each task (results are written under outputs/)
npm run classify       # Document classification
npm run kve            # Key-value extraction
npm run tabular        # Table extraction
npm run docstructure   # Document structure extraction
npm run formfields     # Form field detection
```

Without `npm run`, run them as follows:

```sh
docker build -t sde-jp .
docker run --rm --env-file .env -v "$PWD/outputs:/app/outputs" sde-jp node docclassification.js
```

To process a single file, pass the input PDF path after the script (a path inside the container):

```sh
docker run --rm --env-file .env -v "$PWD/outputs:/app/outputs" sde-jp \
  node keyvalueextraction.js inputs/receipt_ocr-ed_iris.pdf
```

`inputs/` is built into the image, so rebuild the image after adding or changing input PDFs.

## Notes

- **PDFs without a text layer are skipped.**
- **Trial license evaluation page:** With a trial license, one evaluation page is inserted at a random position in the output (including the PDFs produced by form field detection). `results.md` and `report.md` exclude this page from their counts.
- **License key:** Each script reads the key from the `APRYSE_LICENSE_KEY` environment variable and exits with an error if it is not set. To change the key, edit `.env` (no image rebuild needed).
- **The version is pinned to 12.1.0.** In `@pdftron/data-extraction` 12.2.0, AIPageObjectExtractor (classification, KVE, form field detection) crashes with `Illegal instruction` (signal 4) under amd64 emulation (Rosetta) on Apple Silicon Macs. On native x86_64 machines (Linux / Windows / cloud VMs), 12.2.0 is expected to work (not verified); in that case, update the version in both `package.json` and `Dockerfile`.
- **XLSX output and Japanese file names:** Table extraction fails to write XLSX unless the container uses a UTF-8 locale (`LANG=C.UTF-8` is set in the `Dockerfile`).
