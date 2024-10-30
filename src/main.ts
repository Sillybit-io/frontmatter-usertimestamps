import { DEFAULT_SETTINGS, PLUGIN_CONSTANTS } from '@/constants/defaults';
import type { FrontmatterUserTimestampsSettings } from '@/models/types';
import {
  FileSystemAdapter,
  MarkdownView,
  Notice,
  Plugin,
  TFile,
} from 'obsidian';
import { CommandManager } from './commands/commands';
import { ErrorHandler } from './services/errorService';
import { EventManager } from './services/eventService';
import { FileService } from './services/fileService';
import { GitService } from './services/gitService';
import { StateManager } from './services/stateManagementService';
import { StorageService } from './services/storageService';
import { TemplaterService } from './services/templaterService';
import { FrontmatterUserTimestampsSettingTab } from './ui/settings/settingsTab';
import { DateUtils } from './utils/dateUtils';
import { Logger } from './utils/logger';

export default class FrontmatterUserTimestampsPlugin extends Plugin {
  private settings!: FrontmatterUserTimestampsSettings;
  private fileService!: FileService;
  private storageService!: StorageService;
  gitService!: GitService;
  private templaterService!: TemplaterService;
  private logger!: Logger;
  private dateUtils!: DateUtils;
  private commandManager!: CommandManager;
  private eventManager!: EventManager;
  private stateManager!: StateManager;
  private errorHandler!: ErrorHandler;
  private fileCache = new Map<string, number>();
  private debouncedUpdate!: (() => void) & { cancel?: () => void };
  private isUpdatingFrontmatter = false;

  override async onload() {
    await this.initializePlugin();
    await this.initializeServices();
    if (this.settings.checkAllOnStartup) {
      this.registerEventHandlers();
    } else {
      this.app.workspace.onLayoutReady(() => {
        this.registerEventHandlers();
      });
    }
    this.addSettingTab(new FrontmatterUserTimestampsSettingTab(this.app, this));
    await this.performInitialSetup();
  }

  private async initializePlugin() {
    const savedData = await this.loadData();
    this.settings = Object.assign({}, DEFAULT_SETTINGS, savedData);

    // Initialize core utilities
    this.logger = new Logger(this.settings.debug);
    this.dateUtils = new DateUtils(this.settings.dateFormat);
    this.errorHandler = new ErrorHandler(
      this.logger,
      this.settings.showNotifications,
    );
    this.eventManager = new EventManager(this.logger);
    this.stateManager = new StateManager(this.logger);

    this.logger.debug('Plugin initialization started');
  }

  private async initializeServices() {
    try {
      this.storageService = new StorageService(
        this.app.vault.adapter as FileSystemAdapter,
        this.logger,
      );

      this.gitService = new GitService(this.app, this.logger);

      this.templaterService = new TemplaterService(this.app, this.logger);

      this.fileService = new FileService(
        this.app,
        this.app.vault,
        this.settings,
        this.logger,
        this.dateUtils,
      );

      this.commandManager = new CommandManager(
        this,
        this.fileService,
        this.settings,
      );

      this.commandManager.registerCommands();

      this.logger.debug('Services initialized successfully');
    } catch (error) {
      this.errorHandler.handleError(error as Error, 'Service Initialization');
    }
  }

