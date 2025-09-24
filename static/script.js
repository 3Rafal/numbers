class DigitRecognizer {
    constructor() {
        this.gridSize = 28;
        this.cells = [];
        this.isDrawing = false;
        this.resultElement = document.getElementById('result');

        this.init();
    }

    init() {
        this.createGrid();
        this.setupEventListeners();
    }

    createGrid() {
        const grid = document.getElementById('grid');
        grid.innerHTML = '';
        this.cells = [];

        for (let i = 0; i < this.gridSize * this.gridSize; i++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.index = i;
            grid.appendChild(cell);
            this.cells.push(cell);
        }
    }

    setupEventListeners() {
        const grid = document.getElementById('grid');
        const clearBtn = document.getElementById('clearBtn');
        const guessBtn = document.getElementById('guessBtn');

        // Mouse events
        grid.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('cell')) {
                this.isDrawing = true;
                this.drawCell(e.target);
                e.preventDefault();
            }
        });

        grid.addEventListener('mouseover', (e) => {
            if (this.isDrawing && e.target.classList.contains('cell')) {
                this.drawCell(e.target);
            }
        });

        document.addEventListener('mouseup', () => {
            this.isDrawing = false;
        });

        // Touch events for mobile
        grid.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const element = document.elementFromPoint(touch.clientX, touch.clientY);
            if (element && element.classList.contains('cell')) {
                this.isDrawing = true;
                this.drawCell(element);
            }
        });

        grid.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (this.isDrawing) {
                const touch = e.touches[0];
                const element = document.elementFromPoint(touch.clientX, touch.clientY);
                if (element && element.classList.contains('cell')) {
                    this.drawCell(element);
                }
            }
        });

        grid.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.isDrawing = false;
        });

        // Button events
        clearBtn.addEventListener('click', () => this.clearGrid());
        guessBtn.addEventListener('click', () => this.makeGuess());
    }

    drawCell(cell) {
        cell.classList.add('filled');
    }

    clearGrid() {
        this.cells.forEach(cell => {
            cell.classList.remove('filled');
        });
        this.resultElement.textContent = '?';
    }

    getGridData() {
        const data = [];
        this.cells.forEach(cell => {
            data.push(cell.classList.contains('filled') ? 1 : 0);
        });
        return data;
    }

    async makeGuess() {
        const data = this.getGridData();

        try {
            this.resultElement.textContent = '...';

            const response = await fetch('/guess', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ data }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            this.resultElement.textContent = result.prediction;

        } catch (error) {
            console.error('Error making guess:', error);
            this.resultElement.textContent = 'Error';
        }
    }
}

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new DigitRecognizer();
});