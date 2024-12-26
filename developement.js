const { spawn } = require('child_process')
const path = require('path')

const electron = require('electron')
const tsNodePath = require.resolve('ts-node/register')
const mainPath = path.join(__dirname, './src/app/index.ts')

const child = spawn(electron, ['-r', tsNodePath, mainPath,'-devtool'], {
    stdio: 'inherit',
});

child.on('close', (code) => {
    process.exit(code)
});
