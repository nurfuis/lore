import "./index.css";
import { UIElements } from "./app/UIElements";

//* LIBRARY DATA *//
const loreData = window.loreData;
let loreLib = loreData.getLore();

//* TEMPLATE DATA * //
const templateData = window.templateData;
let templates = templateData.getMaps();

//* STATE VARIABLES *//
let spriteName;
let selectedTemplate;
const existingTemplateNames = new Set();
let selectedEntry;
let isCreatingTemplate;
//* ELEMENTS *//
const uiElements = new UIElements();

function getImage(filename) {
  const imageData = imageRequest.getImage(filename);
  const base64Data = btoa(String.fromCharCode.apply(null, imageData)); // Convert Uint8Array to base64
  return `data:image/png;base64,${base64Data}`; // src
}

function setPreview(filename) {
  const imageSrc = getImage(filename);
  uiElements.imagePreview.src = `${imageSrc}`;
  uiElements.imagePreview.style.display = "block";
  spriteName = filename;
}

function saveImageAndUpdatePreview(imageFile) {
  window.electronAPI.saveImage(imageFile.path);

  setTimeout(() => {
    const imageSrc = getImage(imageFile.name);
    // console.log(imageSrc)
    uiElements.imagePreview.src = `${imageSrc}`;
    uiElements.imagePreview.style.display = "block";

    spriteName = imageFile.name;
  }, 200);
}

const clearImagePreview = () => {
  uiElements.imagePreview.src = "";
  uiElements.imagePreview.style.display = "none";
  uiElements.imageInput.value = "";
  spriteName = undefined;
};

function saveEntry() {
  // Create a new entry object from form values
  const newEntry = {};
  newEntry["valid"] = true;

  const formData = new FormData(uiElements.entryForm);
  for (const [key, value] of formData.entries()) {
    newEntry[key] = value;
  }

  // spriteName is set above when an image is added or cleared from the form
  if (spriteName) {
    newEntry["sprite"] = spriteName;
  }

  // Get the appropriate key based on the template
  const entryType = uiElements.templateSelect.value; // Assuming the value matches the template type

  // define the new entry index
  const entryKey = newEntry.name;

  if (loreLib[entryType][entryKey]) {
    if (!loreLib[entryType][entryKey]["version"]) {
      newEntry["version"] = 1;
    } else if (loreLib[entryType][entryKey]["version"]) {
      const version = loreLib[entryType][entryKey]["version"] + 1;
      newEntry["version"] = version;
    }
  } else {
    newEntry["version"] = 1;
  }

  if (entryKey) {
    // Add the new entry to the gameData object under the corresponding key
    loreLib[entryType][entryKey] = newEntry;

    window.electronAPI.saveLore(loreLib);

    // Update the UI or perform any other actions after saving (optional)
    uiElements.information.innerText = `Entry "${newEntry.name}" type: ${entryType} saved successfully!`;
    renderGameData(loreLib);
    updateForm();
  }
}

function openCreateTemplateModal() {
  uiElements.createTemplateModal.style.display = "block";
  uiElements.templateFieldsContainer.innerHTML = "";

  isCreatingTemplate = true;
  // TODO updateTemplateDropdown()

  // Focus on the first input field for accessibility
  const nameInput = document.getElementById("template-name");
  if (nameInput) {
    // FOCUS FIELD
    nameInput.focus();
  }
}

