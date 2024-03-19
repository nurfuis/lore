import { UIElements } from "../UIElements";
import { Image } from "./Image";
const uiElements = new UIElements();
const image = new Image();

function createDetailsButton(item) {
  const detailsButton = document.createElement("button");
  detailsButton.textContent = "Show Details";
  detailsButton.className = "lore-summary__details-button";

  detailsButton.addEventListener("click", () => {
    updateDetailsModal(item);
  });

  return detailsButton;
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
    spriteImage.src = image.get(item.sprite);
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

export class Viewer {
  constructor() {
    window.addEventListener("click", function (event) {
      if (event.target === uiElements.detailsModal) {
        uiElements.detailsModal.style.display = "none";
      }
    });
  }

  deleteConfirmed(itemToDelete, type) {
    delete this.entryForm.loreLib[type][itemToDelete.name];
    window.electronAPI.saveLore(this.entryForm.loreLib); // Save the updated data

    // Update UI (optional)
    uiElements.information.innerText = `Entry "${itemToDelete.name}" deleted successfully!`;
    this.renderGameData();
  }

  deleteEntry(itemToDelete) {
    const type = Object.keys(this.entryForm.loreLib).find((key) =>
      this.entryForm.loreLib[key].hasOwnProperty(itemToDelete.name)
    );
    if (type) {
      const confirmationModal = document.getElementById("confirmation-modal");
      confirmationModal.style.display = "block"; // Show the modal

      const confirmDeleteButton = document.getElementById("confirm-delete");
      confirmDeleteButton.addEventListener("click", () => {
        this.deleteConfirmed(itemToDelete, type); // Call function to delete after confirmation
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
  createItemsContainer() {
    const itemsContainer = document.createElement("ul");
    itemsContainer.classList.add("game-data-items");
    itemsContainer.classList.add("category-content");
    return itemsContainer;
  }
  createDeleteButton(item) {
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.className = "lore-summary__delete-entry-button";

    deleteButton.addEventListener("click", () => {
      this.deleteEntry(item);
    });

    return deleteButton;
  }
  // WE ARE HERE
  createItem(item) {
    const itemElement = document.createElement("li");
    itemElement.classList.add("lore-summary"); 
    
    
    // <grid-area-name></grid-area-name>


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

    const itemPreview = document.createElement("p");
    itemPreview.classList.add("item-preview-text"); // Add a class for styling
    itemPreview.textContent = previewText.trim(); // Trim trailing newline
    itemElement.appendChild(itemPreview);

    if (item.sprite) {
      const previewElement = document.createElement("img");
      previewElement.src = image.get(item.sprite);
      previewElement.classList.add("item-preview");
      itemElement.appendChild(previewElement);
    }

    const detailsButton = createDetailsButton(item);
    itemElement.appendChild(detailsButton);

    const deleteButton = this.createDeleteButton(item);
    itemElement.appendChild(deleteButton);

    return itemElement;
  }
  createCard(type) {
    const card = document.createElement("div");
    card.classList.add("category-card");

    const sectionHeader = this.createCardHeader(type, card);
    card.appendChild(sectionHeader);

    const itemsContainer = this.createItemsContainer();
    card.appendChild(itemsContainer);

    // Alphabetize the keys in this.entryForm.loreLib[type]
    const sortedKeys = Object.keys(this.entryForm.loreLib[type]).sort();

    // Create cards for items in alphabetical order
    sortedKeys.forEach((key) => {
      const itemElement = this.createItem(this.entryForm.loreLib[type][key]);
      itemsContainer.appendChild(itemElement);
    });

    return card;
  }

  createCardHeader(type, card) {
    const sectionHeader = document.createElement("h2");
    sectionHeader.textContent = `${type} (${
      Object.keys(this.entryForm.loreLib[type]).length
    })`; // Add key count
    sectionHeader.classList.add("category-header");

    sectionHeader.addEventListener("click", () => {
      card.classList.toggle("expanded"); /* Add or remove expanded class */
    });

    return sectionHeader;
  }

  renderGameData() {
    uiElements.gameDataViewer.innerHTML = ""; // Clear any existing content

    for (const type in this.entryForm.loreLib) {
      // Check if the type has any keys (properties)
      if (Object.keys(this.entryForm.loreLib[type]).length > 0) {
        const card = this.createCard(type); // Delegate card creation only if keys exist
        uiElements.gameDataViewer.appendChild(card);
      }
    }
  }
}
