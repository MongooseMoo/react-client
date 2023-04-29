import React, { Component } from 'react';
import { AudioConference, LiveKitRoom } from '@livekit/components-react';
import MudClient from '../client';


const serverUrl = 'wss://mongoose-67t79p35.livekit.cloud';

interface AudioChatProps {

    client: MudClient;
}

interface AudioChatState {
    connected: boolean;
    token: string;
}

class AudioChat extends Component<AudioChatProps, AudioChatState> {

    constructor(props: AudioChatProps) {
        super(props);
        this.state = {
            token: '',
            connected: false,
        };
    }

    componentDidMount() {
        const { client } = this.props;

        client.on('livekitToken', (token) => {
            this.setState({ connected: false, token: token }, () => {
                this.setState({ connected: true });
            });
        });
    }

    render() {
        const { token } = this.state;

        return (
            <div data-lk-theme="default">
                <LiveKitRoom
                    video={false}
                    audio={true}
                    token={token}
                    serverUrl={serverUrl}
                    connect={true}
                >
                    <AudioConference />
                </LiveKitRoom>
            </div>
        );
    }
}

export default AudioChat;
