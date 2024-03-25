export function welcomeButtonStartLoreCatalog() {
  const buttonsWrapper = document.querySelectorAll(".lore-welcome__buttons-wrapper");
  const startButton = document.createElement("button");
  startButton.innerText = "Start";
  startButton.classList.add("lore-welcome__button--start");
  buttonsWrapper[0].appendChild(startButton);

  const welcomeButtonStart = document.querySelectorAll(
    ".lore-welcome__button--start"
  );
  welcomeButtonStart[0].addEventListener("click", () => {
    const isLoaded = loreAPI.loadCatalog();
    console.log("Catalog is loaded...", isLoaded);
  });
}