function createNewField() {
  const newField = document.createElement("div");
  newField.classList.add("template-field");

  const fieldNameLabel = document.createElement("label");
  fieldNameLabel.textContent = "Field Name:";
  newField.appendChild(fieldNameLabel);

  const fieldNameInput = document.createElement("input");
  fieldNameInput.type = "text";
  fieldNameInput.name = "field-name";
  fieldNameInput.required = true;
  newField.appendChild(fieldNameInput);

  const fieldTypeSelect = document.createElement("select");
  fieldTypeSelect.name = "field-type";
  newField.appendChild(fieldTypeSelect);

  const fieldPromptLabel = document.createElement("label");
  fieldPromptLabel.textContent = "Field Prompt:";
  newField.appendChild(fieldPromptLabel);

  const fieldPrompt = document.createElement("input"); // Placeholder for the prompt
  fieldPrompt.classList.add("field-prompt"); // Add a class for styling
  fieldPrompt.name = "field-prompt";
  newField.appendChild(fieldPrompt);

  const fieldTypes = ["text", "textarea", "select"];
  fieldTypes.forEach((type) => {
    const option = document.createElement("option");
    option.value = type;
    option.textContent = type;
    fieldTypeSelect.appendChild(option);
  });

  const fieldOptionsContainer = document.createElement("div");
  fieldOptionsContainer.classList.add("field-options");
  newField.appendChild(fieldOptionsContainer);

  // Add a "Remove Field" button
  const removeFieldButton = document.createElement("button");
  removeFieldButton.textContent = "Remove Field";
  removeFieldButton.classList.add("remove-field-button"); // Add a class for styling
  removeFieldButton.addEventListener("click", function () {
    const fieldToRemove = this.parentElement; // Get the field element containing this button
    uiElements.templateFieldsContainer.removeChild(fieldToRemove);
  });
  newField.appendChild(removeFieldButton);

  // Add "Insert Field" button
  const insertFieldButton = document.createElement("button");
  insertFieldButton.textContent = "Insert Field";
  insertFieldButton.classList.add("insert-field-button");
  insertFieldButton.addEventListener("click", function () {
    const newField = createNewField(); // Create a new field
    uiElements.templateFieldsContainer.insertBefore(
      newField,
      this.parentElement.nextSibling
    ); // Insert it after this field
  });

  newField.appendChild(insertFieldButton);

  const hr = document.createElement("hr");
  newField.appendChild(hr);
  return newField;
}

function removeOptionInput(fieldOptionsContainer) {
  const existingOptions =
    fieldOptionsContainer.querySelectorAll("input[type='text']");
  if (existingOptions.length > 0) {
    const lastOption = existingOptions[existingOptions.length - 1];
    fieldOptionsContainer.removeChild(lastOption);
  } else {
    // Handle case where there are no options to remove (optional: display message)
  }
}

function addOptionInput(fieldOptionsContainer) {
  const optionInput = document.createElement("input");
  optionInput.type = "text";
  optionInput.placeholder = "Enter Option Value";
  optionInput.classList.add("option-input"); // Add the class

  fieldOptionsContainer.appendChild(optionInput);
}

function handleFieldTypeChange(fieldTypeSelect, fieldOptionsContainer) {
  fieldTypeSelect.addEventListener("change", function () {
    const selectedType = this.value;
    fieldOptionsContainer.innerHTML = ""; // Clear existing options

    if (selectedType === "select") {
      // Create a new div for option buttons
      const optionButtonContainer = document.createElement("div");
      optionButtonContainer.classList.add("option-button-container"); // Add a class for styling

      const addOptionButton = document.createElement("button");
      addOptionButton.textContent = "Add Option";
      addOptionButton.addEventListener("click", function () {
        addOptionInput(fieldOptionsContainer); // Call function to add option input
      });
      optionButtonContainer.appendChild(addOptionButton);

      const removeOptionButton = document.createElement("button");
      removeOptionButton.textContent = "Remove Option";
      removeOptionButton.addEventListener("click", function () {
        removeOptionInput(fieldOptionsContainer); // Call function to remove option input
      });
      optionButtonContainer.appendChild(removeOptionButton);

      // Append the button container to the options container
      fieldOptionsContainer.appendChild(optionButtonContainer);
    } else {
      // Remove the button container if it exists (optional)
      const existingButtonContainer = fieldOptionsContainer.querySelector(
        ".option-button-container"
      );
      if (existingButtonContainer) {
        fieldOptionsContainer.removeChild(existingButtonContainer);
      }
    }

    fieldOptionsContainer.style.display =
      selectedType === "select" ? "block" : "none";
  });
}

