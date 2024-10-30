import { PLUGIN_CONSTANTS } from '@/constants/defaults';
import type FrontmatterUserTimestampsPlugin from '@/main';
import type { FrontmatterUserTimestampsSettings } from '@/models/types';
import type { FileService } from '@/services/fileService';
import { Notice, TFile } from 'obsidian';

export class CommandManager {
  constructor(
    private plugin: FrontmatterUserTimestampsPlugin,
    private fileService: FileService,
    private settings: FrontmatterUserTimestampsSettings,
  ) {}

  registerCommands(): void {
    this.registerUpdateCurrentFileCommand();
    this.registerUpdateAllFilesCommand();
    this.registerForceUpdateCommand();
  }

  private registerUpdateCurrentFileCommand(): void {
    this.plugin.addCommand({
      id: PLUGIN_CONSTANTS.COMMANDS.UPDATE_CURRENT,
      name: PLUGIN_CONSTANTS.COMMAND_NAMES.UPDATE_CURRENT,
      checkCallback: (checking: boolean) => {
        const activeFile = this.plugin.app.workspace.getActiveFile();
        if (!activeFile) return false;

        if (!checking) {
          this.handleActiveFileUpdate(activeFile);
        }
        return true;
      },
    });
  }

  private registerUpdateAllFilesCommand(): void {
    this.plugin.addCommand({
      id: PLUGIN_CONSTANTS.COMMANDS.UPDATE_ALL,
      name: PLUGIN_CONSTANTS.COMMAND_NAMES.UPDATE_ALL,
      callback: async () => {
        const files = this.plugin.app.vault.getMarkdownFiles();
        let updatedCount = 0;

        for (const file of files) {
          if (this.fileService.shouldProcessFile(file)) {
            const username = await this.plugin.getUsername();
            await this.fileService.updateModifiedDate(file, username);
            updatedCount++;
          }
        }

        this.displayNotice(`Updated ${updatedCount} files`);
      },
    });
  }

  private registerForceUpdateCommand(): void {
    this.plugin.addCommand({
      id: PLUGIN_CONSTANTS.COMMANDS.FORCE_UPDATE,
      name: PLUGIN_CONSTANTS.COMMAND_NAMES.FORCE_UPDATE,
      checkCallback: (checking: boolean) => {
        const activeFile = this.plugin.app.workspace.getActiveFile();
        if (!activeFile) return false;

        if (!checking) {
          this.handleForceFileUpdate(activeFile);
        }
        return true;
      },
    });
  }

  private async handleActiveFileUpdate(file: TFile): Promise<void> {
    if (!this.fileService.shouldProcessFile(file)) {
      this.displayNotice(PLUGIN_CONSTANTS.ERROR_MESSAGES.FILE_EXCLUDED);
      return;
    }
    const username = await this.plugin.getUsername();
    await this.fileService.updateModifiedDate(file, username, true);
  }

  private async handleForceFileUpdate(file: TFile): Promise<void> {
    const username = await this.plugin.getUsername();
    await this.fileService.updateModifiedDate(file, username, true, true);
  }

  private displayNotice(message: string): void {
    if (this.settings.showNotifications) {
      new Notice(message);
    }
  }
}
