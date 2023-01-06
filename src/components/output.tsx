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
        this.props.client.on('connect', () => this.setState({ output: [...this.state.output, "<h2> Connected</h2> "] }));
        this.props.client.on('disconnect', () => this.setState({ output: [...this.state.output, "<h2> Disconnected</h2> "] }));
        // error
        this.props.client.on('error', (error: Error) => this.setState({ output: [...this.state.output, `<h2> Error: ${error.message}</h2> `] }));
    }

    componentDidUpdate() {
        this.scrollToBottom();
    }

    componentWillUnmount() {
        this.props.client.removeListener('message', this.handleMessage);
    }

    handleMessage = (message: string) => {
        // Regular expression to match URLs
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        // Regular expression to match email addresses
        const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
        // Replace all URLs and email addresses in the message with clickable links
        const html = message
            .replace(urlRegex, '<a href="$1" target="_blank">$1</a>')
            .replace(emailRegex, '<a href="mailto:$1">$1</a>');
        this.setState((prevState) => ({
            output: [...prevState.output, html],
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
