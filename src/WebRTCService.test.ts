import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { WebRTCService } from './WebRTCService';
import EventEmitter from 'eventemitter3';
import MudClient from './client';

// Mock RTCPeerConnection
const mockAddIceCandidateFn = vi.fn().mockResolvedValue(undefined);
const mockCreateOfferFn = vi.fn().mockResolvedValue({ type: 'offer', sdp: 'test-sdp' });
const mockCreateAnswerFn = vi.fn().mockResolvedValue({ type: 'answer', sdp: 'test-sdp' });
const mockSetLocalDescriptionFn = vi.fn().mockResolvedValue(undefined);
const mockSetRemoteDescriptionFn = vi.fn().mockResolvedValue(undefined);
const mockCreateDataChannelFn = vi.fn().mockImplementation(() => {
  return {
    readyState: 'connecting',
    send: vi.fn(),
    close: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    onopen: null,
    onclose: null,
    onerror: null,
    onmessage: null,
    bufferedAmount: 0,
    bufferedAmountLowThreshold: 0,
  };
});

global.RTCPeerConnection = vi.fn().mockImplementation(() => {
  return {
    createOffer: mockCreateOfferFn,
    createAnswer: mockCreateAnswerFn,
    setLocalDescription: mockSetLocalDescriptionFn,
    setRemoteDescription: mockSetRemoteDescriptionFn,
    addIceCandidate: mockAddIceCandidateFn,
    createDataChannel: mockCreateDataChannelFn,
    close: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    connectionState: 'new',
    iceConnectionState: 'new',
    signalingState: 'stable',
    iceGatheringState: 'new',
    localDescription: null,
    remoteDescription: null,
    onicecandidate: null,
    onconnectionstatechange: null,
    oniceconnectionstatechange: null,
    onsignalingstatechange: null,
    onicegatheringstatechange: null,
    ondatachannel: null,
  };
}) as unknown as typeof RTCPeerConnection;

global.RTCSessionDescription = vi.fn().mockImplementation((init) => {
  return {
    type: init.type,
    sdp: init.sdp,
    toJSON: () => ({ type: init.type, sdp: init.sdp }),
  };
}) as unknown as typeof RTCSessionDescription;

global.RTCIceCandidate = vi.fn().mockImplementation((init) => {
  return {
    ...init,
    toJSON: () => init,
  };
}) as unknown as typeof RTCIceCandidate;

// Mock setTimeout and clearTimeout
const originalSetTimeout = global.setTimeout;
const originalClearTimeout = global.clearTimeout;
let timeoutIds: number[] = [];

global.setTimeout = vi.fn((fn, ms) => {
  const id = originalSetTimeout(fn, 0) as unknown as number;
  timeoutIds.push(id);
  return id;
}) as unknown as typeof setTimeout;

global.clearTimeout = vi.fn((id) => {
  originalClearTimeout(id);
  timeoutIds = timeoutIds.filter(tid => tid !== id);
});

// Mock MudClient
vi.mock('./client', () => {
  return {
    default: vi.fn().mockImplementation(() => {
      return {
        gmcp_fileTransfer: {
          sendCandidate: vi.fn(),
        },
        emit: vi.fn(),
        on: vi.fn(),
        off: vi.fn(),
      };
    }),
  };
});

