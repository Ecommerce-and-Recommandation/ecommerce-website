import depcheck from 'depcheck';
import { execSync } from 'child_process';

export type CompatibleSpecialParser = (filePath: string, deps: readonly string[], rootDir: string) => string[];

async function runDepcheck({ fix = false } = {}) {
    const options: depcheck.Options = {
        specials: [depcheck.special.eslint],
        ignoreDirs: ['dist', '.vite'],
        ignoreMatches: [
            'tailwindcss',
            'tailwindcss-animate',
            'autoprefixer',
            '@tailwindcss/forms',
            'postcss',
            'tw-animate-css',
            '@tailwindcss/postcss',
            'prettier',
        ],
    };

    await new Promise<void>((resolve, reject) => {
        depcheck(process.cwd(), options, (unused) => {
            const { dependencies, devDependencies, missing } = unused;

            const unusedDeps = [...dependencies, ...devDependencies];
            const missingDeps = Object.keys(missing);

            let hadIssues = false;

            if (unusedDeps.length > 0) {
                hadIssues = true;
                console.log('\nUnused dependencies:');
                unusedDeps.forEach((dep) => {
                    console.log(`  - ${dep}`);
                });

                if (fix) {
                    console.log('\nRemoving unused dependencies...');
                    try {
                        execSync(`npm uninstall ${unusedDeps.join(' ')}`, { stdio: 'inherit' });
                        console.log('Unused dependencies removed.');
                    } catch (err) {
                        console.error('Failed to uninstall some packages:', err);
                        reject(err as Error);
                        return;
                    }
                }
            } else {
                console.log('No unused dependencies found.');
            }

            if (missingDeps.length > 0) {
                hadIssues = true;
                console.log('\nMissing dependencies (used but not listed):');
                missingDeps.forEach((dep) => {
                    const usages = missing[dep];
                    console.log(`  - ${dep}: used in ${usages.length.toString()} file(s)`);
                    usages.forEach((file) => {
                        console.log(`      • ${file}`);
                    });
                });

                if (fix) {
                    console.log('\nInstalling missing dependencies...');
                    try {
                        execSync(`npm install ${missingDeps.join(' ')}`, { stdio: 'inherit' });
                        console.log('Missing dependencies installed.');
                    } catch (err) {
                        console.error('Failed to install some missing packages:', err);
                        reject(err as Error);
                        return;
                    }
                }
            } else {
                console.log('No missing dependencies found.');
            }

            if (hadIssues && !fix) {
                reject(new Error('Dependency issues found. See logs above for details. (npm run depcheck:fix to automatically fix issues)'));
                return;
            }

            resolve();
        }).catch((err: unknown) => {
            console.error('Error running depcheck:', err);
            reject(err as Error);
        });
    });
}

const shouldFix = process.argv.includes('--fix');

runDepcheck({ fix: shouldFix }).catch((err: unknown) => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
});
