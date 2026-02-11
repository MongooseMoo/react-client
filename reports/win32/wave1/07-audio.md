# Win32 Audio System Architecture

**Date:** 2025-12-17
**Analyst:** Claude (Sonnet 4.5)
**Purpose:** Document audio system architecture for Win32 port planning

---

## Executive Summary

The React MUD client uses a sophisticated audio system built on the **Cacophony** library (v0.14.2), which provides Web Audio API-based spatial audio. The system supports:

- **3D HRTF spatial audio** for positional sound
- **Stereo and music streaming** for ambient/background audio
- **Text-to-speech (TTS)** using Web Speech API
- **Volume control** with global muting and background muting
- **Server-driven audio events** via GMCP protocol

For Win32, the recommended approach is **XAudio2 with X3DAudio** for spatial audio, **Windows Audio Session API (WASAPI)** for low-level control, and **SAPI 5.4** for text-to-speech.

---

## 1. Audio Playback Architecture

### 1.1 Current Web Implementation

**Library:** Cacophony v0.14.2 (Web Audio API wrapper)
**File:** `C:\Users\Q\code\react-client\src\gmcp\Client\Media.ts`

The client creates an instance of Cacophony in the main MudClient class:

```typescript
// client.ts, lines 75-102
public cacophony: Cacophony;

constructor() {
  this.cacophony = new Cacophony();
  this.cacophony.setGlobalVolume(preferencesStore.getState().sound.volume);
}
```

### 1.2 Sound Types

**Two primary sound types:**

1. **Buffer Sounds** (`SoundType.Buffer`)
   - Preloaded into memory as audio buffers
   - Low latency, suitable for sound effects and earcons
   - Used for: Footsteps, UI sounds, combat effects, etc.

2. **HTML/Streaming Sounds** (`SoundType.HTML`)
   - Streamed via HTML5 Audio elements
   - Used for background music
   - Routed through CORS proxy for cross-origin streaming
   - CORS Proxy: `https://mongoose.world:9080/?url=`

**Sound Creation:**
```typescript
// Media.ts, lines 94-106
if (data.type === "music") {
  sound = await this.client.cacophony.createSound(
    mediaUrl,
    SoundType.HTML,
    panType  // "HRTF" or "stereo"
  );
} else {
  sound = await this.client.cacophony.createSound(
    mediaUrl,
    SoundType.Buffer,
    panType
  );
}
```

### 1.3 Win32 Translation Strategy

**Recommended Architecture:**

```
Win32 Audio Manager
├── XAudio2 Engine
│   ├── Source Voices (preloaded buffers)
│   ├── X3DAudio (3D positioning)
│   └── Mastering Voice (output)
├── Media Foundation (streaming audio)
│   └── For background music
└── Audio Asset Cache
    └── LRU cache for sound buffers
```

**Key Components:**

1. **XAudio2** - Microsoft's low-latency audio API (successor to DirectSound)
   - Hardware-accelerated mixing
   - Low CPU overhead
   - Sample-accurate timing
   - Built into Windows 7+

2. **X3DAudio** - 3D audio positioning library
   - HRTF rendering
   - Distance attenuation
   - Doppler effect
   - Cone/occlusion modeling

3. **Media Foundation** - For streaming music files
   - MP3, OGG, WAV decoding
   - Progressive download support
   - Replacement for DirectShow

**Implementation Notes:**
- Pre-create a pool of XAudio2 source voices (32-64 voices) to avoid runtime allocation overhead
- Use submix voices for category-based volume control (music vs. effects)
- Buffer format: 16-bit PCM, 44.1kHz or 48kHz

---

## 2. Sound Categories and Types

### 2.1 Sound Effects (Buffer Type)

**Usage:** Game events, UI feedback, environmental sounds

**Examples from GMCP:**
- Footsteps
- Combat sounds (hits, misses, spells)
- Door opening/closing
- Item pickup/drop
- Environmental ambience (wind, water, etc.)

**Characteristics:**
- Short duration (typically < 5 seconds)
- Requires low latency
- May be 3D positioned
- Often looped (e.g., rain ambience)

### 2.2 Background Music (Streaming Type)

**Usage:** Atmospheric music, area themes

**Characteristics:**
- Long duration (2-10 minutes)
- Streamed to conserve memory
- Typically stereo (not 3D)
- May loop indefinitely
- Requires crossfading support

**Win32 Approach:**
- Use Media Foundation Source Reader for streaming
- Decode on background thread
- Feed decoded PCM to XAudio2 source voice
- Implement ring buffer for smooth playback

### 2.3 Speech/TTS (Server-Triggered)

**File:** `C:\Users\Q\code\react-client\src\gmcp\Client\Speech.ts`

The server can trigger text-to-speech via GMCP `Client.Speech.Speak`:

```typescript
export class GMCPMessageClientSpeechSpeak extends GMCPMessage {
    text: string = "";
    rate: number = 1;      // 0.1 to 10.0
    pitch: number = 1;     // 0.0 to 2.0
    volume: number = 0.5;  // 0.0 to 1.0
}

handleSpeak(data: GMCPMessageClientSpeechSpeak): void {
    const utterance = new SpeechSynthesisUtterance(data.text);
    utterance.rate = data.rate;
    utterance.pitch = data.pitch;
    utterance.volume = data.volume;
    speechSynthesis.speak(utterance);
}
```

**Win32 Translation:**
- Use **SAPI 5.4** (Speech API) - built into Windows
- `ISpVoice` interface for speech synthesis
- Supports rate, pitch, volume control
- Multiple voice selection (male/female, accents)
- Asynchronous playback with callbacks

