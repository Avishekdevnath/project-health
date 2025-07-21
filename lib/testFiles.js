/**
 * Detect missing common test files (*.test.js, *.spec.js) with streaming, progress, and timeout.
 * @param {boolean} ciMode - If true, return mock data for CI/testing
 * @returns {Promise<Object>} Test files info
 */

const TIMEOUT_MS = 60000;

async function checkTestFiles(ciMode = false) {
  if (ciMode) {
    return { testFiles: ['mock.test.js', 'mock.spec.js'] };
  }
  // Dynamically import glob for ESM compatibility
  const { globStream } = await import('glob');
  const pattern = '**/*.{test,spec}.js';
  const ignore = ['node_modules/**', 'reports/**', '.git/**', 'dist/**', 'build/**', 'coverage/**'];
  const testFiles = [];
  let totalFiles = 0;
  let done = false;
  let errored = false;
  let resolvePromise, rejectPromise;

  const promise = new Promise((resolve, reject) => {
    resolvePromise = resolve;
    rejectPromise = reject;
  });

  const timer = setTimeout(() => {
    errored = true;
    done = true;
    rejectPromise({ testFiles, error: `Timeout after ${TIMEOUT_MS / 1000}s, scanned ${totalFiles} files.` });
  }, TIMEOUT_MS);

  (async () => {
    let processed = 0;
    for await (const entry of globStream(pattern, { ignore })) {
      if (errored) break;
      testFiles.push(entry);
      totalFiles++;
      processed++;
      if (processed % 1000 === 0) {
        process.stdout.write(`\rScanned ${processed} files...`);
      }
    }
    done = true;
    if (!errored) {
      clearTimeout(timer);
      resolvePromise({ testFiles });
    }
  })();

  return promise;
}

module.exports = checkTestFiles; 