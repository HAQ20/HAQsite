const menu_button = document.querySelector(".menu_button");
const menu = document.querySelector(".menu");
let isOpen = false;

menu.addEventListener("click", () => {
    if (!isOpen) {
        menu.classList.add("open");
        menu_button.classList.add("clicked");
    } else {
        menu.classList.remove("open");
        menu_button.classList.remove("clicked");
    }
    isOpen = !isOpen;
});