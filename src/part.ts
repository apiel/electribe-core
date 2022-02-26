import { FILTER, IFX } from './constant';
import { OSC } from './osc';
import { MOD } from './mod';
import { VOICE } from '.';

interface PosVar {
    oscPos?: number;
    oscEditPos?: number;
    modPos?: number;
    modDepthPos?: number;
    modSpeedPos?: number;
    levelPos?: number;
    ifxOnPos?: number;
    ifxPos?: number;
    ifxEditPos?: number;
    filterPos?: number;
    ampEGpos?: number;
    glidePos?: number;
    pitchPos?: number;
    egInt?: number;
    resPos?: number;
    decayReleasePos?: number;
    panPos?: number;
    lastStepPos?: number;
    voiceAssignPos?: number;
    partPriorityPos?: number;
    cutoffPos?: number;
    attackPos?: number;
    mfxSendPos?: number;
}

export function parsePart(data: number[], partId: number) {
    // part2 many stuff wrong
    // part4

    const POS_VAR0 = {
        modDepthPos: 21,
        modSpeedPos: 20,
        levelPos: 28,
        ifxOnPos: 37,
    };
    const POS_VAR1 = {
        ...POS_VAR0,
        oscEditPos: 13,
        filterPos: 14,
        ampEGpos: 30,
        ifxPos: 38,
        panPos: 29,
    };
    const POS_VAR2 = { glidePos: 44, modPos: 20, voiceAssignPos: 4 };
    const POS_VAR3 = {
        ...POS_VAR2,
        pitchPos: 43,
        egInt: 19,
        oscPos:11,
    };
    const POS_VAR4 = { modSpeedPos: 20, levelPos: 28 };
    const POS_VAR5 = {
        ...POS_VAR3,
        resPos: 18,
        decayReleasePos: 26,
        lastStepPos: 2,
    };
    const POS_VAR6 = { ...POS_VAR0, oscEditPos: 13, panPos: 29 };

    const START_POS: [number, PosVar][] = [
        [2347, {}], // part 1
        [3280, POS_VAR1], // part 2
        [4212, POS_VAR2], // part 3
        [5145, POS_VAR6], // part 4
        [6077, POS_VAR3], // part 5
        [7010, POS_VAR4], // part 6
        [7942, POS_VAR5], // part 7
        [8875, {}], // part 8
        [9808, POS_VAR1], // part 9
        [10740, POS_VAR2], // part 10
        [11673, POS_VAR6], // part 11
        [12605, POS_VAR3], // part 12
        [13538, { ...POS_VAR4, modDepthPos: 22 }], // part 13
        [14470, POS_VAR5], // part 14
        [15403, {}], // part 15
        [16336, POS_VAR1], // part 16
    ];

    const WEIRD_OSC_POS = [
        [32, -6, 1],
        [4, -3, 1],
        [64, -7, 2],
        [8, -4, 1],
        [1, -1, 1],
        [16, -5, 1],
        [2, -2, 1],
    ];
    const [, weirdoA, weirdoB] = WEIRD_OSC_POS[partId % 7];

    const [
        pos,
        {
            oscPos = 10,
            oscEditPos = 14,
            modPos = 19,
            modDepthPos = 22,
            modSpeedPos = 21,
            levelPos = 29,
            ifxOnPos = 38,
            ifxPos = 39,
            ifxEditPos = 40,
            filterPos = 15,
            ampEGpos = 31,
            glidePos = 43,
            pitchPos = 42,
            egInt = 18,
            resPos = 17,
            decayReleasePos = 25,
            panPos = 30,
            lastStepPos = 1,
            voiceAssignPos = 3,
            partPriorityPos = 8,
            cutoffPos = 16,
            attackPos = 24,
            mfxSendPos = 32,
        },
    ] = START_POS[partId];
    // console.log('part', partId, ':', pos + modPos);

    const oscId =
        data[pos + oscPos] +
        (data[pos + oscPos + weirdoA] && 128) +
        (data[pos + oscPos + weirdoB] && 256);
    const part = {
        name: `part ${partId + 1}`,
        settings: {
            mfxSend: !!data[pos + mfxSendPos],
            lastStep: data[pos + lastStepPos] || 16,
            voiceAssign: VOICE[data[pos + voiceAssignPos]],
            partPriority: data[pos + partPriorityPos] ? 'High' : 'Normal',
        },
        oscillator: {
            id: oscId + 1,
            name: OSC[oscId],
            edit: data[pos + oscEditPos],
            pitch:
                data[pos + pitchPos] > 64
                    ? data[pos + pitchPos] - 128
                    : data[pos + pitchPos],
            glide: data[pos + glidePos],
        },
        filter: {
            id: data[pos + filterPos],
            name: FILTER[data[pos + filterPos]],
            cutoff: data[pos + cutoffPos],
            resonance: data[pos + resPos],
            egInt:
                data[pos + egInt] > 64
                    ? data[pos + egInt] - 128
                    : data[pos + egInt],
        },
        modulation: {
            id: data[pos + modPos] + 1,
            name: MOD[data[pos + modPos]],
            speed: data[pos + modSpeedPos],
            depth: data[pos + modDepthPos],
        },
        envelope: {
            ampEG: !!data[pos + ampEGpos],
            level: data[pos + levelPos],
            pan:
                data[pos + panPos] === 0
                    ? 'center'
                    : data[pos + panPos] > 64
                    ? `L ${data[pos + panPos] * -1 + 128}`
                    : `R ${data[pos + panPos]}`,
            attack: data[pos + attackPos],
            decayRelease: data[pos + decayReleasePos],
        },
        effect: {
            id: data[pos + ifxPos] + 1,
            name: IFX[data[pos + ifxPos]],
            on: !!data[pos + ifxOnPos],
            edit: data[pos + ifxEditPos],
        },
    };

    return part;
}
