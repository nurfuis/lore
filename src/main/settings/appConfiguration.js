const APP_ICON = "/data/assets/lore-library-icon-ai-1.png";
exports.APP_ICON = APP_ICON;
const DEV = "development";
exports.DEV = DEV;
const DIST = "distribution";
exports.DIST = DIST;
const DEFAULT_WINDOW_OPTIONS = {
    width: 900,
    height: 600,
    icon: APP_ICON,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  };
exports.DEFAULT_WINDOW_OPTIONS = DEFAULT_WINDOW_OPTIONS;  