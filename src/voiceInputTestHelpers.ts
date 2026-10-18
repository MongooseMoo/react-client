import type { Recognition, RecognitionConstructor } from "./voiceInput";

function resultList(results: [string, boolean][]): SpeechRecognitionResultList {
  const items = results.map(([transcript, isFinal]): SpeechRecognitionResult => {
    const alternative = { transcript, confidence: 0.9 };
    return {
      isFinal,
      length: 1,
      item: () => alternative,
      0: alternative,
      [Symbol.iterator]: () => [alternative][Symbol.iterator](),
    };
  });
  return Object.assign(items, { item: (index: number) => items[index] });
}

/** A recognizer that does nothing until a test says what it heard. */
export class FakeRecognition extends EventTarget implements Recognition {
  static instances: FakeRecognition[] = [];
  lang = "";
  continuous = true;
  interimResults = false;
  maxAlternatives = 0;
  processLocally?: boolean;
  onstart: Recognition["onstart"] = null;
  onresult: Recognition["onresult"] = null;
  onerror: Recognition["onerror"] = null;
  onend: Recognition["onend"] = null;
  started = false;
  stopped = false;
  aborted = false;

  constructor() {
    super();
    FakeRecognition.instances.push(this);
  }

  start(): void {
    this.started = true;
    this.onstart?.(new Event("start"));
  }

  stop(): void {
    this.stopped = true;
  }

  abort(): void {
    this.aborted = true;
    this.end();
  }

  /** Deliver results: each entry is [transcript, isFinal]. */
  hear(...results: [string, boolean][]): void {
    this.onresult?.(Object.assign(new Event("result"), { results: resultList(results) }));
  }

  fail(error: string): void {
    this.onerror?.(Object.assign(new Event("error"), { error }));
  }

  end(): void {
    this.onend?.(new Event("end"));
  }

  static latest(): FakeRecognition {
    const latest = FakeRecognition.instances.at(-1);
    if (!latest) throw new Error("No recognizer was created");
    return latest;
  }
}

export function fakeRecognizer(
  available?: RecognitionConstructor["available"],
  install?: RecognitionConstructor["install"],
): RecognitionConstructor {
  return class extends FakeRecognition {
    static available = available;
    static install = install;
  };
}
