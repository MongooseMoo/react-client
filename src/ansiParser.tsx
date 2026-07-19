import React from "react";
import Anser, { AnserJsonEntry } from "anser";
import { isSafeUrl } from "./isSafeUrl";

export function parseToElements(
    text: string,
    onExitClick: (exit: string) => void
): React.ReactElement[] {
    let elements: React.ReactElement[] = [];
    // handle multiline strings by splitting them and adding the appropriate <br/>
    for (const line of text.split("\r\n")) {
        const parsed = Anser.ansiToJson(line, { json: true, remove_empty: false });
        let children: React.ReactNode[] = [];
        for (const bundle of parsed) {
            const newElements = convertBundleIntoReact(bundle, onExitClick);
            children = [...children, ...newElements];
        }
        elements = [...elements, <React.Fragment key={elements.length}>{children}</React.Fragment>];
    }
    return elements;
}

// Exported so the message-link extractor (messageLinks.ts) can harvest the same
// URLs/emails the renderer links, keeping detection consistent in one spelling.
export const URL_REGEX =
    /(\s|^)((\w+):\/\/(?:www\.|(?!www))[^\s.]+\.[^\s]{2,}|www\.[^\s]+\.[^\s]{2,})/g;
export const EMAIL_REGEX =
    /(?<slorp1>\s|^)(?<name>[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+[a-zA-Z])(?<slorp2>\s|$|\.)/g;
const exitRegex = /@\[exit:([a-zA-Z]+)\]([a-zA-Z]+)@\[\/\]/g;

function convertBundleIntoReact(
    bundle: AnserJsonEntry,
    onExitClick: (exit: string) => void
): React.ReactElement[] {
    const style = createStyle(bundle);
    const content: React.ReactNode[] = [];
    let index = 0;
    let keyCounter = 0; // Initialize a counter for keys

    function processRegex(
        regex: RegExp,
        process: (match: RegExpExecArray) => React.ReactNode
    ): void {
        let match: RegExpExecArray | null = regex.exec(bundle.content);
        while (match !== null) {
            const startIndex = match.index;
            if (startIndex > index) {
                content.push(bundle.content.substring(index, startIndex));
            }
            content.push(process(match));
            index = regex.lastIndex;
            match = regex.exec(bundle.content);
        }
    }

    function processUrlMatch(match: RegExpExecArray): React.ReactNode {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const [, pre, url] = match;
        // Server-controlled URL: only link it if the scheme is allowlisted.
        // URL_REGEX matches javascript://... etc., so unlinked text is the safe fallback.
        if (!isSafeUrl(url)) {
            return <>{pre}{url}</>;
        }
        const href = url;
        return (
            <>{pre}<a href={href} target="_blank" rel="noreferrer">
                {url}
            </a></>
        );
    }

    function processEmailMatch(match: RegExpExecArray): React.ReactNode {
        const email = match.groups!["name"];
        const href = `mailto:${email}`;
        return (
            <>
                {match.groups!["slorp1"]}
                <a href={href} target="_blank" rel="noreferrer">
                    {email}
                </a>
                {match.groups!["slorp2"]}
            </>
        );
    }

    function processExitMatch(match: RegExpExecArray): React.ReactNode {
        const [, exitType, exitName] = match;
        return (
            // eslint-disable-next-line jsx-a11y/anchor-is-valid
            // biome-ignore lint/a11y/useValidAnchor: exit links are click-handled via data-exit; pre-existing pattern, out of scope for the URL-safety change
            <a data-exit={exitType} className="exit" href="#">
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
    const hasStyle = Object.keys(style).length > 0;
    return content.map((c) => hasStyle
        ? <span style={style} key={keyCounter++}>{c}</span>
        : <React.Fragment key={keyCounter++}>{c}</React.Fragment>
    );
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
        case "bold":
            style.fontWeight = "bold";
            break;
        case "dim":
            style.opacity = "0.5";
            break;
        case "italic":
            style.fontStyle = "italic";
            break;
        case "hidden":
            style.visibility = "hidden";
            break;
        case "strikethrough":
            style.textDecoration = "line-through";
            break;
        case "underline":
            style.textDecoration = "underline";
            break;
        case "blink":
            style.textDecoration = "blink";
            break;
        default:
            break;
    }
    return style;
}
