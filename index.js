#!/usr/bin/env node

/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { intro, outro, select, text, confirm, spinner, isCancel, cancel } from '@clack/prompts';
import { execa } from 'execa';
import degit from 'degit';
import chalk from 'chalk';
import gradient from 'gradient-string';
import fs from 'fs-extra';
import path from 'path';
import { validateName, prepareTarget } from './lib/target.js';
import { positionalName, orCancel } from './lib/cli.js';

const baryoGradient = gradient(['#667eea', '#764ba2', '#6b8dd6']);

async function main() {
    console.clear();
    intro(baryoGradient(' 🏘️  BaryoDev: create-baryo-app '));

    const cancelOpts = { isCancel, cancel, exit: (code) => process.exit(code) };

    let projectName = positionalName(process.argv.slice(2));
    if (projectName !== undefined) {
        const problem = validateName(projectName);
        if (problem) {
            cancel(problem);
            process.exit(1);
        }
    } else {
        projectName = orCancel(await text({
            message: 'What is your project named?',
            placeholder: 'my-baryo-app',
            validate: validateName,
        }), cancelOpts);
    }

    const projectDesc = orCancel(await text({
        message: 'Give it a short description:',
        placeholder: 'A next-gen project from the Baryo',
    }), cancelOpts);

    const projectType = await select({
        message: 'What kind of project is this?',
        options: [
            { value: 'library', label: '📦 Library (Performance & Zero-Deps)', hint: 'Ideal for NuGet/NPM modules' },
            { value: 'api', label: '🚀 Web API (Clean & Scalable)', hint: 'Ideal for backend services' },
            { value: 'saas', label: '🏢 Enterprise SaaS (Global & Robust)', hint: 'Full suite of enterprise skills' },
            { value: 'global', label: '🌍 Global Product (i18n & a11y)', hint: 'Focus on worldwide reach' },
        ],
    });

    orCancel(projectType, cancelOpts);

    const s = spinner();
    const targetDir = path.resolve(process.cwd(), projectName);

    if (!prepareTarget(targetDir, process.argv.includes('--force'))) {
        cancel(`${targetDir} already exists and is not empty. Pass --force to delete it and continue.`);
        process.exit(1);
    }

    s.start('🏘️  Fetching BaryoDev template...');
    const emitter = degit('BaryoDev/template-project', {
        force: true,
    });

    try {
        await emitter.clone(targetDir);
        s.stop('Template downloaded!');
    } catch (err) {
        s.stop('Failed to download template', 1);
        console.error(chalk.red(err.message));
        process.exit(1);
    }

    s.start('✨ Tailoring your project to the Baryo Way...');

    // 1. Update package.json
    const pkgPath = path.join(targetDir, 'package.json');
    if (fs.existsSync(pkgPath)) {
        const pkg = fs.readJsonSync(pkgPath);
        pkg.name = projectName;
        pkg.description = projectDesc;
        fs.writeJsonSync(pkgPath, pkg, { spaces: 2 });
    }

    // 2. Customize .cursorrules
    const cursorRulesPath = path.join(targetDir, '.cursorrules');
    if (fs.existsSync(cursorRulesPath)) {
        let rules = fs.readFileSync(cursorRulesPath, 'utf8');

        // Customizing activation guide based on type
        let activationInstruction = '';
        switch (projectType) {
            case 'library':
                activationInstruction = 'Activate: baryo-coding (Library Mode), baryo-testing, baryo-discipline, baryo-packaging';
                break;
            case 'api':
                activationInstruction = 'Activate: baryo-coding (Application Mode), baryo-api, baryo-security, baryo-observability';
                break;
            case 'saas':
                activationInstruction = 'Activate ALL production + enterprise skills';
                break;
            case 'global':
                activationInstruction = 'Activate: baryo-global, baryo-privacy, baryo-scale';
                break;
        }

        rules = rules.replace('Tell the AI which skills to use:', `AUTO-ACTIVATED: ${activationInstruction}\n\nTell the AI which skills to use:`);
        fs.writeFileSync(cursorRulesPath, rules);
    }

    // 3. Update README
    const readmePath = path.join(targetDir, 'README.md');
    if (fs.existsSync(readmePath)) {
        let readme = fs.readFileSync(readmePath, 'utf8');
        readme = readme.replace(/BaryoDev Project Template/g, () => projectName);
        readme = readme.replace(/A universal project template/g, () => projectDesc);
        fs.writeFileSync(readmePath, readme);
    }

    s.stop('Project tailored!');

    const shouldInstall = orCancel(await confirm({
        message: 'Install dependencies?',
        initialValue: true,
    }), cancelOpts);

    if (shouldInstall) {
        s.start('📦 Installing dependencies (npm install)...');
        try {
            await execa('npm', ['install'], { cwd: targetDir });
            s.stop('Dependencies installed!');
        } catch (err) {
            s.stop('Installation failed', 1);
            console.warn(chalk.yellow('npm install failed. You may need to run it manually.'));
        }
    }

    s.start('📂 Initializing Git repository...');
    try {
        await execa('git', ['init'], { cwd: targetDir });
        await execa('git', ['add', '.'], { cwd: targetDir });
        await execa('git', ['commit', '-m', 'chore: initial commit from BaryoDev template'], { cwd: targetDir });
        s.stop('Git initialized!');
    } catch (err) {
        s.stop('Git initialization failed', 1);
    }

    outro(baryoGradient(`🚀 Your project ${projectName} is ready! Enjoy the Baryo Way.`));
    console.log(`\n  ${chalk.cyan('cd')} ${projectName}`);
    if (!shouldInstall) console.log(`  ${chalk.cyan('npm install')}`);
    console.log(`  ${chalk.cyan('npm run docs:dev')}\n`);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
