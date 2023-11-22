import { BehaviorSubject } from "rxjs";

export class FileDialog {
  visible: BehaviorSubject<boolean>;

  constructor() {
    this.visible = new BehaviorSubject(false);
  }

  get insideElectron() {
    return typeof window.electron !== "undefined";
  }

  async selectViaElectron() {
    const filters = [{ name: "OWL", extensions: ["owl"] }];
    this.visible.next(true);
    const result = await window.electron.loadFile(filters);
    this.visible.next(false);
    return result
  }
}

export const fileDialog = new FileDialog();
