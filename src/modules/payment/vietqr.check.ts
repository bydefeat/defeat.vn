import assert from 'node:assert/strict';
import { crc16, vietQrPayload } from './vietqr.ts';

assert.equal(crc16('123456789'), '29B1');
const p = vietQrPayload({ bin: '970422', number: '100000001' });
assert.equal(p, '00020101021138530010A0000007270123000697042201091000000010208QRIBFTTA53037045802VN6304' + crc16(p.slice(0, -4)));
assert.match(vietQrPayload({ bin: '970422', number: '1', amount: 5000000, note: 'DEFEAT 01' }), /010212.*54075000000.*62130809DEFEAT 01/);
console.log('vietqr ok', p);
