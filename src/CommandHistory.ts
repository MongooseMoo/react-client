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
}
