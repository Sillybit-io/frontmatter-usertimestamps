import type FrontmatterUserTimestampsPlugin from '@/main';
import { Setting } from 'obsidian';

export class DateSettingsSection {
  constructor(
    private plugin: FrontmatterUserTimestampsPlugin,
    private containerEl: HTMLElement,
  ) {}

  display(): void {
    this.containerEl.createEl('h3', { text: 'Date Settings' });

    new Setting(this.containerEl)
      .setName('Update delay')
      .setDesc(
        'How long to wait (in seconds) before updating the modified date after changes',
      )
      .addText((text) =>
        text
          .setValue(String(this.plugin.getSettings().updateDelay))
          .onChange(async (value) => {
            const delay = Number(value);
            if (!Number.isNaN(delay) && delay >= 0) {
              const settings = this.plugin.getSettings();
              settings.updateDelay = delay;
              await this.plugin.saveSettings();
            }
          }),
      );

    new Setting(this.containerEl)
      .setName('Date format')
      .setDesc('Format string for dates (using Moment.js syntax)')
      .addText((text) =>
        text
          .setValue(this.plugin.getSettings().dateFormat)
          .onChange(async (value) => {
            const settings = this.plugin.getSettings();
            settings.dateFormat = value;
            await this.plugin.saveSettings();
          }),
      );
  }
}
