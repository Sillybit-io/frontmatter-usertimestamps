import type FrontmatterUserTimestampsPlugin from '@/main';
import { App, PluginSettingTab } from 'obsidian';
import { DateSettingsSection } from './sections/dateSettingsSection';
import { DebugSettingsSection } from './sections/debugSettingsSection';
import { FolderSettingsSection } from './sections/folderSettingsSection';
import { GeneralSettingsSection } from './sections/generalSettingsSection';
import { UserSettingsSection } from './sections/userSettingsSection';

export class FrontmatterUserTimestampsSettingTab extends PluginSettingTab {
  constructor(
    app: App,
    private plugin: FrontmatterUserTimestampsPlugin,
  ) {
    super(app, plugin);
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    // Create sections
    new GeneralSettingsSection(this.plugin, containerEl).display();
    new UserSettingsSection(this.plugin, containerEl).display();
    new DateSettingsSection(this.plugin, containerEl).display();
    new FolderSettingsSection(this.plugin, containerEl).display();
    new DebugSettingsSection(this.plugin, containerEl).display();
  }
}
