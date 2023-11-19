import { GMCPMessage, GMCPPackage } from "../package";

export class GMCPMessageClientSpeechSpeak extends GMCPMessage {
    text: string = "";
    rate: number = 1;
    pitch = 1;
    volume = 0.5;
}

export class GMCPClientSpeech extends GMCPPackage {
    public packageName: string = "Client.Speech";

    handleSpeak(data: GMCPMessageClientSpeechSpeak): void {
        const utterance = new SpeechSynthesisUtterance(data.text);
        utterance.rate = data.rate;
        utterance.pitch = data.pitch;
        utterance.volume = data.volume;
        speechSynthesis.speak(utterance);
    }
}