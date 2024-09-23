# Editor Manager Implementation Plan

## Objectives
1. Centralize editor management
2. Implement focus functionality for duplicate editor references
3. Simplify MudClient by delegating editor operations
4. Maintain existing communication structure with editor windows

## Implementation Steps

1. Create EditorManager class:
   - Manage open editors with a Map (reference -> Window)
   - Handle BroadcastChannel communication

2. Move editor functionality from MudClient to EditorManager:
   - Transfer openEditorWindow and saveEditorWindow methods
   - Move BroadcastChannel handling

3. Update MudClient:
   - Add EditorManager instance as public 'editors' property
   - Remove editor-related methods

4. Keep EditorWindow component unchanged

## EditorManager Class Structure

```typescript
export class EditorManager {
  private openEditors: Map<string, Window>;
  private channel: BroadcastChannel;

  constructor(private client: MudClient) {
    // Initialize openEditors and channel
    // Setup channel listeners
  }

  openEditorWindow(editorSession: EditorSession) {
    // Open new editor or focus existing one
  }

  private focusEditor(id: string) {
    // Focus existing editor window
  }

  saveEditorWindow(editorSession: EditorSession) {
    // Save editor content using client's sendMCPMultiline
  }

  private setupChannelListeners() {
    // Handle 'ready', 'save', and 'close' messages
  }

  private getEditorSession(id: string): EditorSession {
    // Retrieve session data (implementation needed)
  }

  shutdown() {
    // Close all editor windows and channel
  }
}
```

## MudClient Changes

```typescript
class MudClient {
  public editors: EditorManager;

  constructor(host: string, port: number) {
    // Existing constructor code
    this.editors = new EditorManager(this);
  }

  // Remove openEditorWindow and saveEditorWindow methods
}
```

## Usage

Instead of `client.openEditorWindow(session)`, use:
```typescript
client.editors.openEditorWindow(session);
```

## Positive Outcomes
1. Improved code organization and separation of concerns
2. Enhanced editor management with focus functionality
3. Simplified MudClient interface
4. Easier maintenance and potential for future editor-related features
5. Consistent communication model with editor windows
