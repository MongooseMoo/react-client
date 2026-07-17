export class CommandHistory {
  private history: string[] = [];
  private currentIndex: number = -1;
  private unsentInput: string = "";

  addCommand(command: string): void {
    if (command.trim() !== "" && (this.history.length === 0 || this.history[this.history.length - 1] !== command)) {
      this.history.push(command.trim());
    }
    this.currentIndex = -1;
    this.unsentInput = "";
  }

  navigateUp(currentInput: string): string {
    if (this.currentIndex === -1) {  // Change this condition
      this.unsentInput = currentInput;
    }

    if (this.history.length > 0 && this.currentIndex < this.history.length - 1) {  // Change this condition
      this.currentIndex++;
    }

    return this.history.length > 0 ? this.history[this.history.length - 1 - this.currentIndex] : "";  // Reverse the index
  }

  navigateDown(currentInput: string): string {
    if (this.currentIndex === -1) {  // Change this condition
      this.unsentInput = currentInput;
    }

    if (this.currentIndex > 0) {
      this.currentIndex--;
      return this.history[this.history.length - 1 - this.currentIndex];  // Reverse the index
    } else {
      this.currentIndex = -1;  // Reset to -1
      return this.unsentInput;
    }
  }

  getCurrentInput(): string {
    if (this.currentIndex === -1) {  // Change this condition
      return this.unsentInput;
    }
    return this.history[this.history.length - 1 - this.currentIndex];  // Reverse the index
  }

  getHistory(): string[] {
    return [...this.history]; // Return a copy to prevent external modification
  }

  /**
   * Search history for commands containing the query (case-insensitive),
   * most recent first, deduplicated. An empty query returns recent commands.
   */
  search(query: string, limit: number = 50): string[] {
    const needle = query.toLowerCase();
    const results: string[] = [];
    const seen = new Set<string>();
    for (let i = this.history.length - 1; i >= 0 && results.length < limit; i--) {
      const command = this.history[i];
      if (seen.has(command)) continue;
      if (needle === "" || command.toLowerCase().includes(needle)) {
        results.push(command);
        seen.add(command);
      }
    }
    return results;
  }
}
