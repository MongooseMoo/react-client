import React, { Component } from 'react';
import { AudioConference, LiveKitRoom } from '@livekit/components-react';
import MudClient from '../client';


const serverUrl = 'wss://mongoose-67t79p35.livekit.cloud';

interface AudioChatProps {

    client: MudClient;
}

interface AudioChatState {
    token: string;
}

class AudioChat extends Component<AudioChatProps, AudioChatState> {
    constructor(props: AudioChatProps) {
        super(props);
        this.state = {
            token: '',
        };
    }

    componentDidMount() {
        const { client } = this.props;

        client.on('livekitToken', (token) => {
            this.setState({ token });
        });
    }

    render() {
        const { token } = this.state;

        return (
            <div>
                <LiveKitRoom
                    video={false}
                    audio={true}
                    token={token}
                    serverUrl={serverUrl}
                >
                    <AudioConference />
                </LiveKitRoom>
            </div>
        );
    }
}

export default AudioChat;
