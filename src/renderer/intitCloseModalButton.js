export function intitCloseModalButton() {
  const modal = document.querySelectorAll(".modal");
  const modalButtonClose = document.querySelectorAll(".modal_button--close");
  for (let i = 0; i < modalButtonClose.length; i++) {
    modalButtonClose[i].addEventListener("click", function () {
      modal[i].style.display = "none";
    });
  }
}
