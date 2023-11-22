import path from "path";
import fs from "fs";
import url from "url";

import { dialog, ipcMain, app, BrowserWindow } from "electron";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
  * Create the electron window and launch the app by loading the HTML file.
  */
function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 990,
    height: 600,
    resizable: true,
    webPreferences: {
      // Expose some Electron APIs through preload.js.
      preload: path.join(__dirname, "preload.mjs"),
      contextIsolation: true,
      nodeIntegration: true,
    },
  });

  mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  mainWindow.webContents.openDevTools();
}

/**
 * Let the user choose a file, read it and return its name and content.
 */
async function loadFile(filters) {
  const properties = ['openFile'];
  const result = await dialog.showOpenDialog({ filters, properties });

  if (result.canceled) {
    return;
  }

  const path = result.filePaths[0];
  const file = await fs.promises.readFile(path);
  return [path, file];
}

/**
  * Wait for electro initialization, then create the window.
  */
app.whenReady().then(() => {
  createWindow();

  // Mac stuff.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  })

  ipcMain.handle("loadFile", (_event, filters) => loadFile(filters));
});

/**
  * Terminate electron when the last window closes.
  */
app.on('window-all-closed', () => {

  // Mac stuff.
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

