import { it, describe, expect } from 'vitest';
import { parseToElements } from "./ansiParser";

const testParseToElements = (input: string, expectedOutput: JSX.Element[]) => {
  it(`should return ${JSON.stringify(expectedOutput)} when passed ${JSON.stringify(input)}`, () => {
    expect(JSON.stringify(parseToElements(input, () => { }))).toEqual(JSON.stringify(expectedOutput));
  });
};

describe("Output", () => {
  describe("parseToElements", () => {
    describe("plain text", () => {
      testParseToElements("test", [
        <span key="0">
          <span style={{}}>test</span>
        </span>,
      ]);
    });

    describe("links", () => {
      testParseToElements("https://www.google.com", [
        <span key="0">
          <span style={{}}>
            <a href="https://www.google.com" target="_blank" rel="noreferrer">
              https://www.google.com
            </a>
          </span>
        </span>,
      ]);

      testParseToElements("bob@gmail.com", [
        <span key="0">
          <span style={{}}>
            <a href="mailto:bob@gmail.com" target="_blank" rel="noreferrer">
              bob@gmail.com
            </a>
          </span>
        </span>,
      ]);
    });

    describe("formatting", () => {
      testParseToElements(
        "This is a sentence with a bold word: \x1b[1mbold\x1b[0m",
        [
          <span key="0">
            <span style={{}}>This is a sentence with a bold word: </span>
            <span style={{ fontWeight: "bold" }}>bold</span>
          </span>,
        ]
      );

      testParseToElements(
        "This is a sentence with an underlined word: \x1b[4munderlined\x1b[0m",
        [
          <span key="0">
            <span style={{}}>This is a sentence with an underlined word: </span>
            <span style={{ textDecoration: "underline" }}>underlined</span>
          </span>,
        ]
      );
      testParseToElements(
        "This is a sentence with a red word: \x1b[31mred\x1b[0m",
        [
          <span key="0">
            <span style={{}}>This is a sentence with a red word: </span>
            <span style={{ color: "rgb(187, 0, 0)" }}>red</span>
          </span>,
        ]
      );
      testParseToElements(
        "This is a sentence with a blue background: \x1b[44mblue background\x1b[0m",
        [
          <span key="0">
            <span style={{}}>This is a sentence with a blue background: </span>
            <span style={{ backgroundColor: "rgb(0, 0, 187)" }}>
              blue background
            </span>
          </span>,
        ]
      );
      // testParseToElements('This is a sentence with a bold, underlined, and red word: \x1b[1;4;31mbold, underlined, and red\x1b[0m', [
      //     <span style={{}}>This is a sentence with a bold, underlined, and red word: </span>,
      //     <span style={{ fontWeight: 'bold', textDecoration: 'underline', "color": "rgb(187, 0, 0)", }}>bold, underlined, and red</span>
      // ])
    });

    describe("complex messages", () => {
      testParseToElements(
        "This is a sentence with a bold word: \x1b[1mbold\x1b[0m and a link: https://www.google.com",
        [
          <span key="0">
            <span style={{}}>This is a sentence with a bold word: </span>
            <span style={{ fontWeight: "bold" }}>bold</span>
            <span style={{}}> and a link:</span>
            <span style={{}}>
              <a href="https://www.google.com" target="_blank" rel="noreferrer">
                https://www.google.com
              </a>
            </span>
          </span>,
        ]
      );
    });
  });
});
