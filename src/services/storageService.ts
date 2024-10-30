import fs from 'fs';
import { join } from 'path';
import { PLUGIN_CONSTANTS } from '@/constants/defaults';
import { type LocalUserData } from '@/models/types';
import { Logger } from '@/utils/logger';
import { FileSystemAdapter, Platform } from 'obsidian';

export class StorageService {
  private localDataPath!: string;
  private localUserData: LocalUserData | null = null;

  private readonly LOCAL_OBSIDIAN_DIR =
    PLUGIN_CONSTANTS.STORAGE.LOCAL_OBSIDIAN_DIR;
  private readonly STORED_FOLDER_NAME =
    PLUGIN_CONSTANTS.STORAGE.STORED_FOLDER_NAME;
  private readonly STORED_FILE_NAME = PLUGIN_CONSTANTS.STORAGE.STORED_FILE_NAME;
  private readonly MOBILE_STORED_FILE_NAME =
    PLUGIN_CONSTANTS.STORAGE.MOBILE_STORED_FILE_NAME;

  constructor(
    private adapter: FileSystemAdapter,
    private logger: Logger,
  ) {
    this.initializeStoragePath();
  }

  private initializeStoragePath(): void {
    if (Platform.isDesktop) {
      const localDataDir = this.adapter.getBasePath();
      const obsidianDir = join(localDataDir, this.LOCAL_OBSIDIAN_DIR);
      const pluginDir = join(obsidianDir, this.STORED_FOLDER_NAME);

      this.logger.debug(
        PLUGIN_CONSTANTS.STORAGE_MESSAGES.LOCAL_DATA_DIR,
        pluginDir,
      );

      if (!fs.existsSync(pluginDir)) {
        fs.mkdirSync(pluginDir, { recursive: true });
      }

      this.localDataPath = join(pluginDir, this.STORED_FILE_NAME);
    } else {
      this.localDataPath = join(
        this.LOCAL_OBSIDIAN_DIR,
        this.STORED_FOLDER_NAME,
        this.MOBILE_STORED_FILE_NAME,
      );
    }
  }

  async loadLocalUserData(): Promise<LocalUserData> {
    try {
      let data: string;
      if (Platform.isDesktop) {
        data = await fs.readFileSync(this.localDataPath, 'utf8');
      } else {
        data = await this.adapter.read(this.localDataPath);
      }
      this.localUserData = JSON.parse(data) as LocalUserData;
      if (!this.localUserData) {
        this.localUserData = {
          username: '',
          lastUpdated: new Date().toISOString(),
        };
      }
      this.logger.debug(
        PLUGIN_CONSTANTS.STORAGE_MESSAGES.LOAD_SUCCESS,
        this.localUserData,
      );
      return this.localUserData;
    } catch (error) {
      this.localUserData = {
        username: '',
        lastUpdated: new Date().toISOString(),
      };
      await this.saveLocalUserData(this.localUserData);
      return this.localUserData;
    }
  }

  async saveLocalUserData(userData: LocalUserData): Promise<void> {
    try {
      const data = JSON.stringify(userData, null, 2);
      if (Platform.isDesktop) {
        await fs.writeFileSync(this.localDataPath, data, 'utf8');
      } else {
        await this.adapter.write(this.localDataPath, data);
      }
      this.localUserData = userData;
    } catch (error) {
      this.logger.error(PLUGIN_CONSTANTS.STORAGE_MESSAGES.SAVE_ERROR, error);
      throw error;
    }
  }

  getCurrentUserData(): LocalUserData | null {
    return this.localUserData;
  }
}
