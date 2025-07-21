const { execSync } = require('child_process');

describe('project-health CLI', () => {
  it('should print help text with --help', () => {
    const output = execSync('node ./bin/cli.js --help').toString();
    expect(output).toMatch(/Usage: project-health/);
    expect(output).toMatch(/--all/);
    expect(output).toMatch(/--outdated/);
    expect(output).toMatch(/--security/);
    expect(output).toMatch(/--unused/);
    expect(output).toMatch(/--large-files/);
    expect(output).toMatch(/--tests/);
  });

  it('should print version with --version', () => {
    const output = execSync('node ./bin/cli.js --version').toString().trim();
    expect(output).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it('should print version with -v', () => {
    const output = execSync('node ./bin/cli.js -v').toString().trim();
    expect(output).toMatch(/^\d+\.\d+\.\d+$/);
  });

  function getOutputOrError(cmd) {
    try {
      return execSync(cmd).toString();
    } catch (e) {
      return (e.stdout?.toString() || '') + (e.stderr?.toString() || '');
    }
  }

  it('should run all checks with --all --ci', () => {
    const output = getOutputOrError('node ./bin/cli.js --all --ci');
    expect(output).toMatch(/📦 Outdated dependencies:/);
    expect(output).toMatch(/🔐 Vulnerabilities:/);
    expect(output).toMatch(/📦 Unused dependencies:/);
    expect(output).toMatch(/📁 Large files:/);
    expect(output).toMatch(/🧪 Test files:/);
    expect(output).toMatch(/Summary:/);
  });

  it('should run unused check with --unused --ci', () => {
    const output = getOutputOrError('node ./bin/cli.js --unused --ci');
    expect(output).toMatch(/📦 Unused dependencies:/);
    expect(output).toMatch(/mock-unused/);
  });

  it('should run large file check with --large-files --ci', () => {
    const output = getOutputOrError('node ./bin/cli.js --large-files --ci');
    expect(output).toMatch(/📁 Large files:/);
    expect(output).toMatch(/mock-large-file\.zip/);
  });

  it('should run test file check with --tests --ci', () => {
    const output = getOutputOrError('node ./bin/cli.js --tests --ci');
    expect(output).toMatch(/🧪 Test files:/);
    expect(output).toMatch(/test files found|No test files found/i);
    expect(output).toMatch(/mock\.test\.js/);
    expect(output).toMatch(/mock\.spec\.js/);
  });

  it('should run security check with --security --ci', () => {
    const output = getOutputOrError('node ./bin/cli.js --security --ci');
    expect(output).toMatch(/🔐 Vulnerabilities:/);
    expect(output).toMatch(/found|No vulnerabilities found/);
  });

  it('should run outdated check with --outdated --ci', () => {
    const output = getOutputOrError('node ./bin/cli.js --outdated --ci');
    expect(output).toMatch(/📦 Outdated dependencies:/);
    expect(output).toMatch(/mock-package/);
  });

  it('should print error for unknown flag', () => {
    let error = null;
    try {
      execSync('node ./bin/cli.js --unknownflag', { stdio: 'pipe' });
    } catch (e) {
      error = e;
    }
    expect(error).toBeTruthy();
    const errOut = error.stdout?.toString() + error.stderr?.toString();
    expect(errOut).toMatch(/error: unknown option/);
  });

  it('should default to --all --ci when no arguments', () => {
    const output = getOutputOrError('node ./bin/cli.js --ci');
    expect(output).toMatch(/Summary:/);
    expect(output).toMatch(/📦 Outdated dependencies:/);
    expect(output).toMatch(/🔐 Vulnerabilities:/);
    expect(output).toMatch(/📦 Unused dependencies:/);
    expect(output).toMatch(/📁 Large files:/);
    expect(output).toMatch(/🧪 Test files:/);
  });
}); 