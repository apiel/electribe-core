// import midi from 'midi';
const midi = require('midi');
import { readFileSync } from 'fs';

import { parseMessage, event } from '../src/index';

const LOG_FILE = `${__dirname}/log.json`;

const input = new midi.Input();
const output = new midi.Output();

const port = 1;
console.log('Write to ', {
    in: input.getPortName(port),
    out: output.getPortName(port),
});

input.on('message', (deltaTime: number, message: number[]) => {
    parseMessage(message);
});

// Open the first available input port.
input.openPort(port);
input.ignoreTypes(false, true, false);

output.openPort(port);
// output.sendMessage([176,22,1]);

const content = readFileSync(LOG_FILE);
if (!content) {
    throw new Error(`Could not read file ${LOG_FILE}`);
}
const data = JSON.parse(content.toString());
if (!data) {
    throw new Error(`Error while parsing file ${LOG_FILE}`);
}
output.sendMessage(data);

event.onPatternData = ({ pattern }) => console.log('Received pattern', pattern);
event.onMidiData = ({ data }) => console.log('MIDI data', data);
event.onError = ({ type }) => console.error('Error', type);