  private registerEventHandlers() {
    // File modification handler
    this.registerEvent(
      this.app.vault.on(
        // @ts-expect-error
        PLUGIN_CONSTANTS.CORE_EVENTS.MODIFY,
        async (file: TFile) => {
          if (this.isUpdatingFrontmatter) {
            this.logger.debug(
              'Skipping modification event - internally triggered',
            );
            return;
          }

          await this.errorHandler.withErrorHandling(async () => {
            if (
              file instanceof TFile &&
              this.fileService.shouldProcessFile(file)
            ) {
              const username = await this.getUsername();
              this.stateManager.setProcessingFile(true, file.path);

              await this.templaterService.processFileWithTemplaterCheck(
                file,
                async () => {
                  await this.fileService.updateModifiedDate(file, username);
                  this.stateManager.incrementProcessedFiles();
                },
              );

              this.stateManager.setProcessingFile(false);
            }
          }, 'File Modification');
        },
      ),
    );

    // File creation handler
    this.registerEvent(
      this.app.vault.on(
        // @ts-expect-error
        PLUGIN_CONSTANTS.CORE_EVENTS.CREATE,
        async (file: TFile) => {
          this.logger.debug('File creation event', file.path);
          await new Promise((resolve) => setTimeout(resolve, 1000));
          await this.errorHandler.withErrorHandling(async () => {
            if (
              file instanceof TFile &&
              this.fileService.shouldProcessFile(file)
            ) {
              const username = await this.getUsername();
              this.stateManager.setProcessingFile(true, file.path);
              await this.templaterService.processFileWithTemplaterCheck(
                file,
                async () => {
                  this.logger.debug('Updating created date', file.path);
                  await this.fileService.updateCreatedDate(file, username);
                  await this.eventManager.emitFileCreated({
                    file,
                    date: this.dateUtils.getCurrentFormattedDate(),
                    username,
                  });
                },
              );
              this.stateManager.setProcessingFile(false);
            }
          }, 'File Creation');
        },
      ),
    );

    // Settings update handler
    this.eventManager.on(
      PLUGIN_CONSTANTS.EVENTS.SETTINGS_UPDATED,
      async ({ oldSettings, newSettings }) => {
        if (oldSettings.debug !== newSettings.debug) {
          this.logger = new Logger(newSettings.debug);
        }
        if (oldSettings.dateFormat !== newSettings.dateFormat) {
          this.dateUtils.setDateFormat(newSettings.dateFormat);
        }
      },
    );
  }

  private async performInitialSetup() {
    if (this.settings.checkAllOnStartup) {
      await this.errorHandler.withErrorHandling(async () => {
        const files = this.app.vault.getMarkdownFiles();
        const username = await this.getUsername();

        for (const file of files) {
          if (this.fileService.shouldProcessFile(file)) {
            await this.fileService.updateModifiedDate(file, username);
            this.stateManager.incrementProcessedFiles();
          }
        }

        this.logger.debug('Initial file processing completed');
      }, 'Initial Setup');
    }
  }

  async getUsername(): Promise<string> {
    if (this.settings.useGitUsername) {
      const gitUsername = await this.gitService.getGitUsername();
      if (gitUsername) {
        this.logger.debug('Using Git username', gitUsername);
        return gitUsername;
      }
    }

    const userData = await this.storageService.getCurrentUserData();
    return userData?.username || '';
  }

  async setUsername(username: string) {
    this.logger.debug('Setting username', username);
    await this.storageService.saveLocalUserData({
      username,
      lastUpdated: new Date().toISOString(),
    });
  }

  getSettings(): FrontmatterUserTimestampsSettings {
    return this.settings;
  }

  async saveSettings() {
    const oldSettings = { ...this.settings };
    await this.saveData(this.settings);
    await this.eventManager.emitSettingsUpdated({
      oldSettings,
      newSettings: this.settings,
    });
  }

  displayNotice(message: string) {
    if (this.settings.showNotifications) {
      new Notice(message);
    }
  }

  override async onunload() {
    this.logger.debug('Plugin unloading started');

    // Clean up resources
    this.stateManager.reset();
    this.eventManager.removeAllListeners();
    this.fileCache.clear();

    // Cancel any pending operations
    if (this.debouncedUpdate?.cancel) {
      this.debouncedUpdate.cancel();
    }

    // Clean up any open views
    this.app.workspace.iterateAllLeaves((leaf) => {
      if (leaf.view instanceof MarkdownView) {
        const file = leaf.view.file;
        if (file) {
          this.fileCache.delete(file.path);
        }
      }
    });

    this.logger.debug('Plugin unloaded successfully');
  }
}
