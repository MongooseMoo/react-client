import MUDClient from '../client';
import './output.css'

// Output View for MUD Client
import * as React from 'react';
import Convert from 'ansi-to-html';
import MudClient from '../client';

const ansiConverter = new Convert();

interface Props {
    client: MudClient;
}

interface State {
    output: string[];
}

class Output extends React.Component<Props, State> {
    outputRef: React.RefObject<HTMLDivElement> = React.createRef();

    state = {
        output: [],
    };

    componentDidMount() {
        this.props.client.on('message', this.handleMessage);
    }

    componentDidUpdate() {
        this.scrollToBottom();
    }

    componentWillUnmount() {
        this.props.client.removeListener('message', this.handleMessage);
    }

    handleMessage = (message: string) => {
        this.setState((prevState) => ({
            output: [...prevState.output, message],
        }));
    };

    scrollToBottom = () => {
        const output = this.outputRef.current;
        if (output) {
            output.scrollTop = output.scrollHeight;
        }
    };

    render() {
        return (
            <div ref={this.outputRef} className="output" aria-live="polite" role="log">
                {this.state.output.map((message, index) => (
                    <><div key={index} className="output-message" dangerouslySetInnerHTML={{ __html: ansiConverter.toHtml(message) }}></div></>
                ))}
            </div>
        );
    }
}

export default Output;
