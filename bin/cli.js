#!/usr/bin/env node

const { Command } = require('commander');

const checkOutdated = require('../lib/outdated');
const checkAudit = require('../lib/audit');
const checkUnused = require('../lib/unused');
const findLargeFiles = require('../lib/largeFiles');
const checkTestFiles = require('../lib/testFiles');
const generateReports = require('../lib/report');

const program = new Command();

async function main() {
  // Dynamically import chalk and ora for ESM compatibility
  const chalk = (await import('chalk')).default;
  const ora = (await import('ora')).default;

  program
    .name('project-health')
    .description('Analyze a Node.js project and generate a health report')
    .version('1.0.0', '-v, --version', 'output the version number')
    .option('--security', 'Run only the security audit')
    .option('--outdated', 'Check only for outdated dependencies')
    .option('--unused', 'Check only for unused dependencies')
    .option('--large-files', 'Check only for large files')
    .option('--tests', 'Check only for test files')
    .option('--all', 'Run all checks (default)')
    .option('--ci', 'Use mock data for CI/testing (fast, no real checks)');

  program.action(async (opts) => {
    // If no flags, default to --all
    const runAll = opts.all || (!opts.security && !opts.outdated && !opts.unused && !opts.largeFiles && !opts.tests);
    const ciMode = opts.ci || false;
    const results = {};
    let hasIssues = false;

    // Always run all checks, but only print/report those requested
    const [outdatedRes, auditRes, unusedRes, largeFilesRes, testFilesRes] = await Promise.all([
      (runAll || opts.outdated) ? checkOutdated(ciMode) : Promise.resolve(null),
      (runAll || opts.security) ? checkAudit(ciMode) : Promise.resolve(null),
      (runAll || opts.unused) ? checkUnused(ciMode) : Promise.resolve(null),
      (runAll || opts.largeFiles) ? findLargeFiles(ciMode) : Promise.resolve(null),
      (runAll || opts.tests) ? checkTestFiles(ciMode) : Promise.resolve(null)
    ]);
    results.outdated = outdatedRes;
    results.audit = auditRes;
    results.unused = unusedRes;
    results.largeFiles = largeFilesRes;
    results.testFiles = testFilesRes;

    // OUTDATED
    if (runAll || opts.outdated) {
      const outdatedCount = results.outdated && results.outdated.outdated ? Object.keys(results.outdated.outdated).length : 0;
      console.log(chalk.yellowBright(`\n📦 Outdated dependencies:`));
      if (outdatedCount > 0) {
        hasIssues = true;
        Object.entries(results.outdated.outdated).forEach(([name, info]) => {
          console.log(chalk.yellow(`- ${name}: current ${info.current}, latest ${info.latest}`));
        });
        console.log(chalk.cyan('Suggestion: Run "npm update" to update dependencies.'));
      } else {
        console.log(chalk.green('All dependencies are up to date.'));
      }
    }
    // SECURITY
    if (runAll || opts.security) {
      const vulnCount = results.audit && results.audit.audit && results.audit.audit.metadata && results.audit.audit.metadata.vulnerabilities ? Object.values(results.audit.audit.metadata.vulnerabilities).reduce((a, b) => a + b, 0) : 0;
      console.log(chalk.redBright(`\n🔐 Vulnerabilities:`));
      if (vulnCount > 0) {
        hasIssues = true;
        console.log(chalk.redBright(`${vulnCount} found`));
        console.log(chalk.cyan('Suggestion: Run "npm audit fix" to address vulnerabilities.'));
      } else {
        console.log(chalk.green('No vulnerabilities found.'));
      }
    }
    // UNUSED
    if (runAll || opts.unused) {
      const unusedCount = results.unused && results.unused.unused && results.unused.unused.dependencies ? results.unused.unused.dependencies.length : 0;
      console.log(chalk.yellowBright(`\n📦 Unused dependencies:`));
      if (unusedCount > 0) {
        hasIssues = true;
        results.unused.unused.dependencies.forEach(dep => console.log(chalk.yellow(`- ${dep}`)));
        console.log(chalk.cyan('Suggestion: Remove unused packages with "npm uninstall <package>".'));
      } else {
        console.log(chalk.green('No unused dependencies found.'));
      }
    }
    // LARGE FILES
    if (runAll || opts.largeFiles) {
      const largeFiles = results.largeFiles && results.largeFiles.largeFiles ? results.largeFiles.largeFiles : [];
      console.log(chalk.yellowBright(`\n📁 Large files:`));
      if (largeFiles.length > 0) {
        hasIssues = true;
        largeFiles.forEach(f => console.log(chalk.yellowBright(`- ${f.file} (${f.sizeMB} MB)`)));
        console.log(chalk.cyan('Suggestion: Remove or compress large files if not needed.'));
      } else {
        console.log(chalk.green('No large files found.'));
      }
    }
    // TEST FILES
    if (runAll || opts.tests) {
      const testFiles = results.testFiles && results.testFiles.testFiles ? results.testFiles.testFiles : [];
      console.log(chalk.yellowBright(`\n🧪 Test files:`));
      if (testFiles.length === 0) {
        hasIssues = true;
        console.log(chalk.redBright('No test files found.'));
        console.log(chalk.cyan('Suggestion: Add tests to improve code quality.'));
      } else {
        console.log(chalk.green(`${testFiles.length} test files found`));
        testFiles.forEach(f => console.log(chalk.gray(`- ${f}`)));
      }
    }

    if (runAll) {
      // Print detailed results for all checks, just like single-flag mode
      // OUTDATED
      const outdatedCount = results.outdated && results.outdated.outdated ? Object.keys(results.outdated.outdated).length : 0;
      if (outdatedCount > 0) {
        hasIssues = true;
        console.log(chalk.yellowBright(`\n📦 Outdated dependencies: ${outdatedCount}`));
        Object.entries(results.outdated.outdated).forEach(([name, info]) => {
          console.log(chalk.yellow(`- ${name}: current ${info.current}, latest ${info.latest}`));
        });
        console.log(chalk.cyan('Suggestion: Run "npm update" to update dependencies.'));
      } else {
        console.log(chalk.green('📦 All dependencies are up to date.'));
      }
      // UNUSED
      const unusedCount = results.unused && results.unused.unused && results.unused.unused.dependencies ? results.unused.unused.dependencies.length : 0;
      if (unusedCount > 0) {
        hasIssues = true;
        console.log(chalk.yellowBright(`\n📦 Unused dependencies: ${unusedCount}`));
        results.unused.unused.dependencies.forEach(dep => console.log(chalk.yellow(`- ${dep}`)));
        console.log(chalk.cyan('Suggestion: Remove unused packages with "npm uninstall <package>".'));
      } else {
        console.log(chalk.green('📦 No unused dependencies found.'));
      }
      // SECURITY
      const vulnCount = results.audit && results.audit.audit && results.audit.audit.metadata && results.audit.audit.metadata.vulnerabilities ? Object.values(results.audit.audit.metadata.vulnerabilities).reduce((a, b) => a + b, 0) : 0;
      if (vulnCount > 0) {
        hasIssues = true;
        console.log(chalk.redBright(`\n🔐 Vulnerabilities: ${vulnCount} found`));
        console.log(chalk.cyan('Suggestion: Run "npm audit fix" to address vulnerabilities.'));
      } else {
        console.log(chalk.green('🔐 No vulnerabilities found.'));
      }
      // LARGE FILES
      const largeFiles = results.largeFiles && results.largeFiles.largeFiles ? results.largeFiles.largeFiles : [];
      if (largeFiles.length > 0) {
        hasIssues = true;
        largeFiles.forEach(f => console.log(chalk.yellowBright(`📁 Large file: ${f.file} (${f.sizeMB} MB)`)));
        console.log(chalk.cyan('Suggestion: Remove or compress large files if not needed.'));
      } else {
        console.log(chalk.green('📁 No large files found.'));
      }
      // TEST FILES
      const testFiles = results.testFiles && results.testFiles.testFiles ? results.testFiles.testFiles : [];
      if (testFiles.length === 0) {
        hasIssues = true;
        console.log(chalk.redBright('🧪 No test files found.'));
        console.log(chalk.cyan('Suggestion: Add tests to improve code quality.'));
      } else {
        console.log(chalk.green(`🧪 Test files found: ${testFiles.length}`));
        testFiles.forEach(f => console.log(chalk.gray(`- ${f}`)));
      }
      // Print summary
      console.log(chalk.bold('\nSummary:'));
      if (outdatedCount > 0 || unusedCount > 0) {
        console.log(chalk.yellowBright(`📦 Dependencies: ${outdatedCount} outdated, ${unusedCount} unused`));
      } else {
        console.log(chalk.green('📦 Dependencies: All up to date and used.'));
      }
      if (vulnCount > 0) {
        console.log(chalk.redBright(`🔐 Vulnerabilities: ${vulnCount} found`));
      } else {
        console.log(chalk.green('🔐 Vulnerabilities: None'));
      }
      if (testFiles.length === 0) {
        console.log(chalk.redBright('🧪 Tests: No test files found'));
      } else {
        console.log(chalk.green(`🧪 Tests: ${testFiles.length} test files found`));
      }
      if (largeFiles.length > 0) {
        largeFiles.forEach(f => console.log(chalk.yellowBright(`📁 Large file: ${f.file} (${f.sizeMB} MB)`)));
      } else {
        console.log(chalk.green('📁 Large files: None'));
      }
      // Generate reports
      await generateReports(results);
      console.log(chalk.green('✅ Report saved: reports/project-health.md'));
      if (hasIssues) {
        console.log(chalk.redBright('\nSome issues were found. See above for details and suggestions.'));
      } else {
        console.log(chalk.greenBright('\nProject is healthy!'));
      }
    }
    process.exit(hasIssues ? 1 : 0);
  });

  program.parse(process.argv);
}

main(); 