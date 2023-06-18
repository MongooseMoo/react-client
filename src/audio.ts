import { SoundSource, createAudioContext, createSoundListener, SoundSourceOptions } from "sounts";

export class Sound {
    constructor(
        public source: AudioSource,
        private node: AudioBufferSourceNode,
    ) {
    }

    stop() {
        this.node.stop();
    }

    get looping() {
        return this.node.loop;
    }

    set looping(loop: boolean) {
        this.node.loop = loop;
    }


}

export class AudioSource {
    public soundSource: SoundSource;
    private url: string;
    private group: string;
    context: AudioContext;

    constructor(url: string, group: string, context: AudioContext, soundSourceOptions: SoundSourceOptions, public loop: boolean = false, public channel: string = "default") {
        this.url = url;
        this.group = group;
        this.soundSource = new SoundSource(context.destination, soundSourceOptions);
        this.context = context;
    }

    async play(): Promise<Sound> {
        const buffer = await this.fetchSound();
        const playing = this.soundSource.playOnChannel(this.channel, buffer,);
        return new Sound(this, playing);
    }

    async playStream() {
        const audioElement = new Audio(this.url);
        const mediaElementSource = this.context.createMediaElementSource(audioElement);
        mediaElementSource.connect(this.soundSource.node);
        audioElement.play();
        return audioElement;
    }

    fadeIn(duration: number) {
        this.soundSource.gainNode!.gain.exponentialRampToValueAtTime(1, this.context.currentTime + duration);
    }

    fadeOut(duration: number) {
        this.soundSource.gainNode!.gain.exponentialRampToValueAtTime(0.00001, this.context.currentTime + duration);
    }

    stop() {
        this.soundSource.stopAll();
    }

    get volume() {
        return this.soundSource.gainNode!.gain.value;
    }

    set volume(volume: number) {
        this.soundSource.setGain(volume);
    }

    get position() {
        return { x: this.soundSource.node.positionX.value, y: this.soundSource.node.positionY.value, z: this.soundSource.node.positionZ.value }
    }

    set position(pos: { x?: number, y?: number, z?: number }) {
        // revisit this if it ends up being slow
        const position = { ...this.position, ...pos };
        this.soundSource.setPosition(position.x!, position.y!, position.z!);
    }

    private async fetchSound() {
        let cache = await caches.open('audio-cache');
        let response = await cache.match(this.url);

        if (!response) {
            response = await fetch(this.url);
            cache.put(this.url, response.clone());
        }

        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await this.context.decodeAudioData(arrayBuffer);

        return audioBuffer;
    }


}

export class SoundManager {
    private context: AudioContext = createAudioContext();
    private listener = createSoundListener(this.context);
    private sources: Map<string, AudioSource> = new Map();
    private soundGroups: Map<string, Set<string>> = new Map();

    get listenerPosition() {
        return { x: this.listener.node.positionX.value, y: this.listener.node.positionY.value, z: this.listener.node.positionZ.value }
    }

    set listenerPosition({ x, y, z }: { x: number, y: number, z: number }) {
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


export class MicrophoneStream {


    private context: AudioContext;
    private stream: MediaStream;
    private soundSource: SoundSource;
    private mediaStreamSource: MediaStreamAudioSourceNode;

    constructor(context: AudioContext, soundSourceOptions: SoundSourceOptions) {
        this.context = context;
        this.soundSource = new SoundSource(context.destination, soundSourceOptions);
    }

    async play() {
        this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this.mediaStreamSource = this.context.createMediaStreamSource(this.stream);
        this.mediaStreamSource.connect(this.soundSource.node);
    }

    stop() {
        this.stream.getTracks().forEach(track => track.stop());
    }


}