import { removeExtension } from "../../../main/utils/removeExtension";

export class EntryForm {
  constructor() {
    // TEMPLATE SELECTOR
    const entryFormTemplateSelect = document.querySelectorAll(
      ".entry-form__template-select"
    );
    entryFormTemplateSelect[0].addEventListener("change", () => {
      const activeTemplate = entryFormTemplateSelect[0].value;

      this.updateForm();
      this.updatePrototypeDropdown();
    });

    // PROTOTYPE SELECTOR
    const entryFormPrototypeSelect = document.querySelectorAll(
      ".entry-form__prototype-select"
    );
    entryFormPrototypeSelect[0].addEventListener("change", (event) => {
      this.handlePrototypeSelect(event);
    });

    // CLEAR FORM
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
      this.resetPrototypeDropdown();
    });

    // IMAGE INPUT
    const entryFormImageInput = document.querySelectorAll(
      ".entry-form__image--input"
    );
    entryFormImageInput[0].addEventListener("change", (event) => {
      this.updateImagePreview(event);
    });

    // IMAGE CLEAR
    const entryFormImageClear = document.querySelectorAll(
      ".entry-form__image-button--clear"
    );
    entryFormImageClear[0].addEventListener("click", () => {
      this.clearImagePreview();
    });

    // SAVE ENTRY
    const entryFormSaveAll = document.querySelectorAll(
      ".entry-form__save-button"
    );
    entryFormSaveAll[0].addEventListener("click", () => {
      this.saveEntry();
      this.updatePrototypeDropdown();
    });
  }

  handlePrototypeSelect(event) {
    // avtive entry
    const selectedEntry = event.target.value;

    // active template
    const entryFormTemplateSelect = document.querySelectorAll(
      ".entry-form__template-select"
    );
    const selectedTemplate = entryFormTemplateSelect[0].value;

    // fill out the form with the selected entry
    if (selectedTemplate) {
      let hasSprite = false;

      for (const field in this.loreLib[selectedTemplate][selectedEntry]) {
        if (field === "sprite") {
          hasSprite = true;
          this.setPreview(this.loreLib[selectedTemplate][selectedEntry][field]);
        } else if (field !== "valid" && field !== "version") {
          const element = document.querySelector(`[name=${field}]`);
          element.value = this.loreLib[selectedTemplate][selectedEntry][field];
        }
      }

      if (!hasSprite) {
        this.clearImagePreview();
      }

      const entryFormGeneratePromptButton = document.querySelectorAll(
        ".entry-form__commands-button--generate-prompt"
      );
      if (!!selectedEntry) {
        entryFormGeneratePromptButton[0].style.display = "flex";
      } else {
        entryFormGeneratePromptButton[0].style.display = "none";
        this.updateForm();
      }
    }
  }

  enablePrototypeDropdown() {
    try {
      const entryFormPrototypeSelect = document.querySelectorAll(
        ".entry-form__prototype-select"
      );
      if (entryFormPrototypeSelect[0].options.length > 1) {
        entryFormPrototypeSelect[0].disabled = false;
      } else {
        console.info("No prototypes available for this template.");
        entryFormPrototypeSelect[0].disabled = true;
      }
    } catch (error) {
      console.error("Error enabling prototype dropdown:", error);
      entryFormPrototypeSelect[0].disabled = true;
    }
  }

  resetPrototypeDropdown() {
    const entryFormPrototypeSelect = document.querySelectorAll(
      ".entry-form__prototype-select"
    );
    entryFormPrototypeSelect[0].selectedIndex = 0;
    entryFormPrototypeSelect[0].innerHTML = "";

    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.text = "-- Select Entry (Optional) --";
    entryFormPrototypeSelect[0].appendChild(defaultOption);
    entryFormPrototypeSelect[0].disabled = true;
  }

  updatePrototypeDropdown() {
    const entryFormPrototypeSelect = document.querySelectorAll(
      ".entry-form__prototype-select"
    );

    entryFormPrototypeSelect[0].selectedIndex = 0;
    entryFormPrototypeSelect[0].innerHTML = "";

    const entryFormGeneratePromptButton = document.querySelectorAll(
      ".entry-form__commands-button--generate-prompt"
    );

    entryFormGeneratePromptButton[0].style.display = "none";

    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.text = "-- Select Entry (Optional) --";
    entryFormPrototypeSelect[0].appendChild(defaultOption);

    const entryFormTemplateSelect = document.querySelectorAll(
      ".entry-form__template-select"
    );
    const selectedTemplate = entryFormTemplateSelect[0].value;
    if (selectedTemplate) {
      const prototypeNames = Object.keys(this.loreLib[selectedTemplate]);
      if (prototypeNames) {
        // Sort the prototype names alphabetically
        prototypeNames.sort();

        // Create options from sorted names
        prototypeNames.forEach((prototypeName) => {
          const option = document.createElement("option");
          option.value = prototypeName;
          option.text = prototypeName;
          entryFormPrototypeSelect[0].appendChild(option);
        });



        this.enablePrototypeDropdown(); 
      } else {
        // Handle case where no prototypes exist for the chosen template
        console.info("No prototypes available for this template.");
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
  }

  setPreview(fileKey) {
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

      console.log(
        "Requested information:template-fields...",
        templateFieldsResult
      );

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
      this.resetPrototypeDropdown();
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

    const entryKey = newEntry?.name;

    const loreEntry = window.electronAPI.getInformationLoreEntry({
      templateKey,
      entryKey,
    });

    if (entryKey && !loreEntry) {
      if (loreEntry?.valid) {
        if (loreEntry["version"]) {
          const version = loreEntry["version"] + 1;
          newEntry["version"] = version;
        }
      } else {
        newEntry["version"] = 1;
        console.log("New entry:", newEntry["version"]);
      }

      window.electronAPI.saveInformationLoreEntry({ templateKey, newEntry });

      this.loreLib[templateKey][entryKey] = newEntry; // depreciated - will be removed soon

      const informationToast = document.querySelectorAll(
        ".lore-app__information"
      );
      informationToast[0].innerText = `Entry "${newEntry.name}" type: ${templateKey} saved successfully!`;
      this.updateForm();

      console.log(
        "No entry exists under this name, saving data without issues"
      );
    } else if (!loreEntry && !entryKey) {
      console.log("No entry exists, but the new entry lacks a name");
    } else if (loreEntry && entryKey) {
      console.log("An entry already exists under this name.");
    }
  }
}
