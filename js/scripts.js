const BLACK = 'black';
const WHITE = 'white';
const EMPTY = 'empty';

class State {
    constructor(cellDivs, currentPlayer = BLACK) {
        var cells = parse(cellDivs);
        this.cellAt = (col, row) => cells[col][row];
        this.currentPlayer = currentPlayer;

        function parse(cellDivs) {
            var cells = [];
            while(cells.push([]) < 19);
            
            Array.prototype.forEach.call(cellDivs, cellDiv => {
                cells[cellDiv.dataset.col][cellDiv.dataset.row] = new Cell(cellDiv);
            })
            return cells;
        }
    }

    cellForDiv(cellDiv) {
        return this.cellAt(cellDiv.dataset.col, cellDiv.dataset.row);
    }
}

class Cell {
    constructor(cellDiv, contents=EMPTY) {
        this.col = cellDiv.dataset.col;
        this.row = cellDiv.dataset.row;
        this.contents = contents;
    }

    click(event) {
        var self = this
        if(self.contents === EMPTY) {
            addBlackStone();
        }

        function addBlackStone() {
            self.contents = BLACK;
            var stone = new Stone(BLACK);
            stone.addTo(event.target);
        }
    }
}

class Stone {
    constructor(color=EMPTY) {
        this.color = color;
    }

    toDiv() {
        var div = document.createElement('div');
        div.className = `${this.color} stone`;
        return div;
    }

    addTo(targetDiv) {
        targetDiv.appendChild(this.toDiv());
    }
}

/*
User clicks cell
Notifies the Cell object of click
Cell adds piece to itself


*/