function createTemplate() {
  const templateFieldsContainer = document.getElementById("template-fields");
  const templateName = document.getElementById("template-name").value;

  function processTemplate() {
    const fields = {}; // Initialize an empty object for fields
    // 3. Parse fields from modal (iterate through generated fields)
    const fieldElements =
      templateFieldsContainer.querySelectorAll(".template-field");
    fieldElements.forEach((fieldElement) => {
      const fieldNameInput = fieldElement.querySelector(
        "input[name='field-name']"
      );
      const fieldTypeSelect = fieldElement.querySelector(
        "select[name='field-type']"
      );
      const fieldTypePrompt = fieldElement.querySelector(
        "input[name='field-prompt']"
      );

      const options = []; // Initialize an empty options array for select fields

      // Handle options for select type only
      if (fieldTypeSelect.value === "select") {
        const optionInputs = fieldElement.querySelectorAll(
          ".field-options input"
        ); // Select all option input fields within the field
        optionInputs.forEach((optionInput) => {
          if (optionInput.value) {
            options.push(optionInput.value); // Add option value if present
          }
        });
      }
      if (options.length > 0) {
        fields[fieldNameInput.value] = {
          // Use field name as key in the fields object
          label: fieldNameInput.value, // Set label to same as field name (optional, can be customized)
          type: fieldTypeSelect.value,
          options: options, // Include options if it's a select field
          prompt: fieldTypePrompt.value,
        };
      } else {
        fields[fieldNameInput.value] = {
          // Use field name as key in the fields object
          label: fieldNameInput.value, // Set label to same as field name (optional, can be customized)
          type: fieldTypeSelect.value,
          prompt: fieldTypePrompt.value,
        };
      }
    });

    // 4. Add fields to the templateData object
    templates[templateName] = fields;
    // TODO  PREVENT OVERWRITE?!
    // add a catagory to the library for the new template
    if (!loreLib[templateName]) {
      loreLib[templateName] = {};
    } else {
      console.log(
        "do something about items when getting their template changed"
      );
    }

    window.electronAPI.saveTemplates(templates); // Save updated gameData
    window.electronAPI.saveLore(loreLib); // Save updated gameData

    // 5. Close the modal
    const createTemplateModal = document.getElementById(
      "create-template-modal"
    );
    createTemplateModal.style.display = "none";
    // 6. (Optional) Update template options in templateSelect (implementation depends on your logic)
    updateOptions();
    updateForm();
    console.log("Template created:", templateName); // Log for confirmation
  }

  if (uiElements.templateDropdown.value) {
    console.log(uiElements.templateDropdown.value);
  } else {
    if (templateName) {
      processTemplate();
    }
  }
}

function updateOptions() {
  if (templates) {
    const availableTemplates = Object.keys(templates);

    // Filter out existing templates and append only new ones
    availableTemplates
      .filter((templateName) => !existingTemplateNames.has(templateName))
      .forEach((templateName) => {
        const entryOption = document.createElement("option");
        entryOption.value = templateName;
        entryOption.text = templateName;
        uiElements.templateSelect.appendChild(entryOption);

        const templateOption = document.createElement("option");
        templateOption.value = templateName;
        templateOption.text = templateName;
        uiElements.templateDropdown.appendChild(templateOption);

        existingTemplateNames.add(templateName); // Add new template to the set
      });
  }
}

function removeTemplateEntry(templateName) {
  // 1. Remove from the set
  existingTemplateNames.delete(templateName);

  // 2. Remove from the dropdown
  const templateOption = uiElements.templateSelect.querySelector(
    `option[value="${templateName}"]`
  );
  if (templateOption) {
    uiElements.templateSelect.removeChild(templateOption);
  }
  // 3. If no templates remain, select none
  if (uiElements.templateSelect.options.length === 0) {
    selectedTemplate = undefined; // Reset selected template
  }

  // 4. Remove from the template creator dropdown
  const createTemplateOption = uiElements.templateDropdown.querySelector(
    `option[value="${templateName}"]`
  );
  if (createTemplateOption) {
    uiElements.templateDropdown.removeChild(createTemplateOption);
  }
  // 5. If no templates remain, select none
  if (uiElements.templateDropdown.options.length === 0) {
    selectedTemplate = undefined; // Reset selected template
  }
}

function deleteTemplate(templateName) {
  // 1. Confirm deletion with the user
  if (!templateName) return;
  if (
    !confirm(
      `Are you sure you want to delete the template "${templateName}"? This action cannot be undone.`
    )
  ) {
    return; // Exit function if user cancels
  }

  // 2. Remove template data from loreLib
  delete templates[templateName];

  // Keep the orphans
  // delete loreLib[templateName];

  // 3. Save updated gameData
  try {
    window.electronAPI.saveTemplates(templates);
    console.log(`Template "${templateName}" deleted successfully.`);
  } catch (error) {
    console.error(`Failed to delete template: ${error.message}`);
    // Add user-friendly error handling (e.g., display an error message)
  }
  // 4. (Optional) Update template options in templateSelect (implementation depends on your logic)
  removeTemplateEntry(templateName);
  uiElements.deleteTemplateButton.style.display = "none";

  updateForm();
  updateOptions();
  uiElements.createTemplateModal.style.display = "none";
}

