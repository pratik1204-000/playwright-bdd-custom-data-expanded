import fs from 'fs';
import path from 'path';
import glob from 'glob';
import { execSync } from 'child_process';

import { expandFeatureWithExternalData } from '../utils/bdd-expander/excel-bdd-expander';
import { RunConfigOperations } from '../utils/run-config-operations.utils';

/**
 * SUPPORTED COMMANDS (FINAL)
 *
 * 1) runbdd.ts
 *    → RunConfig tests, all projects
 *
 * 2) runbdd.ts --project=chrome
 *    → RunConfig tests, chrome only
 *
 * 3) runbdd.ts --test=tc001
 *    → tc001, all projects
 *
 * 4) runbdd.ts --test=tc001 --project=chrome
 *    → tc001, chrome only
 *
 * NOTES
 * - No browser names are hardcoded
 * - --test disables RunConfig
 * - @ is added ONLY at runtime
 */

async function main() {
    const args = process.argv.slice(2);

    let testId: string | undefined;
    let project: string | undefined;



    /* -------------------------------------------------- */
    /* Parse CLI flags                                    */
    /* -------------------------------------------------- */
    for (const arg of args) {
        if (arg.startsWith('--test=')) {
            testId = arg.split('=')[1]?.trim();
        }

        if (arg.startsWith('--project=')) {
            project = arg.split('=')[1]?.trim();
        }
    }

    /* -------------------------------------------------- */
    /* Resolve runnable tags                              */
    /* -------------------------------------------------- */
    let runnableTags: string[] = [];

    if (testId) {
        // Explicit CLI mode → ignore RunConfig
        runnableTags = [`@${testId}`];
    } else {
        // RunConfig-driven mode
        const runConfigPath = 'tests/config/RunConfiguration.xlsx';

        if (fs.existsSync(runConfigPath)) {
            const tags = await RunConfigOperations.getRunnableTags(runConfigPath);
            runnableTags = tags.map(t => `@${t}`);
        }
    }

    /* -------------------------------------------------- */
    /* Expand BDD features                                */
    /* -------------------------------------------------- */
    const featureFiles = glob.sync('tests/**/*.feature', {
        ignore: ['**/*.gen.feature', '**/.generated-features/**']
    });

    if (!featureFiles.length) {
        console.warn('No feature files found.');
        return;
    }

    const generatedDir = path.join('tests', '.generated-features');

    if (fs.existsSync(generatedDir)) {
        fs.rmSync(generatedDir, { recursive: true, force: true });
    }
    fs.mkdirSync(generatedDir, { recursive: true });

    for (const feature of featureFiles) {
        await expandFeatureWithExternalData(feature, generatedDir);
    }

    console.log('Running bddgen command...');
    execSync('npx bddgen', { stdio: 'inherit' });

    /* -------------------------------------------------- */
    /* Build Playwright command                           */
    /* -------------------------------------------------- */


    let cmd = `npx playwright test`;

    if (runnableTags.length > 0) {
        console.log(`Running the following tests: ${runnableTags.join(', ').trim()}`);
        cmd += ` --grep "${runnableTags.join('|')}"`;
    }

    if (project) {
        cmd += ` --project=${project}`;
    }

    console.log('\n>> Executing:\n', cmd, '\n');
    execSync(cmd, { stdio: 'inherit' });

    /* -------------------------------------------------- */
    /* Cleanup                                            */
    /* -------------------------------------------------- */
    console.log('Cleaning up...');
    fs.rmSync(generatedDir, { recursive: true, force: true });

}

main().catch(err => {
    console.error('\nBDD Runner failed\n');
    console.error(err);
    process.exit(1);
});