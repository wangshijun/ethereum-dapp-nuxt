const fs = require('fs-extra');
const path = require('path');
const solc = require('solc');

// 1. cleanup
const compiledDir = path.resolve(__dirname, '../compiled');
fs.removeSync(compiledDir);
fs.ensureDirSync(compiledDir);

// 2. search all contracts
const contractFiles = fs.readdirSync(path.resolve(__dirname, '../contracts'));
contractFiles.forEach(contractFile => {
    // 2.1 compile
    const contractPath = path.resolve(__dirname, '../contracts', contractFile);
    const contractSource = fs.readFileSync(contractPath, 'utf8');
    const result = solc.compile(contractSource, 1);
    console.log(`file compiled: ${contractFile}`)

    // 2.2 check errors
    if (Array.isArray(result.errors) && result.errors.length) {
        throw new Error(result.errors[0]);
    }

    // 2.3 save to disk
    Object.keys(result.contracts).forEach(name => {
        const contractName = name.replace(/^:/, '');
        const filePath = path.resolve(compiledDir, `${contractName}.json`);
        fs.outputJsonSync(filePath, result.contracts[name]);
        console.log(` > contract ${contractName} saved to ${filePath}`);
    });
});
