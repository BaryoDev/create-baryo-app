import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { isCancel } from '@clack/prompts';
import { positionalName, orCancel } from '../lib/cli.js';

const run = promisify(execFile);
const entry = new URL('../index.js', import.meta.url).pathname;

test('positionalName reads the first non-flag argument', () => {
    assert.equal(positionalName(['my-app', '--force']), 'my-app');
    assert.equal(positionalName(['--force', 'my-app']), 'my-app');
    assert.equal(positionalName(['--force']), undefined);
    assert.equal(positionalName([]), undefined);
});

test('orCancel exits on a cancelled prompt and passes values through', () => {
    const calls = [];
    const opts = { isCancel: (v) => v === 'CANCEL', cancel: (m) => calls.push(['cancel', m]), exit: (c) => calls.push(['exit', c]) };
    assert.equal(orCancel('ok', opts), 'ok');
    assert.deepEqual(calls, []);
    orCancel('CANCEL', opts);
    assert.deepEqual(calls, [['cancel', 'Operation cancelled'], ['exit', 0]]);
    assert.equal(typeof isCancel, 'function');
});

test('an invalid project name argument exits non-zero before any prompt', async () => {
    await assert.rejects(run('node', [entry, 'C:foo'], { timeout: 15000 }), (err) => err.code === 1);
});
