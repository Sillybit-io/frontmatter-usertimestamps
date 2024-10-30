import { PLUGIN_CONSTANTS } from '@/constants/defaults';
import {
  type GitConfig,
  type GitPluginInfo,
  type IGitService,
  PluginError,
} from '@/models/types';
import { Logger } from '@/utils/logger';
import { App } from 'obsidian';

export class GitService implements IGitService {
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  private gitPlugin: any = null;
  private cachedConfig: GitConfig | null = null;
  private lastConfigCheck = 0;
  private readonly CONFIG_CACHE_DURATION = 5 * 60 * 1000;

  constructor(
    private app: App,
    private logger: Logger,
  ) {
    this.initializeGitPlugin();
  }

  /**
   * Initialize the Git plugin reference
   */
  private initializeGitPlugin(): void {
    try {
      // @ts-ignore - Accessing internal API
      this.gitPlugin = this.app.plugins.getPlugin(
        PLUGIN_CONSTANTS.PLUGIN_IDS.GIT,
      );
      if (this.gitPlugin) {
        this.logger.debug(PLUGIN_CONSTANTS.GIT_MESSAGES.GIT_PLUGIN_SUCCESS);
      } else {
        this.logger.debug(PLUGIN_CONSTANTS.GIT_MESSAGES.NO_GIT_PLUGIN);
      }
    } catch (error) {
      this.logger.error(PLUGIN_CONSTANTS.GIT_MESSAGES.GIT_INIT_ERROR, error);
    }
  }

  /**
   * Check if the Git plugin is enabled
   */
  isGitPluginEnabled(): boolean {
    if (!this.gitPlugin) {
      this.initializeGitPlugin();
    }
    return !!this.gitPlugin;
  }

  /**
   * Get Git plugin information
   */
  getGitPluginInfo(): GitPluginInfo {
    return {
      isEnabled: this.isGitPluginEnabled(),
      version: this.gitPlugin?.manifest?.version,
      config: this.cachedConfig || undefined,
    };
  }

  /**
   * Get Git username from config
   */
  async getGitUsername(): Promise<string | null> {
    try {
      const config = await this.getGitConfig();
      return config?.name || null;
    } catch (error) {
      this.logger.error(
        PLUGIN_CONSTANTS.GIT_MESSAGES.GIT_USERNAME_ERROR,
        error,
      );
      throw new PluginError(
        PLUGIN_CONSTANTS.GIT_MESSAGES.GIT_USERNAME_ERROR,
        'STORAGE_ERROR',
        error,
      );
    }
  }

  /**
   * Get Git configuration
   */
  async getGitConfig(): Promise<GitConfig | null> {
    try {
      // Check cache first
      if (this.shouldUseCache()) {
        return this.cachedConfig;
      }

      if (!this.isGitPluginEnabled()) {
        return null;
      }

      // Try to get global config first
      const globalConfig =
        await this.gitPlugin.gitManager?.git?.getConfig('user.name');
      if (globalConfig?.value?.trim()) {
        const config: GitConfig = {
          name: globalConfig.value.trim(),
          scope: 'global',
        };
        this.updateConfigCache(config);
        return config;
      }

      this.updateConfigCache(null);
      return null;
    } catch (error) {
      this.logger.error(PLUGIN_CONSTANTS.GIT_MESSAGES.GIT_CONFIG_ERROR, error);
      throw new PluginError(
        PLUGIN_CONSTANTS.GIT_MESSAGES.GIT_CONFIG_ERROR,
        'STORAGE_ERROR',
        error,
      );
    }
  }

  /**
   * Check if we should use cached config
   */
  private shouldUseCache(): boolean {
    return (
      this.cachedConfig !== null &&
      Date.now() - this.lastConfigCheck < this.CONFIG_CACHE_DURATION
    );
  }

  /**
   * Update the config cache
   */
  private updateConfigCache(config: GitConfig | null): void {
    this.cachedConfig = config;
    this.lastConfigCheck = Date.now();
  }

  /**
   * Clear the config cache
   */
  clearConfigCache(): void {
    this.cachedConfig = null;
    this.lastConfigCheck = 0;
  }
}
