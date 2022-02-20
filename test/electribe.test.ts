import { readFileSync } from 'fs';
import { parseMessage } from '../src';

 // to fix after refactoring!

describe('electribe', () => {
    let data: number[] = [];
    beforeAll(() => {
        const output = readFileSync(`${__dirname}/214.json`);
        data = JSON.parse(output.toString());
    });

    it('should do something', () => {
        const res = parseMessage(data);
        expect(res?.pattern).toEqual({
            alternate13_14: true,
            alternate15_16: true,
            beat: '16',
            chainRepeat: 0,
            chainTo: 0,
            chordSet: 3,
            gateArp: 1,
            key: 'G',
            keyId: 7,
            length: 4,
            level: 127,
            mfx: 'Looper',
            mfxHold: false,
            mfxId: 7,
            name: '300Miles 2',
            scale: 'Dorian',
            scaleId: 2,
            swing: 10,
            tempo: 1020,
            part: [...Array(16)].map((_, i) => ({
                name: `part ${i + 1}`,
                oscId: 263,
                osc: { name: 'Ahaa..', type: 'Voice' },
                oscEdit: 95,
                pitch: 63,
                glide: 38,
                filterId: 9,
                filter: { name: 'P5 HPF', type: 'HPF' },
                cutoff: 70,
                resonance: 64,
                egInt: 24,
                modulationId: 61,
                modulation: {
                    name: 'S&HBPM Filter',
                    source: 'LFO (sample & hold)',
                    destination: 'Filter Cutoff',
                    bpmSync: true,
                    keySync: false,
                },
                modSpeed: 97,
                modDepth: 54,
                mfxSend: true,
                ampEG: true,
                level: 59,
                pan: 'R 40',
                attack: 45,
                decayRelease: 71,
                ifxOn: false,
                ifxId: 33,
                ifx: 'Phaser Manual',
                ifxEdit: 53,
            })),
        });
    });
});
