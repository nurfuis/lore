import "./index.css";
import { EntryForm } from "./catalog/modules/entryForm/EntryForm";
import { TemplateMaker } from "./catalog/modules/templateMaker/TemplateMaker";
import { Viewer } from "./catalog/modules/viewer/Viewer";

// CATALOG //
import { welcomeButtonStartLoreCatalog } from "./catalog/buttons/welcomeButtonStartLoreCatalog";
import { onLoadLoreCatalog } from "./catalog/events/onLoadLoreCatalog"; // This is used

import { intitCloseModalButton } from "./renderer/intitCloseModalButton";
import {onSetPath } from "./catalog/events/onSetPath" // This is used

const entryForm = new EntryForm();
const templateMaker = new TemplateMaker();
const viewer = new Viewer();

// Start
welcomeButtonStartLoreCatalog();

// Modal
intitCloseModalButton();

//* FUNCS *//
export function toggleView(showCreateForm) {
  if (showCreateForm) {
    templateMaker.updateTemplateMakerDropdownOptions();
  } else {
    viewer.renderGameData();
  }




}
