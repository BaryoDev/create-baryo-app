import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { validateName, targetState, prepareTarget } from '../lib/target.js';

test('names that are not a new child of cwd are rejected', () => {
    for (const name of ['.', '..', '/abs', '/', 'a/b', '../x', 'a\\b', 'C:\\x', '']) {
        assert.ok(validateName(name), `"${name}" should be rejected`);
    }
    assert.equal(validateName('my-app'), undefined);
});

function tmp() {
    return fs.mkdtempSync(path.join(os.tmpdir(), 'cba-'));
}

test('a non-empty existing dir is kept when not confirmed', async () => {
    const dir = tmp();
    fs.writeFileSync(path.join(dir, 'keep.txt'), 'x');
    assert.equal(await prepareTarget(dir, async () => false), false);
    assert.ok(fs.existsSync(path.join(dir, 'keep.txt')));
    fs.rmSync(dir, { recursive: true });
});

test('a non-empty existing dir is removed only when confirmed', async () => {
    const dir = tmp();
    fs.writeFileSync(path.join(dir, 'keep.txt'), 'x');
    assert.equal(await prepareTarget(dir, async () => true), true);
    assert.equal(fs.existsSync(dir), false);
});

test('an empty dir is used without asking', async () => {
    const dir = tmp();
    assert.equal(targetState(dir), 'empty');
    let asked = false;
    assert.equal(await prepareTarget(dir, async () => { asked = true; return false; }), true);
    assert.equal(asked, false);
    assert.ok(fs.existsSync(dir));
    fs.rmSync(dir, { recursive: true });
});
