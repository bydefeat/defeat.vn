const tlv = (id: string, value: string) => `${id}${String(value.length).padStart(2, '0')}${value}`;

export function crc16(data: string): string {
  let crc = 0xffff;
  for (const byte of new TextEncoder().encode(data)) {
    crc ^= byte << 8;
    for (let i = 0; i < 8; i++) crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

export function vietQrPayload({ bin, number, amount, note }: { bin: string; number: string; amount?: number; note?: string }): string {
  const beneficiary = tlv('00', bin) + tlv('01', number);
  const body =
    tlv('00', '01') +
    tlv('01', amount ? '12' : '11') +
    tlv('38', tlv('00', 'A000000727') + tlv('01', beneficiary) + tlv('02', 'QRIBFTTA')) +
    tlv('53', '704') +
    (amount ? tlv('54', String(amount)) : '') +
    tlv('58', 'VN') +
    (note ? tlv('62', tlv('08', note)) : '') +
    '6304';
  return body + crc16(body);
}
