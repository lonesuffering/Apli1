const getLocationBtn = document.getElementById('getLocationBtn');
const getMapImageBtn = document.getElementById('getMapImageBtn');
const imageContainer = document.getElementById('imageContainer');
const scrambledContainer = document.getElementById('scrambledContainer');
const puzzleContainer = document.getElementById('puzzleContainer');
let map;
let mapLoaded = false;
let imageParts = [];

// Get geolocation
getLocationBtn.addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else {
        alert("Geolocation API is not supported by your browser.");
    }
});

// Show map based on coordinates
function showPosition(position) {
    const { latitude, longitude } = position.coords;
    if (map) {
        map.setView([latitude, longitude], 13);
    } else {
        map = L.map('map').setView([latitude, longitude], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
        }).addTo(map);
        L.marker([latitude, longitude]).addTo(map)
            .bindPopup("You are here, human")
            .openPopup();
        mapLoaded = true;
    }
}

// Geolocation errors
function showError(error) {
    switch(error.code) {
        case error.PERMISSION_DENIED:
            alert("Geolocation request denied.");
            break;
        case error.POSITION_UNAVAILABLE:
            alert("Location information is unavailable.");
            break;
        case error.TIMEOUT:
            alert("Geolocation request timed out.");
            break;
        case error.UNKNOWN_ERROR:
            alert("An unknown error occurred.");
            break;
    }
}

// Get map image
getMapImageBtn.addEventListener('click', () => {
    if (map && mapLoaded) {
        leafletImage(map, function(err, canvas) {
            if (err) {
                console.error("Error creating map image:", err);
                return;
            }
            imageContainer.innerHTML = '';
            const img = new Image();
            img.src = canvas.toDataURL();
            img.style.maxWidth = "100%";
            img.style.maxHeight = "100%";
            imageContainer.appendChild(img);
            createScrambledImage(img);
        });
    } else {
        alert("Map is still loading. Please try again in a few seconds.");
    }
});

// Create scrambled image
function createScrambledImage(img) {
    const imgWidth = img.width;
    const imgHeight = img.height;
    const partWidth = imgWidth / 4;
    const partHeight = imgHeight / 4;
    scrambledContainer.innerHTML = '';
    imageParts = [];

    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
            const canvas = document.createElement('canvas');
            canvas.width = partWidth;
            canvas.height = partHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, col * partWidth, row * partHeight, partWidth, partHeight, 0, 0, partWidth, partHeight);
            imageParts.push(canvas.toDataURL());

            const imgPart = new Image();
            imgPart.src = canvas.toDataURL();
            imgPart.draggable = true;
            imgPart.style.width = "100%";
            imgPart.style.height = "100%";
            imgPart.style.border = "1px solid gray";
            imgPart.dataset.index = imageParts.length - 1;

            imgPart.addEventListener('dragstart', dragStart);
            scrambledContainer.appendChild(imgPart);
        }
    }

    scrambleImages();
}

// Scramble images
function scrambleImages() {
    const imgs = scrambledContainer.children;
    const imgArray = Array.from(imgs);
    imgArray.sort(() => Math.random() - 0.5);
    scrambledContainer.innerHTML = '';
    imgArray.forEach(img => scrambledContainer.appendChild(img));
}

// Start drag
function dragStart(event) {
    event.dataTransfer.setData('text/plain', event.target.dataset.index);
}

// Get all cells in the puzzle container
const puzzleCells = puzzleContainer.children;

// Add event listener for each cell in the puzzle container
for (let cell of puzzleCells) {
    cell.addEventListener('dragover', (event) => {
        event.preventDefault(); // Allow drop
    });

    cell.addEventListener('drop', (event) => {
        event.preventDefault();
        const index = event.dataTransfer.getData('text/plain'); // Get the index of the element
        const imgData = imageParts[index]; // Get image data by index

        // Check if the cell is empty
        if (cell.children.length === 0) {
            const imgPart = new Image();
            imgPart.src = imgData; // Create image
            imgPart.style.width = "100%";
            imgPart.style.height = "100%";
            imgPart.style.border = "1px solid gray";
            imgPart.dataset.index = index; // Save index in the element

            // Add image to the target cell
            cell.appendChild(imgPart);

            // Remove the element from scrambledContainer
            const scrambledImg = scrambledContainer.querySelector(`img[data-index="${index}"]`);
            if (scrambledImg) {
                scrambledContainer.removeChild(scrambledImg);
            }

            // Update imageParts to mark the element as moved
            imageParts[index] = null; // Nullify the element in imageParts

            // Check if the puzzle is completed
            checkPuzzleCompleted();
        }
    });
}

// Allow drop for scrambled container
scrambledContainer.addEventListener('dragover', (event) => {
    event.preventDefault();
});

// Handler for dropping the element in the scrambled parts container
scrambledContainer.addEventListener('drop', (event) => {
    event.preventDefault();
    const index = event.dataTransfer.getData('text/plain');
    const imgData = imageParts[index];

    // Create image element
    const imgPart = new Image();
    imgPart.src = imgData;
    imgPart.style.width = "100%";
    imgPart.style.height = "100%";
    imgPart.style.border = "1px solid gray";
    imgPart.dataset.index = index; // Save index in the element

    // Add image to scrambledContainer
    scrambledContainer.appendChild(imgPart);

    // Remove element from puzzleContainer
    const puzzleImg = puzzleContainer.children[index];
    if (puzzleImg) {
        puzzleContainer.removeChild(puzzleImg);
    }

    // Add element back to imageParts
    imageParts.push(imgData);
});

// Check if the puzzle is completed
function checkPuzzleCompleted() {
    let correctPieces = 0;

    // Loop through all the puzzle cells
    for (let i = 0; i < puzzleCells.length; i++) {
        if (puzzleCells[i].children.length > 0) {
            const img = puzzleCells[i].children[0];
            if (img.dataset.index == i) {
                correctPieces++;
                console.log(`Piece ${i + 1} is in the correct position.`); // Log specific piece placement
            } else {
                console.log(`Piece ${i + 1} is NOT in the correct position.`); // Log incorrect placement
            }
        } else {
            console.log(`Cell ${i + 1} is empty.`); // Log if cell is empty
        }
    }

    console.log(`Filled cells: ${correctPieces} out of ${puzzleCells.length}`);

    // If all cells are filled correctly
    if (correctPieces === puzzleCells.length) {
        console.log("Puzzle completed, sending notification.");
        showBrowserNotification();
        console.log("All pieces are in the correct position!"); // Log the message for correct arrangement
    }
}

// Function to display notification
function showBrowserNotification() {
    if (Notification.permission === "granted") {
        new Notification("Congratulations!", {
            body: "You have successfully completed the puzzle!",
        });
    } else if (Notification.permission === "default") {
        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                new Notification("Congratulations!", {
                    body: "You have successfully completed the puzzle!",
                });
            }
        });
    }
}
