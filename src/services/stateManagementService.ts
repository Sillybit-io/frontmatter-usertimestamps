import { PluginError, type PluginState } from '@/models/types';
import { Logger } from '@/utils/logger';

export class StateManager {
  private state: PluginState = {
    isProcessingFile: false,
    processedFilesCount: 0,
    errors: [],
  };

  private listeners: Array<(state: PluginState) => void> = [];

  constructor(private logger: Logger) {}

  getState(): Readonly<PluginState> {
    return { ...this.state };
  }

  private setState(newState: Partial<PluginState>): void {
    const oldState = { ...this.state };
    this.state = { ...this.state, ...newState };
    this.notifyListeners();
    this.logger.debug('State updated', { oldState, newState: this.state });
  }

  subscribe(listener: (state: PluginState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners(): void {
    const state = this.getState();
    for (const listener of this.listeners) {
      listener(state);
    }
  }

  setProcessingFile(isProcessing: boolean, filePath?: string): void {
    this.setState({
      isProcessingFile: isProcessing,
      lastProcessedFile: filePath,
    });
  }

  incrementProcessedFiles(): void {
    this.setState({
      processedFilesCount: this.state.processedFilesCount + 1,
    });
  }

  addError(error: PluginError): void {
    this.setState({
      errors: [...this.state.errors, error],
    });
  }

  clearErrors(): void {
    this.setState({
      errors: [],
    });
  }

  reset(): void {
    this.setState({
      isProcessingFile: false,
      lastProcessedFile: undefined,
      processedFilesCount: 0,
      errors: [],
    });
  }
}
