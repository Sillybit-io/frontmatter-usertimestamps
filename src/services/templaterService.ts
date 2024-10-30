import { PLUGIN_CONSTANTS } from '@/constants/defaults';
import { Logger } from '@/utils/logger';
import { App, TFile } from 'obsidian';

interface TemplaterPlugin {
  templater?: {
    files_with_pending_templates: Set<string>;
    current_functions_object?: {
      hooks?: {
        on_all_templates_executed: (callback: () => Promise<void>) => void;
      };
    };
  };
}

export class TemplaterService {
  private templaterPlugin: TemplaterPlugin | null = null;
  private readonly TEMPLATER_PLUGIN_ID = PLUGIN_CONSTANTS.PLUGIN_IDS.TEMPLATER;

  constructor(
    private app: App,
    private logger: Logger,
  ) {
    this.initializeTemplaterIntegration();
  }

  private initializeTemplaterIntegration(): void {
    this.app.workspace.onLayoutReady(() => {
      // @ts-ignore
      const templater = this.app.plugins.plugins[this.TEMPLATER_PLUGIN_ID] as
        | TemplaterPlugin
        | undefined;
      if (templater) {
        this.templaterPlugin = templater;
        this.logger.debug(
          PLUGIN_CONSTANTS.TEMPLATER_MESSAGES.TEMPLATER_PLUGIN_SUCCESS,
        );
      } else {
        this.logger.debug(
          PLUGIN_CONSTANTS.TEMPLATER_MESSAGES.NO_TEMPLATER_PLUGIN,
        );
      }
    });
  }

  async processFileWithTemplaterCheck(
    file: TFile,
    updateFn: () => Promise<void>,
  ): Promise<void> {
    if (!this.templaterPlugin) {
      this.logger.debug(
        PLUGIN_CONSTANTS.TEMPLATER_MESSAGES.NO_TEMPLATER_PLUGIN,
        file.path,
      );
      await updateFn();
      return;
    }

    if (
      this.templaterPlugin.templater?.files_with_pending_templates.has(
        file.path,
      )
    ) {
      this.logger.debug(
        PLUGIN_CONSTANTS.TEMPLATER_MESSAGES.TEMPLATER_WAITING_FOR_PROCESSING,
        file.path,
      );
      await new Promise<void>((resolve) => {
        this.templaterPlugin?.templater?.current_functions_object?.hooks?.on_all_templates_executed(
          async () => {
            this.logger.debug(
              PLUGIN_CONSTANTS.TEMPLATER_MESSAGES.TEMPLATER_FINISHED_PROCESSING,
              file.path,
            );
            await updateFn();
            resolve();
          },
        );
      });
    } else {
      this.logger.debug(
        PLUGIN_CONSTANTS.TEMPLATER_MESSAGES.TEMPLATER_NOT_PROCESSING_FILE,
        file.path,
      );
      await updateFn();
    }
  }

  isTemplaterEnabled(): boolean {
    return this.templaterPlugin !== null;
  }
}
