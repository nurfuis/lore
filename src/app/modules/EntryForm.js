import { UIElements } from "../UIElements";
import { Image } from "./Image";
import { removeExtension } from "../utils/removeExtension";
export class EntryForm {
  constructor() {
    this.image = new Image();
    this.ui = new UIElements();
    this.spriteName = undefined;
    this.selectedTemplate = undefined;
    this.selectedEntry = undefined;

    this.ui.imageInput.addEventListener("change", (event) => {
      this.updateImagePreview(event);
    });

    this.ui.clearImageButton.addEventListener("click", () => {
      this.clearImagePreview();
    });

    this.ui.templateSelect.addEventListener("change", () => {
      if (!this.selectedTemplate) {
        this.selectedTemplate = this.ui.templateSelect.value;
        this.updateForm();
        this.updatePrototypeDropdown();
      } else if (this.selectedTemplate != this.ui.templateSelect.value) {
        this.selectedTemplate = this.ui.templateSelect.value;
        this.updateForm();
        this.updatePrototypeDropdown();
      }
    });

    this.ui.saveEntryButton.addEventListener("click", () => {
      this.saveEntry();
      this.updatePrototypeDropdown();
    });

    this.ui.clearForm.addEventListener("click", () => {
      this.updateForm();
    });

    this.ui.prototypeSelect.addEventListener("change", (event) => {
      this.selectedEntry = event.target.value;
    //   console.log(this.selectedEntry);
      if (this.selectedEntry) {
        this.ui.generatePromptButton.style.display = "flex";
      } else {
        this.ui.generatePromptButton.style.display = "none";
      }

      for (const field in this.loreLib[this.selectedTemplate][
        this.selectedEntry
      ]) {
        if (field == "sprite") {
          this.setPreview(
            this.loreLib[this.selectedTemplate][this.selectedEntry][field]
          );
          this.spriteName =
            this.loreLib[this.selectedTemplate][this.selectedEntry][field];
        } else if (field !== "valid" && field !== "version") {
          const element = document.querySelector(`[name=${field}]`);
          element.value =
            this.loreLib[this.selectedTemplate][this.selectedEntry][field];

          this.clearImagePreview();
        }
      }
    });
  }
  clearImagePreview() {
    this.ui.imagePreview.src = "";
    this.ui.imagePreview.style.display = "none";
    this.ui.imageInput.value = "";
    this.spriteName = undefined;
  }
  setPreview(filename) {
    const fileIndex = removeExtension(filename);

    const imageSrc = this.image.get(fileIndex);
    this.ui.imagePreview.src = `${imageSrc}`;
    this.ui.imagePreview.style.display = "block";

    this.spriteName = filename;
  }
  updateImagePreview(event) {
    const file = event.target.files[0];
    if (!file) {
      return;
    }
    if (!file.type.startsWith("image/")) {
      console.error("Please select an image file!");
      return;
    }
    this.image.save(file);

    setTimeout(() => {
      this.setPreview(file.name);
    }, 200);
  }
  updateForm() {
    this.templates = electronAPI.getTemplates();
    // Clear existing form elements
    this.clearImagePreview();
    this.ui.entryForm.innerHTML = "";

    // Add elements to show/hide
    const elementsToShow = [
      this.ui.entryForm,
      this.ui.saveEntryButton,
      this.ui.imageUpload,
      this.ui.clearForm,
    ];
    const elementsToHide = [];

    if (this.selectedTemplate) {

      const templateFields = this.templateMaker.templates[this.selectedTemplate];

      // Build form elements based on template data
      for (const fieldName in templateFields) {
        // console.log("entry form key", fieldName);

        const fieldData = templateFields[fieldName];
        // console.log("entry form data", fieldData);

        const label = document.createElement("label");
        label.textContent = fieldData.label;

        const promptSpan = document.createElement("span");
        promptSpan.classList.add("prompt");
        // TODO add an extra fallback from the prompts
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
        this.ui.entryForm.appendChild(label);
        this.ui.entryForm.appendChild(promptSpan);
        this.ui.entryForm.appendChild(inputElement);
        this.ui.entryForm.appendChild(br);
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

    const formData = new FormData(this.ui.entryForm);
    for (const [key, value] of formData.entries()) {
      newEntry[key] = value;
    }

    // spriteName is set above when an image is added or cleared from the form
    if (this.spriteName) {
      newEntry["sprite"] = this.spriteName;
    }

    // Get the appropriate key based on the template
    const entryType = this.ui.templateSelect.value; // Assuming the value matches the template type

    // define the new entry index
    const entryKey = newEntry.name;

    if (this.loreLib[entryType][entryKey]) {
      if (!this.loreLib[entryType][entryKey]["version"]) {
        newEntry["version"] = 1;
      } else if (this.loreLib[entryType][entryKey]["version"]) {
        const version = this.loreLib[entryType][entryKey]["version"] + 1;
        newEntry["version"] = version;
      }
    } else {
      newEntry["version"] = 1;
    }

    if (entryKey) {
      // Add the new entry to the gameData object under the corresponding key
      this.loreLib[entryType][entryKey] = newEntry;

      electronAPI.saveLore(this.loreLib);

      // Update the UI or perform any other actions after saving (optional)
      this.ui.information.innerText = `Entry "${newEntry.name}" type: ${entryType} saved successfully!`;
      this.updateForm();
    } else {
        console.log(newEntry, entryKey)
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
    console.log('this.selectedTemplate', Object.keys(this.loreLib), this.selectedTemplate)

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
