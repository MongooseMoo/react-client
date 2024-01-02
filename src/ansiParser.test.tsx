import { it, describe, expect } from 'vitest';
import { parseToElements } from "./ansiParser";
import ReactDOMServer from 'react-dom/server';

const DoNothing = () => { };

const testRenderedMarkup = (input: string, expectedJSX: JSX.Element) => {
  it(`should render correct HTML for ${JSON.stringify(input)}`, () => {
    const actualHtml = ReactDOMServer.renderToStaticMarkup(
      <div>{parseToElements(input, () => { })}</div>
    );
    const expectedHtml = ReactDOMServer.renderToStaticMarkup(
      <div>{expectedJSX}</div>
    );
    expect(actualHtml).toBe(expectedHtml);
  });
};

describe("Output", () => {
  describe("parseToElements", () => {
    describe("plain text", () => {
      testRenderedMarkup("test",
        <span key="0">
          <span style={{}}>test</span>
        </span>,
      );
    });

    describe("links", () => {
      testRenderedMarkup("https://www.google.com",
        <span key="0">
          <span style={{}}>
            <a href="https://www.google.com" target="_blank" rel="noreferrer">
              https://www.google.com
            </a>
          </span>
        </span>,
      );

      testRenderedMarkup("bob@gmail.com",
        <span key="0">
          <span style={{}}>
            <a href="mailto:bob@gmail.com" target="_blank" rel="noreferrer">
              bob@gmail.com
            </a>
          </span>
        </span>,
      );
    });

    describe("formatting", () => {
      testRenderedMarkup(
        "This is a sentence with a bold word: \x1b[1mbold\x1b[0m",

        <span key="0">
          <span style={{}}>This is a sentence with a bold word: </span>
          <span style={{ fontWeight: "bold" }}>bold</span>
        </span>,
      );

      testRenderedMarkup(
        "This is a sentence with an underlined word: \x1b[4munderlined\x1b[0m",

        <span key="0">
          <span style={{}}>This is a sentence with an underlined word: </span>
          <span style={{ textDecoration: "underline" }}>underlined</span>
        </span>,

      );
      testRenderedMarkup(
        "This is a sentence with a red word: \x1b[31mred\x1b[0m",

        <span key="0">
          <span style={{}}>This is a sentence with a red word: </span>
          <span style={{ color: "rgb(187, 0, 0)" }}>red</span>
        </span>,

      );
      testRenderedMarkup(
        "This is a sentence with a blue background: \x1b[44mblue background\x1b[0m",

        <span key="0">
          <span style={{}}>This is a sentence with a blue background: </span>
          <span style={{ backgroundColor: "rgb(0, 0, 187)" }}>
            blue background
          </span>
        </span>,

      );

      testRenderedMarkup(
        'This is a sentence with a bold, underlined, and red word: \x1b[1;4;31mbold, underlined, and red\x1b[0m',
        <span key="0">
          <span style={{}}>This is a sentence with a bold, underlined, and red word: </span>
          <span style={{ color: "rgb(187, 0, 0)", textDecoration: "underline" }}>bold, underlined, and red</span>
        </span>
      )
    });

    describe("complex messages", () => {
      testRenderedMarkup(
        "This is a sentence with a bold word: \x1b[1mbold\x1b[0m and a link: https://www.google.com",

        <span key="0">
          <span style={{}}>This is a sentence with a bold word: </span>
          <span style={{ fontWeight: "bold" }}>bold</span>
          <span style={{}}> and a link:</span>
          <span>
            <a href="https://www.google.com" target="_blank" rel="noreferrer">
              https://www.google.com
            </a>
          </span>
        </span>,

      );
    });
  });
});
