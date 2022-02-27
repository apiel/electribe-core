import { pat2sysConvert, sys2patConvert } from '../src/codec';

describe('electribe', () => {
    it('should convert and convert back', () => {
        const test = [...Array(8 * 1000)].map((e) => ~~(Math.random() * 127));
        const res = pat2sysConvert(sys2patConvert([...test]));

        expect(test).toEqual(res);
    });
});
