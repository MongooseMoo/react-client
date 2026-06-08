import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GMCPClientFile } from './File';
import type MudClient from '../../client';

describe('GMCPClientFile', () => {
  let mockClient: MudClient;
  let gmcpClientFile: GMCPClientFile;

  beforeEach(() => {
    // Mock window.open
    global.open = vi.fn();

    // Mock client
    mockClient = {
      sendGmcp: vi.fn(),
    } as unknown as MudClient;

    gmcpClientFile = new GMCPClientFile(mockClient);
  });

  describe('handleDownload', () => {
    it('should open the URL in a new tab', () => {
      const testUrl = 'https://example.com/download.zip';
      gmcpClientFile.handleDownload({ url: testUrl });

      expect(global.open).toHaveBeenCalledWith(testUrl, '_blank');
    });

    it('should not open a URL when the URL is empty', () => {
      gmcpClientFile.handleDownload({ url: '' });

      expect(global.open).not.toHaveBeenCalled();
    });
  });
});
