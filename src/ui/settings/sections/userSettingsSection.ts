import type FrontmatterUserTimestampsPlugin from '@/main';
import { Setting } from 'obsidian';

export class UserSettingsSection {
  constructor(
    private plugin: FrontmatterUserTimestampsPlugin,
    private containerEl: HTMLElement,
  ) {}

  async display(): Promise<void> {
    this.containerEl.createEl('h3', { text: 'User Settings' });

    const gitPluginEnabled = this.plugin.gitService.isGitPluginEnabled();
    const gitUsername = gitPluginEnabled
      ? await this.plugin.gitService.getGitUsername()
      : null;
    const currentUsername = await this.plugin.getUsername();

    // Username setting
    new Setting(this.containerEl)
      .setName('Local Username')
      .setDesc('Enter your name to be added to new files (stored locally)')
      .addText((text) =>
        text
          .setPlaceholder('Enter your name')
          .setValue(currentUsername)
          .onChange(async (value) => {
            await this.plugin.setUsername(value);
          }),
      );

    // Git integration setting
    if (gitPluginEnabled) {
      new Setting(this.containerEl)
        .setName('Use Git Username')
        .setDesc(
          `Use your Git username (${
            gitUsername || 'not set'
          }) instead of the local username`,
        )
        .addToggle((toggle) =>
          toggle
            .setValue(this.plugin.getSettings().useGitUsername)
            .onChange(async (value) => {
              const settings = this.plugin.getSettings();
              settings.useGitUsername = value;
              await this.plugin.saveSettings();
            }),
        );
    }

    // Enable username in frontmatter
    new Setting(this.containerEl)
      .setName('Enable username')
      .setDesc('Add username to frontmatter when files are created or modified')
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.getSettings().enableUsername)
          .onChange(async (value) => {
            const settings = this.plugin.getSettings();
            settings.enableUsername = value;
            await this.plugin.saveSettings();
          }),
      );

    // Prompt for username
    new Setting(this.containerEl)
      .setName('Prompt for username')
      .setDesc('Allow templates to prompt for user information')
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.getSettings().promptForUsername)
          .onChange(async (value) => {
            const settings = this.plugin.getSettings();
            settings.promptForUsername = value;
            await this.plugin.saveSettings();
          }),
      );
  }
}
