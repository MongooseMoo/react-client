import "./output.css";

import Anser, { AnserJsonEntry, DecorationName } from "anser";
import * as React from "react";

import MudClient from "../client";

interface Props {
  client: MudClient;
}

interface State {
  output: JSX.Element[];
  sidebar_visible: boolean;
}

class Output extends React.Component<Props, State> {
  outputRef: React.RefObject<HTMLDivElement> = React.createRef();

  state = {
    output: [],
    sidebar_visible: false,
  };

  constructor(props: Props) {
    super(props);
    this.props.client.on("message", this.handleMessage);
    // connect
    this.props.client.on("connect", () =>
      this.addToOutput([<h2> Connected</h2>])
    );
    // disconnect
    this.props.client.on("disconnect", () => {

      this.addToOutput([<h2> Disconnected</h2>])
      this.state.sidebar_visible = false;
    });
    // error
    this.props.client.on("error", (error: Error) =>
      this.addToOutput([<h2> Error: {error.message}</h2>])
    );
    this.props.client.on("userlist", (players: any) => this.setState({ sidebar_visible: !!players }));
  }

  componentDidUpdate() {
    this.scrollToBottom();
  }

  componentWillUnmount() {
    this.props.client.removeListener("message", this.handleMessage);
  }

  addToOutput(elements: any[]) {
    this.setState((state) => {
      const key = state.output.length;
      const newOutput = elements.map((element, index) => (
        <div key={key + index}>{element}</div>
      ));
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
    const currentLine = this.state.output[this.state.output.length - 1];
    const elements = parseToElements(message, this.handleExitClick, currentLine);
    this.addToOutput(elements);
  };

  handleExitClick = (exit: string) => {
    this.props.client.sendCommand(exit);
  };

  saveLog() {
    const output = this.outputRef.current;
    if (output) {
      // we want to save as HTML to preserve ansi and links
      const html = output.innerHTML;
      const blob = new Blob([html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      // include the date and time
      const date = new Date();
      const dateString = date.toLocaleDateString();
      // 24 hour time
      const timeString = date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
      // Set MUD name to window title and replace any spaces with dashes
      const mudName = document.title.replace(/\s+/g, "-");
      // Include the MUD name in the filename
      const filename = `${mudName}-log-${dateString}-${timeString}.html`;
      link.download = filename;
      link.href = url;
      link.click();
      // cleanup
      URL.revokeObjectURL(url);
      link.remove();
    }
  }

  clearLog() {
    this.setState({ output: [] });
  }

  render() {
    var classname = "output";
    if (this.state.sidebar_visible) {
      classname += " sidebar-visible";
    }
    return (
      <div
        ref={this.outputRef}
        className={classname}
        aria-live="polite"
        role="log"
      >
        {this.state.output}
      </div>
    );
  }
}

export default Output;


/**
 * Create the style attribute.
 * @name createStyle
 * @function
 * @param {AnserJsonEntry} bundle
 * @return {Object} returns the style object
 */
function createStyle(bundle: AnserJsonEntry): React.CSSProperties {
  const { bg, fg, decorations = [] } = bundle;
  const style: React.CSSProperties = {};
  if (bg) {
    style.backgroundColor = `rgb(${bg})`;
  }
  if (fg) {
    style.color = `rgb(${fg})`;
  }
  const decorationMap: Record<DecorationName, React.CSSProperties> = {
    bold: { fontWeight: "bold" },
    dim: { opacity: "0.5" },
    italic: { fontStyle: "italic" },
    hidden: { visibility: "hidden" },
    strikethrough: { textDecoration: "line-through" },
    underline: { textDecoration: "underline" },
    blink: { textDecoration: "blink" },
    reverse: { filter: "invert(1)" },
  };
  const decorationStyles: React.CSSProperties[] = decorations.map(decoration => decorationMap[decoration]);
  return { ...style, ...Object.assign({}, ...decorationStyles) };
}




export function parseToElements(
  text: string,
  onExitClick: (exit: string) => void,
  startingIndex: number = 0
): React.ReactNode[] {
  let elements: React.ReactNode[] = [];
  let lineIndex = startingIndex;

  // handle multiline strings by splitting them and adding the appropriate <br/>
  for (const line of text.split("\r\n")) {
    const parsed = Anser.ansiToJson(line, { json: true, remove_empty: false });
    let children: React.ReactNode[] = [];
    let bundleIndex = 0;
    for (const bundle of parsed) {
      const newElements = convertBundleIntoReact(
        bundle,
        onExitClick,
        lineIndex,
        bundleIndex
      );
      children = [...children, ...newElements];
      bundleIndex++;
    }
    elements.push(<span key={lineIndex}>{children}</span>);
    lineIndex++;
  }
  return elements;
}

const URL_REGEX =
  /(\s|^)(https?:\/\/(?:www\.|(?!www))[^\s.]+\.[^\s]{2,}|www\.[^\s]+\.[^\s]{2,})/g;
const EMAIL_REGEX =
  /(?<slorp1>\s|^)(?<name>[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+[a-zA-Z])(?<slorp2>\s|$|\.)/g;
const exitRegex = /@\[exit:(?<exitType>[a-zA-Z]+)\](?<exitName>[^\[]+)@\[\/\]/g;


function convertBundleIntoReact(
  bundle: AnserJsonEntry,
  onExitClick: (exit: string) => void,
  lineIndex: number,
  bundleIndex: number
): React.ReactNode[] {
  const style = createStyle(bundle);
  const content: React.ReactNode[] = [];
  let index = 0;
  let lastIndex = 0;

  const combinedRegex = new RegExp(
    `${URL_REGEX.source}|${EMAIL_REGEX.source}|${exitRegex.source}`,
    "g"
  );

  let match: RegExpExecArray | null;
  while ((match = combinedRegex.exec(bundle.content)) !== null) {
    content.push(bundle.content.slice(lastIndex, match.index));

    if (match[2]) {
      // URL
      const [, , url] = match;
      const href = url;
      content.push(
        <a
          key={`${lineIndex}-${bundleIndex}-${index}`}
          href={href}
          target="_blank"
          rel="noreferrer"
        >
          {url}
        </a>
      );
    } else if (match.groups!["name"]) {
      // Email
      const email = match.groups!["name"];
      const href = `mailto:${email}`;
      content.push(
        <>
          {match.groups!["slorp1"]}
          <a
            key={`${lineIndex}-${bundleIndex}-${index}`}
            href={href}
            target="_blank"
            rel="noreferrer"
          >
            {email}
          </a>
          {match.groups!["slorp2"]}
        </>
      );
    } else {
      // Exit
      const exitType = match.groups!["exitType"];
      const exitName = match.groups!["exitName"];
      content.push(
        <a
          key={`${lineIndex}-${bundleIndex}-${index}`}
          onClick={() => onExitClick(exitType)}
          className="exit"
        >
          {exitName}
        </a>
      );
    }
    lastIndex = combinedRegex.lastIndex;
    index++;
  }

  content.push(bundle.content.slice(lastIndex));

  return content.map((c, i) => (
    <span key={`${lineIndex}-${bundleIndex}-${i}`} style={style}>
      {c}
    </span>
  ));
}
