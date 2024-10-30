import type FrontmatterUserTimestampsPlugin from '@/main';
import { Setting } from 'obsidian';
import { FolderSuggestModal } from '../components/folderSuggestModal';

export class FolderSettingsSection {
  private excludedFoldersContainer: HTMLElement;

  constructor(
    private plugin: FrontmatterUserTimestampsPlugin,
    private containerEl: HTMLElement,
  ) {
    this.excludedFoldersContainer = this.containerEl.createDiv(
      'excluded-folders-list',
    );
  }

  display(): void {
    this.containerEl.createEl('h3', { text: 'Folder Settings' });

    new Setting(this.containerEl)
      .setName('Exclude templates folder')
      .setDesc(
        'Automatically exclude the templates folder configured in Obsidian settings',
      )
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.getSettings().excludeTemplatesFolder)
          .onChange(async (value) => {
            const settings = this.plugin.getSettings();
            settings.excludeTemplatesFolder = value;
            await this.plugin.saveSettings();
          }),
      );

    new Setting(this.containerEl)
      .setName('Excluded folders')
      .setDesc('Folders to exclude from automatic updates')
      .addButton((button) =>
        button
          .setButtonText('Add folder')
          .setCta()
          .onClick(() => {
            const modal = new FolderSuggestModal(
              this.plugin,
              async (folder) => {
                const settings = this.plugin.getSettings();
                if (!settings.excludedFolders.includes(folder.path)) {
                  settings.excludedFolders.push(folder.path);
                  await this.plugin.saveSettings();
                  this.displayExcludedFolders();
                }
              },
            );
            modal.open();
          }),
      );

    this.excludedFoldersContainer = this.containerEl.createDiv(
      'excluded-folders-list',
    );
    this.excludedFoldersContainer.style.marginTop = '10px';
    this.displayExcludedFolders();
  }

  private displayExcludedFolders(): void {
    this.excludedFoldersContainer.empty();
    const settings = this.plugin.getSettings();

    if (settings.excludedFolders.length === 0) {
      this.displayEmptyFolderMessage();
      return;
    }

    const list = this.excludedFoldersContainer.createEl('div');
    for (const folderPath of settings.excludedFolders) {
      this.createFolderListItem(list, folderPath);
    }
  }

  private displayEmptyFolderMessage(): void {
    const emptyText = this.excludedFoldersContainer.createDiv(
      'excluded-folders-empty',
    );
    emptyText.style.cssText = `
      font-style: italic;
      color: var(--text-muted);
    `;
    emptyText.setText('No folders excluded');
  }

  private createFolderListItem(list: HTMLElement, folderPath: string): void {
    const itemContainer = list.createDiv('excluded-folder-item');
    itemContainer.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      padding: 6px;
      background-color: var(--background-secondary);
      border-radius: 4px;
    `;

    const pathEl = itemContainer.createSpan();
    pathEl.setText(folderPath);

    const removeButton = itemContainer.createEl('button');
    removeButton.setText('Remove');
    removeButton.style.marginLeft = '10px';
    removeButton.onclick = async () => {
      const settings = this.plugin.getSettings();
      settings.excludedFolders = settings.excludedFolders.filter(
        (path) => path !== folderPath,
      );
      await this.plugin.saveSettings();
      this.displayExcludedFolders();
    };
  }
}
