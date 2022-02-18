import { BEAT, KEY, SCALE, MFX, FILTER, IFX } from './constant';
import { OSC } from './osc';
import { MOD } from './mod';

export type Pattern = ReturnType<typeof parsePattern>;

export const event = {
    onPatternData: ({
        pattern,
        data,
    }: {
        pattern: Pattern;
        data: number[];
    }) => {},

    onMidiData: ({ data }: { data: number[] }) => {},
};

export function parseMessage(data: number[]) {
    const headers = data.slice(0, 7).toString();
    switch (headers) {
        // case '240,66,48,0,1,34,64': // e2s ?
        case '240,66,48,0,1,35,64': // e2
            console.log('Received pattern', data);
            const pattern = parsePattern(data);
            event.onPatternData({ pattern, data });
            return pattern;

        default:
            event.onMidiData({ data });
            break;
    }
}

export function parsePattern(rawData: number[]) {
    const data = [...rawData];

    const name = data
        .slice(26, 43)
        .filter((c, k) => c && k != 13) // data[39], here 13, is used for tempo ? kind of weird...
        .map((c) => String.fromCharCode(c))
        .join('');

    const pattern = {
        name,
        tempo: data[46] + data[48] * 256 + (data[39] ? 128 : 0),
        swing: data[49] > 50 ? data[49] - 128 : data[49], // 48 is displayed 50 and -48 -> -50 but fuck it :p
        length: data[50] + 1,
        beat: BEAT[data[51]],
        key: KEY[data[52]],
        keyId: data[52],
        scale: SCALE[data[53]],
        scaleId: data[53],
        chordSet: data[54] + 1,
        level: 127 - data[56],
        gateArp: data[64] + 1,
        mfx: MFX[data[77]],
        mfxId: data[77] + 1,
        alternate13_14: !!data[85],
        alternate15_16: !!data[86],
        chainTo: data[17269] + (data[17263] && 128),
        chainRepeat: data[17272],
        mfxHold: !!data[82],
        // last step is per part
        // groove is per s
    };

    for (let partId = 0; partId < 16; partId++) {
        const part = parsePart(data, partId);
        // console.log({ part });
        // console.log(`part ${partId}`, part.osc);
        // console.log(`part ${partId}`, part.cutoff);
        // console.log(`part ${partId}`, part.ifx);
    }

    console.log(parsePart(data, 11));

    return pattern;
}

interface PosVar {
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
}

function parsePart(data: number[], partId: number) {
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
        modPos: 6,
        ampEGpos: 17,
        ifxPos: 25,
        panPos: 16,
    };
    const POS_VAR2 = { glidePos: 31, modPos: 7 };
    const POS_VAR3 = { ...POS_VAR2, pitchPos: 30, egInt: 6 };
    
    const START_POS: [number, number, PosVar][] = [
        [2357, 2360, {}], // part 1
        [3290, 3293, POS_VAR1], // part 2
        [4222, 4225, { modPos: 7 }], // part 3
        [5155, 5158, POS_VAR0], // part 4
        [6088, 6090, POS_VAR3], // part 5
        [7020, 7023, { modPos: 6, modSpeedPos: 7, levelPos: 15 }], // part 6
        [7953, 7955, { ...POS_VAR3, resPos: 5, decayReleasePos: 13 }], // part 7
        [8885, 8888, { modPos: 6 }], // part 8
        [9818, 9821, POS_VAR1], // part 9
        [10750, 10753, POS_VAR2], // part 10
        [11683, 11686, { ...POS_VAR0, oscEditPos: 0, modPos: 6, panPos: 16 }], // part 11
        [12616, 12618, POS_VAR3], // part 12
        [13548, 13551, {}], // part 13
        [14481, 14483, {}], // part 14
        [15413, 15416, {}], // part 15
        [16346, 16349, {}], // part 16
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
        oscPos,
        pos,
        {
            oscEditPos = 1,
            modPos = 10,
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
        },
    ] = START_POS[partId];
    // console.log('part', partId, ':', pos + modPos);

    const oscId =
        data[oscPos] +
        (data[oscPos + weirdoA] && 128) +
        (data[oscPos + weirdoB] && 256);
    const part = {
        name: `part ${partId + 1}`,
        oscId: oscId + 1,
        osc: OSC[oscId],
        oscEdit: data[pos + oscEditPos],
        pitch:
            data[pos + pitchPos] > 64
                ? data[pos + pitchPos] - 128
                : data[pos + pitchPos],
        glide: data[pos + glidePos],
        filterId: data[pos + filterPos],
        filter: FILTER[data[pos + filterPos]],
        cutoff: data[pos + 3],
        resonance: data[pos + resPos],
        egInt:
            data[pos + egInt] > 64
                ? data[pos + egInt] - 128
                : data[pos + egInt],
        modulationId: data[pos + modPos] + 1,
        modulation: MOD[data[pos + modPos]],
        modSpeed: data[pos + modSpeedPos],
        modDepth: data[pos + modDepthPos],
        mfxSend: !!data[pos + 19],
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
        ifxOn: !!data[pos + ifxOnPos],
        ifxId: data[pos + ifxPos] + 1,
        ifx: IFX[data[pos + ifxPos]],
        ifxEdit: data[pos + ifxEditPos],
    };

    return part;
}
