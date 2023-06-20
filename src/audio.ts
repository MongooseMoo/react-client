import { SoundSource, createAudioContext, createSoundListener, SoundSourceOptions } from "sounts";

export enum FadeType {
    EXPONENTIAL,
    LINEAR,
}

class CacheManager {
    static pendingRequests = new Map<string, Promise<AudioBuffer>>();

    static async getAudioBuffer(url: string, context: AudioContext): Promise<AudioBuffer> {
        const cache = await this.safeOperation(() => caches.open('audio-cache'), 'Failed to open cache');

        const response = await this.safeOperation(() => cache.match(url), 'Failed to match cache');

        if (response) {
            const arrayBuffer = await this.safeOperation(() => response.arrayBuffer(), 'Failed to convert response to ArrayBuffer');
            const audioBuffer = await this.safeOperation(() => context.decodeAudioData(arrayBuffer), 'Failed to decode audio data');
            return audioBuffer;
        }

        let pendingRequest = this.pendingRequests.get(url);
        if (!pendingRequest) {
            const fetchResponse = await this.safeOperation(() => fetch(url), 'Failed to fetch request');
            cache.put(url, fetchResponse.clone());
            const arrayBuffer = await this.safeOperation(() => fetchResponse.arrayBuffer(), 'Failed to convert response to ArrayBuffer');
            pendingRequest = context.decodeAudioData(arrayBuffer);
            this.pendingRequests.set(url, pendingRequest);
        }

        return pendingRequest;
    }

    static async safeOperation<T>(operation: () => Promise<T>, errorMessage: string): Promise<T> {
        try {
            return await operation();
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`${errorMessage}: ${error.message}`);
            }
            throw error; // Re-throw if it's not an Error, we don't know how to handle it.
        }
    }
}


type AudioPosition = {
    x: number;
    y: number;
    z: number;
};

abstract class AudioNodeWrapper {
    protected filters: BiquadFilterNode[] = [];
    protected effectsChain: AudioNode[] = [];

    constructor(public soundSource: SoundSource, public context: AudioContext) { }

    get volume() {
        return this.soundSource.gainNode!.gain.value;
    }

    set volume(volume: number) {
        this.soundSource.setGain(volume);
    }

    get position(): AudioPosition {
        return { x: this.soundSource.node.positionX.value as number, y: this.soundSource.node.positionY.value as number, z: this.soundSource.node.positionZ.value as number }
    }

    set position(pos: { x?: number, y?: number, z?: number }) {
        const position = { ...this.position, ...pos };
        this.soundSource.setPosition(position.x!, position.y!, position.z!);
    }

    fadeIn(duration: number, fadeType: FadeType = FadeType.EXPONENTIAL) {
        const target = this.context.currentTime + duration;
        switch (fadeType) {
            case FadeType.EXPONENTIAL:
                this.soundSource.gainNode!.gain.exponentialRampToValueAtTime(1, target);
                break;
            case FadeType.LINEAR:
                this.soundSource.gainNode!.gain.linearRampToValueAtTime(1, target);
                break;
        }
    }

    fadeOut(duration: number, fadeType: FadeType = FadeType.EXPONENTIAL) {
        const target = this.context.currentTime + duration;
        switch (fadeType) {
            case FadeType.EXPONENTIAL:
                this.soundSource.gainNode!.gain.exponentialRampToValueAtTime(0.00001, target);
                break;
            case FadeType.LINEAR:
                this.soundSource.gainNode!.gain.linearRampToValueAtTime(0, target);
                break;
        }
    }

    addEffect(node: AudioNode) {
        this.effectsChain.push(node);
    }

    removeEffect(node: AudioNode) {
        const index = this.effectsChain.indexOf(node);
        if (index !== -1) {
            this.effectsChain.splice(index, 1);
        }
    }

    getEffectsChain(): AudioNode[] {
        return this.effectsChain;
    }

    addFilter(filter: BiquadFilterNode) {
        this.filters.push(filter);
        this.rebuildFilterChain();
    }

    removeFilter(filter: BiquadFilterNode) {
        const index = this.filters.indexOf(filter);
        if (index > -1) {
            this.filters.splice(index, 1);
            this.rebuildFilterChain();
        }
    }

