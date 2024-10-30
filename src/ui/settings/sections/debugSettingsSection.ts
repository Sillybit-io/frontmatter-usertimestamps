import type FrontmatterUserTimestampsPlugin from '@/main';
import { Setting } from 'obsidian';

export class DebugSettingsSection {
  constructor(
    private plugin: FrontmatterUserTimestampsPlugin,
    private containerEl: HTMLElement,
  ) {}

  display(): void {
    this.containerEl.createEl('h3', { text: 'Debug Settings' });

    new Setting(this.containerEl)
      .setName('Enable debug mode')
      .setDesc('Show debug messages in the console')
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.getSettings().debug)
          .onChange(async (value) => {
            const settings = this.plugin.getSettings();
            settings.debug = value;
            await this.plugin.saveSettings();
          }),
      );
  }
}
