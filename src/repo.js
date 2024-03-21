// main
function getUserDataPath() {
  console.log("Reading user config file...");
  const configFile = root + "/config.json";
  console.log(configFile);
  let result;
  try {
    result = JSON.parse(fs.readFileSync(configFile, "utf-8"));
    console.log("Success");
  } catch (err) {
    console.error("Error loading config data:", err);
    console.log("Creating new config file...");
    result = { USER_PATH: root };
    console.log("initialize USER_PATH", result);

    fs.writeFile(configFile, JSON.stringify(result), (err) => {
      if (err) {
        console.error("Error saving config:", err);
      } else {
        console.log("Config saved.", result);
      }
    });
  }
  if (!result.USER_PATH) {
    console.log("FATAL ERROR ;(");
    app.quit();
  }
  currentDirectory = result.USER_PATH;
  return result.USER_PATH;
}
// main
ipcMain.handle("dialog-file-open", handleOpenDialog);

async function handleOpenDialog() {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ["openDirectory"],
  });
  if (!canceled) {
    console.log("dialog result", filePaths[0]);
    return filePaths[0];
  }
}
function updateCurrentDirectory(filePath) {
  currentDirectory = filePath;
  const configFile = root + "/config.json";
  const data = { USER_PATH: filePath };
  console.log("update USER_PATH", data);
  fs.writeFile(configFile, JSON.stringify(data), (err) => {
    if (err) {
      console.error("Error saving config:", err);
    } else {
      console.log("Config updated.", data);
    }
  });
}
// preloader
function openFileDialog() {
  const response = ipcRenderer.invoke("dialog-file-open");
  return response;
}