import './output.css';
// Output View for MUD Client
import Anser, { AnserJsonEntry } from "anser";
import * as React from 'react';

import MudClient from '../client';



interface Props {
    client: MudClient;
}

interface State {
    output: JSX.Element[];
    lastKey: number;
}

class Output extends React.Component<Props, State> {
    outputRef: React.RefObject<HTMLDivElement> = React.createRef();

    state = {
        output: [],
        lastKey: 0
    };

    componentDidMount() {
        this.props.client.on('message', this.handleMessage);
        // connect
        this.props.client.on('connect', () => this.addToOutput([<h2> Connected</h2>]));
        // disconnect
        this.props.client.on('disconnect', () => this.addToOutput([<h2> Disconnected</h2>]));
        // error
        this.props.client.on('error', (error: Error) => this.addToOutput([<h2> Error: {error.message}</h2>]));
    }

    componentDidUpdate() {
        this.scrollToBottom();
    }

    componentWillUnmount() {
        this.props.client.removeListener('message', this.handleMessage);
    }

    addToOutput(elements: any[]) {
        this.setState((state) => {
            console.log("Current output length: " + state.output.length)
            const key = state.output.length;
            const newOutput = elements.map((element, index) => <div key={key + index}>{element}</div>);
            return { output: [...state.output, ...newOutput] };
        });
    }

    scrollToBottom = () => {
        const output = this.outputRef.current;
        if (output) {
            output.scrollTop = output.scrollHeight;
        }
    };

    handleMessage = (message: string) => {
        const elements = parseToElements(message, this.handleExitClick);
        this.addToOutput(elements);
    };

    handleExitClick = (exit: string) => {
        this.props.client.sendCommand(exit);
    }

    render() {
        return (
            <div ref={this.outputRef} className="output" aria-live="polite" role="log">
                {this.state.output}
            </      div>
        );
    }
}

export default Output;


export function parseToElements(text: string, onExitClick: (exit: string) => void): React.ReactNode[] {
    // handle multiline strings by splitting them and adding the appropriate <br/>
    let elements: React.ReactNode[] = [];
    const parsed = Anser.ansiToJson(text, { json: true, remove_empty: false });
    for (const bundle of parsed) {
        const newElements = convertBundleIntoReact(bundle, onExitClick);
        elements = [...elements, ...newElements]
    }

    return elements;
}

const URL_REGEX = /(\s|^)(https?:\/\/(?:www\.|(?!www))[^\s.]+\.[^\s]{2,}|www\.[^\s]+\.[^\s]{2,})/g;
const EMAIL_REGEX = /(\s|^)[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+(\s|$)/g;
const exitRegex = /@\[exit:([a-zA-Z]+)\]([a-zA-Z]+)@\[\/\]/g;

function convertBundleIntoReact(bundle: AnserJsonEntry, onExitClick: (exit: string) => void): React.ReactNode[] {
    const style = createStyle(bundle);
    const content: React.ReactNode[] = [];
    let index = 0;

    function processRegex(regex: RegExp, process: (match: RegExpExecArray) => React.ReactNode): void {
        let match: RegExpExecArray | null;
        while ((match = regex.exec(bundle.content)) !== null) {
            const startIndex = match.index;
            if (startIndex > index) {
                content.push(bundle.content.substring(index, startIndex));
            }
            content.push(process(match));
            index = regex.lastIndex;
        }
    }

    function processUrlMatch(match: RegExpExecArray): React.ReactNode {
        const [, pre, url] = match;
        const href = url;
        return (
            <a href={href} target="_blank">
                {url}
            </a>
        );
    }

    function processEmailMatch(match: RegExpExecArray): React.ReactNode {
        const email = match[0];
        const href = `mailto:${email}`;
        return (
            <a href={href} target="_blank">
                {email}
            </a>
        );
    }

    function processExitMatch(match: RegExpExecArray): React.ReactNode {
        const [, exitType, exitName] = match;
        return (
            <a onClick={() => onExitClick(exitType)}>
                {exitName}
            </a>
        );
    }

    processRegex(URL_REGEX, processUrlMatch);
    processRegex(EMAIL_REGEX, processEmailMatch);
    processRegex(exitRegex, processExitMatch);

    if (index < bundle.content.length) {
        content.push(bundle.content.substring(index));
    }
    if (bundle.clearLine) {
        content.push(<br />);
    }
    return content.map((c) => <span style={style}>{c}</span>);
}

/**
 * Create the style attribute.
 * @name createStyle
 * @function
 * @param {AnserJsonEntry} bundle
 * @return {Object} returns the style object
 */
function createStyle(bundle: AnserJsonEntry): React.CSSProperties {
    const style: React.CSSProperties = {};
    if (bundle.bg) {
        style.backgroundColor = `rgb(${bundle.bg})`;
    }
    if (bundle.fg) {
        style.color = `rgb(${bundle.fg})`;
    }
    switch (bundle.decoration) {
        case 'bold':
            style.fontWeight = 'bold';
            break;
        case 'dim':
            style.opacity = '0.5';
            break;
        case 'italic':
            style.fontStyle = 'italic';
            break;
        case 'hidden':
            style.visibility = 'hidden';
            break;
        case 'strikethrough':
            style.textDecoration = 'line-through';
            break;
        case 'underline':
            style.textDecoration = 'underline';
            break;
        case 'blink':
            style.textDecoration = 'blink';
            break;
        default:
            break;
    }
    return style;
}