**Implementation Example:**
```cpp
#include <sapi.h>

class TextToSpeech {
    ISpVoice* pVoice;

    void Speak(const wstring& text, float rate, float pitch, float volume) {
        pVoice->SetRate(static_cast<long>(rate * 10 - 10));  // SAPI range: -10 to 10
        pVoice->SetVolume(static_cast<USHORT>(volume * 100)); // SAPI range: 0 to 100
        pVoice->Speak(text.c_str(), SPF_ASYNC | SPF_PURGEBEFORESPEAK, NULL);
    }
};
```

**Note:** SAPI does not support pitch adjustment directly. Use XML SSML for pitch:
```xml
<pitch absmiddle="+5">Text to speak</pitch>
```

### 2.4 Earcons and UI Sounds

**Status:** Not explicitly implemented as a separate category

**Observations:**
- No built-in earcon library in the React client
- All sounds are server-driven via GMCP
- UI sounds would be played as regular buffer sounds

**Win32 Recommendation:**
- Create a local earcon library for client-side UI feedback
- Sounds for: Connection established, connection lost, private message received, etc.
- Keep earcons in resources (embedded in executable)
- Play via XAudio2 with high priority

---

## 3. Spatial Audio (3D HRTF)

### 3.1 Current Implementation

**File:** `C:\Users\Q\code\react-client\src\gmcp\Client\Media.ts` (lines 133-141)

```typescript
// 3D functionality
if (data.is3d) {
  sound.threeDOptions = {
    coneInnerAngle: 360,
    coneOuterAngle: 0,
    panningModel: "HRTF",
    distanceModel: "inverse",
  };
  sound.position = [data.position[0], data.position[1], data.position[2]];
}
```

**GMCP Messages:**

1. **Client.Media.Play** - Play sound with 3D position
   ```json
   {
     "name": "footstep.wav",
     "is3d": true,
     "position": [10, 0, 5],  // x, y, z
     "volume": 80
   }
   ```

2. **Client.Media.Listener.Position** - Set listener position
   ```json
   {
     "position": [0, 0, 0]
   }
   ```

3. **Client.Media.Listener.Orientation** - Set listener orientation
   ```json
   {
     "forward": [0, 0, -1],
     "up": [0, 1, 0]
   }
   ```

**Listener Control:**
```typescript
// Media.ts, lines 192-205
handleListenerPosition(data: GMCPMessageClientMediaListenerPosition) {
  if (data.position?.length) {
    this.client.cacophony.listenerPosition = data.position;
  }
}

handleListenerOrientation(data: GMCPMessageClientMediaListenerOrientation) {
  if (data.up && data.up.length) {
    this.client.cacophony.listenerUpOrientation = data.up;
  }
  if (data.forward && data.forward.length) {
    this.client.cacophony.listenerForwardOrientation = data.forward;
  }
}
```

### 3.2 Coordinate System

**Web Audio API (Cacophony):**
- Right-handed coordinate system
- X: Left (-) to Right (+)
- Y: Down (-) to Up (+)
- Z: Front (-) to Back (+)

**Win32 (X3DAudio):**
- Same right-handed coordinate system
- Direct mapping possible

### 3.3 Distance Attenuation

**Current Model:** "inverse" distance model

**Formula (Web Audio API):**
```
gain = referenceDistance / (referenceDistance + rolloffFactor * (distance - referenceDistance))
```

**Win32 X3DAudio Equivalent:**
```cpp
X3DAUDIO_DISTANCE_CURVE_POINT defaultCurve[2] = {
    { 0.0f, 1.0f },           // At source: full volume
    { 1.0f, 0.0f }            // Beyond max distance: silent
};

X3DAUDIO_DISTANCE_CURVE distanceCurve = {
    defaultCurve, 2
};

emitter.pVolumeCurve = &distanceCurve;
emitter.CurveDistanceScaler = 1.0f;  // Reference distance
```

**Custom Inverse Curve:**
```cpp
// Generate inverse distance curve points
for (int i = 0; i < numPoints; i++) {
    float distance = (float)i / numPoints * maxDistance;
    float gain = refDistance / (refDistance + rolloff * (distance - refDistance));
    curvePoints[i] = { distance / maxDistance, gain };
}
```

### 3.4 HRTF Rendering

**Web Audio API:**
- Uses `panningModel: "HRTF"` parameter
- Browser-specific HRTF implementation
- Automatic binaural rendering

**Win32 X3DAudio:**
- Use `X3DAUDIO_CALCULATE_LPF_DIRECT` and `X3DAUDIO_CALCULATE_LPF_REVERB` flags
- Apply HRTF filters to left/right channels
- Windows Sonic spatial audio support (Windows 10+)

**Recommended Approach:**

```cpp
// Initialize X3DAudio
X3DAUDIO_HANDLE x3dInstance;
X3DAudioInitialize(SPEAKER_STEREO, X3DAUDIO_SPEED_OF_SOUND, x3dInstance);

// Set up listener
X3DAUDIO_LISTENER listener = {};
listener.Position = { 0.0f, 0.0f, 0.0f };
listener.OrientFront = { 0.0f, 0.0f, 1.0f };
listener.OrientTop = { 0.0f, 1.0f, 0.0f };

// Set up emitter
X3DAUDIO_EMITTER emitter = {};
emitter.Position = { x, y, z };
emitter.ChannelCount = 1;  // Mono source for 3D
emitter.CurveDistanceScaler = 1.0f;
emitter.DopplerScaler = 1.0f;

// Calculate 3D audio
X3DAUDIO_DSP_SETTINGS dspSettings = {};
dspSettings.SrcChannelCount = 1;
dspSettings.DstChannelCount = 2;  // Stereo output
float matrixCoefficients[2];
dspSettings.pMatrixCoefficients = matrixCoefficients;

X3DAudioCalculate(x3dInstance, &listener, &emitter,
    X3DAUDIO_CALCULATE_MATRIX | X3DAUDIO_CALCULATE_LPF_DIRECT,
    &dspSettings);

// Apply to XAudio2 source voice
pSourceVoice->SetOutputMatrix(pMasteringVoice, 1, 2, matrixCoefficients);
```

