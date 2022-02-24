export const E2_SYSEX_HEADER = [240, 66, 48, 0, 1, 35]; // 0xf0, 0x42, 0x30, 0, 1, 0x23
export const E2_SYSEX_HEADER_STR = E2_SYSEX_HEADER.toString();

export const SYSEX_CURRENT_PATTERN = [...E2_SYSEX_HEADER, 16, 247]; // F0,42,30,00,01,23,10,F7

export const SYSEX_PATTERN = (pos: number) => [
    ...E2_SYSEX_HEADER,
    0x4c,
    (pos - 1) % 128,
    pos > 128 ? 1 : 0,
];

// Python
// (b'KORG'.ljust(16, b'\x00') + 
//     b'electribe'.ljust(16, b'\x00') +
//     b'\x01\x00\x00\x00'.ljust(224, b'\xff'))
export const E2_BIN_HEADER = [
    75, 79, 82, 71, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 101, 108, 101, 99,
    116, 114, 105, 98, 101, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 255, 255, 255,
    255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
    255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
    255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
    255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
    255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
    255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
    255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
    255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
    255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
    255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
    255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
    255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
    255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
    255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
    255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
    255, 255, 255, 255, 255, 255, 255,
];
