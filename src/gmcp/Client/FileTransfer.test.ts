import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GMCPClientFileTransfer, FileTransferOffer, FileTransferAccept, FileTransferReject, FileTransferCancel } from './FileTransfer';
import MudClient from '../../client';

// Mock MudClient
vi.mock('../../client', () => {
  return {
    default: vi.fn().mockImplementation(() => {
      return {
        sendGmcp: vi.fn(),
        webRTCService: {
          handleIceCandidate: vi.fn().mockResolvedValue(undefined),
        },
        fileTransferManager: {
          pendingOffers: new Map(),
        },
        onFileTransferOffer: vi.fn(),
        onFileTransferAccept: vi.fn(),
        onFileTransferReject: vi.fn(),
        onFileTransferCancel: vi.fn(),
      };
    }),
  };
});

describe('GMCPClientFileTransfer', () => {
  let gmcpFileTransfer: GMCPClientFileTransfer;
  let mockClient: MudClient;

  beforeEach(() => {
    vi.clearAllMocks();
    mockClient = new MudClient('test.com', 8080) as unknown as MudClient;
    gmcpFileTransfer = new GMCPClientFileTransfer(mockClient);
  });

  describe('Package Name', () => {
    it('should have the correct package name', () => {
      expect(gmcpFileTransfer.packageName).toBe('Client.FileTransfer');
    });
  });

  describe('Sending Messages', () => {
    it('should send an offer correctly', () => {
      gmcpFileTransfer.sendOffer(
        'recipient',
        'test.txt',
        1024,
        'test-sdp',
        'test-hash'
      );

      expect(mockClient.sendGmcp).toHaveBeenCalledWith(
        'Client.FileTransfer.Offer',
        JSON.stringify({
          recipient: 'recipient',
          filename: 'test.txt',
          filesize: 1024,
          offerSdp: 'test-sdp',
          hash: 'test-hash',
        })
      );
    });

    it('should send an accept message correctly', () => {
      gmcpFileTransfer.sendAccept(
        'sender',
        'test-hash',
        'test.txt',
        'test-sdp'
      );

      expect(mockClient.sendGmcp).toHaveBeenCalledWith(
        'Client.FileTransfer.Accept',
        JSON.stringify({
          sender: 'sender',
          hash: 'test-hash',
          filename: 'test.txt',
          answerSdp: 'test-sdp',
        })
      );
    });

    it('should send a reject message correctly', () => {
      gmcpFileTransfer.sendReject('sender', 'test-hash');

      expect(mockClient.sendGmcp).toHaveBeenCalledWith(
        'Client.FileTransfer.Reject',
        JSON.stringify({
          sender: 'sender',
          hash: 'test-hash',
        })
      );
    });

    it('should send a cancel message correctly', () => {
      gmcpFileTransfer.sendCancel('recipient', 'test-hash');

      expect(mockClient.sendGmcp).toHaveBeenCalledWith(
        'Client.FileTransfer.Cancel',
        JSON.stringify({
          recipient: 'recipient',
          hash: 'test-hash',
        })
      );
    });

    it('should send an ICE candidate correctly', () => {
      const mockCandidate = {
        candidate: 'test-candidate',
        sdpMid: 'test-mid',
        sdpMLineIndex: 0,
      };

      gmcpFileTransfer.sendCandidate('recipient', mockCandidate as unknown as RTCIceCandidate);

      expect(mockClient.sendGmcp).toHaveBeenCalledWith(
        'Client.FileTransfer.Candidate',
        JSON.stringify({
          recipient: 'recipient',
          candidate: JSON.stringify(mockCandidate),
        })
      );
    });

    it('should send a request to resend correctly', () => {
      gmcpFileTransfer.sendRequestResend('sender', 'test-hash');

      expect(mockClient.sendGmcp).toHaveBeenCalledWith(
        'Client.FileTransfer.RequestResend',
        JSON.stringify({
          sender: 'sender',
          hash: 'test-hash',
        })
      );
    });
  });

  describe('Handling Incoming Messages', () => {
    it('should handle an incoming offer correctly', () => {
      const offerData = {
        sender: 'sender',
        filename: 'test.txt',
        filesize: 1024,
        offerSdp: 'test-sdp',
        hash: 'test-hash',
      };

      gmcpFileTransfer.handleOffer(offerData as FileTransferOffer);

      // Should store the offer in the pending offers
      expect(mockClient.fileTransferManager.pendingOffers.get('test-hash')).toEqual(offerData);
      
      // Should notify the client
      expect(mockClient.onFileTransferOffer).toHaveBeenCalledWith(
        'sender',
        'test-hash',
        'test.txt',
        1024,
        'test-sdp'
      );
    });

    it('should handle an incoming accept message correctly', () => {
      const acceptData = {
        sender: 'sender',
        hash: 'test-hash',
        filename: 'test.txt',
        answerSdp: 'test-sdp',
      };

      gmcpFileTransfer.handleAccept(acceptData as FileTransferAccept);

      expect(mockClient.onFileTransferAccept).toHaveBeenCalledWith(
        'sender',
        'test-hash',
        'test.txt',
        'test-sdp'
      );
    });

    it('should handle an incoming reject message correctly', () => {
      const rejectData = {
        sender: 'sender',
        hash: 'test-hash',
      };

      gmcpFileTransfer.handleReject(rejectData as FileTransferReject);

      expect(mockClient.onFileTransferReject).toHaveBeenCalledWith(
        'sender',
        'test-hash'
      );
    });

    it('should handle an incoming cancel message correctly', () => {
      const cancelData = {
        sender: 'sender',
        hash: 'test-hash',
      };

      gmcpFileTransfer.handleCancel(cancelData as FileTransferCancel);

      expect(mockClient.onFileTransferCancel).toHaveBeenCalledWith(
        'sender',
        'test-hash'
      );
    });

    it('should handle an incoming ICE candidate correctly', () => {
      const candidateData = {
        sender: 'sender',
        candidate: JSON.stringify({
          candidate: 'test-candidate',
          sdpMid: 'test-mid',
          sdpMLineIndex: 0,
        }),
      };

      gmcpFileTransfer.handleCandidate(candidateData);

      expect(mockClient.webRTCService.handleIceCandidate).toHaveBeenCalledWith({
        candidate: 'test-candidate',
        sdpMid: 'test-mid',
        sdpMLineIndex: 0,
      });
    });
  });
});