### 3.5 Windows Sonic Integration

**Windows 10+ Feature:**
- Built-in spatial audio platform
- Supports headphones and speakers
- Automatic HRTF and room modeling

**API:** `ISpatialAudioClient` (Windows.Media.Audio)

**Benefits:**
- Higher quality HRTF than X3DAudio
- Automatic head tracking (with compatible hardware)
- Room acoustics simulation

**Considerations:**
- Requires Windows 10 1703+
- More complex API than XAudio2
- May be overkill for MUD client

**Recommendation:** Start with X3DAudio, add Windows Sonic as optional enhancement.

---

## 4. Text-to-Speech Integration

### 4.1 Client-Side TTS (Auto-Read)

**File:** `C:\Users\Q\code\react-client\src\client.ts` (lines 574-595)

```typescript
speak(text: string) {
  if (!("speechSynthesis" in window)) {
    console.log("This browser does not support speech synthesis");
    return;
  }
  const utterance = new SpeechSynthesisUtterance(stripAnsi(text));
  utterance.lang = "en-US";
  const { rate, pitch, voice, volume } = preferencesStore.getState().speech;
  utterance.rate = rate;
  utterance.pitch = pitch;
  utterance.volume = volume;
  const voices = speechSynthesis.getVoices();
  const selectedVoice = voices.find((v) => v.name === voice);
  if (selectedVoice) {
    utterance.voice = selectedVoice;
  }
  speechSynthesis.speak(utterance);
}

cancelSpeech() {
  speechSynthesis.cancel();
}
```

**Auto-Read Modes:**

File: `C:\Users\Q\code\react-client\src\PreferencesStore.tsx`

```typescript
export enum AutoreadMode {
  Off = "off",
  Unfocused = "unfocused",  // Read when window not focused
  All = "all"                // Always read incoming text
}
```

**Trigger Logic:**
```typescript
// client.ts, lines 493-499
private emitMessage(dataString: string) {
  const autoreadMode = preferencesStore.getState().speech.autoreadMode;
  if (autoreadMode === AutoreadMode.All) {
    this.speak(dataString);
  }
  if (autoreadMode === AutoreadMode.Unfocused && !document.hasFocus()) {
    this.speak(dataString);
  }
  this.emit("message", dataString);
}
```

**Cancel Mechanism:**
```typescript
// App.tsx, lines 163-165
if (event.key === "Control") {
  newClient.cancelSpeech(); // Cancel the speech when control key is pressed
}
```

### 4.2 Speech Preferences

**File:** `C:\Users\Q\code\react-client\src\PreferencesStore.tsx` (lines 94-100)

```typescript
speech: {
  autoreadMode: AutoreadMode.Off,
  voice: "",
  rate: 1.0,    // 0.1 to 10.0
  pitch: 1.0,   // 0.0 to 2.0
  volume: 1.0,  // 0.0 to 1.0
}
```

**Voice Selection:**

File: `C:\Users\Q\code\react-client\src\hooks\useVoices.tsx`

```typescript
export const useVoices = () => {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    const updateVoices = () => {
      setVoices(window.speechSynthesis.getVoices());
    };

    updateVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  return voices;
};
```

### 4.3 Win32 TTS Implementation

**SAPI 5.4 Implementation:**

```cpp
#include <sapi.h>
#include <comdef.h>

class TextToSpeechManager {
private:
    ISpVoice* m_pVoice;
    bool m_initialized;

public:
    TextToSpeechManager() : m_pVoice(nullptr), m_initialized(false) {
        Initialize();
    }

    bool Initialize() {
        HRESULT hr = CoCreateInstance(CLSID_SpVoice, NULL, CLSCTX_ALL,
                                       IID_ISpVoice, (void**)&m_pVoice);
        if (SUCCEEDED(hr)) {
            m_initialized = true;
            return true;
        }
        return false;
    }

    void Speak(const std::wstring& text, float rate, float pitch, float volume) {
        if (!m_initialized || !m_pVoice) return;

        // Set rate (-10 to 10, where 0 is normal)
        long sapiRate = static_cast<long>((rate - 1.0f) * 10.0f);
        m_pVoice->SetRate(sapiRate);

        // Set volume (0 to 100)
        USHORT sapiVolume = static_cast<USHORT>(volume * 100.0f);
        m_pVoice->SetVolume(sapiVolume);

        // Pitch requires SSML
        std::wstring ssmlText = BuildSSMLWithPitch(text, pitch);

        // Speak asynchronously
        m_pVoice->Speak(ssmlText.c_str(), SPF_ASYNC | SPF_IS_XML, NULL);
    }

    void Cancel() {
        if (m_pVoice) {
            m_pVoice->Speak(NULL, SPF_PURGEBEFORESPEAK, NULL);
        }
    }

    std::vector<std::wstring> GetVoices() {
        std::vector<std::wstring> voices;

        ISpObjectTokenCategory* pCategory = nullptr;
        HRESULT hr = CoCreateInstance(CLSID_SpObjectTokenCategory, NULL, CLSCTX_ALL,
                                       IID_ISpObjectTokenCategory, (void**)&pCategory);

        if (SUCCEEDED(hr)) {
            hr = pCategory->SetId(SPCAT_VOICES, FALSE);
            if (SUCCEEDED(hr)) {
                IEnumSpObjectTokens* pEnum = nullptr;
                hr = pCategory->EnumTokens(NULL, NULL, &pEnum);

                if (SUCCEEDED(hr)) {
                    ISpObjectToken* pToken = nullptr;
                    while (pEnum->Next(1, &pToken, NULL) == S_OK) {
                        WCHAR* pDescription = nullptr;
                        pToken->GetStringValue(NULL, &pDescription);
                        if (pDescription) {
                            voices.push_back(pDescription);
                            CoTaskMemFree(pDescription);
                        }
                        pToken->Release();
                    }
                    pEnum->Release();
                }
            }
            pCategory->Release();
        }

        return voices;
    }

private:
    std::wstring BuildSSMLWithPitch(const std::wstring& text, float pitch) {
        // Convert pitch (0.0 to 2.0) to SAPI pitch (-10 to +10)
        int sapiPitch = static_cast<int>((pitch - 1.0f) * 10.0f);

        std::wstringstream ss;
        ss << L"<pitch absmiddle=\"" << sapiPitch << L"\">"
           << text
           << L"</pitch>";
        return ss.str();
    }

    ~TextToSpeechManager() {
        if (m_pVoice) {
            m_pVoice->Release();
        }
    }
};
```

