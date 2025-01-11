export class CommandHistory {
  private static readonly STORAGE_KEY = 'command_history';
  private static readonly MAX_HISTORY = 1000;
  
  private history: string[] = [];
  private currentIndex: number = -1;
  private unsentInput: string = "";

  constructor() {
    this.loadHistory();
  }

  private loadHistory(): void {
    const saved = localStorage.getItem(CommandHistory.STORAGE_KEY);
    if (saved) {
      this.history = JSON.parse(saved);
    }
  }

  private saveHistory(): void {
    localStorage.setItem(CommandHistory.STORAGE_KEY, JSON.stringify(this.history));
  }

  addCommand(command: string): void {
    const trimmedCommand = command.trim();
    if (trimmedCommand !== "" && (this.history.length === 0 || this.history[this.history.length - 1] !== trimmedCommand)) {
      this.history.push(trimmedCommand);
      // Trim history to max size if needed
      if (this.history.length > CommandHistory.MAX_HISTORY) {
        this.history = this.history.slice(-CommandHistory.MAX_HISTORY);
      }
      this.saveHistory();
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
