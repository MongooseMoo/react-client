export class CommandHistory {
  private history: string[] = [];
  private currentIndex: number | null = null;
  private unsentInput: string = "";

  addCommand(command: string): void {
    if (command.trim() !== "" && (this.history.length === 0 || this.history[this.history.length - 1] !== command)) {
      this.history.push(command.trim());
      this.unsentInput = "";
    }
    this.currentIndex = null;
  }

  navigateUp(currentInput: string): string {
    if (this.currentIndex === null) {
      this.unsentInput = currentInput;
    }

    if (this.history.length > 0 && (this.currentIndex == null || this.currentIndex > 0)) {
      this.currentIndex = this.currentIndex == null ? this.history.length - 1 : this.currentIndex - 1;
      return this.history[this.currentIndex];
    }

    return this.currentIndex === null ? "" : this.history[this.currentIndex];
  }
  navigateDown(currentInput: string): string {
    if (this.currentIndex !== null) {
      if (this.currentIndex < this.history.length - 1) {
        this.currentIndex++;
        return this.history[this.currentIndex];
      } else {
        this.currentIndex = null;
        return this.unsentInput;
      }
    }
    // Preserve unsent input if not navigating history
    return this.unsentInput;
  }

  getCurrentInput(): string {
    return this.currentIndex === null ? this.unsentInput : this.history[this.currentIndex];
  }
}
