import { execSync } from 'child_process';
import { readFileSync } from 'fs';

const LOG_FILE = `${__dirname}/log.json`;

const content = readFileSync(LOG_FILE);
if (!content) {
    throw new Error(`Could not read file ${LOG_FILE}`);
}
const data = JSON.parse(content.toString());
if (!data) {
    throw new Error(`Error while parsing file ${LOG_FILE}`);
}

const hex = data.map((v: number) => v.toString(16)).join(' ');

const cmd = `amidi -p hw:3 -S "${hex}"`;
console.log('run cmd:', cmd);
const output = execSync(cmd);
console.log(output.toString());
