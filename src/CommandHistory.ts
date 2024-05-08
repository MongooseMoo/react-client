export class CommandHistory {
  private history: string[] = [];
  private currentIndex: number = 0;
  private unsentInput: string = "";

  addCommand(command: string): void {
    if (command.trim() !== "" && (this.history.length === 0 || this.history[this.history.length - 1] !== command)) {
      this.history.push(command.trim());
      this.currentIndex = this.history.length;  // Point currentIndex to just after the last command
    }
    this.unsentInput = "";  // Clear the unsentInput whenever a command is added
  }

  navigateUp(currentInput: string): string {
    if (this.currentIndex === this.history.length) {
      this.unsentInput = currentInput;  // Store current input if at the end of the history
    }

    if (this.history.length > 0 && this.currentIndex > 0) {
      this.currentIndex--;
    }

    return this.history.length > 0 ? this.history[Math.max(0, this.currentIndex)] : "";
  }

  navigateDown(currentInput: string): string {
    if (this.currentIndex === this.history.length) {
      this.unsentInput = currentInput;  // Save current input if at end
    }

    if (this.currentIndex < this.history.length - 1) {
      this.currentIndex++;
      return this.history[this.currentIndex];
    } else {
      this.currentIndex = this.history.length;  // Reset to after the last item
      return this.unsentInput;  // Return unsent input when navigating down past the end
    }
  }

  getCurrentInput(): string {
    if (this.currentIndex >= this.history.length) {
      return this.unsentInput;  // Return unsent input if currentIndex is beyond the last history item
    }
    return this.history[this.currentIndex];  // Otherwise, return the current history item
  }
}
