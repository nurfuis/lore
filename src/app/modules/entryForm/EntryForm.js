import { UIElements } from "../../UIElements";
import { removeExtension } from "../../../main/utils/removeExtension";

export class EntryForm {
  constructor() {
    this.ui = new UIElements();
    this.spriteName = undefined;
    this.selectedTemplate = undefined;
    this.selectedEntry = undefined;

    const entryFormTemplateSelect = document.querySelectorAll(
      ".entry-form__template-select"
    );
    entryFormTemplateSelect[0].addEventListener("change", () => {
      const activeTemplate = entryFormTemplateSelect[0].value;

      this.selectedTemplate = activeTemplate; // TODO phase out this property

      this.updateForm();
      this.updatePrototypeDropdown();
    });

    const entryFormPrototypeSelect = document.querySelectorAll(
      ".entry-form__prototype-select"
    );
    entryFormPrototypeSelect[0].addEventListener("change", (event) => {
      this.handlePrototypeSelect(event);
    });

    const entryFormCommandButtonClear = document.querySelectorAll(
      ".entry-form__commands-button--clear"
    );
    entryFormCommandButtonClear[0].addEventListener("click", () => {
      const entryFormTemplateSelect = document.querySelectorAll(
        ".entry-form__template-select"
      );
      const entryFormPrototypeSelect = document.querySelectorAll(
        ".entry-form__prototype-select"
      );

      entryFormTemplateSelect[0].selectedIndex = 0;
      entryFormPrototypeSelect[0].selectedIndex = 0;
      this.updateForm();
    });

    const entryFormImageInput = document.querySelectorAll(
      ".entry-form__image--input"
    );
    entryFormImageInput[0].addEventListener("change", (event) => {
      this.updateImagePreview(event);
    });

    const entryFormImageClear = document.querySelectorAll(
      ".entry-form__image-button--clear"
    );
    entryFormImageClear[0].addEventListener("click", () => {
      this.clearImagePreview();
    });

    const entryFormSaveAll = document.querySelectorAll(
      ".entry-form__save-button"
    );
    entryFormSaveAll[0].addEventListener("click", () => {
      this.saveEntry();
      this.updatePrototypeDropdown();
    });
  }
  handlePrototypeSelect(event) {
    const selectedEntry = event.target.value;

    const entryFormTemplateSelect = document.querySelectorAll(
      ".entry-form__template-select"
    );
    const selectedTemplate = entryFormTemplateSelect[0].value;

    if (selectedTemplate) {
      for (const field in this.loreLib[selectedTemplate][selectedEntry]) {
        if (field == "sprite") {
          this.setPreview(this.loreLib[selectedTemplate][selectedEntry][field]);
          this.spriteName =
            this.loreLib[selectedTemplate][selectedEntry][field];
        } else if (field !== "valid" && field !== "version") {
          const element = document.querySelector(`[name=${field}]`);
          element.value = this.loreLib[selectedTemplate][selectedEntry][field];

          this.clearImagePreview();
        }
      }

      if (selectedEntry) {
        const entryFormGeneratePromptButton = document.querySelectorAll(
          ".entry-form__commands-button--generate-prompt"
        );
        entryFormGeneratePromptButton[0].style.display = "flex";
      } else {
        entryFormGeneratePromptButton[0].style.display = "none";
      }
    }
  }

  clearImagePreview() {
    const entryFormImagePreview = document.querySelectorAll(
      ".entry-form__image--preview"
    );
    entryFormImagePreview[0].src = "";
    entryFormImagePreview[0].style.display = "none";

    const entryFormImageInput = document.querySelectorAll(
      ".entry-form__image--input"
    );
    entryFormImageInput[0].value = "";

    this.spriteName = undefined;
  }

  setPreview(fileKey) {
    this.spriteName = fileKey;

    const imageSource = window.electronAPI.getPathSpritesPreview(fileKey);

    const entryFormImagePreview = document.querySelectorAll(
      ".entry-form__image--preview"
    );

    entryFormImagePreview[0].src = imageSource;

    entryFormImagePreview[0].style.display = "block";
  }

  async updateImagePreview(event) {
    const file = event.target.files[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      console.error("Please select an image file!");
      return;
    }

    this.spriteName = removeExtension(file.name);

    const pathToSource = electronAPI.saveImage(file.path);

    const entryFormImagePreview = document.querySelectorAll(
      ".entry-form__image--preview"
    );

    entryFormImagePreview[0].src = `${pathToSource}`;
    entryFormImagePreview[0].style.display = "block";

    console.log("save:lore-image", file.name);
  }

