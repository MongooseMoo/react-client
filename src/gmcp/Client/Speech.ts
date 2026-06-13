import { inbound } from "../../protocol/messages";
import { gmcpJsonMessage } from "../messages";
import { GMCPMessage, GMCPPackage } from "../package";

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

export class GMCPClientSpeech extends GMCPClientSpeechBase {
    constructor(client: ConstructorParameters<typeof GMCPClientSpeechBase>[0]) {
        super(client);
        this.on("speak", (data) => this.handleSpeak(data));
    }

    handleSpeak(data: GMCPMessageClientSpeechSpeak): void {
        const utterance = new SpeechSynthesisUtterance(data.text);
        utterance.rate = data.rate;
        utterance.pitch = data.pitch;
        utterance.volume = data.volume;
        speechSynthesis.speak(utterance);
    }
}