function updateForm() {
  const selectedTemplate = uiElements.templateSelect.value;

  // Clear existing form elements
  clearImagePreview();
  uiElements.entryForm.innerHTML = "";

  // Add elements to show/hide
  const elementsToShow = [
    uiElements.entryForm,
    uiElements.saveEntryButton,
    uiElements.imageUpload,
    uiElements.clearForm,
    uiElements.generatePromptButton,
  ];

  const elementsToHide = [];

  if (selectedTemplate) {
    const templateFields = templates[selectedTemplate];

    // Build form elements based on template data
    for (const fieldName in templateFields) {
      const fieldData = templateFields[fieldName];

      const label = document.createElement("label");
      label.textContent = fieldData.label;

      const promptSpan = document.createElement("span");
      promptSpan.classList.add("prompt");
      promptSpan.textContent = fieldData.prompt || fieldData.label;

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

      const br = document.createElement("br");
      uiElements.entryForm.appendChild(label);
      uiElements.entryForm.appendChild(promptSpan);

      uiElements.entryForm.appendChild(inputElement);
      uiElements.entryForm.appendChild(br);
    }
    elementsToShow.forEach((element) => (element.style.display = "block")); // Show elements
    elementsToHide.forEach((element) => (element.style.display = "none")); // Show elements
  } else {
    elementsToShow.forEach((element) => (element.style.display = "none")); // Hide elements
    elementsToHide.forEach((element) => (element.style.display = "block")); // Hide elements
  }
}

function deleteConfirmed(itemToDelete, type) {
  delete loreLib[type][itemToDelete.name];
  window.electronAPI.saveLore(loreLib); // Save the updated data
  // Update UI (optional)
  uiElements.information.innerText = `Entry "${itemToDelete.name}" deleted successfully!`;
  renderGameData(loreLib);
}

function deleteEntry(itemToDelete) {
  const type = Object.keys(loreLib).find((key) =>
    loreLib[key].hasOwnProperty(itemToDelete.name)
  );
  if (type) {
    const confirmationModal = document.getElementById("confirmation-modal");
    confirmationModal.style.display = "block"; // Show the modal

    const confirmDeleteButton = document.getElementById("confirm-delete");
    confirmDeleteButton.addEventListener("click", () => {
      deleteConfirmed(itemToDelete, type); // Call function to delete after confirmation
      confirmationModal.style.display = "none"; // Hide the modal
    });

    const cancelDeleteButton = document.getElementById("cancel-delete");
    cancelDeleteButton.addEventListener("click", () => {
      confirmationModal.style.display = "none"; // Hide the modal on cancel
    });
  } else {
    console.error("Error: Entry not found in gameData");
  }
}

function createCard(type) {
  const card = document.createElement("div");
  card.classList.add("category-card");

  const sectionHeader = createCardHeader(type, card);
  card.appendChild(sectionHeader);

  const itemsContainer = createItemsContainer();
  card.appendChild(itemsContainer);

  // Alphabetize the keys in loreLib[type]
  const sortedKeys = Object.keys(loreLib[type]).sort();

  // Create cards for items in alphabetical order
  sortedKeys.forEach((key) => {
    const itemElement = createItem(loreLib[type][key]);
    itemsContainer.appendChild(itemElement);
  });

  return card;
}

function createCardHeader(type, card) {
  const sectionHeader = document.createElement("h2");
  sectionHeader.textContent = `${type} (${Object.keys(loreLib[type]).length})`; // Add key count
  sectionHeader.classList.add("category-header");

  sectionHeader.addEventListener("click", () => {
    card.classList.toggle("expanded"); /* Add or remove expanded class */
  });

  return sectionHeader;
}

function createItemsContainer() {
  const itemsContainer = document.createElement("ul");
  itemsContainer.classList.add("game-data-items");
  itemsContainer.classList.add("category-content");
  return itemsContainer;
}

