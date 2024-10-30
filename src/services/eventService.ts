import { PLUGIN_CONSTANTS } from '@/constants/defaults';
import {
  type EventCallback,
  type EventUnsubscribe,
  type FrontmatterUserTimestampsSettings,
  type PluginEvents,
} from '@/models/types';
import { Logger } from '@/utils/logger';
import { TFile } from 'obsidian';

export class EventManager {
  private listeners: Map<
    keyof PluginEvents,
    Set<EventCallback<PluginEvents[keyof PluginEvents]>>
  > = new Map();

  constructor(private logger: Logger) {}

  on<T extends keyof PluginEvents>(
    event: T,
    callback: EventCallback<PluginEvents[T]>,
  ): EventUnsubscribe {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    const listeners = this.listeners.get(event) as Set<
      EventCallback<PluginEvents[T]>
    >;
    listeners.add(callback);
    this.logger.debug(`Added listener for event: ${event}`);

    return () => {
      listeners.delete(callback);
      this.logger.debug(`Removed listener for event: ${event}`);
    };
  }

  async emit<T extends keyof PluginEvents>(
    event: T,
    data: PluginEvents[T],
  ): Promise<void> {
    this.logger.debug(`Emitting event: ${event}`, data);

    const listeners = this.listeners.get(event);
    if (!listeners) return;

    const promises = Array.from(listeners).map((callback) => {
      try {
        return Promise.resolve(callback(data));
      } catch (error) {
        this.logger.error(`Error in event listener for ${event}:`, error);
        return Promise.reject(error);
      }
    });

    await Promise.all(promises);
  }

  // Convenience methods for common events
  async emitFileModified(params: {
    file: TFile;
    oldDate?: string;
    newDate: string;
    username?: string;
  }): Promise<void> {
    await this.emit(PLUGIN_CONSTANTS.EVENTS.FILE_MODIFIED, params);
  }

  async emitFileCreated(params: {
    file: TFile;
    date: string;
    username?: string;
  }): Promise<void> {
    await this.emit(PLUGIN_CONSTANTS.EVENTS.FILE_CREATED, params);
  }

  async emitSettingsUpdated(params: {
    oldSettings: FrontmatterUserTimestampsSettings;
    newSettings: FrontmatterUserTimestampsSettings;
  }): Promise<void> {
    await this.emit(PLUGIN_CONSTANTS.EVENTS.SETTINGS_UPDATED, params);
  }

  removeAllListeners(): void {
    this.listeners.clear();
    this.logger.debug('Removed all event listeners');
  }
}