describe('WebRTCService', () => {
  let webRTCService: WebRTCService;
  let mockClient: MudClient;

  beforeEach(() => {
    vi.clearAllMocks();
    mockClient = new MudClient('test.com', 8080) as unknown as MudClient;
    webRTCService = new WebRTCService(mockClient);
  });

  afterEach(() => {
    timeoutIds.forEach(id => originalClearTimeout(id));
    timeoutIds = [];
  });

  describe('constructor', () => {
    it('should initialize correctly', () => {
      expect(webRTCService).toBeInstanceOf(EventEmitter);
      expect(webRTCService).toBeInstanceOf(WebRTCService);
      expect(webRTCService.recipient).toBe('');
      expect(webRTCService.pendingCandidates).toEqual([]);
    });
  });

  describe('isDataChannelOpen', () => {
    it('should return false when data channel is null', () => {
      expect(webRTCService.isDataChannelOpen()).toBe(false);
    });

    it('should return false when data channel is not open', async () => {
      await webRTCService.createPeerConnection();
      // Data channel state is 'connecting' by default in our mock
      expect(webRTCService.isDataChannelOpen()).toBe(false);
    });

    it('should return true when data channel is open', async () => {
      await webRTCService.createPeerConnection();
      // Set the data channel state to 'open'
      (webRTCService as any).dataChannel.readyState = 'open';
      expect(webRTCService.isDataChannelOpen()).toBe(true);
    });
  });

  describe('createPeerConnection', () => {
    it('should create a peer connection with the correct configuration', async () => {
      await webRTCService.createPeerConnection();

      expect(global.RTCPeerConnection).toHaveBeenCalledWith(expect.objectContaining({
        iceServers: expect.arrayContaining([
          expect.objectContaining({
            urls: expect.arrayContaining(['turn:mongoose.world:3478', 'stun:mongoose.world:3478']),
          }),
          expect.objectContaining({
            urls: 'stun:stun.l.google.com:19302',
          }),
        ]),
      }));
    });

    it('should set up event handlers', async () => {
      await webRTCService.createPeerConnection();
      
      const peerConnection = (webRTCService as any).peerConnection;
      expect(peerConnection.onconnectionstatechange).toBeDefined();
      expect(peerConnection.oniceconnectionstatechange).toBeDefined();
      expect(peerConnection.onsignalingstatechange).toBeDefined();
      expect(peerConnection.onicegatheringstatechange).toBeDefined();
      expect(peerConnection.onicecandidate).toBeDefined();
      expect(peerConnection.ondatachannel).toBeDefined();
    });

    it('should create a data channel', async () => {
      await webRTCService.createPeerConnection();
      
      expect(mockCreateDataChannelFn).toHaveBeenCalledWith('fileTransfer', expect.any(Object));
      expect((webRTCService as any).dataChannel).not.toBeNull();
    });
    
    it('should handle errors when creating peer connection', async () => {
      const originalRTCPeerConnection = global.RTCPeerConnection;
      global.RTCPeerConnection = vi.fn().mockImplementationOnce(() => {
        throw new Error('Test error');
      }) as unknown as typeof RTCPeerConnection;

      await expect(webRTCService.createPeerConnection()).rejects.toThrow('Test error');
      
      // Restore original mock
      global.RTCPeerConnection = originalRTCPeerConnection;
    });
  });
  
  describe('setupDataChannel', () => {
    it('should not setup data channel if it is null', () => {
      (webRTCService as any).dataChannel = null;
      
      // This should not throw an error
      (webRTCService as any).setupDataChannel();
    });

    it('should set up event handlers for the data channel', async () => {
      await webRTCService.createPeerConnection();
      
      const dataChannel = (webRTCService as any).dataChannel;
      expect(dataChannel.onopen).not.toBeNull();
      expect(dataChannel.onclose).not.toBeNull();
      expect(dataChannel.onerror).not.toBeNull();
      expect(dataChannel.onmessage).not.toBeNull();
    });

    it('should emit events when data channel events occur', async () => {
      await webRTCService.createPeerConnection();
      const emitSpy = vi.spyOn(webRTCService, 'emit');
      
      // Trigger onopen
      (webRTCService as any).dataChannel.onopen();
      expect(emitSpy).toHaveBeenCalledWith('dataChannelOpen');
      
      // Trigger onclose
      (webRTCService as any).dataChannel.onclose();
      expect(emitSpy).toHaveBeenCalledWith('dataChannelClose');
      
      // Trigger onerror
      const error = new Error('Test error');
      (webRTCService as any).dataChannel.onerror(error);
      expect(emitSpy).toHaveBeenCalledWith('dataChannelError', error);
      
      // Trigger onmessage with ArrayBuffer
      const arrayBuffer = new ArrayBuffer(10);
      (webRTCService as any).dataChannel.onmessage({ data: arrayBuffer });
      expect(emitSpy).toHaveBeenCalledWith('dataChannelMessage', arrayBuffer);
    });
    
    it('should not emit dataChannelMessage for non-ArrayBuffer data', async () => {
      await webRTCService.createPeerConnection();
      const emitSpy = vi.spyOn(webRTCService, 'emit');
      
      // Trigger onmessage with non-ArrayBuffer
      (webRTCService as any).dataChannel.onmessage({ data: 'string data' });
      
      expect(emitSpy).not.toHaveBeenCalledWith('dataChannelMessage', expect.anything());
    });
  });

  describe('sendData', () => {
    it('should throw an error if data channel is not initialized', async () => {
      const data = new ArrayBuffer(10);
      await expect(webRTCService.sendData(data)).rejects.toThrow('Data channel not initialized');
    });

    it('should throw an error if data channel is not open', async () => {
      await webRTCService.createPeerConnection();
      const data = new ArrayBuffer(10);
      // Data channel state is 'connecting' by default in our mock
      await expect(webRTCService.sendData(data)).rejects.toThrow('Data channel is not open');
    });

    it('should send data through the data channel when it is open', async () => {
      await webRTCService.createPeerConnection();
      (webRTCService as any).dataChannel.readyState = 'open';
      
      const data = new ArrayBuffer(10);
      const sendSpy = vi.spyOn((webRTCService as any).dataChannel, 'send');
      
      await webRTCService.sendData(data);
      
      expect(sendSpy).toHaveBeenCalledWith(data);
    });

    it('should handle buffered amount flow control', async () => {
      await webRTCService.createPeerConnection();
      (webRTCService as any).dataChannel.readyState = 'open';
      (webRTCService as any).dataChannel.bufferedAmount = 2000000; // More than the 1MB threshold
      
      const addEventListener = vi.spyOn((webRTCService as any).dataChannel, 'addEventListener');
      
      const data = new ArrayBuffer(10);
      
      // Start sending data (should wait due to buffer amount)
      const sendPromise = webRTCService.sendData(data);
      
      // Should have set up a handler for bufferedamountlow
      expect(addEventListener).toHaveBeenCalledWith('bufferedamountlow', expect.any(Function));
      
      // Simulate the bufferedamountlow event
      const callback = addEventListener.mock.calls[0][1] as EventListener;
      (webRTCService as any).dataChannel.bufferedAmount = 0;
      callback();
      
      // Promise should resolve
      await sendPromise;
      
      expect((webRTCService as any).dataChannel.send).toHaveBeenCalledWith(data);
    });

    it('should handle errors in send operation', async () => {
      await webRTCService.createPeerConnection();
      (webRTCService as any).dataChannel.readyState = 'open';
      
      const sendError = new Error('Send error');
      (webRTCService as any).dataChannel.send = vi.fn().mockImplementation(() => {
        throw sendError;
      });
      
      const data = new ArrayBuffer(10);
      await expect(webRTCService.sendData(data)).rejects.toThrow(sendError);
    });
  });

  describe('createOffer', () => {
    it('should throw an error if peer connection is not initialized', async () => {
      await expect(webRTCService.createOffer()).rejects.toThrow('Peer connection not initialized');
    });

    it('should create and set a local description', async () => {
      await webRTCService.createPeerConnection();
      const offer = await webRTCService.createOffer();
      
      expect(mockCreateOfferFn).toHaveBeenCalled();
      expect(mockSetLocalDescriptionFn).toHaveBeenCalledWith({ type: 'offer', sdp: 'test-sdp' });
      expect(offer).toEqual({ type: 'offer', sdp: 'test-sdp' });
    });
    
    it('should handle errors in createOffer', async () => {
      await webRTCService.createPeerConnection();
      
      const error = new Error('Create offer error');
      mockCreateOfferFn.mockRejectedValueOnce(error);
      
      await expect(webRTCService.createOffer()).rejects.toThrow(error);
    });
    
    it('should handle errors in setLocalDescription', async () => {
      await webRTCService.createPeerConnection();
      
      const error = new Error('Set local description error');
      mockSetLocalDescriptionFn.mockRejectedValueOnce(error);
      
      await expect(webRTCService.createOffer()).rejects.toThrow(error);
    });
  });

  describe('createAnswer', () => {
    it('should throw an error if peer connection is not initialized', async () => {
      await expect(webRTCService.createAnswer()).rejects.toThrow('Peer connection not initialized');
    });

    it('should create and set a local description', async () => {
      await webRTCService.createPeerConnection();
      const answer = await webRTCService.createAnswer();
      
      expect(mockCreateAnswerFn).toHaveBeenCalled();
      expect(mockSetLocalDescriptionFn).toHaveBeenCalledWith({ type: 'answer', sdp: 'test-sdp' });
      expect(answer).toEqual({ type: 'answer', sdp: 'test-sdp' });
    });
    
    it('should handle errors in createAnswer', async () => {
      await webRTCService.createPeerConnection();
      
      const error = new Error('Create answer error');
      mockCreateAnswerFn.mockRejectedValueOnce(error);
      
      await expect(webRTCService.createAnswer()).rejects.toThrow(error);
    });
    
    it('should handle errors in setLocalDescription', async () => {
      await webRTCService.createPeerConnection();
      
      const error = new Error('Set local description error');
      mockSetLocalDescriptionFn.mockRejectedValueOnce(error);
      
      await expect(webRTCService.createAnswer()).rejects.toThrow(error);
    });
  });

  describe('handleOffer', () => {
    it('should create a peer connection if one does not exist', async () => {
      await webRTCService.handleOffer({ type: 'offer', sdp: 'test-sdp' });
      
      expect(global.RTCPeerConnection).toHaveBeenCalled();
    });

    it('should set the remote description and mark remote offer as received', async () => {
      await webRTCService.handleOffer({ type: 'offer', sdp: 'test-sdp' });
      
      expect(mockSetRemoteDescriptionFn).toHaveBeenCalled();
      expect((webRTCService as any).remoteOfferReceived).toBe(true);
      expect(mockClient.emit).toHaveBeenCalledWith('remoteOfferReceived');
    });
    
    it('should process pending ICE candidates after setting remote description', async () => {
      // Add pending candidates
      webRTCService.pendingCandidates = [
        { candidate: 'candidate1' },
        { candidate: 'candidate2' }
      ];
      
      await webRTCService.handleOffer({ type: 'offer', sdp: 'test-sdp' });
      
      // Should have tried to add both candidates
      expect(mockAddIceCandidateFn).toHaveBeenCalledTimes(2);
      // Should have cleared the pending candidates
      expect(webRTCService.pendingCandidates).toEqual([]);
    });
    
    it('should handle errors when adding pending ICE candidates', async () => {
      // Add pending candidates
      webRTCService.pendingCandidates = [
        { candidate: 'candidate1' },
        { candidate: 'candidate2' }
      ];
      
      // Make the first candidate addition fail
      mockAddIceCandidateFn.mockRejectedValueOnce(new Error('Failed to add ICE candidate'));
      
      // This should not throw
      await webRTCService.handleOffer({ type: 'offer', sdp: 'test-sdp' });
      
      // Should have tried to add both candidates
      expect(mockAddIceCandidateFn).toHaveBeenCalledTimes(2);
      // Should have cleared the pending candidates
      expect(webRTCService.pendingCandidates).toEqual([]);
    });
    
    it('should handle errors in setRemoteDescription', async () => {
      const error = new Error('Set remote description error');
      mockSetRemoteDescriptionFn.mockRejectedValueOnce(error);
      
      await expect(webRTCService.handleOffer({ type: 'offer', sdp: 'test-sdp' })).rejects.toThrow(error);
    });
  });

  describe('handleAnswer', () => {
    it('should throw an error if peer connection is not initialized', async () => {
      await expect(webRTCService.handleAnswer({ type: 'answer', sdp: 'test-sdp' })).rejects.toThrow('Peer connection not initialized');
    });

    it('should set the remote description', async () => {
      await webRTCService.createPeerConnection();
      await webRTCService.handleAnswer({ type: 'answer', sdp: 'test-sdp' });
      
      expect(mockSetRemoteDescriptionFn).toHaveBeenCalled();
    });
    
    it('should process pending ICE candidates after setting remote description', async () => {
      await webRTCService.createPeerConnection();
      
      // Add pending candidates
      webRTCService.pendingCandidates = [
        { candidate: 'candidate1' },
        { candidate: 'candidate2' }
      ];
      
      await webRTCService.handleAnswer({ type: 'answer', sdp: 'test-sdp' });
      
      // Should have tried to add both candidates
      expect(mockAddIceCandidateFn).toHaveBeenCalledTimes(2);
      // Should have cleared the pending candidates
      expect(webRTCService.pendingCandidates).toEqual([]);
    });
    
    it('should handle errors in setRemoteDescription', async () => {
      await webRTCService.createPeerConnection();
      
      const error = new Error('Set remote description error');
      mockSetRemoteDescriptionFn.mockRejectedValueOnce(error);
      
      await expect(webRTCService.handleAnswer({ type: 'answer', sdp: 'test-sdp' })).rejects.toThrow(error);
    });
  });

  describe('handleIceCandidate', () => {
    it('should store candidates if remote description is not set', async () => {
      const candidate = { candidate: 'test-candidate' };
      await webRTCService.handleIceCandidate(candidate);
      
      expect(webRTCService.pendingCandidates).toEqual([candidate]);
      expect(mockAddIceCandidateFn).not.toHaveBeenCalled();
    });

    it('should add the candidate immediately if remote description is set', async () => {
      await webRTCService.createPeerConnection();
      (webRTCService as any).peerConnection.remoteDescription = { type: 'offer', sdp: 'test-sdp' };
      
      const candidate = { candidate: 'test-candidate' };
      await webRTCService.handleIceCandidate(candidate);
      
      expect(mockAddIceCandidateFn).toHaveBeenCalled();
      expect(webRTCService.pendingCandidates).toEqual([]);
    });
    
    it('should handle errors when adding ICE candidate', async () => {
      await webRTCService.createPeerConnection();
      (webRTCService as any).peerConnection.remoteDescription = { type: 'offer', sdp: 'test-sdp' };
      
      const error = new Error('Failed to add ICE candidate');
      mockAddIceCandidateFn.mockRejectedValueOnce(error);
      
      const candidate = { candidate: 'test-candidate' };
      await expect(webRTCService.handleIceCandidate(candidate)).rejects.toThrow(error);
    });
  });

  describe('reconnect', () => {
    it('should close current connection and create a new one', async () => {
      const closeSpy = vi.spyOn(webRTCService, 'close');
      const createPeerConnectionSpy = vi.spyOn(webRTCService, 'createPeerConnection');
      const emitSpy = vi.spyOn(webRTCService, 'emit');
      
      await webRTCService.reconnect();
      
      expect(closeSpy).toHaveBeenCalled();
      expect(createPeerConnectionSpy).toHaveBeenCalled();
      expect(emitSpy).toHaveBeenCalledWith('webRTCReconnecting');
    });
  });

  describe('cleanup', () => {
    it('should clean up all resources', async () => {
      await webRTCService.createPeerConnection();
      
      const dataChannelCloseSpy = vi.spyOn((webRTCService as any).dataChannel, 'close');
      const peerConnectionCloseSpy = vi.spyOn((webRTCService as any).peerConnection, 'close');
      const emitSpy = vi.spyOn(webRTCService, 'emit');
      
      webRTCService.cleanup();
      
      expect(dataChannelCloseSpy).toHaveBeenCalled();
      expect(peerConnectionCloseSpy).toHaveBeenCalled();
      expect((webRTCService as any).dataChannel).toBeNull();
      expect((webRTCService as any).peerConnection).toBeNull();
      expect(webRTCService.pendingCandidates).toEqual([]);
      expect(emitSpy).toHaveBeenCalledWith('webRTCClosed');
    });
    
    it('should clear timeout if one exists', () => {
      (webRTCService as any).connectionTimeoutId = 123;
      
      webRTCService.cleanup();
      
      expect(global.clearTimeout).toHaveBeenCalledWith(123);
      expect((webRTCService as any).connectionTimeoutId).toBeUndefined();
    });
  });

  describe('close', () => {
    it('should close connections and emit event', async () => {
      await webRTCService.createPeerConnection();
      
      const dataChannelCloseSpy = vi.spyOn((webRTCService as any).dataChannel, 'close');
      const peerConnectionCloseSpy = vi.spyOn((webRTCService as any).peerConnection, 'close');
      const emitSpy = vi.spyOn(webRTCService, 'emit');
      
      webRTCService.close();
      
      expect(dataChannelCloseSpy).toHaveBeenCalled();
      expect(peerConnectionCloseSpy).toHaveBeenCalled();
      expect((webRTCService as any).dataChannel).toBeNull();
      expect((webRTCService as any).peerConnection).toBeNull();
      expect(webRTCService.pendingCandidates).toEqual([]);
      expect(emitSpy).toHaveBeenCalledWith('webRTCClosed');
    });
  });

  describe('waitForConnection', () => {
    it('should resolve immediately if data channel is already open', async () => {
      await webRTCService.createPeerConnection();
      (webRTCService as any).dataChannel.readyState = 'open';
      
      await expect(webRTCService.waitForConnection()).resolves.toBeUndefined();
    });

    it('should wait for data channel to open', async () => {
      await webRTCService.createPeerConnection();
      
      // Mock the setTimeout to prevent actual timeout
      const originalSetTimeout = global.setTimeout;
      global.setTimeout = vi.fn().mockImplementation((fn, ms) => {
        return 999 as unknown as NodeJS.Timeout; // Return a fake ID
      }) as unknown as typeof setTimeout;
      
      // Start waiting for connection
      const connectionPromise = webRTCService.waitForConnection();
      
      // Simulate data channel opening
      (webRTCService as any).dataChannel.readyState = 'open';
      // Directly emit the event that our implementation is waiting for
      webRTCService.emit('dataChannelOpen');
      
      await connectionPromise;
      
      // Restore original setTimeout
      global.setTimeout = originalSetTimeout;
    });

    it('should reject if connection fails', async () => {
      await webRTCService.createPeerConnection();
      
      // Mock the setTimeout to prevent actual timeout
      const originalSetTimeout = global.setTimeout;
      global.setTimeout = vi.fn().mockImplementation((fn, ms) => {
        return 999 as unknown as NodeJS.Timeout; // Return a fake ID
      }) as unknown as typeof setTimeout;
      
      // Start waiting for connection
      const connectionPromise = webRTCService.waitForConnection();
      
      // Simulate connection failure by directly calling the failure handler
      // This ensures we get the "Connection failed" error instead of a timeout
      const peerConnection = (webRTCService as any).peerConnection;
      peerConnection.connectionState = 'failed';
      
      // Get the event handlers that were registered in waitForConnection
      const handleFailure = vi.spyOn(webRTCService, 'emit').mock.calls
        .find(call => call[0] === 'connectionStateChange')?.[1];
        
      // Manually trigger the failure condition
      if (handleFailure) {
        (handleFailure as () => void)();
      } else {
        // Fallback - directly reject with the expected error
        (webRTCService as any).emit('webRTCFailed');
      }
      
      await expect(connectionPromise).rejects.toThrow('Connection failed');
      
      // Restore original setTimeout
      global.setTimeout = originalSetTimeout;
    });

    it('should reject on timeout', async () => {
      await webRTCService.createPeerConnection();
      
      // Start waiting for connection
      const connectionPromise = webRTCService.waitForConnection();
      
      // Simulate timeout by calling the timeout handler
      const timeoutHandler = (global.setTimeout as any).mock.calls[0][0];
      timeoutHandler();
      
      await expect(connectionPromise).rejects.toThrow('Connection timeout');
    });
  });

  describe('isPeerConnectionInitialized', () => {
    it('should return false when peer connection is null', () => {
      expect(webRTCService.isPeerConnectionInitialized()).toBe(false);
    });

    it('should return false when peer connection is closed', async () => {
      await webRTCService.createPeerConnection();
      (webRTCService as any).peerConnection.connectionState = 'closed';
      
      expect(webRTCService.isPeerConnectionInitialized()).toBe(false);
    });

    it('should return true when peer connection is initialized and not closed', async () => {
      await webRTCService.createPeerConnection();
      
      // Default state is 'new'
      expect(webRTCService.isPeerConnectionInitialized()).toBe(true);
      
      // Test other states
      (webRTCService as any).peerConnection.connectionState = 'connecting';
      expect(webRTCService.isPeerConnectionInitialized()).toBe(true);
      
      (webRTCService as any).peerConnection.connectionState = 'connected';
      expect(webRTCService.isPeerConnectionInitialized()).toBe(true);
    });
  });

  describe('hasRemoteOffer', () => {
    it('should return false by default', () => {
      expect(webRTCService.hasRemoteOffer()).toBe(false);
    });

    it('should return true after remote offer is received', async () => {
      (webRTCService as any).remoteOfferReceived = true;
      
      expect(webRTCService.hasRemoteOffer()).toBe(true);
    });
  });

  describe('waitForRemoteOffer', () => {
    it('should resolve immediately if remote offer is already received', async () => {
      (webRTCService as any).remoteOfferReceived = true;
      
      await expect(webRTCService.waitForRemoteOffer()).resolves.toBeUndefined();
    });

    it('should wait for remoteOfferReceived event', async () => {
      // Start waiting for offer
      const offerPromise = webRTCService.waitForRemoteOffer();
      
      // Should have registered event handler
      expect(mockClient.on).toHaveBeenCalledWith('remoteOfferReceived', expect.any(Function));
      
      // Simulate event
      const handler = (mockClient.on as any).mock.calls[0][1];
      handler();
      
      await offerPromise;
      
      // Should have cleaned up the event handler
      expect(mockClient.off).toHaveBeenCalledWith('remoteOfferReceived', expect.any(Function));
    });

    it('should reject on timeout', async () => {
      // Start waiting for offer with custom timeout
      const offerPromise = webRTCService.waitForRemoteOffer(1000);
      
      // Simulate timeout
      const timeoutHandler = (global.setTimeout as any).mock.calls[0][0];
      timeoutHandler();
      
      await expect(offerPromise).rejects.toThrow('Timeout waiting for remote offer');
    });
  });

  describe('connection state event handlers', () => {
    beforeEach(async () => {
      await webRTCService.createPeerConnection();
    });

    it('should handle connection state connected', () => {
      const emitSpy = vi.spyOn(webRTCService, 'emit');
      
      (webRTCService as any).peerConnection.connectionState = 'connected';
      (webRTCService as any).peerConnection.onconnectionstatechange();
      
      expect(emitSpy).toHaveBeenCalledWith('webRTCStateChange', 'Connection: connected');
      expect(emitSpy).toHaveBeenCalledWith('webRTCConnected');
    });

    it('should handle connection state disconnected', () => {
      const emitSpy = vi.spyOn(webRTCService, 'emit');
      vi.spyOn(webRTCService as any, 'attemptRecovery').mockResolvedValue(undefined);
      
      (webRTCService as any).peerConnection.connectionState = 'disconnected';
      (webRTCService as any).peerConnection.onconnectionstatechange();
      
      expect(emitSpy).toHaveBeenCalledWith('webRTCStateChange', 'Connection: disconnected');
      expect(emitSpy).toHaveBeenCalledWith('webRTCDisconnected');
      
      // Fast-forward timers to trigger the recovery
      const timeoutHandler = (global.setTimeout as any).mock.calls[0][0];
      (webRTCService as any).peerConnection.connectionState = 'disconnected';
      timeoutHandler();
      
      expect((webRTCService as any).attemptRecovery).toHaveBeenCalled();
    });

    it('should handle connection state failed', () => {
      const emitSpy = vi.spyOn(webRTCService, 'emit');
      const attemptRecoverySpy = vi.spyOn(webRTCService as any, 'attemptRecovery').mockResolvedValue(undefined);
      
      (webRTCService as any).peerConnection.connectionState = 'failed';
      (webRTCService as any).peerConnection.onconnectionstatechange();
      
      expect(emitSpy).toHaveBeenCalledWith('webRTCStateChange', 'Connection: failed');
      expect(attemptRecoverySpy).toHaveBeenCalled();
    });

    it('should handle ice connection state failed', () => {
      const emitSpy = vi.spyOn(webRTCService, 'emit');
      const attemptRecoverySpy = vi.spyOn(webRTCService as any, 'attemptRecovery').mockResolvedValue(undefined);
      
      (webRTCService as any).peerConnection.iceConnectionState = 'failed';
      (webRTCService as any).peerConnection.oniceconnectionstatechange();
      
      expect(emitSpy).toHaveBeenCalledWith('webRTCStateChange', 'ICE: failed');
      expect(attemptRecoverySpy).toHaveBeenCalled();
    });

    it('should handle signaling state stable', () => {
      const emitSpy = vi.spyOn(webRTCService, 'emit');
      
      (webRTCService as any).peerConnection.signalingState = 'stable';
      (webRTCService as any).peerConnection.onsignalingstatechange();
      
      expect(emitSpy).toHaveBeenCalledWith('webRTCStateChange', 'Signaling: stable');
    });

    it('should handle ice gathering state complete', () => {
      const emitSpy = vi.spyOn(webRTCService, 'emit');
      
      (webRTCService as any).peerConnection.iceGatheringState = 'complete';
      (webRTCService as any).peerConnection.onicegatheringstatechange();
      
      expect(emitSpy).toHaveBeenCalledWith('webRTCStateChange', 'ICE Gathering: complete');
      expect(emitSpy).toHaveBeenCalledWith('iceGatheringComplete');
    });

    it('should handle ice candidate event with candidate', () => {
      webRTCService.recipient = 'test-recipient';
      
      const event = {
        candidate: {
          type: 'host',
          protocol: 'udp',
          address: '192.168.1.1',
          port: 8080,
        }
      };
      
      (webRTCService as any).peerConnection.onicecandidate(event);
      
      expect(mockClient.gmcp_fileTransfer.sendCandidate).toHaveBeenCalledWith(
        'test-recipient',
        event.candidate
      );
    });

    it('should handle ice candidate event without candidate', () => {
      const event = { candidate: null };
      
      (webRTCService as any).peerConnection.onicecandidate(event);
      
      expect(mockClient.gmcp_fileTransfer.sendCandidate).not.toHaveBeenCalled();
    });

    it('should handle data channel event', () => {
      const setupDataChannelSpy = vi.spyOn(webRTCService as any, 'setupDataChannel');
      
      const channel = {
        readyState: 'connecting',
      };
      
      (webRTCService as any).peerConnection.ondatachannel({ channel });
      
      expect((webRTCService as any).dataChannel).toBe(channel);
      expect(setupDataChannelSpy).toHaveBeenCalled();
    });
  });

  describe('attemptRecovery', () => {
    it('should close existing connection and create new one', async () => {
      await webRTCService.createPeerConnection();
      
      const closeSpy = vi.spyOn(webRTCService, 'close');
      const createPeerConnectionSpy = vi.spyOn(webRTCService, 'createPeerConnection');
      
      await (webRTCService as any).attemptRecovery();
      
      expect(closeSpy).toHaveBeenCalled();
      expect(createPeerConnectionSpy).toHaveBeenCalled();
    });

    it('should handle errors during recovery', async () => {
      await webRTCService.createPeerConnection();
      
      const error = new Error('Recovery failed');
      vi.spyOn(webRTCService, 'createPeerConnection').mockRejectedValueOnce(error);
      
      // Should not throw
      await (webRTCService as any).attemptRecovery();
    });
  });

  describe('attemptChannelRecovery', () => {
    it('should create new data channel and set it up', async () => {
      await webRTCService.createPeerConnection();
      
      const setupDataChannelSpy = vi.spyOn(webRTCService as any, 'setupDataChannel');
      
      // Reset the data channel
      (webRTCService as any).dataChannel = null;
      
      await (webRTCService as any).attemptChannelRecovery();
      
      expect(mockCreateDataChannelFn).toHaveBeenCalled();
      expect((webRTCService as any).dataChannel).not.toBeNull();
      expect(setupDataChannelSpy).toHaveBeenCalled();
    });

    it('should handle errors during channel recovery', async () => {
      await webRTCService.createPeerConnection();
      
      const error = new Error('Channel recovery failed');
      mockCreateDataChannelFn.mockImplementationOnce(() => {
        throw error;
      });
      
      const emitSpy = vi.spyOn(webRTCService, 'emit');
      
      // Should not throw
      await (webRTCService as any).attemptChannelRecovery();
      
      expect(emitSpy).toHaveBeenCalledWith('dataChannelRecoveryFailed', error);
    });
  });
});
