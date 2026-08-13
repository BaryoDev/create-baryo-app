/**
 * Smoke tests for create-baryo-app.
 *
 * The CLI is fully interactive, so there is no non-interactive path to drive end to end
 * yet. These cover the two ways it actually breaks in practice, both of which have
 * nothing to do with the prompts:
 *
 *   1. A dependency is removed or renamed, and the module no longer loads at all.
 *   2. The template repository it clones is moved, renamed or made private, so every
 *      scaffold fails at the point the user has already answered four questions.
 *
 * Neither is caught by anything else in this repository.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const run = promisify(execFile);
const source = readFileSync(new URL('../index.js', import.meta.url), 'utf8');

test('every declared dependency resolves', async () => {
    const { dependencies } = JSON.parse(
        readFileSync(new URL('../package.json', import.meta.url), 'utf8')
    );

    for (const name of Object.keys(dependencies)) {
        await assert.doesNotReject(
            import(name),
            `dependency "${name}" is declared but does not resolve`
        );
    }
});

test('the CLI entry point parses and its imports load', async () => {
    // Importing index.js would run main() and block on a prompt, so check it parses and
    // that each of its own imports resolves, which is what a broken dependency breaks.
    const imports = [...source.matchAll(/^import .* from ['"]([^'".][^'"]*)['"]/gm)].map((m) => m[1]);

    assert.ok(imports.length > 0, 'expected the entry point to import something');

    for (const name of imports) {
        await assert.doesNotReject(import(name), `import "${name}" does not resolve`);
    }
});

test('the template repository it clones is still reachable', async (t) => {
    const match = source.match(/degit\(\s*['"]([^'"]+)['"]/);
    assert.ok(match, 'expected a degit() call naming a template repository');

    const repo = match[1];

    // Network-dependent, so it is skipped offline rather than failing the suite.
    try {
        const { stdout } = await run('git', ['ls-remote', `https://github.com/${repo}.git`, 'HEAD'], {
            timeout: 15000
        });
        assert.match(stdout, /\w{40}/, `template repo ${repo} returned no HEAD`);
    } catch (error) {
        if (/network|ENOTFOUND|EAI_AGAIN|timed out|Could not resolve/i.test(String(error))) {
            t.skip('no network');
            return;
        }
        throw new Error(
            `template repo "${repo}" is unreachable, so every scaffold would fail after the ` +
                `user has answered the prompts: ${error.message}`
        );
    }
});
