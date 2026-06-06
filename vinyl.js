const albumSelect = document.getElementById("album-select");
const discDisplay = document.getElementById("disc-display");
const songDisplay = document.getElementById("song-display");
const playerSteps = document.querySelectorAll(".player_step");
const discButtons = playerSteps[1].querySelectorAll(".step_button");
const selectedSide = document.querySelectorAll('input[name="side"]');
const songButtons = playerSteps[3].querySelectorAll(".step_button");
const pause_play = document.querySelector(".step_button--pause");
const vinylDisplay = document.querySelector(".vinyl_display");
const coverContainer = document.querySelector(".cover");
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

function resetSideToA() {
    state.side = 0;

    selectedSide.forEach((radio) => {
        radio.checked = Number(radio.value) === 0;
    });
}

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

function getAlbumCoverSources(album) {
    if (!album) {
        return [];
    }

    if (Array.isArray(album.covers)) {
        return album.covers.filter(Boolean);
    }

    const covers = [];

    if (album.cover) {
        covers.push(album.cover);
    }

    if (album.cover_1) {
        covers.push(`${album.cover_1}.png`);
    }

    if (album.cover_2) {
        covers.push(`${album.cover_2}.png`);
    }

    return covers;
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

    coverContainer.innerHTML = "";

    getAlbumCoverSources(album).forEach((source, index) => {
        const coverImage = document.createElement("img");
        coverImage.className = "album_cover";
        coverImage.src = source;
        coverImage.alt = `${album?.title ?? "Album"} cover ${index + 1}`;
        coverImage.addEventListener("contextmenu", event => event.preventDefault());
        coverContainer.appendChild(coverImage);
    });
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



    const songSource = getSongSource(currentSong);


    if (audioPlayer.src !== songSource) {
        audioPlayer.src = songSource;
        audioPlayer.load();
    }


    if (state.playing) {
        audioPlayer.play().catch((error) => {
            console.error(error);
            state.playing = false;
            renderControls();
            renderVinyl();
        });
    } else {
        renderControls();
    }

    renderVinyl();
}

function renderControls() {
    pause_play.innerHTML = state.playing ? '<img src="assets/pause.png" alt="play" class="controls">' : '<img src="assets/play.png" alt="play"  class="controls">';
}

function renderAll() {
    renderDiscs();
    renderSongs();
    renderVinyl();
}

// Event listeners

albumSelect.addEventListener("change", () => {
    state.albumIndex = Number(albumSelect.value);
    state.discIndex = 0;
    state.songIndex = 0;
    state.side = 0;
    renderAll();
});

selectedSide.forEach((radio) => {
    radio.addEventListener("change", (event) => {
        state.side = Number(event.target.value);
        state.songIndex = 0;
        renderAll();
    });
});



function getMaxSongIndex() {
    return (getCurrentSide()?.songs?.length ?? 1) - 1;
}

discNextButton.addEventListener("click", () =>{
    const maxDiscIndex = getCurrentAlbum()?.discs?.length ? getCurrentAlbum().discs.length - 1 : 0;
    if (state.discIndex < maxDiscIndex) {
        state.discIndex++;
        state.songIndex = 0;
        renderAll();
    }
});
discBackButton.addEventListener("click", () =>{
    if (state.discIndex > 0) {
        state.discIndex--;
        state.songIndex = 0;
        renderAll();
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

    const songSource = getSongSource(currentSong);

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
        renderControls();
        renderVinyl();
        return;
    }

    audioPlayer.play().then(() => {
        state.playing = true;
        renderControls();
        renderVinyl();
    }).catch((error) => {
        console.error(error);
        state.playing = false;
        renderControls();
        renderVinyl();
    });
});

volumeBar.addEventListener("input", () => {
    syncVolume();
});


syncVolume();
resetSideToA();
loadMusic();