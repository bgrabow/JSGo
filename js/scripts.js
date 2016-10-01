"use strict";

var Stone = {
    empty: 'empty',
    black: 'black',
    white: 'white',
}

class GoGame {
    constructor(observer) {
        this.observer = observer || {notify: ()=>{}};
        this.state = new State();
    }

    currentPlayerSelects(col, row) {
        if(this.state.stoneAt(col, row) === Stone.empty) {
            var newStone = this.state.currentPlayerColor;
            this.state = this.state.add(newStone, col, row);
        }
        this.observer.notify(this.state.getValue());
    }
}

class State {
    constructor(inCells) {
        this.cells = inCells || new StoneMap();
        this.currentPlayerColor = Stone.black;

        this.stoneAt = (col, row) => {
            return this.cells.has(col, row) ?
                   this.cells.get(col, row) :
                   Stone.empty;
        }

        this.add = (stone, col, row) => {
            var newCells = new StoneMap(this.cells);
            newCells.set(col, row, stone);
            return new State(newCells);
        }

        this.getValue = () => {
            return {
                currentPlayerColor: this.currentPlayerColor,
                cells: new StoneMap(this.cells),
            }
        }
    }
}

class StoneMap {
    constructor(stoneMap) {
        this.map = stoneMap ? new Map(stoneMap.map) : new Map();
    }

    size() {
        return this.map.size;
    }

    has(col, row) {
        return this.map.has(this.key(col, row));
    }

    get(col, row) {
        return this.map.get(this.key(col, row));
    }

    set(col, row, value) {
        return this.map.set(this.key(col, row), value);
    }

    key(col, row) {
        return [col, row].toString();
    }
}