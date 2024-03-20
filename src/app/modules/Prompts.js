import { UIElements } from "../UIElements";
import { promptTemplates } from "../promptTemplates";

// function fillTemplate(template, data) {
//   let filledTemplate = template;
//   for (const key in data) {
//     filledTemplate = filledTemplate.replace(
//       new RegExp(`{{${key}}}`, "g"),
//       data[key]
//     );
//   }
//   return filledTemplate;
// }

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
  promptModal.style.display = "none";
}

export class Prompts {
  constructor() {
    this.ui = new UIElements();
    this.templates = promptTemplates;
    const promptModal = document.getElementById("promptModal");
    const copyPromptButton = document.getElementById("copyPromptButton");

    copyPromptButton.addEventListener("click", copyPromptText);

    this.ui.generatePromptButton.addEventListener("click", () => {
      this.generatePrompt();
      promptModal.style.display = "block";
    });

    window.addEventListener("click", function (event) {
      if (event.target === promptModal) {
        promptModal.style.display = "none";
      }
    });
  }
  generatePrompt() {
    const promptText = document.getElementById("promptText");
    const selectedTemplate = this.entryForm.selectedTemplate;
    const selectedEntry = this.entryForm.selectedEntry;
    const loreLib = this.entryForm.loreLib;

    let promptString = "";
    if (selectedEntry != undefined) {
      promptString += `Please fill in the missing details for a lore library entry in the ${selectedTemplate} category. You can expand or adjust details to create a more convincing lore while preserving the main details provided.; `;

      // iterate over the entry fields
      for (const key in loreLib[selectedTemplate][selectedEntry]) {
        if (key !== "valid" && key !== "version" && key != "sprite") {
          // get field name
          const fieldValue = loreLib[selectedTemplate][selectedEntry][key];
          // console.log("prompt key", key);
          // console.log(
          //   "prompt data",
          //   this.entryForm.templates[selectedTemplate][key]
          // );

          // Check for user provided prompt
          const providedPrompt =
            this.entryForm.templates[selectedTemplate][key].prompt;
          const hasUserProvidedPrompt = !!providedPrompt;

          // get detailed prompt from presets
          const fieldPromptTemplate = promptTemplates[key];

          if (!fieldValue) {
            // field was empty
            if (hasUserProvidedPrompt) {
              promptString += providedPrompt;
            } else if (fieldPromptTemplate) {
              promptString += `${key}: ${fieldPromptTemplate} ; `;
            } else {
              promptString += `**Provide details for the ${key} field** ; `;
            }
          } else {
            // field was filled in
            promptString += `Based on the existing ${key}: ${fieldValue}; `;
          }
        }
      }
    } else {
      promptString = "Please select a lore entry to generate a prompt for.";
    }

    promptText.textContent = promptString;
    promptModal.style.display = "block"; // Open the modal after updating prompt
  }
}
