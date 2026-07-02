import { describe, it, expect } from 'vitest';
import { isSafeUrl } from './isSafeUrl';

describe('isSafeUrl', () => {
  describe('allowed schemes', () => {
    it('allows plain https', () => {
      expect(isSafeUrl('https://example.com/path')).toBe(true);
    });

    it('allows plain http', () => {
      expect(isSafeUrl('http://example.com')).toBe(true);
    });

    it('allows mailto', () => {
      expect(isSafeUrl('mailto:someone@example.com')).toBe(true);
    });

    it('allows protocol-relative URLs (resolve to https)', () => {
      expect(isSafeUrl('//example.com/path')).toBe(true);
    });
  });

  describe('rejected schemes', () => {
    it('rejects javascript:', () => {
      expect(isSafeUrl('javascript:alert(1)')).toBe(false);
    });

    it('rejects javascript:// that matches URL_REGEX', () => {
      expect(isSafeUrl('javascript://%0aalert(1)')).toBe(false);
    });

    it('rejects data: URLs', () => {
      expect(isSafeUrl('data:text/html,<script>alert(1)</script>')).toBe(false);
    });

    it('rejects vbscript:', () => {
      expect(isSafeUrl('vbscript:msgbox(1)')).toBe(false);
    });

    it('rejects blob:', () => {
      expect(isSafeUrl('blob:https://example.com/uuid')).toBe(false);
    });

    it('rejects file:', () => {
      expect(isSafeUrl('file:///etc/passwd')).toBe(false);
    });

    it('rejects javascript: with leading/trailing whitespace', () => {
      expect(isSafeUrl('  javascript:alert(1)  ')).toBe(false);
    });

    it('rejects mixed-case JavaScript:', () => {
      expect(isSafeUrl('JavaScript:alert(1)')).toBe(false);
    });
  });

  describe('malformed / empty input', () => {
    it('rejects an empty string without throwing', () => {
      expect(isSafeUrl('')).toBe(false);
    });

    it('rejects whitespace-only input', () => {
      expect(isSafeUrl('   ')).toBe(false);
    });

    it('rejects a bare scheme with no host', () => {
      expect(isSafeUrl('http://')).toBe(false);
    });
  });
});
