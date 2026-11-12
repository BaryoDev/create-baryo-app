import fs from 'fs-extra';

export function validateName(value) {
    if (!value || value.trim().length === 0) return 'Name is required!';
    if (value === '.' || value === '..') return 'Name must be a new directory, not "." or ".."';
    if (value.includes('/') || value.includes('\\')) return 'Name must not contain path separators';
    // A colon makes `C:` or `C:foo` drive-relative on Windows, which resolves outside the current directory.
    if (value.includes(':')) return 'Name must not contain ":"';
    if (/[\x00-\x1f]/.test(value)) return 'Name must not contain control characters';
}

// 'new' (does not exist), 'empty' (empty directory) or 'occupied' (anything else,
// including a symlink, which could point outside the current directory).
export function targetState(targetDir) {
    let st;
    try {
        st = fs.lstatSync(targetDir);
    } catch {
        return 'new';
    }
    if (st.isDirectory() && fs.readdirSync(targetDir).length === 0) return 'empty';
    return 'occupied';
}

// Returns true when targetDir may be used. An occupied target is removed only
// when force is true.
export function prepareTarget(targetDir, force) {
    if (targetState(targetDir) !== 'occupied') return true;
    if (force !== true) return false;
    fs.removeSync(targetDir);
    return true;
}
