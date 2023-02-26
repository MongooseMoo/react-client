import * as SimplePeer from "simple-peer";
import { EventEmitter } from "eventemitter3";
import {
    IAudioContext,
    IMediaStreamAudioDestinationNode,
} from "standardized-audio-context";

interface WebRTCClientEvents {
    connect: (peer: SimplePeer.Instance, clientId: string) => void;
    close: (clientId: string) => void;
    error: (clientId: string, error: any) => void;
    stream: (clientId: string, stream: MediaStream) => void;
    offerGenerated: (clientId: string, offer: any) => void;
}

export class WebRTCClient extends EventEmitter<WebRTCClientEvents> {
    private readonly context: AudioContext | IAudioContext;
    private readonly destination:
        | MediaStreamAudioDestinationNode
        | IMediaStreamAudioDestinationNode<IAudioContext>;
    private readonly stream: MediaStream;
    private readonly peerConnections: Map<string, SimplePeer.Instance> =
        new Map();

    constructor(context: AudioContext | IAudioContext) {
        super();
        this.context = context;
        this.destination = this.context.createMediaStreamDestination();
        this.stream = this.destination.stream;
    }

    private handleConnection(peer: SimplePeer.Instance, clientId: string) {
        this.peerConnections.set(clientId, peer);
        peer.on("connect", () => {
            console.log(`Connected to peer ${clientId}`);
            this.emit("connect", peer, clientId);
        });
        peer.on("close", () => {
            console.log(`Connection to peer ${clientId} closed`);
            this.peerConnections.delete(clientId);
            this.emit("close", clientId);
        });
        peer.on("error", (error) => {
            console.error(`Error connecting to peer ${clientId}: ${error}`);
            this.peerConnections.delete(clientId);
            this.emit("error", clientId, error);
        });
        peer.on("stream", (stream: MediaStream) => {
            console.log(`Received stream from peer ${clientId}`);
            const source = this.context.createMediaStreamSource(stream);
            // @ts-ignore
            source.connect(this.destination);
            this.emit("stream", clientId, stream);
        });
    }

    createConnection(clientId: string, initiator: boolean, offer?: any) {
        const peer = new SimplePeer.default({
            initiator,
            trickle: false,
            stream: this.stream,
        });
        if (offer) {
            peer.signal(offer);
        } else {
            peer.on("signal", (data: any) => {
                this.onOfferGenerated(data, clientId);
            });
        }
        this.handleConnection(peer, clientId);
    }

    receiveOffer(clientId: string, offer: any) {
        this.createConnection(clientId, false, offer);
    }

    receiveAnswer(clientId: string, answer: any) {
        const peer = this.peerConnections.get(clientId);
        if (peer) {
            peer.signal(answer);
        }
    }

    closeConnection(clientId: string) {
        const peer = this.peerConnections.get(clientId);
        if (peer) {
            peer.destroy();
        }
    }

    protected onOfferGenerated(offer: any, clientId: string) {
        // Emit the 'offerGenerated' event with the offer and clientId
        this.emit("offerGenerated", clientId, offer);
    }
}
