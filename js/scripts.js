"use strict";

var Stone = {
    empty: 'empty',
    black: 'black',
    white: 'white',
}

var Player = {
    black: Stone.black,
    white: Stone.white,
}

class GoGame {
    constructor(observer) {
        this.observer = observer || {notify: ()=>{}};
        this.state = new State();
    }

    currentPlayerSelects(col, row) {
        if(this.state.stoneAt(col, row) === Stone.empty) {
            this.state = this.state.addStone(col, row).nextPlayer();
        }
        this.observer.notify(this.state.getValue());
    }

    currentPlayer() { return this.state.currentPlayer }
}

class State {
    constructor(inCells, player) {
        this.cells = inCells || new StoneMap();
        this.currentPlayer = player || Player.black;

        this.stoneAt = (col, row) => {
            return this.cells.has(col, row) ?
                   this.cells.get(col, row) :
                   Stone.empty;
        }

        this.addStone = (col, row) => {
            var newCells = new StoneMap(this.cells);
            newCells.set(col, row, this.currentPlayer);
            return new State(newCells, this.currentPlayer);
        }

        this.getValue = () => {
            return {
                currentPlayer: this.currentPlayer,
                cells: new StoneMap(this.cells, this.currentPlayer),
            }
        }

        this.nextPlayer = () => {
            let nextPlayer = this.currentPlayer == Player.black ? Player.white : Player.black;
            return new State(this.cells, nextPlayer);
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