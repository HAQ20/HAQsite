const albumSelect = document.getElementById("album-select");
const discDisplay = document.getElementById("disc-display");
const songDisplay = document.getElementById("song-display");
const playerSteps = document.querySelectorAll(".player_step");
const discButtons = playerSteps[1].querySelectorAll(".step_button");
const selectedSide = document.querySelectorAll('input[name="side"]');
const songButtons = playerSteps[3].querySelectorAll(".step_button");
const pause_play = document.querySelector(".step_button--pause");
const vinylDisplay = document.querySelector(".vinyl_display");
const coverContainer = document.querySelector(".cover") || vinylDisplay;
const volumeBar = document.getElementById("volume");

const discBackButton = discButtons[0];
const discNextButton = discButtons[1];
const songBackButton = songButtons[0];
const songNextButton = songButtons[2];
const audioPlayer = new Audio();
audioPlayer.preload = "none";

function syncVolume() {
    audioPlayer.volume = Number(volumeBar.value);
}

const coverImageFront = document.createElement("img");
const coverImageBack = document.createElement("img");
coverImageFront.className = "album_cover front";
coverImageBack.className = "album_cover back";
coverImageFront.alt = "Album cover (front)";
coverImageBack.alt = "Album cover (back)";
coverImageFront.addEventListener("contextmenu", event => event.preventDefault());
coverImageBack.addEventListener("contextmenu", event => event.preventDefault());
coverContainer.appendChild(coverImageFront);
coverContainer.appendChild(coverImageBack);

const vinylImage = document.createElement("img");
vinylImage.className = "vinyl_image";
vinylImage.alt = "Vinyl image";
vinylDisplay.appendChild(vinylImage);

const state = {
    music: null,
    albumIndex: 0,
    discIndex: 0,
    songIndex: 0,
    side: 0,
    playing: false,
};

// Getters

function getCurrentAlbum() {
    return state.music?.albums?.[state.albumIndex] ?? null;
}

function getCurrentDisc() {
    return getCurrentAlbum()?.discs?.[state.discIndex] ?? null;
}

function getCurrentSide() {
    return getCurrentDisc()?.sides?.[state.side] ?? null;
}

function getCurrentSong() {
    return getCurrentSide()?.songs?.[state.songIndex] ?? null;
}

function getSongSource(song) {
    return song.url || song.mp3 || "";
}

function getVinylStill() {
    const side = getCurrentSide();
    return side?.png || side?.gif || "";
}

function getVinylAnimated() {
    const side = getCurrentSide();
    return side?.gif || side?.png || "";
}



// Rendering

function renderVinyl() {
    const source = state.playing ? getVinylAnimated() : getVinylStill();

    if (!source) {
        vinylImage.removeAttribute("src");
        vinylImage.alt = "Vinyl image unavailable";
        return;
    }

    vinylImage.src = source;
    vinylImage.alt = state.playing ? "Spinning vinyl" : "Vinyl cover";

    renderAlbumCover();
}
 
function renderAlbumCover() {
    const album = getCurrentAlbum();

    function setImageSimple(imgElem, base) {
        imgElem.src = base + ".png"
    }

    const frontBase = album.cover_1;
    const backBase = album.cover_2;

    setImageSimple(coverImageFront, frontBase);
    setImageSimple(coverImageBack, backBase);
}

async function loadMusic() {
    try {
        const response = await fetch("music.json");

        if (!response.ok) {
            throw new Error(`Failed to load music.json (${response.status})`);
        }
        state.music = await response.json();
        renderAlbumOptions();
        renderDiscs();
        renderSongs();
    } catch (error) {
        console.error(error);
        discDisplay.textContent = "Load failed";
        songDisplay.textContent = "";
    }
}

function renderAlbumOptions() {
    const albums = state.music?.albums ?? [];
    albumSelect.innerHTML = "";

    albums.forEach((album, index) => {
        const option = document.createElement("option");
        option.value = String(index);
        option.textContent = album.title;
        albumSelect.appendChild(option);
    });
    albumSelect.value = String(state.albumIndex);
}


function renderDiscs(){
    discDisplay.textContent = getCurrentDisc()?.title ?? "";
}

function renderSongs(){
    const currentSong = getCurrentSong();

    syncVolume();

    songDisplay.textContent = currentSong?.title ?? "";

    if (!currentSong) {
        audioPlayer.pause();
        audioPlayer.removeAttribute("src");
        audioPlayer.load();
        state.playing = false;
        pause_play.textContent = "Play";
        renderVinyl();
        return;
    }

    const songSource = getSongSource(currentSong);

    if (!songSource) {
        audioPlayer.pause();
        audioPlayer.removeAttribute("src");
        audioPlayer.load();
        state.playing = false;
        pause_play.textContent = "Play";
        renderVinyl();
        return;
    }

    if (audioPlayer.src !== songSource) {
        audioPlayer.src = songSource;
        audioPlayer.load();
    }

    syncVolume();

    if (state.playing) {
        audioPlayer.play().catch((error) => {
            console.error(error);
            state.playing = false;
            pause_play.textContent = "Play";
            renderVinyl();
        });
    } else {
        pause_play.textContent = "Play";
    }

    renderVinyl();
}

// Event listeners

albumSelect.addEventListener("change", () => {
    state.albumIndex = Number(albumSelect.value);
    state.discIndex = 0;
    state.songIndex = 0;
    state.side = 0;
    renderDiscs();
    renderSongs();
    renderVinyl();
});

selectedSide.forEach((radio) => {
    radio.addEventListener("change", (event) => {
        state.side = Number(event.target.value);
        state.songIndex = 0;
        renderVinyl();
        renderSongs();
    });
});



function getMaxSongIndex() {
    return getCurrentSide()?.songs?.length ? getCurrentSide().songs.length - 1 : 0;
}

discNextButton.addEventListener("click", () =>{
    const maxDiscIndex = getCurrentAlbum()?.discs?.length ? getCurrentAlbum().discs.length - 1 : 0;
    if (state.discIndex < maxDiscIndex) {
        state.discIndex++;
        state.songIndex = 0;
        renderDiscs();
        renderSongs();
        renderVinyl();
    }
});
discBackButton.addEventListener("click", () =>{
    if (state.discIndex > 0) {
        state.discIndex--;
        state.songIndex = 0;
        renderDiscs();
        renderSongs();
        renderVinyl();
    }
});

songNextButton.addEventListener("click", () => {
    const maxSongIndex = getMaxSongIndex();

    if (state.songIndex < maxSongIndex) {
        state.songIndex++;
        renderSongs();
    }
});

songBackButton.addEventListener("click", () => {
    if (state.songIndex > 0) {
        state.songIndex--;
        renderSongs();
    }
});

pause_play.addEventListener("click", () => {
    const currentSong = getCurrentSong();

    if (!currentSong) {
        return;
    }

    const songSource = currentSong.url || currentSong.mp3 || "";

    if (!songSource) {
        return;
    }

    if (audioPlayer.src !== songSource) {
        audioPlayer.src = songSource;
        audioPlayer.load();
    }

    syncVolume();

    if (state.playing) {
        audioPlayer.pause();
        state.playing = false;
        pause_play.textContent = "Play";
        renderVinyl();
        return;
    }

    audioPlayer.play().then(() => {
        state.playing = true;
        pause_play.textContent = "Pause";
        renderVinyl();
    }).catch((error) => {
        console.error(error);
        state.playing = false;
        pause_play.textContent = "Play";
        renderVinyl();
    });
});

volumeBar.addEventListener("input", () => {
    syncVolume();
});


syncVolume();
loadMusic();