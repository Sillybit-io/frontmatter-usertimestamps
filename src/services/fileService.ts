import { PLUGIN_CONSTANTS } from '@/constants/defaults';
import type { FrontmatterUserTimestampsSettings } from '@/models/types';
import { DateUtils } from '@/utils/dateUtils';
import { Logger } from '@/utils/logger';
import { App, TFile, Vault } from 'obsidian';

interface ExtendedVault extends Vault {
  getConfig: (key: string) => string | null;
}

export class FileService {
  constructor(
    private app: App,
    private vault: Vault,
    private settings: FrontmatterUserTimestampsSettings,
    private logger: Logger,
    private dateUtils: DateUtils,
  ) {}

  async updateModifiedDate(
    file: TFile,
    username: string,
    showNotification = false,
    ignoreExclusions = false,
  ): Promise<void> {
    if (!this.settings.enableModified && !ignoreExclusions) {
      this.logger.debug(
        PLUGIN_CONSTANTS.FILE_SERVICE_MESSAGES.MODIFIED_DATE_UPDATES_DISABLED,
        file.path,
      );
      return;
    }

    try {
      const currentTime = this.dateUtils.getCurrentFormattedDate();

      this.logger.debug(
        PLUGIN_CONSTANTS.FILE_SERVICE_MESSAGES.UPDATE_MODIFIED_DATE,
        {
          file: file.path,
          time: currentTime,
          username,
          ignoreExclusions,
        },
      );

      let currentModified: string | undefined;
      await this.app.fileManager.processFrontMatter(file, (frontmatter) => {
        currentModified = frontmatter?.modified;
      });

      if (currentModified === currentTime) {
        return;
      }

      await this.app.fileManager.processFrontMatter(file, (frontmatter) => {
        if (frontmatter && !frontmatter.modified?.includes('<% ')) {
          this.logger.debug('Setting modified date in frontmatter', {
            file: file.path,
            oldDate: frontmatter.modified,
            newDate: currentTime,
          });

          frontmatter.modified = currentTime;
          if (this.settings.enableUsername && username) {
            frontmatter['modified-by'] = username;
          }
        }
      });
    } catch (error) {
      this.logger.error(
        PLUGIN_CONSTANTS.FILE_SERVICE_MESSAGES.UPDATE_MODIFIED_DATE_ERROR,
        error,
      );
      throw error;
    }
  }

  async updateCreatedDate(file: TFile, username: string): Promise<void> {
    if (!this.settings.enableCreated) {
      this.logger.debug(
        PLUGIN_CONSTANTS.FILE_SERVICE_MESSAGES.CREATED_DATE_UPDATES_DISABLED,
        file.path,
      );
      return;
    }

    try {
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      const templater = (this.app as any).plugins.plugins['templater-obsidian'];
      if (templater?.templater?.running_tasks?.length > 0) {
        this.logger.debug('Waiting for templater to finish processing...');
        await Promise.all(templater.templater.running_tasks);
      }
      const currentTime = this.dateUtils.getCurrentFormattedDate();

      await this.app.fileManager.processFrontMatter(file, (frontmatter) => {
        if (frontmatter && !frontmatter.created?.includes('<% ')) {
          if (!frontmatter.created) {
            frontmatter.created = currentTime;
            if (this.settings.enableUsername && username) {
              frontmatter['created-by'] = username;
            }
          }
        }
      });
    } catch (error) {
      this.logger.error(
        PLUGIN_CONSTANTS.FILE_SERVICE_MESSAGES.UPDATE_CREATED_DATE_ERROR,
        error,
      );
      throw error;
    }
  }

  shouldProcessFile(file: TFile, ignoreExclusions = false): boolean {
    if (!(file instanceof TFile) || file.extension !== 'md') return false;
    if (ignoreExclusions) return true;

    const filePath = file.path.replace(/\\/g, '/');
    this.logger.debug('File path', filePath);
    const templatesFolder = (this.app.vault as ExtendedVault).getConfig(
      'templateFolder',
    );

    if (this.settings.excludeTemplatesFolder && templatesFolder) {
      const normalizedTemplatesFolder = templatesFolder.replace(/\\/g, '/');
      if (
        filePath === normalizedTemplatesFolder ||
        filePath.startsWith(`${normalizedTemplatesFolder}/`)
      ) {
        this.logger.debug('File excluded - in templates folder', {
          file: filePath,
        });
        return false;
      }
    }

    for (const folder of this.settings.excludedFolders) {
      const normalizedFolder = folder.replace(/\\/g, '/');
      if (
        filePath === normalizedFolder ||
        filePath.startsWith(`${normalizedFolder}/`)
      ) {
        this.logger.debug('File excluded - in excluded folder', {
          file: filePath,
          folder: normalizedFolder,
        });
        return false;
      }
    }

    return true;
  }
}
