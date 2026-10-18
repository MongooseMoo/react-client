import { describe, expect, it } from 'vitest';
import { MAX_LAUNCH_TEXT, parseProtocolUrl, sanitizeLaunchText } from './launchText';

describe('parseProtocolUrl', () => {
  it('decodes the text after the scheme', () => {
    expect(parseProtocolUrl('web+mongoose:look%20at%20fountain')).toBe('look at fountain');
  });

  it('accepts the scheme in any case and an optional //', () => {
    expect(parseProtocolUrl('WEB+Mongoose://say%20hi')).toBe('say hi');
  });

  it('gives empty text for a bare scheme, which only focuses the client', () => {
    expect(parseProtocolUrl('web+mongoose:')).toBe('');
  });

  it('rejects other schemes', () => {
    expect(parseProtocolUrl('telnet:mongoose.moo.mud.org')).toBeUndefined();
    expect(parseProtocolUrl('web+mongooses:look')).toBeUndefined();
    expect(parseProtocolUrl('javascript:alert(1)')).toBeUndefined();
  });

  it('rejects malformed percent-encoding instead of guessing', () => {
    expect(parseProtocolUrl('web+mongoose:look%E0%A4%A')).toBeUndefined();
  });

  it('turns an encoded newline into a space so a link cannot hide a second command', () => {
    expect(parseProtocolUrl('web+mongoose:look%0A%40quit')).toBe('look @quit');
    expect(parseProtocolUrl('web+mongoose:look%0D%0A%0D%0A%40quit')).toBe('look @quit');
    expect(parseProtocolUrl('web+mongoose:look%E2%80%A8%40quit')).toBe('look @quit');
  });
});

describe('sanitizeLaunchText', () => {
  it('collapses every run of control characters to one space and trims', () => {
    const separators = String.fromCharCode(0x2028, 0x2029);
    expect(sanitizeLaunchText(`\t say\u0000\u001b[31m hi \u0085${separators}there\n`)).toBe('say [31m hi there');
  });

  it('caps the length', () => {
    expect(sanitizeLaunchText('x'.repeat(MAX_LAUNCH_TEXT + 50))).toHaveLength(MAX_LAUNCH_TEXT);
  });

  it('leaves ordinary text alone', () => {
    expect(sanitizeLaunchText('page Alice "Café at 5?"')).toBe('page Alice "Café at 5?"');
  });
});
