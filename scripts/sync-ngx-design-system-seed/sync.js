/* eslint-disable no-console */

const syncDirectory = require('sync-directory');
const fs = require('fs');
const { execSync } = require('child_process');

// assume that ngx-angular-cli-seed and ngx-design-system-seed are checked out next to each other in a directory
let srcDir = process.cwd() + '/../../../../ngx-design-system-seed/webapp/platform';
let targetDir = process.cwd() + '/webapp/platform/ngx-design-system-seed';

console.log('Sync ngx-design-system-seed');
console.log('--------------');

try {
    console.log('Searching for sync-ngx-design-system-seed.config.json ...');
    const config = require('./sync-ngx-design-system-seed.config.json'); // eslint-disable-line global-require
    srcDir = config['path-to-platform'];
} catch {
    console.log('Unable to read config file, using default paths.');
}

console.log('Path in ngx-design-system-seed repository (source):', srcDir);
console.log('Path in ngx-angular-cli-seed repository (target):', targetDir);

let cleanup = false;
let type = null; // link type
let message;

try {
    switch (process.argv[2]) {
        case 'link':
            cleanup = true;
            type = 'hardlink';
            message = 'ngx-design-system-seed source and ngx-angular-cli-seed platform are now linked together. A change in either repo will reflect in another, too.';
            break;
        case 'reset':
            cleanup = true;
            type = 'copy';
            message = 'ngx-design-system-seed source has been copied into ngx-angular-cli-seed platform. They are now identical but NOT linked together.';
            break;
        case 'reset:reverse':
            [srcDir, targetDir] = [targetDir, srcDir];
            cleanup = true;
            type = 'copy';
            message = 'ngx-angular-cli-seed platform/ngx-design-system-seed directory has been copied back into ngx-design-system-seed repository. They are now identical but NOT linked together.';
            break;
        case 'disable':
            cleanup = true;
            message = 'ngx-design-system-seed source has been deleted from ngx-angular-cli-seed platform. Now you can try the app with the released version of ngx-design-system-seed installed into node_modules.';
            break;
        case 'status': {
            const stats1 = fs.statSync(srcDir + '/index.ts');
            const stats2 = fs.statSync(targetDir + '/index.ts');

            const linkIsActive = stats1 && stats2 && stats1.ino && stats2.ino && stats1.ino === stats2.ino;
            message = linkIsActive ? '\nngx-angular-cli-seed platform and ngx-design-system-seed are HARD LINKED' : '\nngx-angular-cli-seed platform and ngx-design-system-seed are NOT hard linked.';

            console.log('\nGit status of NG_FLUIDX:');
            console.log('--------------------------');
            console.log(execSync(' cd ' + srcDir + ' && git status').toString());

            console.log('\nGit status of ngx-angular-cli-seed:');
            console.log('--------------------');
            console.log(execSync('git status').toString());
        }
            break;
        default:
    }
} catch { /* */ }

if (cleanup) {
    fs.rmdirSync(targetDir, { recursive: true });
    console.log('Target dir cleaned.');
}

if (type) {
    let counter = 0;
    syncDirectory.sync(srcDir, targetDir, {
        type,
        deleteOrphaned: true,
        async afterEachSync(/* { eventType, nodeType, relativePath, srcPath, targetPath } */) {
            counter++;
        },
        onError: (err) => {
            console.error(err);
        }
    });
    console.log('Synced ' + counter + ' files.');
}

if (cleanup && !type) {
    // disable sync - redirecting imports to node_modules
    fs.mkdirSync(targetDir);
    fs.mkdirSync(targetDir + '/assets');
    fs.mkdirSync(targetDir + '/assets/styles');
    fs.writeFileSync(targetDir + '/index.ts', 'export * from \'../../../node_modules/ngx-design-system-seed\';\n');
    fs.writeFileSync(targetDir + '/assets/styles/index.scss', '@import "node_modules/ngx-design-system-seed/assets/styles/index.scss";\n');
}

if (message) {
    console.log(message);
} else {
    console.log('Usage: "sync.js link | reset | reset:reverse | disable | status" ');
}
