// First argument that is not a flag, or undefined.
export function positionalName(args) {
    return args.find((a) => !a.startsWith('-'));
}

// Returns value, or reports the cancel and exits when the prompt was cancelled.
// isCancel, cancel and exit are passed in so this can be tested without a TTY.
export function orCancel(value, { isCancel, cancel, exit }) {
    if (isCancel(value)) {
        cancel('Operation cancelled');
        exit(0);
    }
    return value;
}
