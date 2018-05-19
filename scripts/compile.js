const fs = require('fs-extra');
const path = require('path');
const solc = require('solc');

const contractPath = path.resolve(__dirname, '../contracts', 'Car.sol');
const contractSource = fs.readFileSync(contractPath, 'utf8');

const result = solc.compile(contractSource, 1);
console.log(result);

Object.keys(result.contracts).forEach(name => {
    const contractName = name.replace(/^:/, '');
    const filePath = path.resolve(__dirname, '../compiled', `${contractName}.json`);
    fs.outputJsonSync(filePath, result.contracts[name]);
    console.log(`save compiled contract ${contractName} to ${filePath}`);
});
