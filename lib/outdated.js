/**
 * Analyze and return a list of outdated dependencies using `npm outdated`.
 * @param {boolean} ciMode - If true, return mock data for CI/testing
 * @returns {Promise<Object>} Outdated dependencies info
 */
const { exec } = require('child_process');

async function checkOutdated(ciMode = false) {
  if (ciMode) {
    return { outdated: { 'mock-package': { current: '1.0.0', latest: '2.0.0' } } };
  }
  return new Promise((resolve) => {
    exec('npm outdated --json', (error, stdout) => {
      if (error && !stdout) {
        // If error and no output, treat as no outdated deps or error
        return resolve({ outdated: null, error: error.message });
      }
      try {
        const data = stdout ? JSON.parse(stdout) : {};
        if (Object.keys(data).length === 0) {
          resolve({ outdated: null }); // All up to date
        } else {
          resolve({ outdated: data });
        }
      } catch (e) {
        resolve({ outdated: null, error: 'Failed to parse npm outdated output' });
      }
    });
  });
}

module.exports = checkOutdated; 