  updateForm() {
    this.clearImagePreview();

    const entryFormElement = document.querySelectorAll(
      ".entry-form__form-element"
    );
    entryFormElement[0].innerHTML = "";

    const entryFormSaveAll = document.querySelectorAll(
      ".entry-form__save-button"
    );

    const entryFormImageInput = document.querySelectorAll(".entry-form__image");

    const entryFormCommandButtonClear = document.querySelectorAll(
      ".entry-form__commands-button--clear"
    );

    // Add elements to show/hide
    const elementsToShow = [
      entryFormElement[0],
      entryFormSaveAll[0],
      entryFormImageInput[0],
      entryFormCommandButtonClear[0],
    ];

    const elementsToHide = [];

    const entryFormTemplateSelect = document.querySelectorAll(
      ".entry-form__template-select"
    );
    const selectedTemplate = entryFormTemplateSelect[0].value;

    if (!!selectedTemplate) {
      const templateFieldsResult =
        window.electronAPI.getInformationTemplateFields(selectedTemplate);

      // console.log(
      //   "Requested information:template-fields...",
      //   templateFieldsResult
      // );

      const templateFields = this.templateMaker.templates[selectedTemplate];

      for (const fieldName in templateFields) {
        const fieldData = templateFields[fieldName];

        const label = document.createElement("label");
        label.textContent = fieldData.label;

        const promptSpan = document.createElement("span");
        promptSpan.classList.add("prompt");

        promptSpan.textContent =
          fieldData.prompt ||
          this.prompts.templates[fieldName] ||
          fieldData.label;

        let inputElement;
        switch (fieldData.type) {
          case "text":
            inputElement = document.createElement("input");
            inputElement.type = "text";

            // Escape spaces in the field name for attribute safety
            inputElement.name = fieldName.replace(/\s/g, "_");
            break;
          case "textarea":
            inputElement = document.createElement("textarea");
            // Escape spaces in the field name for attribute safety
            inputElement.name = fieldName.replace(/\s/g, "_");
            break;
          case "select":
            inputElement = document.createElement("select");
            // Escape spaces in the field name for attribute safety
            inputElement.name = fieldName.replace(/\s/g, "_");
            for (const option of fieldData.options) {
              const optionElement = document.createElement("option");
              optionElement.text = option;
              optionElement.value = option;
              inputElement.appendChild(optionElement);
            }
            break;
        }

        // assemble the elements
        const br = document.createElement("br");
        entryFormElement[0].appendChild(label);
        entryFormElement[0].appendChild(promptSpan);
        entryFormElement[0].appendChild(inputElement);
        entryFormElement[0].appendChild(br);
      }
      elementsToShow.forEach((element) => (element.style.display = "block")); // Show elements
      elementsToHide.forEach((element) => (element.style.display = "none")); // Show elements
    } else {
      elementsToShow.forEach((element) => (element.style.display = "none")); // Hide elements
      elementsToHide.forEach((element) => (element.style.display = "block")); // Hide elements
    }
  }

  saveEntry() {
    // Create a new entry object from form values
    const newEntry = {};
    newEntry["valid"] = true;

    const entryFormElement = document.querySelectorAll(
      ".entry-form__form-element"
    );

    const formData = new FormData(entryFormElement[0]);
    for (const [key, value] of formData.entries()) {
      newEntry[key] = value;
    }

    const entryFormImageInput = document.querySelectorAll(
      ".entry-form__image--input"
    );

    if (!!entryFormImageInput[0].value) {
      const filePath = removeExtension(entryFormImageInput[0].value);
      const parts = filePath.split(/[\\/]/);

      newEntry["sprite"] = parts[parts.length - 1];
      // console.log(parts[parts.length - 1]);
    }

    // Get the appropriate key based on the template
    const entryFormTemplateSelect = document.querySelectorAll(
      ".entry-form__template-select"
    );
    entryFormTemplateSelect[0].value;
    const templateKey = entryFormTemplateSelect[0].value;

    const entryKey = newEntry.name;

    // write an api call to check if the entry exists
    const result = window.electronAPI.getInformationLoreEntry({
      templateKey,
      entryKey,
    });

    if (result?.valid) {
      console.log("An entry with that name already exists...");
      if (result["version"]) {
        const version = result["version"] + 1;
        newEntry["version"] = version;
        // console.log("Incriment entry version by +1");
      }
    } else {
      newEntry["version"] = 1;
      console.log("New entry, setting version to", newEntry["version"]);
    }

    if (entryKey) {
      // Add the new entry to the gameData object under the corresponding key
      this.loreLib[templateKey][entryKey] = newEntry;

      // electronAPI.saveLore(this.loreLib);

      // Update the UI or perform any other actions after saving (optional)
      this.ui.information.innerText = `Entry "${newEntry.name}" type: ${templateKey} saved successfully!`;
      // this.updateForm();
    } else {
      console.log("NO NAME IS SET!");
    }
  }

  enablePrototypeDropdown() {
    try {
      // Check if options are available within the dropdown
      if (this.ui.prototypeSelect.options.length > 1) {
        this.ui.prototypeSelect.disabled = false; // Enable the dropdown
      } else {
        // Handle case where no prototypes are available (optional)
        console.info("No prototypes available for this template.");
        this.ui.prototypeSelect.disabled = true; // Keep the dropdown disabled
      }
    } catch (error) {
      // Handle potential errors (optional)
      console.error("Error enabling prototype dropdown:", error);
      this.ui.prototypeSelect.disabled = true; // Keep the dropdown disabled on error
    }
  }

  updatePrototypeDropdown() {
    this.ui.prototypeSelect.innerHTML = ""; // Clear existing options
    // this.selectedEntry = undefined; // TODO Reason where this should happen
    this.ui.generatePromptButton.style.display = "none";

    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.text = "-- Select Entry (Optional) --";
    this.ui.prototypeSelect.appendChild(defaultOption);

    // Call your renderer to get prototype names based on the selected template
    // console.log(
    //   'this.selectedTemplate',
    //   Object.keys(this.loreLib),
    //   this.selectedTemplate
    // );

    if (this.selectedTemplate) {
      const prototypeNames = Object.keys(this.loreLib[this.selectedTemplate]);
      if (prototypeNames) {
        // Sort the prototype names alphabetically
        prototypeNames.sort();

        // Create options from sorted names
        prototypeNames.forEach((prototypeName) => {
          const option = document.createElement("option");
          option.value = prototypeName;
          option.text = prototypeName;
          this.ui.prototypeSelect.appendChild(option);
        });

        this.enablePrototypeDropdown(); // Enable the dropdown if prototypes are available
      } else {
        // Handle case where no prototypes exist for the chosen template
        console.info("No prototypes available for this template.");
      }
    }
  }
}
