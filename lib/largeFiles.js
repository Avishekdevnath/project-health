/**
 * Find files over 1MB in the project directory (all file types), with concurrency, progress, and timeout.
 * @param {boolean} ciMode - If true, return mock data for CI/testing
 * @returns {Promise<Object>} Large files info
 */
const fs = require('fs');
const path = require('path');

const CONCURRENCY = 10;
const TIMEOUT_MS = 60000;

async function findLargeFiles(ciMode = false) {
  if (ciMode) {
    return { largeFiles: [{ file: 'mock-large-file.zip', sizeMB: '5.00' }] };
  }
  const { globStream } = await import('glob');
  const pattern = '**/*.*'; // Scan all files
  const ignore = ['node_modules/**', 'reports/**', '.git/**', 'dist/**', 'build/**', 'coverage/**'];
  const largeFiles = [];
  let totalFiles = 0;
  let active = 0;
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
    rejectPromise({ largeFiles, error: `Timeout after ${TIMEOUT_MS / 1000}s, scanned ${totalFiles} files.` });
  }, TIMEOUT_MS);

  function statFile(file) {
    return fs.promises.stat(file)
      .then(stat => ({ file, size: stat.size }))
      .catch(() => null);
  }

  async function processQueue(queue) {
    while (queue.length && !errored) {
      if (active >= CONCURRENCY) {
        await new Promise(r => setTimeout(r, 10));
        continue;
      }
      const file = queue.shift();
      active++;
      statFile(file).then(result => {
        active--;
        if (result && result.size > 1024 * 1024) {
          largeFiles.push({ file: result.file, sizeMB: (result.size / (1024 * 1024)).toFixed(2) });
        }
        if (done && active === 0 && queue.length === 0) {
          clearTimeout(timer);
          resolvePromise({ largeFiles });
        }
      });
    }
  }

  (async () => {
    const queue = [];
    let processed = 0;
    for await (const entry of globStream(pattern, { ignore })) {
      if (errored) break;
      queue.push(entry);
      totalFiles++;
      processed++;
      if (processed % 1000 === 0) {
        // Print progress to stdout
        process.stdout.write(`\rScanned ${processed} files...`);
      }
      if (queue.length >= CONCURRENCY) {
        await processQueue(queue);
      }
    }
    done = true;
    await processQueue(queue);
    if (!errored) {
      clearTimeout(timer);
      resolvePromise({ largeFiles });
    }
  })();

  return promise;
}

module.exports = findLargeFiles; 