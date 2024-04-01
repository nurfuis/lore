import { welcomeButtonStartLoreCatalog } from "./buttons/welcomeButtonStartLoreCatalog";
import { EntryForm } from "./modules/entryForm/EntryForm";
import { TemplateMaker } from "./modules/templateMaker/TemplateMaker";
import { Viewer } from "./modules/viewer/Viewer";
import { onLoadLoreCatalog } from "./events/onLoadLoreCatalog"; // This is used
import { onSetPath } from "./events/onSetPath"; // This is used
import { welcomeButtonOpenFileDialog } from "./buttons/welcomeButtonOpenFileDialog";
export class RendererCatalog {
  constructor() {
    this.entryForm = new EntryForm();
    this.templateMaker = new TemplateMaker();
    this.viewer = new Viewer();
    welcomeButtonOpenFileDialog();
    welcomeButtonStartLoreCatalog();
  }
}
