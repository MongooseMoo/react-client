export class CommandHistory {
  private history: string[] = [];
  /**
   * The entries being walked with Up/Down, oldest first. Null when no walk is
   * active. When the walk starts with text in the input, only entries with
   * that prefix (case-insensitive) are included; an empty input walks
   * everything. Duplicates keep their most recent occurrence.
   */
  private matches: string[] | null = null;
  /** Steps back from the end of `matches`; -1 means at the unsent input. */
  private matchIndex: number = -1;
  private unsentInput: string = "";

  addCommand(command: string): void {
    if (command.trim() !== "" && (this.history.length === 0 || this.history[this.history.length - 1] !== command)) {
      this.history.push(command.trim());
    }
    this.matches = null;
    this.matchIndex = -1;
    this.unsentInput = "";
  }

  /** Begin a new walk anchored to the current input as prefix filter. */
  private startWalk(currentInput: string): void {
    this.unsentInput = currentInput;
    const prefix = currentInput.toLowerCase();
    const filtered =
      prefix === ""
        ? this.history
        : this.history.filter((command) => command.toLowerCase().startsWith(prefix));
    // Deduplicate, keeping the most recent occurrence of each command.
    const seen = new Set<string>();
    const deduped: string[] = [];
    for (let i = filtered.length - 1; i >= 0; i--) {
      if (!seen.has(filtered[i])) {
        seen.add(filtered[i]);
        deduped.unshift(filtered[i]);
      }
    }
    this.matches = deduped;
    this.matchIndex = -1;
  }

  /** True when the input still shows what this walk last produced. */
  private isWalking(currentInput: string): boolean {
    return this.matches !== null && currentInput === this.getCurrentInput();
  }

  navigateUp(currentInput: string): string {
    if (!this.isWalking(currentInput)) {
      this.startWalk(currentInput);
    }
    const matches = this.matches as string[];
    if (matches.length > 0 && this.matchIndex < matches.length - 1) {
      this.matchIndex++;
    }
    return this.getCurrentInput();
  }

  navigateDown(currentInput: string): string {
    if (!this.isWalking(currentInput)) {
      this.startWalk(currentInput);
      return this.unsentInput;
    }
    if (this.matchIndex > 0) {
      this.matchIndex--;
    } else {
      this.matchIndex = -1;
    }
    return this.getCurrentInput();
  }

  getCurrentInput(): string {
    if (this.matches === null || this.matchIndex === -1) {
      return this.unsentInput;
    }
    return this.matches[this.matches.length - 1 - this.matchIndex];
  }

  getHistory(): string[] {
    return [...this.history]; // Return a copy to prevent external modification
  }
}
