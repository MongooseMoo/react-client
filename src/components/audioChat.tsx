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
                setTimeout(() => {
                    this.setState({ connected: true });
                }, 1000);

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
                    connect={this.state.connected}
                >
                    <AudioConference />
                </LiveKitRoom>
                <div className="audio-status" aria-live='polite'   >
                    <div className="audio-status-text">
                        {this.state.connected ? 'Connected' : 'Connecting...'}
                    </div>
                </div>
            </div>
        );
    }
}

export default AudioChat;
