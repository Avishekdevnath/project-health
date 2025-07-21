/**
 * Analyze and return security vulnerabilities using `npm audit --json`.
 * @param {boolean} ciMode - If true, return mock data for CI/testing
 * @returns {Promise<Object>} Security audit info
 */
const { exec } = require('child_process');

async function checkAudit(ciMode = false) {
  if (ciMode) {
    return { audit: { audit: { metadata: { vulnerabilities: { high: 1, moderate: 2, low: 0 } } } } };
  }
  return new Promise((resolve) => {
    exec('npm audit --json', (error, stdout) => {
      if (error && !stdout) {
        // If error and no output, treat as no audit info or error
        return resolve({ audit: null, error: error.message });
      }
      try {
        const data = stdout ? JSON.parse(stdout) : {};
        // npm audit --json output has 'vulnerabilities' key in v6, 'advisories' in v7-, 'metadata' in v8+
        resolve({ audit: data });
      } catch (e) {
        resolve({ audit: null, error: 'Failed to parse npm audit output' });
      }
    });
  });
}

module.exports = checkAudit; 