/**
 * Generate and save health reports in JSON and Markdown formats.
 * @param {Object} results - Aggregated analysis results
 * @returns {Promise<void>}
 */
const fs = require('fs');
const path = require('path');
const json2md = require('json2md');

async function generateReports(results) {
  const reportsDir = path.join(process.cwd(), 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir);
  }
  // Save JSON
  fs.writeFileSync(path.join(reportsDir, 'project-health.json'), JSON.stringify(results, null, 2));
  // Save Markdown
  const md = json2md([
    { h1: 'Project Health Report' },
    { p: `Generated: ${new Date().toISOString()}` },
    { h2: 'Dependencies' },
    { code: JSON.stringify(results.outdated, null, 2) },
    { h2: 'Security Audit' },
    { code: JSON.stringify(results.audit, null, 2) },
    { h2: 'Unused Dependencies' },
    { code: JSON.stringify(results.unused, null, 2) },
    { h2: 'Large Files (>1MB)' },
    { ul: (results.largeFiles && results.largeFiles.largeFiles) ? results.largeFiles.largeFiles.map(f => `${f.file} (${f.sizeMB} MB)`) : [] },
    { h2: 'Test Files' },
    { ul: (results.testFiles && results.testFiles.testFiles) ? results.testFiles.testFiles : [] }
  ]);
  fs.writeFileSync(path.join(reportsDir, 'project-health.md'), md);
}

module.exports = generateReports; 