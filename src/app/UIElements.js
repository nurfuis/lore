export class UIElements {
  constructor() {
    this.welcomeDiv = document.getElementById("welcome-message");
    this.information = document.getElementById("info");
    this.imagePreview = document.getElementById("image-preview");
    this.imageInput = document.getElementById("image-input");
    this.imageUpload = document.getElementById("image-file-upload");
    this.clearImageButton = document.getElementById("clear-image-button");
    this.saveEntryButton = document.getElementById("save-entry");
    this.templateSelect = document.getElementById("template-select");
    this.createTemplateButton = document.getElementById("create-template");
    this.deleteTemplateButton = document.getElementById("delete-template");
    this.createTemplateModal = document.getElementById("create-template-modal");
    this.addFieldButton = document.getElementById("add-field");
    this.templateFieldsContainer = document.getElementById("template-fields");
    this.saveTemplateButton = document.getElementById("save-template");
    this.entryForm = document.getElementById("entry-form");
    this.gameDataViewer = document.getElementById("game-data-viewer");
    this.detailsModal = document.getElementById("item-details-modal");
    this.closeModalButton = document.querySelector(".close-modal");
    this.spriteContainer = document.getElementById("item-details-sprite");
    this.createFormContainer = document.getElementById("create-form-container");
    this.createButton = document.getElementById("create-button");
    this.viewButton = document.getElementById("view-button");
    this.advancedOptions = document.getElementById("advanced-options");
    this.prototypeSelect = document.getElementById("prototype-select");
    this.settingsButton = document.getElementById("settings-button");
    this.settingsModal = document.getElementById("settings-modal");
    this.settingsForm = document.getElementById("settings-form");
    this.projectPathInput = document.getElementById("project-path");
    this.fileBrowserButton = document.getElementById("file-browser-button");
    this.clearForm = document.getElementById("clear-form");
  }


}
