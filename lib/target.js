import fs from 'fs-extra';
import path from 'path';

export function validateName(value) {
    if (!value || value.trim().length === 0) return 'Name is required!';
    if (value === '.' || value === '..') return 'Name must be a new directory, not "." or ".."';
    if (path.isAbsolute(value) || path.win32.isAbsolute(value)) return 'Name must not be an absolute path';
    if (value.includes('/') || value.includes('\\')) return 'Name must not contain path separators';
}

// 'new' (does not exist), 'empty' (empty directory) or 'occupied' (anything else).
export function targetState(targetDir) {
    if (!fs.existsSync(targetDir)) return 'new';
    if (fs.statSync(targetDir).isDirectory() && fs.readdirSync(targetDir).length === 0) return 'empty';
    return 'occupied';
}

// Returns true when targetDir may be used. An occupied target is removed only
// after confirmOverwrite() resolves to true.
export async function prepareTarget(targetDir, confirmOverwrite) {
    if (targetState(targetDir) !== 'occupied') return true;
    if (await confirmOverwrite(targetDir) !== true) return false;
    fs.removeSync(targetDir);
    return true;
}