function createItem(item) {
  const itemElement = document.createElement("li");

  let previewText = ""; // Empty string for text accumulation

  // Get the name and version keys (assuming they exist)
  const nameKey = "name"; // Adjust if the name key has a different name
  const versionKey = "version"; // Adjust if the version key has a different name
  const descriptionKey = "description";

  const nameValue = item[nameKey];
  const versionValue = item[versionKey];
  const descriptionValue = item[descriptionKey];

  // Add name and version (if they exist) with newline
  if (nameValue) {
    previewText += `Name: ${nameValue}\n`;
  }
  if (versionValue) {
    previewText += `Version: ${versionValue}\n`;
  }
  if (descriptionValue) {
    previewText += `Description: ${descriptionValue}\n`;
  }
  // Get the 3rd and 4th keys (assuming indexing starts from 0)
  // const thirdKey = Object.keys(item)[2];
  // const fourthKey = Object.keys(item)[3];

  // // Add 3rd and 4th key-value pairs with newline
  // if (thirdKey) {
  //   previewText += `${thirdKey}: ${item[thirdKey]}\n`;
  // }
  // if (fourthKey) {
  //   previewText += `${fourthKey}: ${item[fourthKey]}\n`;
  // }

  const itemPreview = document.createElement("p");
  itemPreview.classList.add("item-preview-text"); // Add a class for styling
  itemPreview.textContent = previewText.trim(); // Trim trailing newline
  itemElement.appendChild(itemPreview);

  if (item.sprite) {
    const previewElement = document.createElement("img");
    previewElement.src = getImage(item.sprite);
    previewElement.classList.add("item-preview");
    itemElement.appendChild(previewElement);
  }

  const detailsButton = createDetailsButton(item);
  itemElement.appendChild(detailsButton);

  const deleteButton = createDeleteButton(item);
  itemElement.appendChild(deleteButton);

  return itemElement;
}

function createDetailsButton(item) {
  const detailsButton = document.createElement("button");
  detailsButton.textContent = "Show Details";
  detailsButton.className = "details-button";

  detailsButton.addEventListener("click", () => {
    updateDetailsModal(item);
  });

  return detailsButton;
}

function createDeleteButton(item) {
  const deleteButton = document.createElement("button");
  deleteButton.textContent = "Delete";
  deleteButton.className = "delete-button";

  deleteButton.addEventListener("click", () => {
    deleteEntry(item);
  });

  return deleteButton;
}

function updateDetailsModal(item) {
  document.getElementById("item-details-name").textContent = item.name;
  document.getElementById("item-details-description").textContent =
    item.description || "No description available";

  const detailsList = createEntryList(item);

  const existingEntries = document.getElementById(
    "item-details-description"
  ).nextElementSibling;
  if (existingEntries && existingEntries.tagName === "UL") {
    existingEntries.remove();
    uiElements.spriteContainer.innerHTML = ""; // Clear any existing sprite
  }
  if (item.sprite) {
    uiElements.spriteContainer.innerHTML = ""; // Clear any existing sprite

    const spriteImage = document.createElement("img");
    spriteImage.src = getImage(item.sprite);
    spriteImage.alt = "Item Sprite";
    uiElements.spriteContainer.appendChild(spriteImage);
  }

  document
    .getElementById("item-details-description")
    .parentElement.appendChild(detailsList);

  uiElements.detailsModal.style.display = "block"; // Show the modal
}

function createEntryList(item) {
  const detailsList = document.createElement("ul");
  for (const entry in item) {
    const entryItem = document.createElement("li");
    entryItem.textContent = `${entry}: ${item[entry]}`; // Combine entry name and value
    detailsList.appendChild(entryItem);
  }
  return detailsList;
}

function renderGameData() {
  uiElements.gameDataViewer.innerHTML = ""; // Clear any existing content

  for (const type in loreLib) {
    // Check if the type has any keys (properties)
    if (Object.keys(loreLib[type]).length > 0) {
      const card = createCard(type); // Delegate card creation only if keys exist
      uiElements.gameDataViewer.appendChild(card);
    }
  }
}

function toggleView(showCreateForm) {
  uiElements.welcomeDiv.style.display = "none"; // Hide welcome message on button click
  clearImagePreview();

  uiElements.createFormContainer.style.display = showCreateForm
    ? "block"
    : "none";
  uiElements.gameDataViewer.style.display = showCreateForm ? "none" : "block";
  renderGameData(loreLib);
  updatePrototypeDropdown();
}

function enablePrototypeDropdown() {
  try {
    // Check if options are available within the dropdown
    if (uiElements.prototypeSelect.options.length > 1) {
      uiElements.prototypeSelect.disabled = false; // Enable the dropdown
    } else {
      // Handle case where no prototypes are available (optional)
      console.info("No prototypes available for this template.");
      uiElements.prototypeSelect.disabled = true; // Keep the dropdown disabled
    }
  } catch (error) {
    // Handle potential errors (optional)
    console.error("Error enabling prototype dropdown:", error);
    uiElements.prototypeSelect.disabled = true; // Keep the dropdown disabled on error
  }
}