    protected rebuildFilterChain() {
        this.soundSource.node.disconnect();
        if (this.filters.length > 0) {
            this.soundSource.node.connect(this.filters[0]);
            for (let i = 0; i < this.filters.length; i++) {
                this.filters[i].disconnect();
                if (i < this.filters.length - 1) {
                    this.filters[i].connect(this.filters[i + 1]);
                } else {
                    this.filters[i].connect(this.context.destination);
                }
            }
        } else {
            this.soundSource.node.connect(this.context.destination);
        }
    }

    destructor() {
        this.soundSource.node.disconnect();
        this.soundSource.gainNode!.disconnect();
    }
}


export class Sound {
    private pannerNode?: PannerNode;
    private soundEffectsChain: AudioNode[] = [];


    constructor(
        public source: AudioSource,
        private node: AudioBufferSourceNode,
        context: AudioContext,
        position?: AudioPosition,
    ) {

        if (position) {
            this.pannerNode = context.createPanner();
            this.pannerNode.positionX.value = position.x;
            this.pannerNode.positionY.value = position.y;
            this.pannerNode.positionZ.value = position.z;
            this.node.connect(this.pannerNode);
            this.pannerNode.connect(context.destination);
        } else {
            this.node.connect(context.destination);
        }
    }


    addEffect(node: AudioNode) {
        this.soundEffectsChain.push(node);
    }

    removeEffect(node: AudioNode) {
        const index = this.soundEffectsChain.indexOf(node);
        if (index !== -1) {
            this.soundEffectsChain.splice(index, 1);
        }
    }

    play() {
        const sourceEffectsChain = this.source.getEffectsChain();
        this.connectNodes(this.node, [...sourceEffectsChain, ...this.soundEffectsChain], this.source.context.destination);
    }

    protected connectNodes(startNode: AudioNode, chain: AudioNode[], endNode: AudioNode) {
        chain.unshift(startNode);
        chain.push(endNode);

        for (let i = 0; i < chain.length - 1; i++) {
            chain[i].connect(chain[i + 1]);
        }
    }

    stop() {
        this.node.stop();
        this.source.destructor();
    }


    get looping() {
        return this.node.loop;
    }

    set looping(loop: boolean) {
        this.node.loop = loop;
    }

    get position() {
        if (this.pannerNode) {
            return { x: this.pannerNode.positionX.value as number, y: this.pannerNode.positionY.value as number, z: this.pannerNode.positionZ.value as number }
        } else {
            return this.source.position;
        }
    }

    set position(pos: AudioPosition) {
        if (this.pannerNode) {
            this.pannerNode.positionX.value = pos.x;
            this.pannerNode.positionY.value = pos.y;
            this.pannerNode.positionZ.value = pos.z;
        } else {
            this.source.position = pos;
        }
    }


    get playbackRate() {
        return this.node.playbackRate.value;
    }

    set playbackRate(rate: number) {
        this.node.playbackRate.value = rate;
    }

}

export class AudioSource extends AudioNodeWrapper {
    private url: string;
    private group: string;

    constructor(url: string, group: string, context: AudioContext, soundSourceOptions: SoundSourceOptions, public loop: boolean = false, public channel: string = "default") {
        super(new SoundSource(context.destination, soundSourceOptions), context);
        this.url = url;
        this.group = group;
    }

    async play(position?: AudioPosition): Promise<Sound> {
        const buffer = await CacheManager.getAudioBuffer(this.url, this.context);
        const playing = this.soundSource.playOnChannel(this.channel, buffer);
        return new Sound(this, playing, this.context, position);
    }

    async playStream() {
        const audioElement = new Audio(this.url);
        const mediaElementSource = this.context.createMediaElementSource(audioElement);
        mediaElementSource.connect(this.soundSource.node);
        audioElement.play();
        return audioElement;
    }

    stop() {
        this.soundSource.stopAll();
        this.destructor();
    }
}

export class SoundManager {

    private listener = createSoundListener(this.context);
    private sources: Map<string, AudioSource> = new Map();
    private soundGroups: Map<string, Set<string>> = new Map();

    constructor(private context: AudioContext = createAudioContext()) { }

