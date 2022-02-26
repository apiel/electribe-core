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
        modDepthPos: 18,
        modSpeedPos: 17,
        levelPos: 25,
        ifxOnPos: 34,
    };
    const POS_VAR1 = {
        ...POS_VAR0,
        oscEditPos: 10,
        filterPos: 11,
        ampEGpos: 27,
        ifxPos: 35,
        panPos: 26,
    };
    const POS_VAR2 = { glidePos: 41, modPos: 17 };
    const POS_VAR3 = {
        ...POS_VAR2,
        pitchPos: 40,
        egInt: 16,
        voiceAssignPos: 1,
        oscPos: 8,
    };
    const POS_VAR4 = { modSpeedPos: 17, levelPos: 25 };
    const POS_VAR5 = {
        ...POS_VAR3,
        resPos: 15,
        decayReleasePos: 23,
        lastStepPos: -1,
    };
    const POS_VAR6 = { ...POS_VAR0, oscEditPos: 10, panPos: 26 };

    const START_POS: [number, PosVar][] = [
        [2350, {}], // part 1
        [3283, POS_VAR1], // part 2
        [4215, { ...POS_VAR2, voiceAssignPos: 1 }], // part 3
        [5148, POS_VAR6], // part 4
        [6080, POS_VAR3], // part 5
        [7013, POS_VAR4], // part 6
        [7945, POS_VAR5], // part 7
        [8878, {}], // part 8
        [9811, POS_VAR1], // part 9
        [10743, { ...POS_VAR2, voiceAssignPos: 1 }], // part 10
        [11676, POS_VAR6], // part 11
        [12608, POS_VAR3], // part 12
        [13541, { ...POS_VAR4, modDepthPos: 19 }], // part 13
        [14473, POS_VAR5], // part 14
        [15406, {}], // part 15
        [16339, POS_VAR1], // part 16
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
            oscPos = 7,
            oscEditPos = 11,
            modPos = 16,
            modDepthPos = 19,
            modSpeedPos = 18,
            levelPos = 26,
            ifxOnPos = 35,
            ifxPos = 36,
            ifxEditPos = 37,
            filterPos = 12,
            ampEGpos = 28,
            glidePos = 40,
            pitchPos = 39,
            egInt = 15,
            resPos = 14,
            decayReleasePos = 22,
            panPos = 27,
            lastStepPos = -2,
            voiceAssignPos = 0,
            partPriorityPos = 5,
            cutoffPos = 13,
            attackPos = 21,
            mfxSendPos = 29,
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