function updatePrototypeDropdown() {
  uiElements.prototypeSelect.innerHTML = ""; // Clear existing options

  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.text = "-- Select Prototype (Optional) --";
  uiElements.prototypeSelect.appendChild(defaultOption);

  // Call your renderer to get prototype names based on the selected template
  if (selectedTemplate) {
    const prototypeNames = Object.keys(loreLib[selectedTemplate]);
    if (prototypeNames) {
      // Sort the prototype names alphabetically
      prototypeNames.sort();

      // Create options from sorted names
      prototypeNames.forEach((prototypeName) => {
        const option = document.createElement("option");
        option.value = prototypeName;
        option.text = prototypeName;
        uiElements.prototypeSelect.appendChild(option);
      });

      enablePrototypeDropdown(); // Enable the dropdown if prototypes are available
    } else {
      // Handle case where no prototypes exist for the chosen template
      console.info("No prototypes available for this template.");
    }
  }
}

function toggleSettingsModal() {
  uiElements.settingsModal.style.display = "block";
}

function updateLibrary() {
  loreLib = loreData.getLore();
  templates = templateData.getMaps();

  updateOptions();
  updateForm();
  renderGameData();
}

async function checkLoreLibrary() {
  uiElements.settingsModal.style.display = "none";
  console.log(Object.keys(loreLib).length);
  const tries = 999;
  for (let i = 0; i < tries; i++) {
    loreLib = loreData.getLore();
    console.log(Object.keys(loreLib).length);
    if (Object.keys(loreLib).length > 0) {
      uiElements.welcomeDiv.innerText = "Select an option to begin...";
      uiElements.createButton.style.display = "";
      uiElements.viewButton.style.display = "";
      uiElements.createTemplateButton.style.display = "";
      uiElements.settingsButton.style.display = "none";
      updateLibrary();
      break; // Exit the loop once loreLib is populated
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}
//* EVENTS *//
uiElements.clearImageButton.addEventListener("click", () => {
  clearImagePreview();
});

uiElements.imageInput.addEventListener("change", (event) => {
  const selectedFile = event.target.files[0];
  // Check if a file was selected
  if (!selectedFile) {
    return;
  }
  // Validate file type (optional)
  if (!selectedFile.type.startsWith("image/")) {
    // Handle non-image files (optional)
    console.error("Please select an image file!");
    return;
  }
  // Proceed with saving the image (implementation details omitted)
  saveImageAndUpdatePreview(selectedFile);
});

uiElements.saveEntryButton.addEventListener("click", () => {
  saveEntry();
  updatePrototypeDropdown();
});

uiElements.createTemplateButton.addEventListener(
  "click",
  openCreateTemplateModal
);

window.addEventListener("click", function (event) {
  if (event.target === uiElements.createTemplateModal) {
    uiElements.createTemplateModal.style.display = "none";
    isCreatingTemplate = false;
  }
});

function addFieldEvent() {
  const newField = createNewField();
  const fieldTypeSelect = newField.querySelector("select[name='field-type']");

  const fieldOptionsContainer = newField.querySelector(".field-options");

  handleFieldTypeChange(fieldTypeSelect, fieldOptionsContainer);
  const inputToFocus = newField.querySelector("input"); // Directly target the input element
  uiElements.templateFieldsContainer.appendChild(newField);
  inputToFocus.focus();
}

uiElements.addFieldButton.addEventListener("click", function () {
  addFieldEvent();
});
document.addEventListener("keydown", function (event) {
  if (event.key === "Tab" && isCreatingTemplate) {
    event.preventDefault(); // Prevent default Alt+Tab behavior
    addFieldEvent();
  }
});
uiElements.saveTemplateButton.addEventListener("click", createTemplate);

uiElements.templateSelect.addEventListener("change", () => {
  console.log("change in template selector on entry page");
  if (!selectedTemplate) {
    selectedTemplate = uiElements.templateSelect.value;
    updateForm();
    updatePrototypeDropdown();
  } else if (selectedTemplate != uiElements.templateSelect.value) {
    selectedTemplate = uiElements.templateSelect.value;
    updateForm();
    updatePrototypeDropdown();
  }
});

uiElements.deleteTemplateButton.addEventListener("click", function () {
  deleteTemplate(selectedTemplate);
});

window.addEventListener("click", function (event) {
  if (event.target === uiElements.detailsModal) {
    uiElements.detailsModal.style.display = "none";
  }
});

uiElements.closeModalButton.addEventListener("click", function () {
  uiElements.detailsModal.style.display = "none"; // Double-check for typos
  // Optional: Log click confirmation
  console.log("Modal closed");
});
uiElements.createButton.addEventListener("click", () => toggleView(true));

uiElements.viewButton.addEventListener("click", () => toggleView(false));

uiElements.prototypeSelect.addEventListener("change", (event) => {
  selectedEntry = event.target.value;

  for (const field in loreLib[selectedTemplate][selectedEntry]) {
    if (field == "sprite") {
      // console.log(loreLib[selectedTemplate][selectedEntry][field]);
      setPreview(loreLib[selectedTemplate][selectedEntry][field]);
    } else if (field !== "valid" && field !== "version") {
      const element = document.querySelector(`[name=${field}]`);
      element.value = loreLib[selectedTemplate][selectedEntry][field];

      console.log(loreLib[selectedTemplate][selectedEntry][field]);

      clearImagePreview();
    }
  }
});

uiElements.advancedOptions.addEventListener("click", () => {
  const deleteButton = uiElements.deleteTemplateButton;

  if (deleteButton.style.display === "block") {
    deleteButton.style.display = "none";
  } else {
    deleteButton.style.display = "block";
  }
});

uiElements.settingsButton.addEventListener("click", () =>
  toggleSettingsModal()
);

window.addEventListener("click", function (event) {
  if (event.target === uiElements.settingsModal) {
    uiElements.settingsModal.style.display = "none";
  }
});

uiElements.fileBrowserButton.addEventListener("click", () => {
  window.electronAPI.openFileDialog();
  checkLoreLibrary();
});

uiElements.clearForm.addEventListener("click", () => {
  updateForm();
});

uiElements.templateDropdown.addEventListener("change", (event) => {
  selectedTemplate = uiElements.templateDropdown.value;
  const templateData = templates[selectedTemplate];
  const formContainer = uiElements.templateFieldsContainer;
  // console.log(formContainer);
  formContainer.innerHTML = "";
  function appendTemplateFields(templateData, formContainer) {
    // Iterate through the template data
    for (const fieldName in templateData) {
      const fieldData = templateData[fieldName];
      // console.log("fieldData", fieldData);

      const newField = createNewField();
      const fieldInput = newField.querySelector("input");
      fieldInput.value = fieldData.label;

      const fieldTypeSelect = newField.querySelector(
        "select[name='field-type']"
      );
      const fieldOptionsContainer = newField.querySelector(".field-options");

      fieldTypeSelect.value = fieldData.type;

      handleFieldTypeChange(fieldTypeSelect, fieldOptionsContainer);

      if (fieldData.type == "select" && fieldData.options != undefined) {
        console.log(fieldData.type);
        for (let i = 0; i < fieldData.options.length; i++) {
          const optionInput = document.createElement("input");
          optionInput.type = "text";
          optionInput.value = fieldData.options[i];
          optionInput.classList.add("option-input"); // Add the class

          fieldOptionsContainer.appendChild(optionInput);
        }
        const optionButtonContainer = document.createElement("div");
        optionButtonContainer.classList.add("option-button-container"); // Add a class for styling

        const addOptionButton = document.createElement("button");
        addOptionButton.textContent = "Add Option";
        addOptionButton.addEventListener("click", function () {
          addOptionInput(fieldOptionsContainer); // Call function to add option input
        });
        optionButtonContainer.appendChild(addOptionButton);

        const removeOptionButton = document.createElement("button");
        removeOptionButton.textContent = "Remove Option";
        removeOptionButton.addEventListener("click", function () {
          removeOptionInput(fieldOptionsContainer); // Call function to remove option input
        });
        optionButtonContainer.appendChild(removeOptionButton);

        // Append the button container to the options container
        fieldOptionsContainer.appendChild(optionButtonContainer);
      }

      uiElements.templateFieldsContainer.appendChild(newField);
    }
  }
  appendTemplateFields(templateData, formContainer);
});

uiElements.generatePromptButton.addEventListener("click", () => {
  function generatePrompt() {
    const promptText = document.getElementById("promptText");

    let promptString = "";

    if (selectedEntry !== undefined) {
      promptString += `Please fill in the missing details for a lore library entry in the ${selectedTemplate} category. You can expand or adjust details to create a more convincing lore while preserving the main details provided.; `;

      for (const field in loreLib[selectedTemplate][selectedEntry]) {
        if (field !== "valid" && field !== "version" && field != "sprite") {
          const fieldValue = loreLib[selectedTemplate][selectedEntry][field];
          const fieldPromptTemplate = promptTemplates[field];
          console.log(fieldValue);
          if (!fieldValue) {
            promptString += fieldPromptTemplate
              ? fieldPromptTemplate
              : `**Provide details for the ${field} field** ;`;
          } else {
            promptString += `Based on the existing ${field}: ${fieldValue}; `;
          }
        }
      }
    } else {
      promptString = "Please select a lore entry to generate a prompt for.";
    }

    promptText.textContent = promptString;
    promptModal.style.display = "block"; // Open the modal after updating prompt
  }
  generatePrompt();
});

//* ON LOAD *//
uiElements.welcomeDiv.style.display = "block";

toggleSettingsModal();
uiElements.createButton.style.display = "none";
uiElements.viewButton.style.display = "none";
uiElements.createTemplateButton.style.display = "none";

const promptModal = document.getElementById("promptModal");

// Get the button that opens the modal

// Get the <span> element that closes the modal
const closeSpan = document.getElementsByClassName("close")[0];

// When the user clicks on the button, open the modal
uiElements.generatePromptButton.addEventListener("click", function () {
  promptModal.style.display = "block";
});

// When the user clicks on <span> (x), close the modal
closeSpan.addEventListener("click", function () {
  promptModal.style.display = "none";
});

// When the user clicks outside of the modal, close it
window.addEventListener("click", function (event) {
  if (event.target === promptModal) {
    promptModal.style.display = "none";
  }
});

function fillTemplate(template, data) {
  let filledTemplate = template;
  for (const key in data) {
    filledTemplate = filledTemplate.replace(
      new RegExp(`{{${key}}}`, "g"),
      data[key]
    );
  }
  return filledTemplate;
}

const copyPromptButton = document.getElementById("copyPromptButton");

function copyPromptText() {
  const promptText = document.getElementById("promptText");
  const selection = window.getSelection();
  const range = document.createRange();
  range.selectNodeContents(promptText);
  selection.removeAllRanges();
  selection.addRange(range);
  navigator.clipboard
    .writeText(promptText.textContent)
    .then(() => {
      console.log("Prompt copied successfully!"); // Optional success message
    })
    .catch(() => {
      console.error("Failed to copy prompt!"); // Optional error message
    });
  selection.removeAllRanges();
}
copyPromptButton.addEventListener("click", copyPromptText);

const UNIVERSE = "earth based lore ";
const FACTIONS = "";

const promptTemplates = {
  location:
    "Location: What are some challenges faced by explorers in the " +
    UNIVERSE +
    " region? ; ",
  appearance:
    "Appearance: What would this look like in the land of " + UNIVERSE + "? ; ",
  name:
    "Name: Utilize a naming convention that reflects the lore of the " +
    UNIVERSE +
    " universe.; ",

  alias: "Alias:Provide a nickname or alternative name.; ",

  description:
    "Description: Capture the essence of the location through details. Describe the overall scale; ",

  terrain:
    "Terrain: Detail the landscape features: mountains, plains, deserts, etc.; ",

  atmosphere:
    "Atmosphere: Describe the composition and pressure of the atmosphere.; ",

  climate:
    "Climate: Outline the average temperature range and weather patterns.; ",

  flora_and_faune:
    "Flora and Fauna: Describe the plant and animal life, if any.; ",

  settlements:
    "Settlements: Consider factors like population size, architectural style, and social structures.; ",

  history:
    "History: Include details on its founding, inhabitants, and any historical conflicts or advancements.; ",

  cultural_practices:
    "Cultural Practices: Describe the customs, traditions, and beliefs of the inhabitants.; ",

  mythology:
    "Mythology: Describe the prevalent myths and legends surrounding the location or its inhabitants.; ",

  architecture:
    "Architecture: Describe the typical building style used in settlements.; ",

  resources:
    "Resources: Specify the valuable resources found in the location.; ",

  time_of_day:
    "Time of Day: Decide if a specific time of day is relevant for the location's purpose or mood.; ",

  weather_conditions:
    "Weather Conditions: Describe the prevailing weather patterns or typical weather for the location.; ",

  sensory_details:
    "Sensory Details: Engage the reader's senses through evocative descriptions. ",

  mood: "Mood: Describe the overall feeling or atmosphere evoked by the location.; ",

  factions:
    "Factions: List any dominant factions or groups that hold power within the location.; ",

  characters:
    "Characters: Consider the types of characters that might inhabit or visit the location.; ",

  events:
    "Events: Consider both historical events and potential future developments.; ",

  notes:
    "Notes: Use this section to include any additional details or ideas that don't fit into the other categories.; ",
};
