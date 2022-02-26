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
}

export function parsePart(data: number[], partId: number) {
    // part2 many stuff wrong
    // part4

    const POS_VAR0 = {
        modDepthPos: 8,
        modSpeedPos: 7,
        levelPos: 15,
        ifxOnPos: 24,
    };
    const POS_VAR1 = {
        ...POS_VAR0,
        oscEditPos: 0,
        filterPos: 1,
        ampEGpos: 17,
        ifxPos: 25,
        panPos: 16,
    };
    const POS_VAR2 = { glidePos: 31, modPos: 7 };
    const POS_VAR3 = {
        ...POS_VAR2,
        pitchPos: 30,
        egInt: 6,
        voiceAssignPos: -9,
        oscPos: -2,
    };
    const POS_VAR4 = { modSpeedPos: 7, levelPos: 15 };
    const POS_VAR5 = {
        ...POS_VAR3,
        resPos: 5,
        decayReleasePos: 13,
        lastStepPos: -11,
    };
    const POS_VAR6 = { ...POS_VAR0, oscEditPos: 0, panPos: 16 };

    const START_POS: [number, PosVar][] = [
        [2360, {}], // part 1
        [3293, POS_VAR1], // part 2
        [4225, { ...POS_VAR2, voiceAssignPos: -9 }], // part 3
        [5158, POS_VAR6], // part 4
        [6090, POS_VAR3], // part 5
        [7023, POS_VAR4], // part 6
        [7955, POS_VAR5], // part 7
        [8888, {}], // part 8
        [9821, POS_VAR1], // part 9
        [10753, { ...POS_VAR2, voiceAssignPos: -9 }], // part 10
        [11686, POS_VAR6], // part 11
        [12618, POS_VAR3], // part 12
        [13551, { ...POS_VAR4, modDepthPos: 9 }], // part 13
        [14483, POS_VAR5], // part 14
        [15416, {}], // part 15
        [16349, POS_VAR1], // part 16
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
            oscPos = -3,
            oscEditPos = 1,
            modPos = 6,
            modDepthPos = 9,
            modSpeedPos = 8,
            levelPos = 16,
            ifxOnPos = 25,
            ifxPos = 26,
            ifxEditPos = 27,
            filterPos = 2,
            ampEGpos = 18,
            glidePos = 30,
            pitchPos = 29,
            egInt = 5,
            resPos = 4,
            decayReleasePos = 12,
            panPos = 17,
            lastStepPos = -12, // -9
            voiceAssignPos = -10, // -7
            partPriorityPos = -5, // -2
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
            mfxSend: !!data[pos + 19],
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
            cutoff: data[pos + 3],
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
            attack: data[pos + 11],
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
