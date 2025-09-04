/**
 * MidiJsScriptLoader - Dynamically loads MIDI.js scripts for use with JZZ
 * 
 * Loads scripts in the correct order: JZZ → MIDI.js → JZZ.synth.MIDIjs
 * Based on working pattern from midi-testing example
 */

export interface ScriptLoadError {
  script: string;
  error: string;
  timestamp: number;
}

export class MidiJsScriptLoader {
  private static instance: MidiJsScriptLoader;
  private scriptsLoaded = false;
  private loadPromise: Promise<void> | null = null;

  // Scripts must be loaded in this exact order
  private readonly scriptUrls = [
    // Note: JZZ is already loaded via import in MidiService
    // Files are served from public/ folder in Vite
    '/MIDI.js',
    '/JZZ.synth.MIDIjs.js'
  ];

  private constructor() {}

  static getInstance(): MidiJsScriptLoader {
    if (!MidiJsScriptLoader.instance) {
      MidiJsScriptLoader.instance = new MidiJsScriptLoader();
    }
    return MidiJsScriptLoader.instance;
  }

  /**
   * Load all required MIDI.js scripts
   * Fails fast with detailed error information
   */
  async loadScripts(): Promise<void> {
    console.log('🚀 loadScripts() called');
    
    if (this.scriptsLoaded) {
      console.log('✅ MIDI.js scripts already loaded');
      return;
    }

    if (this.loadPromise) {
      console.log('⏳ MIDI.js scripts already loading, waiting...');
      return this.loadPromise;
    }

    console.log('📋 Starting MIDI.js script loading sequence...');
    console.log('📋 Scripts to load:', this.scriptUrls);
    const startTime = performance.now();

    this.loadPromise = this.performScriptLoading();
    
    try {
      await this.loadPromise;
      const endTime = performance.now();
      console.log(`MIDI.js scripts loaded successfully in ${endTime - startTime}ms`);
      this.scriptsLoaded = true;
    } catch (error) {
      this.loadPromise = null; // Allow retry on failure
      console.error('❌ Script loading promise rejected:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Script loading failed: ${errorMessage}`);
    }
  }

  private async performScriptLoading(): Promise<void> {
    // Check if JZZ is available
    if (typeof window.JZZ === 'undefined') {
      const error = 'JZZ not found - must be loaded before MIDI.js scripts';
      console.error('❌', error);
      throw new Error(error);
    }

    console.log('✅ JZZ is available, proceeding with script loading...');

    // Load each script in sequence
    for (let i = 0; i < this.scriptUrls.length; i++) {
      const url = this.scriptUrls[i];
      console.log(`📥 Loading script ${i + 1}/${this.scriptUrls.length}: ${url}`);
      
      try {
        await this.loadScript(url);
      } catch (scriptError) {
        console.error(`❌ Failed to load script ${i + 1}: ${url}`, scriptError);
        throw scriptError; // Re-throw to stop the sequence
      }
      
      // Verify script loaded correctly
      if (i === 0) {
        // After MIDI.js loads
        if (typeof window.MIDI === 'undefined') {
          throw new Error(`MIDI.js failed to create window.MIDI object after loading ${url}`);
        }
        console.log('✓ MIDI.js loaded - window.MIDI available');
      } else if (i === 1) {
        // After JZZ.synth.MIDIjs loads
        if (!window.JZZ.synth || typeof window.JZZ.synth.MIDIjs !== 'function') {
          throw new Error(`JZZ.synth.MIDIjs failed to register after loading ${url}`);
        }
        console.log('✓ JZZ.synth.MIDIjs loaded - JZZ.synth.MIDIjs() available');
      }
    }

    console.log('All MIDI.js scripts loaded and verified successfully');
  }

  private loadScript(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if script is already loaded
      const existingScript = document.querySelector(`script[src="${url}"]`);
      if (existingScript) {
        console.log(`Script already exists in DOM: ${url}`);
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = url;
      script.type = 'text/javascript';
      
      const timeout = setTimeout(() => {
        cleanup();
        reject(new Error(`Timeout loading script: ${url} (30s timeout exceeded)`));
      }, 30000);

      const cleanup = () => {
        clearTimeout(timeout);
        script.removeEventListener('load', onLoad);
        script.removeEventListener('error', onError);
      };

      const onLoad = () => {
        cleanup();
        console.log(`✓ Script loaded: ${url}`);
        resolve();
      };

      const onError = (event: any) => {
        cleanup();
        if (script.parentNode) {
          script.parentNode.removeChild(script); // Clean up failed script safely
        }
        
        const error: ScriptLoadError = {
          script: url,
          error: event.message || event.error || `HTTP error or file not found: ${url}`,
          timestamp: Date.now()
        };
        
        console.error('❌ Script loading failed:', error);
        console.error('Event details:', event);
        reject(new Error(`Failed to load script ${url}: ${error.error}. Check if file exists and is accessible.`));
      };

      script.addEventListener('load', onLoad);
      script.addEventListener('error', onError);
      
      document.head.appendChild(script);
    });
  }

  /**
   * Check if all required scripts are loaded and functional
   */
  isLoaded(): boolean {
    return this.scriptsLoaded && 
           typeof window.MIDI !== 'undefined' && 
           typeof window.JZZ !== 'undefined' && 
           window.JZZ.synth && 
           typeof window.JZZ.synth.MIDIjs === 'function';
  }

  /**
   * Reset loader state (for testing purposes)
   */
  reset(): void {
    this.scriptsLoaded = false;
    this.loadPromise = null;
  }
}

export const midiJsScriptLoader = MidiJsScriptLoader.getInstance();