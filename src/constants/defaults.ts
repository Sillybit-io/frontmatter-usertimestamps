export const PLUGIN_CONSTANTS = {
  SETTINGS: {
    DEFAULT_DATE_FORMAT: 'YYYY-MM-DD HH:mm:ss',
    DEFAULT_UPDATE_DELAY: 30,
    MIN_UPDATE_DELAY: 1,
    MAX_UPDATE_DELAY: 300,
  },

  STORAGE: {
    LOCAL_OBSIDIAN_DIR: '.obsidian',
    STORED_FOLDER_NAME: 'frontmatter-usertimestamps-local',
    STORED_FILE_NAME: 'user-data.json',
    MOBILE_STORED_FILE_NAME: 'user-data.local',
  },

  PLUGIN_IDS: {
    GIT: 'obsidian-git',
    TEMPLATER: 'templater-obsidian',
  },

  FRONTMATTER: {
    MODIFIED_KEY: 'modified',
    CREATED_KEY: 'created',
    MODIFIED_BY_KEY: 'modified-by',
    CREATED_BY_KEY: 'created-by',
  },

  COMMANDS: {
    UPDATE_CURRENT: 'update-current-file-modified-date',
    UPDATE_ALL: 'update-all-files-modified-date',
    FORCE_UPDATE: 'force-update-current-file-modified-date',
  },

  COMMAND_NAMES: {
    UPDATE_CURRENT: 'Update modified date for current file',
    UPDATE_ALL: 'Update modified date for all files',
    FORCE_UPDATE:
      'Force update modified date for current file (ignore exclusions)',
  },

  EVENTS: {
    FILE_MODIFIED: 'file-modified',
    FILE_CREATED: 'file-created',
    SETTINGS_UPDATED: 'settings-updated',
  },

  CORE_EVENTS: {
    MODIFY: 'modify',
    CREATE: 'create',
  },

  ERROR_MESSAGES: {
    NO_ACTIVE_FILE: 'No active file',
    FILE_EXCLUDED: 'This file is in an excluded folder',
    INVALID_DATE: 'Invalid date format',
    TEMPLATER_ERROR: 'Error processing template',
    STORAGE_ERROR: 'Error accessing local storage',
  },

  SUCCESS_MESSAGES: {
    FILE_UPDATED: 'File updated successfully',
    ALL_FILES_UPDATED: 'All files updated successfully',
    SETTINGS_SAVED: 'Settings saved successfully',
  },

  GIT_MESSAGES: {
    NO_GIT_PLUGIN: 'Git plugin not found',
    NO_GIT_CONFIG: 'No Git config found',
    GIT_CONFIG_ERROR: 'Error getting Git config',
    GIT_USERNAME_ERROR: 'Error getting Git username',
    GIT_PLUGIN_SUCCESS: 'Git plugin initialized successfully',
    GIT_INIT_ERROR: 'Error initializing Git plugin',
  },

  TEMPLATER_MESSAGES: {
    NO_TEMPLATER_PLUGIN: 'Templater plugin not found',
    TEMPLATER_PLUGIN_SUCCESS: 'Templater plugin initialized successfully',
    TEMPLATER_INIT_ERROR: 'Error initializing Templater plugin',
    TEMPLATER_WAITING_FOR_PROCESSING:
      'Waiting for Templater to finish processing',
    TEMPLATER_FINISHED_PROCESSING: 'Templater finished, proceeding with update',
    TEMPLATER_NOT_PROCESSING_FILE: 'Templater not processing this file',
    TEMPLATER_ERROR: 'Error processing template',
    NO_TEMPLATER_PLUGIN_PROCEED: 'No Templater plugin, proceeding immediately',
  },

  STORAGE_MESSAGES: {
    LOAD_ERROR: 'Error loading local user data',
    SAVE_ERROR: 'Error saving local user data',
    LOAD_SUCCESS: 'Loaded local user data',
    LOCAL_DATA_DIR: 'Local data directory',
  },

  FILE_SERVICE_MESSAGES: {
    UPDATE_MODIFIED_DATE: 'Updating modified date',
    MODIFIED_DATE_UPDATES_DISABLED: 'Modified date updates disabled',
    CREATED_DATE_UPDATES_DISABLED: 'Created date updates disabled',
    UPDATE_CREATED_DATE: 'Updating created date',
    UPDATE_MODIFIED_DATE_ERROR: 'Error updating modified date',
    UPDATE_CREATED_DATE_ERROR: 'Error updating created date',
  },
} as const;

export const DEFAULT_SETTINGS = {
  username: '',
  useGitUsername: false,
  updateDelay: PLUGIN_CONSTANTS.SETTINGS.DEFAULT_UPDATE_DELAY,
  dateFormat: PLUGIN_CONSTANTS.SETTINGS.DEFAULT_DATE_FORMAT,
  enableModified: true,
  enableCreated: true,
  enableUsername: false,
  excludedFolders: [],
  excludeTemplatesFolder: true,
  showNotifications: true,
  debug: false,
  checkAllOnStartup: false,
  promptForUsername: true,
} as const;
