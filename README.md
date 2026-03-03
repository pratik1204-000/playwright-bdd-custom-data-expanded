<div align="center">

# 🎭 Playwright BDD — Custom Data Expanded Framework

### A pre-processing BDD architecture that separates feature parsing, data expansion, and execution into cleanly decoupled layers

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Playwright](https://img.shields.io/badge/Playwright-1.58-2EAD33?style=for-the-badge&logo=playwright&logoColor=white)](https://playwright.dev/)
[![playwright-bdd](https://img.shields.io/badge/playwright--bdd-8.x-orange?style=for-the-badge)](https://github.com/vitalets/playwright-bdd)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D16-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](./LICENSE)

</div>

---

## 🧠 What Is This?

Most BDD frameworks make you hard-code test data in feature files or duplicate scenario outlines by hand. This framework solves that completely differently.

**The core idea:** feature files are *templates*. At runtime, a pre-processor reads your `Examples:` block, fetches real data from **Excel / CSV / JSON**, and dynamically expands every row into a full Gherkin scenario — before Playwright ever runs a single test.

Think of it like the **Quantum framework's data injection model**, but built natively on top of Playwright BDD with strict TypeScript, a pluggable reader abstraction, and zero external test-management dependencies.

It also reads a **RunConfiguration Excel sheet** — tests marked `Run = YES` are automatically selected, just like enterprise frameworks, without a separate CI toggle per test.

---

## ✨ Key Features

| Capability | Detail |
|---|---|
| 🔄 **Runtime Feature Generation** | Scans `.feature` files, expands `Examples:` from external data sources, writes `.gen.feature` files, and cleans them up post-run |
| 📊 **Pluggable Data Readers** | Factory pattern supporting **Excel (ExcelJS)**, **CSV**, and **JSON** with a shared `DataReader` interface |
| 🗂️ **RunConfiguration Control** | An Excel sheet (`RunConfig`) drives which test cases execute — mark `Run = YES` and the runner picks them up automatically |
| 🎭 **Playwright BDD Integration** | Built on `playwright-bdd` — full Gherkin support, `@tags`, `Scenario Outline`, and all Playwright fixtures |
| 📸 **Rich Evidence Reporting** | Per-step screenshots compiled into branded **PDF** and **DOCX** evidence files, attached to the Playwright HTML report |
| 🎬 **Video Recording** | Full 1920×1080 video captured for every test run out of the box |
| 🌐 **Cross-Browser** | Chromium, Firefox, WebKit, Chrome, Edge, Mobile Chrome, Mobile Safari — all pre-configured |
| 🏗️ **Page Object Model** | Strict POM with JSON-based external locator files, fully decoupled from step logic |
| 🔒 **Strict TypeScript** | `strict: true`, ES2020 target, runtime validation throughout |
| ⚙️ **CI Ready** | Headless mode, retry logic, parallel execution, and `forbidOnly` — all configured for CI environments |

---

## 🏛️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        BDD RUNNER                               │
│              tests/runners/bdd-runner.run.ts                    │
│                                                                 │
│  1. Read RunConfiguration.xlsx  →  collect TestCaseIds (Run=YES)│
│  2. CLI override  →  --test=<id>  bypasses RunConfig            │
│  3. Expand features  →  write to tests/.generated-features/     │
│  4. npx bddgen  →  compile generated features                   │
│  5. npx playwright test --grep <tags>                           │
│  6. Cleanup  →  delete .generated-features/                     │
└───────────────┬─────────────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────────────┐
│                     BDD EXPANDER                                │
│           tests/utils/bdd-expander/excel-bdd-expander.ts        │
│                                                                 │
│  Parses each .feature file for Scenario Outline + Examples:     │
│                                                                 │
│  ┌──────────────┐  ┌────────────────┐  ┌────────────────────┐  │
│  │ Inline Legacy│  │  Table Format  │  │ Pure Gherkin Table │  │
│  │ Examples:{..}│  │ fileType/path/ │  │  (pass-through,    │  │
│  │ (Excel only) │  │ fileName/sheet │  │   not expanded)    │  │
│  └──────┬───────┘  └───────┬────────┘  └────────────────────┘  │
│         └──────────────────┘                                    │
│                      │                                          │
│                      ▼                                          │
│              DataReaderFactory                                  │
│         ┌────────┬───────┬────────┐                             │
│         │ Excel  │  CSV  │  JSON  │                             │
│         └────────┴───────┴────────┘                             │
│                      │                                          │
│          Rewrites Examples: into full Gherkin table             │
└─────────────────────────────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────────────┐
│                   PLAYWRIGHT EXECUTION                          │
│                                                                 │
│  Step Definitions  →  Page Objects  →  JSON Locators            │
│                                                                 │
│  Per step:  ScreenshotOperations.save()                         │
│  Post test: PdfEvidenceOperations.generate()                    │
│             DocxEvidenceOperations.generate()                   │
│             Video attachment (always-on, 1920×1080)             │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📂 Project Structure

```
playwright-bdd-custom/
├── playwright.config.ts              # Multi-browser config, video, timeouts, CI flags
├── tsconfig.json                     # Strict TypeScript — ES2020, CommonJS
├── package.json
│
└── tests/
    ├── features/                     # ✍️  Gherkin feature files (source of truth)
    │   ├── basic-login-demo-swaglabs.feature
    │   └── basic-framework-sanity.feature
    │
    ├── .generated-features/          # ⚡ Auto-generated at runtime (gitignored)
    │   └── *.gen.feature
    │
    ├── steps/                        # 🔗  Step definitions
    │   ├── basic-sauce-login-demo.steps.ts
    │   └── basic-framework-sanity.steps.ts
    │
    ├── pages/                        # 📄  Page Object Model
    │   └── swagLabsDemo/
    │       ├── loginPage.page.ts
    │       └── inventoryPage.page.ts
    │
    ├── locators/                     # 📍  JSON locator files (decoupled from pages)
    │   └── swagLabsDemo/
    │       ├── locator_loginPage.json
    │       └── locator_inventoryPage.json
    │
    ├── runners/
    │   └── bdd-runner.run.ts         # 🚀  Orchestration entrypoint
    │
    ├── config/
    │   └── RunConfiguration.xlsx     # ☑️   Controls which tests run (Run=YES)
    │
    ├── testdata/                     # 📦  Test data files
    │   ├── swagLabsLogin.xlsx
    │   ├── swagLabsLogin.csv
    │   └── swagLabsLogin.json
    │
    ├── assets/
    │   └── header_logo.png           # 🖼️  Branding for PDF/DOCX evidence
    │
    └── utils/
        ├── bdd-expander/             # 🔧  Pre-processing engine
        │   ├── excel-bdd-expander.ts
        │   ├── data-reader.factory.ts
        │   └── readers/
        │       ├── excel.reader.ts
        │       ├── csv.reader.ts
        │       └── json.reader.ts
        ├── excel-operations.utils.ts
        ├── run-config-operations.utils.ts
        ├── screenshot-operations.utils.ts
        ├── pdf-evidence-operations.utils.ts
        ├── docx-evidence-operations.utils.ts
        └── time-stamp.utils.ts
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 16
- **npm**

### Install

```bash
npm install
npx playwright install
```

### Run Tests (BDD Runner — Recommended)

This is the primary way to run tests. It reads `RunConfiguration.xlsx`, expands feature files, and orchestrates the full Playwright run.

```bash
# Run all tests marked Run=YES in RunConfiguration.xlsx
npx ts-node tests/runners/bdd-runner.run.ts

# Run a specific test by tag (bypasses RunConfig)
npx ts-node tests/runners/bdd-runner.run.ts --test=swagLabsLoginJson

# Restrict to a specific browser
npx ts-node tests/runners/bdd-runner.run.ts --project=chromium

# Combine both
npx ts-node tests/runners/bdd-runner.run.ts --test=swagLabsLoginJson --project=chromium
```

### Run Tests (Playwright Directly)

```bash
# Run all tests
npx playwright test

# Run with headed browser
npx playwright test --headed

# Debug mode
npx playwright test --headed --debug
```

### Open Report

```bash
npx playwright show-report
```

---

## 📊 Data Expansion — The Core Mechanic

The `BDD Expander` supports **four ways** to reference external test data in your `Examples:` block. All of them are automatically expanded into full Gherkin data tables at runtime.

### Format 1 — New Generic Table *(Recommended)*

Supports Excel, CSV, and JSON through the `fileType` discriminator:

```gherkin
Scenario Outline: Login with data from Excel
    Given the user is on the Swag Labs login page
    When the user enters username "<username>" and password "<password>"
    Then the user should be redirected to the Products inventory page
    Examples:
        | fileType | filePath       | fileName           | sheetName |
        | Excel    | tests/testdata | swagLabsLogin.xlsx | Login     |
```

```gherkin
    Examples:
        | fileType | filePath       | fileName          |
        | CSV      | tests/testdata | swagLabsLogin.csv |
```

```gherkin
    Examples:
        | fileType | filePath       | fileName           |
        | JSON     | tests/testdata | swagLabsLogin.json |
```

### Format 2 — Legacy Excel Table

```gherkin
    Examples:
        | excelFile          | sheetName |
        | swagLabsLogin.xlsx | Login     |
```

### Format 3 — Inline Legacy JSON-Style

```gherkin
    Examples:{'datafile': 'tests/testdata/swagLabsLogin.xlsx', 'sheetName': 'Login'}
```

### Format 4 — Pure Gherkin *(pass-through, not expanded)*

Standard Gherkin `Examples:` tables with actual test values are detected automatically and passed through unchanged.

```gherkin
    Examples:
        | username      | password     |
        | standard_user | secret_sauce |
```

> **How the detection works:** The expander inspects `Examples:` table headers. If any of `fileType`, `filePath`, `fileName`, `sheetName`, or `excelFile` are present, it treats the table as an external data pointer and expands it. Otherwise the table is preserved as-is.

---

## ☑️ RunConfiguration — Test Execution Control

Place a `RunConfiguration.xlsx` file at `tests/config/RunConfiguration.xlsx` with a sheet named **`RunConfig`**.

| TestCaseId | Run |
|---|---|
| swagLabsLoginJson | YES |
| swagLabsLoginCsv | NO |
| swagLabsLoginExcelNew | YES |

The runner reads this sheet and automatically builds the `--grep` tag filter. Only rows where `Run = YES` are executed. No manual CLI editing needed for day-to-day runs.

---

## 🗂️ Pluggable Data Reader Architecture

```
DataReaderFactory.create({ fileType, filePath, fileName, sheetName? })
        │
        ├── "excel"  →  ExcelReader  →  ExcelOperations.read(path, sheet)  [ExcelJS]
        ├── "csv"    →  CsvReader    →  fs.readFileSync + header split
        └── "json"   →  JsonReader   →  JSON.parse top-level array
```

All readers implement a single interface:

```typescript
export interface DataReader {
  read(): Promise<Array<Record<string, string>>>;
}
```

Adding a new data source is as simple as implementing `DataReader` and registering it in `DataReaderFactory`.

---

## 📸 Evidence Generation

After each test, the framework automatically generates rich evidence artifacts and attaches them to the Playwright HTML report.

### What gets captured

Every call to `ScreenshotOperations.save(page, 'Step name')` captures a PNG screenshot with a step label and timestamp, stored in `test-results/<test>/screens/`.

### PDF Evidence

`PdfEvidenceOperations.generate()` compiles all step screenshots into a single branded PDF:

- Header logo (from `tests/assets/header_logo.png`)
- Test name, status, execution timestamp
- Each step screenshot with its label and capture time
- Auto-pagination with clean layout

### DOCX Evidence

`DocxEvidenceOperations.generate()` produces the same content as a Word document, suitable for clients and stakeholders who require editable audit trails.

### Video

Every test records a full **1920×1080 video**, always-on — no configuration needed.

All three artifacts (PDF, DOCX, video) are attached to the test in the **Playwright HTML report**.

---

## 🌐 Browser Matrix

| Browser | Mode |
|---|---|
| Chromium | Desktop, fullscreen |
| Firefox | Desktop, fullscreen |
| WebKit (Safari) | Desktop, fullscreen |
| Chrome (branded) | Desktop, fullscreen |
| Microsoft Edge | Desktop, fullscreen |
| Mobile Chrome | Pixel 5 |
| Mobile Safari | iPhone 12 |

---

## ⚙️ CLI Reference

```bash
# BDD Runner flags
--test=<tagName>      Run a single test by its @tag (skips RunConfig)
--project=<name>      Restrict to a Playwright project (chromium, firefox, chrome, etc.)

# Playwright flags (direct)
--headed              Run in headed browser mode
--debug               Open Playwright Inspector
--grep="@tag"         Filter by tag
--retries=2           Set retry count
```

---

## 🏗️ Extending the Framework

### Add a new Page Object

1. Create `tests/pages/<app>/myPage.page.ts` following the existing POM pattern
2. Add a locator JSON file at `tests/locators/<app>/locator_myPage.json`
3. Import and use it in step definitions

### Add a new Data Reader

1. Create `tests/utils/bdd-expander/readers/myFormat.reader.ts` implementing `DataReader`
2. Register it in `DataReaderFactory` with a new `case`

### Add a new Feature

1. Write a `.feature` file in `tests/features/`
2. Add a `@tagName` that matches a row in `RunConfiguration.xlsx`
3. Implement steps in `tests/steps/<name>.steps.ts`

---

## 🔬 Tech Stack

| Package | Purpose |
|---|---|
| `@playwright/test` | Core test runner and browser automation |
| `playwright-bdd` | BDD / Gherkin layer on top of Playwright |
| `exceljs` | Excel file reading and writing (data + RunConfig) |
| `pdfkit` | PDF evidence generation |
| `docx` | DOCX evidence generation |
| `image-size` | Image dimension detection for PDF layout |
| `ts-node` | TypeScript execution for the BDD runner |
| `typescript` | Strict typing, ES2020, CommonJS modules |

---

## 🤝 Contributing

1. Fork the repository and create a feature branch
2. Follow the existing TypeScript patterns — strict types, no `any` unless justified
3. Add or update feature files and step definitions for new functionality
4. Run the full suite locally before opening a PR:

```bash
npx ts-node tests/runners/bdd-runner.run.ts
```

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](./LICENSE) file for details.

---

<div align="center">

**Built by [Pratik Sarkar](https://github.com/craftedbypratik)**

*Engineered to make data-driven BDD testing feel effortless.*

</div>
