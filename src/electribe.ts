import { E2_SYSEX_HEADER, E2_SYSEX_HEADER_STR } from './hex';
import { parsePattern } from './pattern';

export type Pattern = ReturnType<typeof parsePattern>;
export type Part = Pattern['parts'][0];

export const event = {
    onPatternData: ({
        pattern,
        data,
    }: {
        pattern: Pattern;
        data: number[];
    }) => {},

    onMidiData: (_: { data: number[] }) => {},
    onError: (_: {
        data: number[];
        type: 'DATA_FORMAT_ERROR' | 'DATA_LOAD_ERROR' | 'WRITE_ERROR';
    }) => {},
    onWriteDone: () => {},
};

export function parseMessage(data: number[]) {
    const headerEnd = E2_SYSEX_HEADER.length;
    const headers = data.slice(0, headerEnd).toString();

    if (headers === E2_SYSEX_HEADER_STR) {
        // See 1-4 SYSTEM EXCLUSIVE MESSAGES
        switch (data[headerEnd]) {
            // should move those to hex...
            case 0x40: // 0x40 (64) CURRENT PATTERN DATA DUMP
            case 0x4c: // 0x4C (76) GIVEN PATTERN DATA DUMP
                // console.log('Received pattern', data);
                const pattern = parsePattern(data);
                event.onPatternData({ pattern, data });
                return { pattern };

            case 0x26: // 0x26 DATA FORMAT ERROR
                event.onError({ data, type: 'DATA_FORMAT_ERROR' });
                return;

            case 0x22: // 0x22 WRITE ERROR
                event.onError({ data, type: 'WRITE_ERROR' });
                return;

            case 0x24: // 0x24 DATA LOAD ERROR
                event.onError({ data, type: 'DATA_LOAD_ERROR' });
                return;

            case 0x21: // 0x21 (33) WRITE COMPLETED
                event.onWriteDone();
                return;

            case 0x51: // 0x51 (81) GLOBAL DATA DUMP
            case 0x23: // 0x23 DATA LOAD COMPLETED
        }
    }

    event.onMidiData({ data });
}
