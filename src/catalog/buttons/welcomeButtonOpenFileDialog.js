export function welcomeButtonOpenFileDialog() {
  const buttonsWrapper = document.querySelectorAll(
    ".lore-welcome__buttons-wrapper"
  );

  const openFileDialogButton = document.createElement("button");

  openFileDialogButton.innerText = "Select";
  openFileDialogButton.classList.add("lore-welcome__button--browse");

  buttonsWrapper[0].appendChild(openFileDialogButton);

  const welcomeButtonBrowse = document.querySelectorAll(
    ".lore-welcome__button--browse"
  );

  welcomeButtonBrowse[0].addEventListener("click", async () => {
    const result = await catalogAPI.openFileDialog();

    console.log("Selected a directory", result);
  });
}
