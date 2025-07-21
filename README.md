# Project Health

[![npm version](https://img.shields.io/npm/v/project-health.svg)](https://www.npmjs.com/package/project-health)
[![CI](https://github.com/Avishekdevnath/project-health/actions/workflows/ci.yml/badge.svg)](https://github.com/Avishekdevnath/project-health/actions)

> Analyze your Node.js project and generate a comprehensive health report.

## Features
- Detect outdated dependencies
- Find security vulnerabilities
- Identify unused dependencies
- Scan for large files (>1MB)
- Check for missing or present test files (`*.test.js`, `*.spec.js`)
- Output results as:
  - Styled CLI summary
  - `reports/project-health.json`
  - `reports/project-health.md`

## Installation

```sh
npm install -g project-health
```
Or use with npx (no install):
```sh
npx project-health --all
```

## Usage

Run in your project root:

```sh
project-health --all           # Run all checks (default)
project-health --outdated      # Only check outdated dependencies
project-health --security      # Only check for vulnerabilities
project-health --unused        # Only check for unused dependencies
project-health --large-files   # Only check for large files
project-health --tests         # Only check for test files
project-health --help          # Show help
project-health --version       # Show version
```

## Example Output
```
📦 Outdated dependencies: 2
- lodash: current 4.17.0, latest 4.17.21
- marked: current 0.3.6, latest 16.1.1
Suggestion: Run "npm update" to update dependencies.
🔐 Vulnerabilities: 4 found
Suggestion: Run "npm audit fix" to address vulnerabilities.
📦 Unused dependencies: 3
- left-pad
- lodash
- marked
Suggestion: Remove unused packages with "npm uninstall <package>".
📁 Large file: large-dummy.zip (2.86 MB)
Suggestion: Remove or compress large files if not needed.
🧪 Test files found: 2
- dummy2.spec.js
- dummy.test.js
Summary:
📦 Dependencies: 2 outdated, 3 unused
🔐 Vulnerabilities: 4 found
🧪 Tests: 2 test files found
📁 Large file: large-dummy.zip (2.86 MB)
✅ Report saved: reports/project-health.md
Some issues were found. See above for details and suggestions.
```

## Contributing
Pull requests and issues are welcome! Please open an issue to discuss your idea or bug before submitting a PR.

## License
MIT 
