export class CommandHistory {
  private history: string[];
  private currentIndex: number;
  private unsentInput: string;

  constructor() {
    this.history = [];
    this.currentIndex = -1;
    this.unsentInput = "";
  }

  addCommand(command: string): void {
    if (command.trim() !== "") {
      this.history.push(command);
      this.currentIndex = -1;
    }
  }

  navigateUp(currentInput: string): string {
    if (this.currentIndex === -1) {
      this.unsentInput = currentInput;
      this.currentIndex = this.history.length - 1;
    } else if (this.currentIndex > 0) {
      this.currentIndex--;
    }
    return this.history[this.currentIndex] || "";
  }

  navigateDown(): string {
    if (this.currentIndex < this.history.length - 1) {
      this.currentIndex++;
      return this.history[this.currentIndex];
    } else {
      this.currentIndex = -1;
      return this.unsentInput;
    }
  }

  getCurrentInput(): string {
    return this.currentIndex === -1 ? this.unsentInput : this.history[this.currentIndex];
  }
}
