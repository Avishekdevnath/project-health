# Project Health – Node.js Project Analyzer CLI

## 🎯 Purpose
A CLI tool to analyze a Node.js project and generate a comprehensive health report.

## 🧩 Features
1. **Outdated Dependencies**: List outdated packages using `npm outdated`.
2. **Security Audit**: Check for vulnerabilities with `npm audit`.
3. **Unused Dependencies**: Detect unused dependencies via `depcheck`.
4. **Large Files**: Identify files over 1MB in the project.
5. **Test Coverage**: Detect missing common test files (`*.test.js`, `*.spec.js`).
6. **Reporting**: Output results as:
   - Styled CLI summary
   - `reports/project-health.json`
   - `reports/project-health.md` (Markdown)

## 📦 Tech Stack
- [`commander`](https://www.npmjs.com/package/commander): CLI interface
- [`chalk`](https://www.npmjs.com/package/chalk): Styled CLI output
- [`ora`](https://www.npmjs.com/package/ora): Loading spinners
- [`depcheck`](https://www.npmjs.com/package/depcheck): Unused dependency scanner
- Node.js built-ins: `child_process`, `fs`, `path`, `glob`
- [`json2md`](https://www.npmjs.com/package/json2md): Markdown report generation

## 📁 Folder Structure
- `bin/cli.js` – CLI entry point (referenced in `package.json` bin field)
- `lib/` – Analysis modules
- `reports/` – Output files
- `package.json` – CLI metadata
- `README.md` – Usage and examples

## 🧪 Example Output
```
📦 Dependencies: 2 outdated, 1 unused
🔐 Vulnerabilities: 3 found
🧪 Tests: 2 files missing
📁 Large files: /src/assets/hero-bg.jpg (2.3 MB)
✅ Report saved: reports/project-health.md
```

## 🧾 Publishing
- Publish to npm as `project-health` (no scope).
- Ensure `package.json` includes:
  ```json
  "bin": {
    "project-health": "./bin/cli.js"
  }
  ```
- The CLI should be runnable via `npx project-health` or globally as `project-health`.
