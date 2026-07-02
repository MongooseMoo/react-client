import { inbound } from "../../protocol/messages";
import { usePreferences } from "../../stores/preferencesStore";
import { gmcpJsonMessage } from "../messages";
import { GMCPMessage, GMCPPackage } from "../package";

// Web Speech API valid parameter ranges. A server value outside these bounds
// either throws or is silently ignored by the browser, and the extremes let a
// hostile server make speech unintelligible, so we clamp before speaking.
const RATE_RANGE = { min: 0.1, max: 10 } as const;
const PITCH_RANGE = { min: 0, max: 2 } as const;
const VOLUME_RANGE = { min: 0, max: 1 } as const;

// Cap on server-supplied utterance length. Prevents a server from queueing a
// multi-minute utterance that monopolises the TTS channel users rely on.
export const MAX_SPEECH_LENGTH = 1000;

export class GMCPMessageClientSpeechSpeak extends GMCPMessage {
    text: string = "";
    rate: number = 1;
    pitch = 1;
    volume = 0.5;
}

const speechSpeak = gmcpJsonMessage<"Speak", GMCPMessageClientSpeechSpeak>("Speak");

const GMCPClientSpeechBase = GMCPPackage.with({
    packageName: "Client.Speech",
    messages: [inbound(speechSpeak)] as const,
});

// Resolve a server-supplied speech param: use it when it is a finite number,
// otherwise fall back to the user's preference, then clamp into the valid range
// so a server value can never escape the bounds.
function resolveParam(
    serverValue: number,
    fallback: number,
    range: { min: number; max: number },
): number {
    const value = Number.isFinite(serverValue) ? serverValue : fallback;
    return Math.min(range.max, Math.max(range.min, value));
}

export class GMCPClientSpeech extends GMCPClientSpeechBase {
    constructor(client: ConstructorParameters<typeof GMCPClientSpeechBase>[0]) {
        super(client);
        this.on("speak", (data) => this.handleSpeak(data));
    }

    handleSpeak(data: GMCPMessageClientSpeechSpeak): void {
        if (!("speechSynthesis" in window)) return;
        const prefs = usePreferences.getState().speech;
        const text = (data.text ?? "").slice(0, MAX_SPEECH_LENGTH);
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = resolveParam(data.rate, prefs.rate, RATE_RANGE);
        utterance.pitch = resolveParam(data.pitch, prefs.pitch, PITCH_RANGE);
        utterance.volume = resolveParam(data.volume, prefs.volume, VOLUME_RANGE);
        speechSynthesis.speak(utterance);
    }

    // Stop any pending or looping server speech when the client tears down.
    override shutdown(): void {
        if (!("speechSynthesis" in window)) return;
        speechSynthesis.cancel();
    }
}
