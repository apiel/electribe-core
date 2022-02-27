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

export const START_POS: number[] = [
    2347, // part 1
    3280, // part 2
    4212, // part 3
    5145, // part 4
    6077, // part 5
    7010, // part 6
    7942, // part 7
    8875, // part 8
    9808, // part 9
    10740, // part 10
    11673, // part 11
    12605, // part 12
    13538, // part 13
    14470, // part 14
    15403, // part 15
    16336, // part 16
];

export function parsePartFromPattern(data: number[], partId: number) {
    const pos = START_POS[partId];
    const partData = data.slice(pos);
    return parsePart(partData, partId);
}

export function parsePart(data: number[], partId: number) {
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
        oscPos: 11,
    };
    const POS_VAR4 = { modSpeedPos: 20, levelPos: 28 };
    const POS_VAR5 = {
        ...POS_VAR3,
        resPos: 18,
        decayReleasePos: 26,
        lastStepPos: 2,
    };
    const POS_VAR6 = { ...POS_VAR0, oscEditPos: 13, panPos: 29 };

    const POS_VAR: PosVar[] = [
        {}, // part 1
        POS_VAR1, // part 2
        POS_VAR2, // part 3
        POS_VAR6, // part 4
        POS_VAR3, // part 5
        POS_VAR4, // part 6
        POS_VAR5, // part 7
        {}, // part 8
        POS_VAR1, // part 9
        POS_VAR2, // part 10
        POS_VAR6, // part 11
        POS_VAR3, // part 12
        { ...POS_VAR4, modDepthPos: 22 }, // part 13
        POS_VAR5, // part 14
        {}, // part 15
        POS_VAR1, // part 16
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

    const {
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
    } = POS_VAR[partId];

    const oscId =
        data[oscPos] +
        (data[oscPos + weirdoA] && 128) +
        (data[oscPos + weirdoB] && 256);
    const part = {
        name: `part ${partId + 1}`,
        settings: {
            mfxSend: !!data[mfxSendPos],
            lastStep: data[lastStepPos] || 16,
            voiceAssign: VOICE[data[voiceAssignPos]],
            partPriority: data[partPriorityPos] ? 'High' : 'Normal',
        },
        oscillator: {
            id: oscId + 1,
            name: OSC[oscId],
            edit: data[oscEditPos],
            pitch: data[pitchPos] > 64 ? data[pitchPos] - 128 : data[pitchPos],
            glide: data[glidePos],
        },
        filter: {
            id: data[filterPos],
            name: FILTER[data[filterPos]],
            cutoff: data[cutoffPos],
            resonance: data[resPos],
            egInt: data[egInt] > 64 ? data[egInt] - 128 : data[egInt],
        },
        modulation: {
            id: data[modPos] + 1,
            name: MOD[data[modPos]],
            speed: data[modSpeedPos],
            depth: data[modDepthPos],
        },
        envelope: {
            ampEG: !!data[ampEGpos],
            level: data[levelPos],
            pan:
                data[panPos] === 0
                    ? 'center'
                    : data[panPos] > 64
                    ? `L ${data[panPos] * -1 + 128}`
                    : `R ${data[panPos]}`,
            attack: data[attackPos],
            decayRelease: data[decayReleasePos],
        },
        effect: {
            id: data[ifxPos] + 1,
            name: IFX[data[ifxPos]],
            on: !!data[ifxOnPos],
            edit: data[ifxEditPos],
        },
    };

    return part;
}
