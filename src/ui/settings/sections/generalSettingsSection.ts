import type FrontmatterUserTimestampsPlugin from '@/main';
import { Setting } from 'obsidian';

export class GeneralSettingsSection {
  constructor(
    private plugin: FrontmatterUserTimestampsPlugin,
    private containerEl: HTMLElement,
  ) {}

  display(): void {
    new Setting(this.containerEl)
      .setName('Show notifications')
      .setDesc('Show notifications when manually updating dates')
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.getSettings().showNotifications)
          .onChange(async (value) => {
            const settings = this.plugin.getSettings();
            settings.showNotifications = value;
            await this.plugin.saveSettings();
          }),
      );

    new Setting(this.containerEl)
      .setName('Enable modified date')
      .setDesc('Update modified date when files are changed')
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.getSettings().enableModified)
          .onChange(async (value) => {
            const settings = this.plugin.getSettings();
            settings.enableModified = value;
            await this.plugin.saveSettings();
          }),
      );

    new Setting(this.containerEl)
      .setName('Enable created date')
      .setDesc('Set created date for new files')
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.getSettings().enableCreated)
          .onChange(async (value) => {
            const settings = this.plugin.getSettings();
            settings.enableCreated = value;
            await this.plugin.saveSettings();
          }),
      );

    new Setting(this.containerEl)
      .setName('Check all files on startup')
      .setDesc('Update dates for all files when the plugin loads')
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.getSettings().checkAllOnStartup)
          .onChange(async (value) => {
            const settings = this.plugin.getSettings();
            settings.checkAllOnStartup = value;
            await this.plugin.saveSettings();
          }),
      );
  }
}
