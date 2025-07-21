/**
 * Analyze and return unused dependencies using depcheck.
 * @param {boolean} ciMode - If true, return mock data for CI/testing
 * @returns {Promise<Object>} Unused dependencies info
 */
const depcheck = require('depcheck');

async function checkUnused(ciMode = false) {
  if (ciMode) {
    return { unused: { dependencies: ['mock-unused'] } };
  }
  return new Promise((resolve) => {
    depcheck(process.cwd(), {}, (unused) => {
      resolve({ unused });
    });
  });
}

module.exports = checkUnused; 