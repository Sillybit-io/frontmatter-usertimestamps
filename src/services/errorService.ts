import { PLUGIN_CONSTANTS } from '@/constants/defaults';
import { PluginError } from '@/models/types';
import { Logger } from '@/utils/logger';
import { Notice } from 'obsidian';

export class ErrorHandler {
  constructor(
    private logger: Logger,
    private showNotifications = true,
  ) {}

  handleError(error: Error | PluginError, context?: string): void {
    if (error instanceof PluginError) {
      this.handlePluginError(error, context);
    } else {
      this.handleGenericError(error, context);
    }
  }

  private handlePluginError(error: PluginError, context?: string): void {
    const errorMessage =
      PLUGIN_CONSTANTS.ERROR_MESSAGES[error.code] || error.message;

    this.logger.error(
      `[${context || 'Plugin Error'}] ${errorMessage}`,
      error.details,
    );

    if (this.showNotifications) {
      new Notice(errorMessage);
    }
  }

  private handleGenericError(error: Error, context?: string): void {
    this.logger.error(
      `[${context || 'Unexpected Error'}] ${error.message}`,
      error,
    );

    if (this.showNotifications) {
      new Notice('An unexpected error occurred. Check console for details.');
    }
  }

  async withErrorHandling<T>(
    operation: () => Promise<T>,
    context: string,
  ): Promise<T | undefined> {
    try {
      return await operation();
    } catch (error) {
      this.handleError(error as Error, context);
      return undefined;
    }
  }

  setShowNotifications(show: boolean): void {
    this.showNotifications = show;
  }
}
