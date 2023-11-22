import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electron', {
  // Expose loading files using specific file extension filters.
  loadFile: (filters) => ipcRenderer.invoke('loadFile', filters)
})