**Key Features:**
- Asynchronous speech (non-blocking)
- Voice enumeration for user selection
- Rate, pitch, volume control
- Cancel/interrupt support
- ANSI stripping (use same logic as React client)

**ANSI Stripping:**
- Use regex to remove ANSI escape codes before sending to TTS
- Pattern: `\x1b\[[0-9;]*m`

---

## 5. Volume Control

### 5.1 Global Volume

**File:** `C:\Users\Q\code\react-client\src\components\toolbar.tsx` (lines 37-58)

```typescript
const [volume, setVolume] = React.useState(preferencesStore.getState().sound.volume);

const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
  const newVolume = Number(e.target.value) / 100;
  setVolume(newVolume);
  client.cacophony.setGlobalVolume(newVolume);
  preferencesStore.dispatch({
    type: PrefActionType.SetSound,
    data: {
      ...preferencesStore.getState().sound,
      volume: newVolume
    }
  });
}, [client]);
```

**Storage:**
```typescript
sound: {
  muteInBackground: false,
  volume: 1.0,  // 0.0 to 1.0
}
```

**Initialization:**
```typescript
// client.ts, line 102
this.cacophony.setGlobalVolume(preferencesStore.getState().sound.volume);
```

### 5.2 Mute Control

**Global Mute:**
```typescript
// toolbar.tsx, lines 41-45
const handleMuteToggle = useCallback(() => {
  const newMutedState = !muted;
  setMuted(newMutedState);
  client.setGlobalMute(newMutedState);
}, [muted, client]);
```

**Background Mute:**

File: `C:\Users\Q\code\react-client\src\client.ts` (lines 110-125, 604-614)

```typescript
// Track window focus state
private isWindowFocused: boolean = true;

constructor() {
  // Set up window focus event listeners
  window.addEventListener('focus', () => {
    this.isWindowFocused = true;
    this.updateBackgroundMuteState();
  });

  window.addEventListener('blur', () => {
    this.isWindowFocused = false;
    this.updateBackgroundMuteState();
  });

  // Subscribe to preference changes
  preferencesStore.subscribe(() => {
    this.updateBackgroundMuteState();
  });
}

updateBackgroundMuteState() {
  const prefs = preferencesStore.getState();
  const shouldMuteInBackground = prefs.sound.muteInBackground && !this.isWindowFocused;

  // Apply mute state: global mute OR background mute
  this.cacophony.muted = this.globalMuted || shouldMuteInBackground;
}
```

### 5.3 Per-Sound Volume

**GMCP Message:**
```json
{
  "name": "sword_swing.wav",
  "volume": 75  // 0 to 100
}
```

**Implementation:**
```typescript
// Media.ts, lines 110-112
if (data.volume !== undefined) {
  sound.volume = data.volume / 100;
}
```

### 5.4 Win32 Volume Architecture

**Recommended Approach:**

```
Master Volume (0.0 to 1.0)
├── Category Volumes
│   ├── Music Volume
│   ├── Effects Volume
│   └── Speech Volume
└── Per-Sound Volume
```

**XAudio2 Implementation:**

```cpp
class AudioManager {
private:
    IXAudio2* m_pXAudio2;
    IXAudio2MasteringVoice* m_pMasteringVoice;
    IXAudio2SubmixVoice* m_pMusicSubmix;
    IXAudio2SubmixVoice* m_pEffectsSubmix;

    float m_masterVolume = 1.0f;
    bool m_globalMuted = false;
    bool m_backgroundMuted = false;

public:
    void SetMasterVolume(float volume) {
        m_masterVolume = std::clamp(volume, 0.0f, 1.0f);
        UpdateMasterVolume();
    }

    void SetGlobalMute(bool muted) {
        m_globalMuted = muted;
        UpdateMasterVolume();
    }

    void SetBackgroundMute(bool muted) {
        m_backgroundMuted = muted;
        UpdateMasterVolume();
    }

    void SetCategoryVolume(AudioCategory category, float volume) {
        IXAudio2SubmixVoice* pSubmix = GetSubmixForCategory(category);
        if (pSubmix) {
            pSubmix->SetVolume(volume);
        }
    }

private:
    void UpdateMasterVolume() {
        float effectiveVolume = (m_globalMuted || m_backgroundMuted) ? 0.0f : m_masterVolume;
        m_pMasteringVoice->SetVolume(effectiveVolume);
    }
};
```

