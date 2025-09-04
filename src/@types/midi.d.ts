/**
 * TypeScript declarations for MIDI.js library
 * Based on the working example from midi-testing
 */

declare global {
  interface Window {
    MIDI: {
      /**
       * Load MIDI.js plugin with configuration
       */
      loadPlugin(options: {
        soundfontUrl?: string;
        instruments?: string[];
        onsuccess?: () => void;
        onerror?: (error: any) => void;
        onprogress?: (state: string, progress: number) => void;
        targetFormat?: 'mp3' | 'ogg';
        api?: 'webaudio' | 'audiotag' | 'webmidi';
      }): void;

      /**
       * Play a MIDI note
       */
      noteOn(channel: number, note: number, velocity: number, delay?: number): void;

      /**
       * Stop a MIDI note
       */
      noteOff(channel: number, note: number, delay?: number): void;

      /**
       * Change instrument program
       */
      programChange?(channel: number, program: number): void;

      /**
       * Control change
       */
      controlChange?(channel: number, controller: number, value: number): void;

      /**
       * Pitch bend
       */
      pitchBend?(channel: number, value: number): void;

      /**
       * Channel aftertouch
       */
      channelAftertouch?(channel: number, pressure: number): void;

      /**
       * Polyphonic aftertouch
       */
      polyAftertouch?(channel: number, note: number, pressure: number): void;

      /**
       * Load additional soundfont resource
       */
      loadResource?(options: {
        instrument: string;
        onSuccess?: () => void;
        onError?: (error: any) => void;
      }): void;

      /**
       * General MIDI instrument mappings
       */
      GM?: any;

      /**
       * Soundfont data
       */
      Soundfont?: { [key: string]: any };

      /**
       * Current API being used
       */
      api?: string;

      /**
       * Audio format being used
       */
      __audioFormat?: string;
    };
  }

  // JZZ namespace extensions for MIDI.js synthesizer
  namespace JZZ {
    namespace synth {
      /**
       * Create MIDI.js synthesizer instance
       */
      function MIDIjs(options?: {
        soundfontUrl?: string;
        instruments?: string[];
        targetFormat?: 'mp3' | 'ogg';
      }): any;

      namespace MIDIjs {
        /**
         * Register MIDI.js synthesizer with JZZ
         */
        function register(name?: string, options?: any): any;
      }
    }
  }
}

// Ensure this file is treated as a module
export {};