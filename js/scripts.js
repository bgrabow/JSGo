var Stone = {
    empty: 'empty',
    black: 'black',
    white: 'white',
}

class GoGame {
    constructor(observer) {
        this.observer = observer;
        this.state = new State();
    }

    currentPlayerSelects(col, row) {
        if(this.state.stoneAt(col, row) === Stone.empty) {
            var newStone = this.state.currentPlayerColor;
            this.state = this.state.add(newStone, col, row);
            this.observer.notify(this.state.getValue());
        }
    }
}

class State {
    constructor(inCells = new Map()) {
        var cells = inCells;
        this.currentPlayerColor = Stone.black;

        this.stoneAt = (col, row) => {
            return cells.has([col, row]) ?
                   cells.get([col, row]) :
                   Stone.empty;
        }

        this.add = (stone, col, row) => {
            var newCells = new Map(cells);
            newCells.set([col, row], stone);
            return new State(newCells);
        }

        this.getValue = () => {
            return {
                currentPlayerColor: this.currentPlayerColor,
                cells: new Map(cells),
            }
        }
    }
}