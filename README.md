
Playwright BDD Custom Framework
===============================

Overview
--------

This repository contains a Playwright-based BDD test framework with custom helpers to run feature-driven tests, data-driven scenarios, and page-object organized pages. The framework integrates feature files, step definitions, page objects, test data readers and utilities for evidence (screenshots, PDF, DOCX) and reporting.

Key Features
------------

- Lightweight Playwright + BDD structure
- Page Object Model under `tests/pages`
- Feature files under `tests/features`
- Data-driven test support via `testData` and `bdd-expander`
- Custom utilities for screenshots, PDF/DOCX evidence, and run configuration
- Built-in Playwright HTML report output in `playwright-report`

Prerequisites
-------------

- Node.js (>= 16 recommended)
- npm or yarn
- Playwright dependencies (browsers)

Install
-------

Install dependencies and Playwright browsers:

```bash
npm install
npx playwright install
```

Run Tests
---------

Run all tests with Playwright:

```bash
npx playwright test
```

Open the HTML report after a run:

```bash
npx playwright show-report
```

If this project includes an npm script for the BDD runner, you can instead run:

```bash
npm run test
```

Project Layout
--------------

- `playwright.config.ts`: Playwright configuration (projects, timeouts, reporters).
- `tests/features`: Gherkin feature files.
- `steps`: Step definition implementations mapping to feature steps.
- `tests/pages`: Page objects for the AUT.
- `locators`: JSON locator files used by page objects.
- `testData`: CSV/JSON data and readers for data-driven scenarios.
- `utils`: Helpers for screenshots, PDF/DOCX evidence, timestamping and run config operations.
- `playwright-report`: Generated HTML report after running tests.

Writing Tests
-------------

- Add feature files to `tests/features` using Gherkin syntax.
- Implement corresponding steps in `steps/*.steps.ts`. Step definitions should call page object methods from `tests/pages`.
- Keep selectors in `locators/*` and reference them from page objects for maintainability.

Data-driven Tests
-----------------

This framework includes a BDD expander located under `utils/bdd-expander` that supports reading data from CSV, Excel and JSON via `testData`. Add test data files to `testData/` and use the expander patterns in feature files to generate scenario outlines.

Reporting & Evidence
--------------------

- Playwright HTML report is generated into `playwright-report` by default.
- Screenshots and attachments for failed steps are saved under `test-results` and subfolders created per run.
- Utilities in `utils` provide helpers to convert evidence into PDF or DOCX if needed.

Debugging & Troubleshooting
---------------------------

- Run with Playwright UI to debug flaky tests:

```bash
npx playwright test --headed --debug
```

- Check `playwright-report/index.html` for step-level details and attachments.
- If browser binaries are missing, re-run `npx playwright install`.

Extending the Framework
-----------------------

- Add new page objects under `tests/pages/<app>` following the existing pattern.
- Add locator JSON files under `locators/<app>` and reference them in the page objects.
- Add new step definitions in `steps` and group them logically by feature area.

Contributing
------------

1. Fork the repo and create a feature branch.
2. Add or update tests and utilities.
3. Run the test suite locally before opening a PR.

Contact
-------

If you need help, open an issue or contact the repository maintainer.

Notes
-----

This README is a concise guide to get started. See the repository structure and existing example feature files under `tests/features` for reference usage.

Runner & Data Flow (Detailed)
-----------------------------

- Runner entrypoint: `tests/runners/bdd-runner.run.ts` — use `npx ts-node tests/runners/bdd-runner.run.ts` to run the BDD runner.
- CLI flags:
 	- `--test=<TCID>`: run a single test tag (e.g. `--test=tc001`) — this bypasses the RunConfiguration sheet.
 	- `--project=<name>`: restrict Playwright to a specific project (`chromium`, `firefox`, etc.).

Examples:

```bash
# single test (skips RunConfig)
npx ts-node tests/runners/bdd-runner.run.ts --test=tc001

# RunConfig-driven run (reads tests/config/RunConfiguration.xlsx)
npx ts-node tests/runners/bdd-runner.run.ts

# limit to a Playwright project
npx ts-node tests/runners/bdd-runner.run.ts --project=chromium
```

What the runner does:

- Parses CLI flags and builds runnable tags.
- If no `--test` is provided, it reads `tests/config/RunConfiguration.xlsx` (sheet `RunConfig`) and uses rows with `Run` === `YES` to collect `TestCaseId`s.
- Expands features: scans `tests/**/*.feature`, calls the BDD expander to replace Examples that point to external data, and writes generated features to `tests/.generated-features`.
- Runs `npx bddgen` then `npx playwright test` (with `--grep` for runnable tags and optionally `--project`).
- Cleans up generated features after the run.

Data expansion behavior
----------------------

- The expander looks for `Scenario Outline` blocks with `Examples:` and supports two external-data patterns:
 1. Inline legacy JSON-like Examples: `Examples:{'datafile':'tests/testData/foo.xlsx','sheetName':'Sheet1'}`
 2. Table-based pointers: an `Examples` table whose headers include one of `fileType`, `filePath`, `fileName`, `sheetName` (or legacy `excelFile`, `sheetName`).
- For external pointers, the expander uses `tests/utils/bdd-expander/DataReaderFactory` to load rows and rewrites the `Examples:` into a full Gherkin table (one row per data record).
- Generated `.gen.feature` files are used for the run and removed afterwards.

Supported data readers
----------------------

- Excel: requires `sheetName`; implemented by `ExcelReader` which delegates to `ExcelOperations.read(path, sheetName)`.
- CSV: implemented by `CsvReader` — reads first line as headers and splits on commas (note: naive parser, see caveats).
- JSON: implemented by `JsonReader` — expects a top-level array of objects.

Caveats & known issues
----------------------

- Path casing: some handlers set `filePath` to `tests/testdata` (lowercase) while the repo uses `testData` (camelCase). This can lead to "file not found" issues — prefer normalized `path.resolve` usage.
- CSV parsing is simplistic and doesn't handle quoted fields, escaped commas, or different newline conventions.
- Excel readers require an accurate `sheetName`; missing sheets will result in runtime errors.
- The expander treats a table as external only if it contains one of the external headers; pure Gherkin tables are preserved.

Upcoming Changes
---------------------

- Normalize data file paths using `path.resolve()` and avoid hardcoded paths such as `tests/testdata`.
- Replace the simple CSV parser with a robust library (e.g. `csv-parse`) to handle quoted fields and edge cases.
- Make EXTERNAL_HEADERS matching case-insensitive to avoid header-casing issues.
- Add clearer error messages when external data files or Excel sheets are missing.
- Consider a `--dry-run` flag that expands features and prints the generated `.gen.feature` file paths without executing Playwright.
