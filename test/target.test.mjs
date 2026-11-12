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

test('a non-empty existing dir is kept without force', () => {
    const dir = tmp();
    fs.writeFileSync(path.join(dir, 'keep.txt'), 'x');
    assert.equal(prepareTarget(dir, false), false);
    assert.equal(prepareTarget(dir, undefined), false);
    assert.ok(fs.existsSync(path.join(dir, 'keep.txt')));
    fs.rmSync(dir, { recursive: true });
});

test('a non-empty existing dir is removed only with force', () => {
    const dir = tmp();
    fs.writeFileSync(path.join(dir, 'keep.txt'), 'x');
    assert.equal(prepareTarget(dir, true), true);
    assert.equal(fs.existsSync(dir), false);
});

test('an empty dir is used without force', () => {
    const dir = tmp();
    assert.equal(targetState(dir), 'empty');
    assert.equal(prepareTarget(dir, false), true);
    assert.ok(fs.existsSync(dir));
    fs.rmSync(dir, { recursive: true });
});

test('a symlink to an empty dir is occupied and force removes only the link', () => {
    const real = tmp();
    const link = path.join(tmp(), 'link');
    fs.symlinkSync(real, link);
    assert.equal(targetState(link), 'occupied');
    assert.equal(prepareTarget(link, false), false);
    assert.ok(fs.lstatSync(link).isSymbolicLink());
    assert.equal(prepareTarget(link, true), true);
    assert.throws(() => fs.lstatSync(link));
    assert.ok(fs.existsSync(real));
    fs.rmSync(real, { recursive: true });
});

test('drive-relative and colon names are rejected and cannot escape cwd on Windows', () => {
    for (const name of ['C:', 'C:foo', 'c:', 'a:b', 'x\u0000y']) {
        assert.ok(validateName(name), `"${name}" should be rejected`);
    }
    // Why: on Windows these resolve against another drive's cwd, outside the project directory.
    assert.notEqual(path.win32.dirname(path.win32.resolve('D:\\work', 'C:foo')), 'D:\\work');
    assert.equal(path.win32.dirname(path.win32.resolve('D:\\work', 'my-app')), 'D:\\work');
    assert.equal(validateName('my-app'), undefined);
});
