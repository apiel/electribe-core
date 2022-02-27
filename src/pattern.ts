import { BEAT, KEY, SCALE, MFX } from './constant';
import { parsePartFromPattern } from './part';

export function setName(rawData: number[], name: string) {
    // here we sould replace all none possible char to empty string
    // [A-Za-z0-9 !#$%&'()+,-]
    const data = [...rawData];
    for (let i = 0; i < 15; i++) {
        const p = 26 + i + (i > 4 ? 1 : 0) + (i > 11 ? 1 : 0);
        data[p] = name.charCodeAt(i) || 32; // 32 = space
    }
    return data;
}

export function parsePattern(rawData: number[]) {
    const data = [...rawData];

    const name = data
        .slice(26, 43)
        .filter((c, k) => c && k != 13 && k != 5) // data[39], here 13, is used for tempo ? kind of weird...
        .map((c) => String.fromCharCode(c))
        .join('')
        .trim();

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
        // last step is per part?
        // groove is per s
        // ...
        parts: [...Array(16)].map((_, partId) =>
            parsePartFromPattern(data, partId),
        ),
    };

    return pattern;
}