    get listenerPosition() {
        return { x: this.listener.node.positionX.value, y: this.listener.node.positionY.value, z: this.listener.node.positionZ.value }
    }

    set listenerPosition({ x, y, z }: AudioPosition) {
        this.listener.setPosition(x, y, z);
    }

    getSource(url: string, group: string = "default", soundSourceOptions: SoundSourceOptions = {}): AudioSource {
        let source = this.sources.get(url);

        if (!source) {
            source = new AudioSource(url, group, this.context, soundSourceOptions);
            this.sources.set(url, source);

            if (!this.soundGroups.has(group)) {
                this.soundGroups.set(group, new Set());
            }

            if (!this.soundGroups.get(group)?.has(url)) {
                this.soundGroups.get(group)?.add(url);
            }
        }

        return source;
    }

    playSource(url: string, volume: number = 1.0) {
        const source = this.getSource(url);
        source.volume = volume;
        source.play();
    }

    playStream(url: string, volume: number = 1.0) {
        const stream = this.getSource(url);
        stream.volume = volume;
        stream.playStream();
    }

    stopAll() {
        for (const source of this.sources.values()) {
            source.stop();
        }
    }

    stopSoundGroup(group: string) {
        const soundUrls = this.soundGroups.get(group);
        if (soundUrls) {
            for (let url of soundUrls) {
                const source = this.sources.get(url);
                source && source.stop();
            }
        }
    }
}

export class MicrophoneStream extends AudioNodeWrapper {
    private stream?: MediaStream;
    private mediaStreamSource?: MediaStreamAudioSourceNode;

    constructor(context: AudioContext, soundSourceOptions: SoundSourceOptions) {
        super(new SoundSource(context.destination, soundSourceOptions), context);
    }

    async play() {
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.mediaStreamSource = this.context.createMediaStreamSource(this.stream);
            this.mediaStreamSource.connect(this.soundSource.node);
        } catch (err) {
            console.error('Failed to access microphone', err);
            throw err;
        }
    }

    stop() {
        this.stream && this.stream.getTracks().forEach(track => track.stop());
        this.destructor();
    }
}

export class ConvolverSource extends AudioNodeWrapper {
    // The convolver node is used to apply reverb to the sound
    // The impulse response (IR) is the sound sample that the reverb effect is based on

    // The impulse response is stored in a buffer
    // The buffer is loaded from a URL


    private convolver: ConvolverNode;
    private _url: string;
    private _buffer!: AudioBuffer;

    constructor(context: AudioContext, soundSourceOptions: SoundSourceOptions, private url: string) {
        super(new SoundSource(context.destination, soundSourceOptions), context);
        this.convolver = this.context.createConvolver();
        this._url = url;
    }

    async load() {
        this._buffer = await CacheManager.getAudioBuffer(this._url, this.context);
        this.convolver.buffer = this._buffer;
    }

    play() {
        this.soundSource.node.connect(this.convolver);
        this.convolver.connect(this.context.destination);
    }
}


export class OscillatorSource extends AudioNodeWrapper {
    private oscillator: OscillatorNode;
    private _frequency: number;
    private _type: OscillatorType;

    constructor(context: AudioContext, soundSourceOptions: SoundSourceOptions, frequency: number = 440, type: OscillatorType = "sine") {
        super(new SoundSource(context.destination, soundSourceOptions), context);
        this._frequency = frequency;
        this._type = type;
        this.oscillator = this.context.createOscillator();
    }

    get frequency(): number {
        return this._frequency;
    }

    set frequency(value: number) {
        this._frequency = value;
        this.oscillator.frequency.value = this._frequency;
    }

    get type(): OscillatorType {
        return this._type;
    }

    set type(value: OscillatorType) {
        this._type = value;
        this.oscillator.type = this._type;
    }

    play() {
        this.oscillator.type = this._type;
        this.oscillator.frequency.value = this._frequency;

        // Apply filters
        if (this.filters.length > 0) {
            this.oscillator.connect(this.filters[0]);
            this.rebuildFilterChain();
        } else {
            this.oscillator.connect(this.soundSource.node);
        }

        this.oscillator.start();
    }

    stop() {
        this.destructor();
        this.oscillator.stop();
    }
}