**Per-Sound Volume:**
```cpp
void PlaySound(const std::string& soundKey, float volume) {
    IXAudio2SourceVoice* pVoice = GetSourceVoice(soundKey);
    pVoice->SetVolume(volume);  // 0.0 to 1.0
}
```

---

## 6. Audio Events and Triggers

### 6.1 GMCP-Driven Events

All audio playback is triggered by the server via GMCP messages:

**Sound Playback:**
- Message: `Client.Media.Play`
- Triggers: Sound effects, music, ambient sounds

**Sound Stopping:**
- Message: `Client.Media.Stop`
- Can stop by: name, type, tag, key, priority, or all sounds

**Listener Updates:**
- `Client.Media.Listener.Position` - Player moves
- `Client.Media.Listener.Orientation` - Player looks around

**Speech:**
- Message: `Client.Speech.Speak`
- Server-triggered TTS for announcements, hints, etc.

### 6.2 Client-Side Events

**Keyboard Shortcuts:**

File: `C:\Users\Q\code\react-client\src\App.tsx` (lines 163-173)

```typescript
if (event.key === "Control") {
  newClient.cancelSpeech(); // Cancel TTS
}

if (event.key === "Escape") {
  newClient.stopAllSounds();
  // Also send MIDI all notes off if MIDI is enabled
  const midiPackage = newClient.gmcpHandlers["Client.Midi"];
  if (midiPackage) {
    (midiPackage as any).sendAllNotesOff();
  }
}
```

**Window Focus:**
- Focus lost: May mute audio (if preference enabled)
- Focus gained: Restore audio

**Connection Events:**
- Connection lost: Stop all sounds
- Reconnect: Resume background music (if applicable)

### 6.3 Win32 Event Handling

**Message Loop Integration:**

```cpp
// In WndProc
switch (message) {
    case WM_KEYDOWN:
        if (wParam == VK_CONTROL) {
            g_AudioManager->CancelSpeech();
        }
        else if (wParam == VK_ESCAPE) {
            g_AudioManager->StopAllSounds();
        }
        break;

    case WM_ACTIVATE:
        if (LOWORD(wParam) == WA_INACTIVE) {
            g_AudioManager->OnWindowDeactivated();
        } else {
            g_AudioManager->OnWindowActivated();
        }
        break;
}
```

**GMCP Message Routing:**

```cpp
void HandleGMCPMessage(const std::string& package, const nlohmann::json& data) {
    if (package == "Client.Media.Play") {
        GMCPMediaPlay msg = data.get<GMCPMediaPlay>();
        g_AudioManager->PlaySound(msg);
    }
    else if (package == "Client.Media.Stop") {
        GMCPMediaStop msg = data.get<GMCPMediaStop>();
        g_AudioManager->StopSound(msg);
    }
    else if (package == "Client.Media.Listener.Position") {
        GMCPListenerPosition msg = data.get<GMCPListenerPosition>();
        g_AudioManager->SetListenerPosition(msg.position);
    }
    // ... etc.
}
```

---

## 7. Additional Audio Features

### 7.1 Priority System

**File:** `C:\Users\Q\code\react-client\src\gmcp\Client\Media.ts` (lines 144-152)

```typescript
// Priority handling
if (data.priority) {
  for (let key in this.sounds) {
    const activeSound = this.sounds[key];
    if (activeSound.priority && activeSound.priority < data.priority) {
      activeSound.stop();
    }
  }
  sound.priority = data.priority;
}
```

**Behavior:**
- Higher priority sounds stop lower priority sounds
- Useful for important alerts interrupting background audio

**Win32 Implementation:**
```cpp
void PlaySoundWithPriority(Sound* sound, int priority) {
    // Stop all sounds with lower priority
    for (auto& [key, activeSound] : m_activeSounds) {
        if (activeSound->priority < priority) {
            StopSound(key);
        }
    }

    sound->priority = priority;
    PlaySound(sound);
}
```

### 7.2 Sound Tagging

**Purpose:** Group sounds for bulk control

**Example:**
- Tag all combat sounds with "combat"
- Tag all UI sounds with "ui"
- Stop all combat sounds: `Client.Media.Stop { "tag": "combat" }`

**Win32 Implementation:**
```cpp
struct Sound {
    std::string key;
    std::string tag;
    int priority;
    // ... other properties
};

void StopSoundsByTag(const std::string& tag) {
    std::vector<std::string> keysToStop;

    for (auto& [key, sound] : m_activeSounds) {
        if (sound->tag == tag) {
            keysToStop.push_back(key);
        }
    }

    for (const auto& key : keysToStop) {
        StopSound(key);
    }
}
```

### 7.3 Looping

**GMCP Parameter:**
```json
{
  "loops": -1  // -1 = infinite, 0 = play once, N = play N times
}
```

**Implementation:**
```typescript
// Media.ts, lines 115-118
if (data.loops !== undefined) {
  const loopCount = data.loops === -1 ? Infinity : data.loops - 1;
  sound.loop(loopCount);
}
```

**Win32 XAudio2:**
```cpp
void PlaySound(Sound* sound, int loops) {
    XAUDIO2_BUFFER buffer = {};
    buffer.AudioBytes = sound->dataSize;
    buffer.pAudioData = sound->data;

    if (loops == -1) {
        buffer.LoopCount = XAUDIO2_LOOP_INFINITE;
    } else {
        buffer.LoopCount = loops;
    }

    pSourceVoice->SubmitSourceBuffer(&buffer);
    pSourceVoice->Start();
}
```

### 7.4 Fade In/Fade Out

