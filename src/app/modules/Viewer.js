import { UIElements } from "../UIElements";
const uiElements = new UIElements();

function createDetailsButton(item, sprites) {
  const detailsButton = document.createElement("button");
  detailsButton.textContent = "Show Details";
  detailsButton.className = "lore-summary__details-button";
  detailsButton.addEventListener("click", () => {
    updateDetailsModal(item, sprites);
  });

  return detailsButton;
}
function updateDetailsModal(item, sprites) {
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
    const imageSource = window.electronAPI.getPathSpritesPreview(item.sprite);

    spriteImage.src = imageSource;
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
    electronAPI.saveLore(this.entryForm.loreLib); // Save the updated data

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
  createItem(item, sprites) {
    const listParentElement = document.createElement("li");
    listParentElement.classList.add("lore-summary");

    const listContentElement = document.createElement("div");
    listContentElement.classList.add("lore-summary__content");
    listParentElement.appendChild(listContentElement);

    let previewText = ""; // Empty string for text accumulation
    const nameKey = "name";
    const versionKey = "version";
    const descriptionKey = "description";

    const nameValue = item[nameKey];
    const versionValue = item[versionKey];
    const descriptionValue = item[descriptionKey];

    if (nameValue) {
      previewText += `Name: ${nameValue}\n`;
    }
    if (versionValue) {
      previewText += `Version: ${versionValue}\n`;
    }
    if (descriptionValue) {
      previewText += `Description: ${descriptionValue}\n`;
    }

    const entryItemPreview = document.createElement("p");
    entryItemPreview.classList.add("lore-summary__entry-text");
    entryItemPreview.textContent = previewText.trim();
    listContentElement.appendChild(entryItemPreview);

    if (item.sprite) {
      const entryImagePeviewElement = document.createElement("img");
      const imageSource = window.electronAPI.getPathSpritesPreview(item.sprite);
      entryImagePeviewElement.src = imageSource;
      entryImagePeviewElement.classList.add(
        "lore-summary__entry-image-preview"
      );

      const entryImagePreviewWrapper = document.createElement("div");
      entryImagePreviewWrapper.classList.add(
        "lore-summary__entry-image-preview-wrapper"
      );
      entryImagePreviewWrapper.appendChild(entryImagePeviewElement);
      listContentElement.appendChild(entryImagePreviewWrapper);
    }

    const detailsButton = createDetailsButton(item, sprites);
    listContentElement.appendChild(detailsButton);

    const deleteButton = this.createDeleteButton(item);
    listContentElement.appendChild(deleteButton);

    return listParentElement;
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
      const itemElement = this.createItem(
        this.entryForm.loreLib[type][key],
        this.sprites
      );
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
