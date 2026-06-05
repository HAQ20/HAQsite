let intro = document.querySelector(".intro");
let userNameInput = document.getElementById("user-name");
let introSegment = document.getElementById("intro-segment");
window.onload = () => {
	if (intro) {
		intro.style.visibility = "hidden";
	}
}


userNameInput.addEventListener("change", () => {
    intro.classList.add("visible");
    intro.style.visibility = "visible";
    const confetti = document.createElement("img");
    confetti.src = "assets/confetti.gif";
    confetti.className = "confetti";
    document.body.appendChild(confetti);
    introSegment.textContent = `officialy internet friends or, haq${userNameInput.value} i guess, this is such a shitty joke`;
});