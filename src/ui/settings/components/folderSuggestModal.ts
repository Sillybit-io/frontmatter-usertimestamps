import type FrontmatterUserTimestampsPlugin from '@/main';
import { FuzzySuggestModal, TFolder } from 'obsidian';

export class FolderSuggestModal extends FuzzySuggestModal<TFolder> {
  constructor(
    private plugin: FrontmatterUserTimestampsPlugin,
    private onChoose: (folder: TFolder) => void,
  ) {
    super(plugin.app);
  }

  getItems(): TFolder[] {
    return this.getAllFolders();
  }

  getItemText(folder: TFolder): string {
    return folder.path;
  }

  onChooseItem(folder: TFolder): void {
    this.onChoose(folder);
  }

  private getAllFolders(): TFolder[] {
    const folders: TFolder[] = [];

    const recurseFolder = (folder: TFolder) => {
      folders.push(folder);
      for (const child of folder.children) {
        if (child instanceof TFolder) {
          recurseFolder(child);
        }
      }
    };

    for (const child of this.plugin.app.vault.getRoot().children) {
      if (child instanceof TFolder) {
        recurseFolder(child);
      }
    }

    return folders;
  }
}
