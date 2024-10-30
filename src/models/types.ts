import { PLUGIN_CONSTANTS } from '@/constants/defaults';
import { TFile } from 'obsidian';

/**
 * Main plugin settings interface
 */
export interface FrontmatterUserTimestampsSettings {
  /** User's name for file attribution */
  username: string;

  /** Whether to use Git username instead of local username */
  useGitUsername: boolean;

  /** Delay in seconds before updating modified date */
  updateDelay: number;

  /** Date format string (moment.js format) */
  dateFormat: string;

  /** Whether to enable modified date tracking */
  enableModified: boolean;

  /** Whether to enable created date tracking */
  enableCreated: boolean;

  /** Whether to enable username tracking */
  enableUsername: boolean;

  /** Whether to prompt for username in templates */
  promptForUsername: boolean;

  /** List of folders to exclude from date tracking */
  excludedFolders: string[];

  /** Whether to exclude the templates folder */
  excludeTemplatesFolder: boolean;

  /** Whether to show notification popups */
  showNotifications: boolean;

  /** Whether to enable debug logging */
  debug: boolean;

  /** Whether to check all files when plugin loads */
  checkAllOnStartup: boolean;
}

/**
 * Local storage user data interface
 */
export interface LocalUserData {
  /** Stored username */
  username: string;

  /** When the data was last updated */
  lastUpdated: string;
}

/**
 * File processing status
 */
export interface FileProcessingStatus {
  success: boolean;
  message: string;
  error?: Error;
}

/**
 * Git integration related types
 */
export interface GitConfig {
  name?: string;
  email?: string;
  scope: 'global' | 'local';
}

export interface GitPluginInfo {
  isEnabled: boolean;
  version?: string;
  config?: GitConfig;
}

/**
 * Plugin event types
 */
export type PluginEvents = {
  [PLUGIN_CONSTANTS.EVENTS.FILE_MODIFIED]: {
    file: TFile;
    oldDate?: string;
    newDate: string;
    username?: string;
  };
  [PLUGIN_CONSTANTS.EVENTS.FILE_CREATED]: {
    file: TFile;
    date: string;
    username?: string;
  };
  [PLUGIN_CONSTANTS.EVENTS.SETTINGS_UPDATED]: {
    oldSettings: FrontmatterUserTimestampsSettings;
    newSettings: FrontmatterUserTimestampsSettings;
  };
};

/**
 * Error types
 */
export class PluginError extends Error {
  constructor(
    message: string,
    public readonly code: keyof typeof PLUGIN_CONSTANTS.ERROR_MESSAGES,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'PluginError';
  }
}

/**
 * File processing options
 */
export interface FileProcessingOptions {
  ignoreExclusions?: boolean;
  showNotification?: boolean;
  force?: boolean;
}

/**
 * Frontmatter data interface
 */
export interface FrontmatterData {
  created?: string;
  modified?: string;
  'created-by'?: string;
  'modified-by'?: string;
  [key: string]: unknown;
}

/**
 * Service interfaces for dependency injection
 */
export interface IFileService {
  updateModifiedDate(
    file: TFile,
    username: string,
    options?: FileProcessingOptions,
  ): Promise<void>;
  updateCreatedDate(file: TFile, username: string): Promise<void>;
  shouldProcessFile(file: TFile, ignoreExclusions?: boolean): boolean;
}

export interface IGitService {
  isGitPluginEnabled(): boolean;
  getGitUsername(): Promise<string | null>;
  getGitConfig(): Promise<GitConfig | null>;
}

export interface IStorageService {
  loadLocalUserData(): Promise<LocalUserData>;
  saveLocalUserData(userData: LocalUserData): Promise<void>;
  getCurrentUserData(): LocalUserData | null;
}

/**
 * Event handler types
 */
export type EventCallback<T> = (data: T) => void | Promise<void>;
export type EventUnsubscribe = () => void;

/**
 * Plugin state interface
 */
export interface PluginState {
  isProcessingFile: boolean;
  lastProcessedFile?: string;
  processedFilesCount: number;
  errors: PluginError[];
}
