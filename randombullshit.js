let intro = document.querySelector(".intro");
let userNameInput = document.getElementById("user-name");
let introSegment = document.getElementById("intro-segment");

const introSessionKey = "intro-name";
const introSeenKey = "intro-seen";

function showIntro(userName, animate = false) {
    if (!intro || !introSegment) {
        return;
    }

    if (animate) {
        intro.classList.add("visible");
    } else {
        intro.classList.remove("visible");
    }

    intro.style.visibility = "visible";
    introSegment.textContent = `officialy internet friends or, haq${userName} i guess, this is such a shitty joke`;
}

function hideIntro() {
    if (!intro) {
        return;
    }

    intro.classList.remove("visible");
    intro.style.visibility = "hidden";
}

window.onload = () => {
	const savedName = sessionStorage.getItem(introSessionKey);

	if (savedName !== null) {
		userNameInput.value = savedName;
        sessionStorage.setItem(introSeenKey, "true");
        showIntro(savedName, false);
		return;
	}

	hideIntro();
}


userNameInput.addEventListener("change", () => {
    const userName = userNameInput.value;

    sessionStorage.setItem(introSessionKey, userName);

    if (!userName) {
        sessionStorage.removeItem(introSessionKey);
        hideIntro();
        introSegment.textContent = "";
        return;
    }

    const shouldAnimate = !sessionStorage.getItem(introSeenKey);

    sessionStorage.setItem(introSeenKey, "true");
    showIntro(userName, shouldAnimate);

    const confetti = document.createElement("img");
    confetti.src = "assets/confetti.gif";
    confetti.className = "confetti";
    document.body.appendChild(confetti);
});