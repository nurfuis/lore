import { themes } from '../settings/themes';
let currentTheme = 'earth';
export function toggleTheme(mainWindow) {
  if (currentTheme === 'earth') {
    currentTheme = 'fey';
  } else {
    currentTheme = 'earth';
  }
  // Update CSS variables based on current theme
  const script = `
  document.documentElement.style.setProperty('--primary-color', '${themes[currentTheme].primary}');
  document.documentElement.style.setProperty('--secondary-color', '${themes[currentTheme].secondary}');
  document.documentElement.style.setProperty('--background-color', '${themes[currentTheme].background}');
  document.documentElement.style.setProperty('--text-color', '${themes[currentTheme].text}');
  document.documentElement.style.setProperty('--button-color', '${themes[currentTheme].button}');
  document.documentElement.style.setProperty('--button-hover-color', '${themes[currentTheme].buttonHover}');
  document.documentElement.style.setProperty('--button-text-color', '${themes[currentTheme].buttonText}');
  document.documentElement.style.setProperty('--form-background', '${themes[currentTheme].formBackground}');
  document.documentElement.style.setProperty('--highlight-color', '${themes[currentTheme].highlight}');
`;
  mainWindow.webContents.executeJavaScript(script);
}
exports.toggleTheme = toggleTheme;
