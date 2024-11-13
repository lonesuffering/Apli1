document.addEventListener("DOMContentLoaded", function() {
    const mapContainer = document.getElementById('map-container');
    const map = L.map('map-container').setView([51.505, -0.09], 13);

    // Проверяем поддержку aspect-ratio
    if (!CSS.supports("aspect-ratio", "1 / 1")) {
        const setSquareMapContainer = () => {
            const size = mapContainer.clientWidth;
            mapContainer.style.height = `${size}px`; // Устанавливаем высоту, равную ширине
            map.invalidateSize(); // Принудительное обновление размера карты
        };
        setSquareMapContainer(); // Устанавливаем сразу
        window.addEventListener('resize', setSquareMapContainer); // Устанавливаем при изменении окна
    }

    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '&copy; <a href="https://www.esri.com/">Esri</a>, USGS, NOAA'
    }).addTo(map);

    const locationBtn = document.getElementById('locationBtn');
    const downloadMapBtn = document.getElementById('downloadMapBtn');

    locationBtn.addEventListener('click', () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const { latitude, longitude } = position.coords;
                map.setView([latitude, longitude], 13);
                L.marker([latitude, longitude]).addTo(map)
                    .bindPopup("Twoja lokalizacja").openPopup();
            }, () => {
                alert('Brak dostępu do geolokalizacji');
            });
        } else {
            alert('Twoja przeglądarka nie obsługuje geolokalizacji');
        }
    });

    downloadMapBtn.addEventListener('click', () => {
        leafletImage(map, function(err, canvas) {
            if (err) {
                console.error('Błąd при экспортировании карты:', err);
                return;
            }
            const imageDataUrl = canvas.toDataURL('image/png');
            splitMapIntoPuzzlePieces(imageDataUrl);
        });
    });
});

function splitMapIntoPuzzlePieces(imageDataUrl) {
    const puzzlePieces = document.getElementById('puzzle-pieces');
    const puzzleBoard = document.getElementById('puzzle-board');
    puzzlePieces.innerHTML = '';
    puzzleBoard.innerHTML = '';

    const img = new Image();
    img.src = imageDataUrl;
    img.onload = () => {
        const pieceWidth = img.width / 4;
        const pieceHeight = img.height / 4;

        for (let y = 0; y < 4; y++) {
            for (let x = 0; x < 4; x++) {
                const canvas = document.createElement('canvas');
                canvas.width = pieceWidth;
                canvas.height = pieceHeight;
                const context = canvas.getContext('2d');

                context.drawImage(img, x * pieceWidth, y * pieceHeight, pieceWidth, pieceHeight, 0, 0, pieceWidth, pieceHeight);

                const piece = document.createElement('div');
                piece.classList.add('puzzle-piece');
                piece.style.backgroundImage = `url(${canvas.toDataURL()})`;
                piece.style.width = '100%';
                piece.style.height = '100%';
                piece.setAttribute('data-x', x);
                piece.setAttribute('data-y', y);

                piece.draggable = true;
                piece.addEventListener('dragstart', handleDragStart);

                puzzlePieces.appendChild(piece);

                const boardCell = document.createElement('div');
                boardCell.classList.add('puzzle-cell');
                boardCell.setAttribute('data-x', x);
                boardCell.setAttribute('data-y', y);
                boardCell.addEventListener('dragover', handleDragOver);
                boardCell.addEventListener('drop', handleDrop);

                puzzleBoard.appendChild(boardCell);
            }
        }

        [...puzzlePieces.children].sort(() => Math.random() - 0.5).forEach(child => {
            puzzlePieces.appendChild(child);
        });
    };
}

function handleDragStart(event) {
    event.dataTransfer.setData('text/plain', event.target.getAttribute('data-x') + ',' + event.target.getAttribute('data-y'));
    event.dataTransfer.setData('source', event.target.parentNode.id);
}

function handleDragOver(event) {
    event.preventDefault();
}

function handleDrop(event) {
    event.preventDefault();

    const [x, y] = event.dataTransfer.getData('text/plain').split(',');
    const draggedPiece = document.querySelector(`.puzzle-piece[data-x="${x}"][data-y="${y}"]`);
    const sourceContainer = event.dataTransfer.getData('source');

    const targetCell = event.target;
    if (targetCell.classList.contains('puzzle-cell') || targetCell.classList.contains('puzzle-grid')) {
        if (targetCell.childElementCount === 0 || targetCell.id === 'puzzle-pieces') {
            targetCell.appendChild(draggedPiece);

            // Проверяем завершение после каждого перемещения в puzzle-board
            if (targetCell.classList.contains('puzzle-cell')) {
                checkPuzzleCompletion();
            }
        }
    }
}

function checkPuzzleCompletion() {
    const cells = document.querySelectorAll('#puzzle-board .puzzle-cell');
    let complete = true;

    cells.forEach(cell => {
        const piece = cell.querySelector('.puzzle-piece');
        if (!piece ||
            piece.getAttribute('data-x') !== cell.getAttribute('data-x') ||
            piece.getAttribute('data-y') !== cell.getAttribute('data-y')) {
            complete = false;
        }
    });

    if (complete) {
        setTimeout(() => {
            alert('Puzzle completed!');
        }, 100);
    }
}