**GMCP Parameters:**
```json
{
  "fadein": 2000,   // Fade in over 2 seconds (ms)
  "fadeout": 1500   // Fade out over 1.5 seconds (ms)
}
```

**Current Status:** Partially implemented (placeholders in code)

```typescript
// Media.ts, lines 157-162
if (data.fadein) {
  // Implement fade in functionality
}
if (data.fadeout) {
  // Implement fade out functionality
}
```

**Win32 Implementation:**

```cpp
class FadeController {
public:
    void FadeIn(IXAudio2SourceVoice* pVoice, float duration) {
        float startVolume = 0.0f;
        float endVolume = 1.0f;

        // Create fade timeline
        auto fadeTask = std::make_shared<FadeTask>(pVoice, startVolume, endVolume, duration);
        m_fadeTasks.push_back(fadeTask);
    }

    void Update(float deltaTime) {
        for (auto it = m_fadeTasks.begin(); it != m_fadeTasks.end();) {
            auto& task = *it;
            task->elapsedTime += deltaTime;

            float t = std::min(1.0f, task->elapsedTime / task->duration);
            float volume = task->startVolume + (task->endVolume - task->startVolume) * t;

            task->pVoice->SetVolume(volume);

            if (t >= 1.0f) {
                it = m_fadeTasks.erase(it);
            } else {
                ++it;
            }
        }
    }

private:
    struct FadeTask {
        IXAudio2SourceVoice* pVoice;
        float startVolume;
        float endVolume;
        float duration;
        float elapsedTime = 0.0f;
    };

    std::vector<std::shared_ptr<FadeTask>> m_fadeTasks;
};
```

**Update Loop:**
```cpp
// In main game loop
void Update(float deltaTime) {
    g_FadeController->Update(deltaTime);
}
```

### 7.5 Seek/Start Position

**GMCP Parameter:**
```json
{
  "start": 5000  // Start at 5 seconds (ms)
}
```

**Implementation:**
```typescript
// Media.ts, lines 121-123
if (data.start) {
  sound.seek(data.start / 1000);
}
```

**Win32 XAudio2:**
```cpp
void PlaySoundAtPosition(Sound* sound, float startTimeSeconds) {
    XAUDIO2_BUFFER buffer = {};
    buffer.AudioBytes = sound->dataSize;
    buffer.pAudioData = sound->data;

    // Calculate start sample
    UINT32 startSample = static_cast<UINT32>(
        startTimeSeconds * sound->sampleRate * sound->channels
    );

    buffer.PlayBegin = startSample;
    buffer.PlayLength = 0;  // Play to end

    pSourceVoice->SubmitSourceBuffer(&buffer);
    pSourceVoice->Start();
}
```

---

## 8. Win32 Audio Architecture Summary

### 8.1 Recommended Technology Stack

| Component | Technology | Notes |
|-----------|-----------|-------|
| **Core Audio Engine** | XAudio2 | Low-latency, hardware-accelerated |
| **3D Positioning** | X3DAudio | HRTF, distance attenuation |
| **Streaming** | Media Foundation | MP3/OGG decoding |
| **Text-to-Speech** | SAPI 5.4 | Built into Windows |
| **Spatial Audio (Optional)** | Windows Sonic | Enhanced HRTF for Windows 10+ |
| **File Loading** | Media Foundation Source Reader | Async decoding |

### 8.2 Class Structure

```cpp
AudioManager
├── XAudioEngine
│   ├── IXAudio2* m_pXAudio2
│   ├── IXAudio2MasteringVoice* m_pMasteringVoice
│   ├── IXAudio2SubmixVoice* m_pMusicSubmix
│   └── IXAudio2SubmixVoice* m_pEffectsSubmix
├── SpatialAudioController
│   ├── X3DAUDIO_HANDLE m_x3dInstance
│   ├── X3DAUDIO_LISTENER m_listener
│   └── std::map<std::string, X3DAUDIO_EMITTER> m_emitters
├── SoundCache
│   └── std::map<std::string, Sound*> m_sounds
├── VoicePool
│   └── std::vector<IXAudio2SourceVoice*> m_voices
├── TextToSpeechManager
│   └── ISpVoice* m_pVoice
└── FadeController
    └── std::vector<FadeTask> m_fadeTasks
```

### 8.3 Initialization Sequence

```cpp
bool AudioManager::Initialize() {
    // 1. Initialize COM
    CoInitializeEx(NULL, COINIT_MULTITHREADED);

    // 2. Create XAudio2 engine
    HRESULT hr = XAudio2Create(&m_pXAudio2, 0, XAUDIO2_DEFAULT_PROCESSOR);
    if (FAILED(hr)) return false;

    // 3. Create mastering voice
    hr = m_pXAudio2->CreateMasteringVoice(&m_pMasteringVoice);
    if (FAILED(hr)) return false;

    // 4. Create submix voices for categories
    hr = m_pXAudio2->CreateSubmixVoice(&m_pMusicSubmix, 2, 44100);
    hr = m_pXAudio2->CreateSubmixVoice(&m_pEffectsSubmix, 2, 44100);

    // 5. Initialize X3DAudio
    DWORD channelMask;
    m_pMasteringVoice->GetChannelMask(&channelMask);
    X3DAudioInitialize(channelMask, X3DAUDIO_SPEED_OF_SOUND, m_x3dInstance);

    // 6. Create voice pool
    for (int i = 0; i < 64; i++) {
        IXAudio2SourceVoice* pVoice;
        WAVEFORMATEX wfx = {};
        wfx.wFormatTag = WAVE_FORMAT_PCM;
        wfx.nChannels = 1;  // Mono for 3D
        wfx.nSamplesPerSec = 44100;
        wfx.wBitsPerSample = 16;
        wfx.nBlockAlign = wfx.nChannels * wfx.wBitsPerSample / 8;
        wfx.nAvgBytesPerSec = wfx.nSamplesPerSec * wfx.nBlockAlign;

        hr = m_pXAudio2->CreateSourceVoice(&pVoice, &wfx);
        if (SUCCEEDED(hr)) {
            m_voicePool.push_back(pVoice);
        }
    }

    // 7. Initialize Text-to-Speech
    m_ttsManager.Initialize();

    return true;
}
```

### 8.4 Performance Considerations

**Memory Management:**
- Pre-allocate source voices (64 voices for simultaneous playback)
- Cache decoded audio buffers (LRU cache, max 50 MB)
- Stream music files (don't load entire file into memory)

**Threading:**
- Decode audio files on background thread
- XAudio2 callbacks run on dedicated thread (don't block)
- Use thread-safe queues for play/stop requests

**CPU Usage:**
- X3DAudio calculations are CPU-intensive
- Limit to 16-24 simultaneous 3D sounds
- Use simpler distance models for non-critical sounds

**Latency:**
- XAudio2 buffer size: 512-1024 samples (11-23ms @ 44.1kHz)
- Smaller buffers = lower latency, higher CPU usage
- Larger buffers = higher latency, lower CPU usage

---

## 9. Feature Parity Matrix

| Feature | React Client | Win32 Equivalent | Difficulty |
|---------|-------------|-----------------|------------|
| **3D HRTF Spatial Audio** | Cacophony (Web Audio API) | X3DAudio + XAudio2 | Medium |
| **Stereo Panning** | Cacophony | XAudio2 SetOutputMatrix | Low |
| **Distance Attenuation** | Inverse model | X3DAudio custom curve | Low |
| **Listener Position** | Vector3 | X3DAUDIO_LISTENER | Low |
| **Listener Orientation** | Forward/Up vectors | X3DAUDIO_LISTENER | Low |
| **Sound Playback** | Buffer/HTML types | XAudio2/Media Foundation | Medium |
| **Volume Control** | Global + per-sound | XAudio2 SetVolume | Low |
| **Mute** | Global + background | XAudio2 SetVolume(0) | Low |
| **Looping** | Infinite or N times | XAUDIO2_BUFFER.LoopCount | Low |
| **Priority System** | Custom logic | Custom logic | Low |
| **Sound Tagging** | Custom logic | Custom logic | Low |
| **Fade In/Out** | Partially implemented | Custom FadeController | Medium |
| **Seek/Start Position** | Time-based | Sample-based | Low |
| **TTS (Server)** | Web Speech API | SAPI 5.4 | Low |
| **TTS (Auto-Read)** | Web Speech API | SAPI 5.4 | Low |
| **Voice Selection** | Browser voices | SAPI voices | Low |
| **Cancel Speech** | Control key | Control key | Low |
| **Stop All Sounds** | Escape key | Escape key | Low |

**Overall Assessment:** High feature parity achievable with Win32 APIs.

---

## 10. Implementation Phases

### Phase 1: Basic Audio (Week 1-2)
- XAudio2 initialization
- Sound loading (WAV files)
- Basic playback (non-3D)
- Volume control
- Stop/pause functionality

### Phase 2: Spatial Audio (Week 3-4)
- X3DAudio integration
- 3D sound positioning
- Listener position/orientation
- Distance attenuation
- HRTF rendering

### Phase 3: Advanced Features (Week 5-6)
- Music streaming (Media Foundation)
- Fade in/out
- Priority system
- Sound tagging
- Looping

### Phase 4: Text-to-Speech (Week 7)
- SAPI integration
- Voice selection
- Auto-read modes
- Cancel/interrupt

### Phase 5: Polish (Week 8)
- Background mute
- Performance optimization
- Memory management
- Error handling

---

## 11. Code Examples

### 11.1 Playing a 3D Sound

```cpp
void AudioManager::PlaySound3D(const std::string& soundKey,
                               const Vector3& position,
                               float volume) {
    // Get sound data from cache
    Sound* sound = m_soundCache->GetSound(soundKey);
    if (!sound) return;

    // Get available source voice from pool
    IXAudio2SourceVoice* pVoice = GetAvailableVoice();
    if (!pVoice) return;

    // Set up emitter
    X3DAUDIO_EMITTER emitter = {};
    emitter.Position = { position.x, position.y, position.z };
    emitter.OrientFront = { 0, 0, 1 };
    emitter.OrientTop = { 0, 1, 0 };
    emitter.ChannelCount = 1;  // Mono source
    emitter.CurveDistanceScaler = 1.0f;

    // Calculate 3D audio
    X3DAUDIO_DSP_SETTINGS dspSettings = {};
    float matrixCoefficients[2];
    dspSettings.SrcChannelCount = 1;
    dspSettings.DstChannelCount = 2;
    dspSettings.pMatrixCoefficients = matrixCoefficients;

    X3DAudioCalculate(m_x3dInstance, &m_listener, &emitter,
        X3DAUDIO_CALCULATE_MATRIX | X3DAUDIO_CALCULATE_LPF_DIRECT,
        &dspSettings);

    // Apply 3D calculations to voice
    pVoice->SetOutputMatrix(m_pMasteringVoice, 1, 2, matrixCoefficients);
    pVoice->SetVolume(volume);

    // Submit audio buffer
    XAUDIO2_BUFFER buffer = {};
    buffer.AudioBytes = sound->dataSize;
    buffer.pAudioData = sound->data;
    buffer.Flags = XAUDIO2_END_OF_STREAM;

    pVoice->SubmitSourceBuffer(&buffer);
    pVoice->Start();

    // Store in active sounds
    m_activeSounds[soundKey] = { pVoice, emitter };
}
```

### 11.2 Updating Listener

```cpp
void AudioManager::SetListenerPosition(const Vector3& position) {
    m_listener.Position = { position.x, position.y, position.z };
    UpdateAllEmitters();
}

void AudioManager::SetListenerOrientation(const Vector3& forward,
                                          const Vector3& up) {
    m_listener.OrientFront = { forward.x, forward.y, forward.z };
    m_listener.OrientTop = { up.x, up.y, up.z };
    UpdateAllEmitters();
}

void AudioManager::UpdateAllEmitters() {
    for (auto& [key, activeSound] : m_activeSounds) {
        X3DAUDIO_DSP_SETTINGS dspSettings = {};
        float matrixCoefficients[2];
        dspSettings.SrcChannelCount = 1;
        dspSettings.DstChannelCount = 2;
        dspSettings.pMatrixCoefficients = matrixCoefficients;

        X3DAudioCalculate(m_x3dInstance, &m_listener, &activeSound.emitter,
            X3DAUDIO_CALCULATE_MATRIX | X3DAUDIO_CALCULATE_LPF_DIRECT,
            &dspSettings);

        activeSound.pVoice->SetOutputMatrix(m_pMasteringVoice, 1, 2,
                                           matrixCoefficients);
    }
}
```

### 11.3 Text-to-Speech

```cpp
void TextToSpeechManager::Speak(const std::wstring& text,
                                float rate, float pitch, float volume) {
    if (!m_pVoice) return;

    // Convert rate (1.0 = normal) to SAPI range (-10 to 10)
    long sapiRate = static_cast<long>((rate - 1.0f) * 10.0f);
    m_pVoice->SetRate(sapiRate);

    // Convert volume (0.0 to 1.0) to SAPI range (0 to 100)
    USHORT sapiVolume = static_cast<USHORT>(volume * 100.0f);
    m_pVoice->SetVolume(sapiVolume);

    // Build SSML with pitch
    std::wstringstream ssml;
    int sapiPitch = static_cast<int>((pitch - 1.0f) * 10.0f);
    ssml << L"<pitch absmiddle=\"" << sapiPitch << L"\">"
         << text
         << L"</pitch>";

    // Speak asynchronously
    m_pVoice->Speak(ssml.str().c_str(), SPF_ASYNC | SPF_IS_XML, NULL);
}

void TextToSpeechManager::Cancel() {
    if (m_pVoice) {
        m_pVoice->Speak(NULL, SPF_PURGEBEFORESPEAK, NULL);
    }
}
```

---

## 12. Testing Recommendations

### 12.1 Unit Tests
- Sound loading (various formats: WAV, MP3, OGG)
- Volume control (0.0 to 1.0)
- Mute/unmute
- 3D positioning accuracy
- Distance attenuation

### 12.2 Integration Tests
- GMCP message handling
- Multiple simultaneous sounds (stress test with 32+ sounds)
- Listener movement (smooth transitions)
- Sound priority system
- TTS integration

### 12.3 Performance Tests
- CPU usage with 16, 32, 64 simultaneous sounds
- Memory usage with various cache sizes
- Latency measurements
- 3D calculation overhead

### 12.4 Compatibility Tests
- Windows 7, 8.1, 10, 11
- Various audio devices (headphones, speakers, USB audio)
- Spatial audio support (Windows Sonic enabled/disabled)

---

## 13. Known Limitations and Workarounds

### 13.1 Web Audio API vs. XAudio2

**Limitation:** Web Audio API uses forward/up vectors for orientation, XAudio2 uses quaternions internally

**Workaround:** Convert forward/up to orientation vectors (same format)

### 13.2 SAPI Pitch Control

**Limitation:** SAPI doesn't support pitch as direct parameter

**Workaround:** Use SSML `<pitch>` tags

### 13.3 Music Streaming Latency

**Limitation:** Media Foundation decoding adds latency

**Workaround:** Pre-buffer 2-3 seconds of audio

### 13.4 Maximum Simultaneous Sounds

**Limitation:** XAudio2 voice pool is finite

**Workaround:** Pre-allocate 64 voices, reuse voices from pool

---

## 14. References

### 14.1 Microsoft Documentation
- [XAudio2 Programming Guide](https://docs.microsoft.com/en-us/windows/win32/xaudio2/xaudio2-programming-guide)
- [X3DAudio Overview](https://docs.microsoft.com/en-us/windows/win32/xaudio2/x3daudio-overview)
- [Media Foundation](https://docs.microsoft.com/en-us/windows/win32/medfound/microsoft-media-foundation-sdk)
- [SAPI 5.4](https://docs.microsoft.com/en-us/previous-versions/windows/desktop/ee125663(v=vs.85))

### 14.2 Web Audio API (Reference)
- [Web Audio API Specification](https://www.w3.org/TR/webaudio/)
- [PannerNode (3D audio)](https://developer.mozilla.org/en-US/docs/Web/API/PannerNode)

### 14.3 Cacophony Library
- [Cacophony on npm](https://www.npmjs.com/package/cacophony)
- Version: 0.14.2

---

## Document Metadata

**Author:** Claude (Sonnet 4.5)
**Date:** 2025-12-17
**Version:** 1.0
**Status:** Complete
**Target Platform:** Windows 7+
**Dependencies:** XAudio2, X3DAudio, Media Foundation, SAPI 5.4

**Related Documents:**
- `reports/wave1/06-features.md` - Feature analysis
- `reports/research/ios-3d-spatial-audio.md` - iOS spatial audio research
