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
        this.notify();
    }

    currentPlayerSelects(col, row) {
        if(this.state.stoneAt(col, row) === Stone.empty) {
            this.state = this.state.addStone(col, row).nextPlayer();
        }
        this.notify();
    }

    currentPlayerPasses() {
        this.state = this.state.nextPlayer();
        this.notify();
    }

    currentPlayer() { return this.state.currentPlayer }

    notify() {
        this.observer.notify(this.state.getValue());
    }
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

        this.toJSON = () => {
            return JSON.stringify({
                currentPlayer: this.currentPlayer,
                cells: JSON.parse(this.cells.toJSON()),
            })
        }

        this.nextPlayer = () => {
            let nextPlayer = this.currentPlayer == Player.black ? Player.white : Player.black;
            let newState = new State(this.cells, nextPlayer);
            return newState;
        }
    }
}

class StoneMap {
    constructor(stoneMap) {
        this.map = stoneMap ? clone(stoneMap.map) : {};

        function clone(map) {
            return JSON.parse(JSON.stringify(map));
        }
    }

    size() {
        return Object.keys(this.map).length;
    }

    has(col, row) {
        return this.map.hasOwnProperty(this.key(col, row));
    }

    get(col, row) {
        return this.map[this.key(col, row)];
    }

    set(col, row, value) {
        return this.map[this.key(col, row)] = value;
    }

    toJSON() {
        return JSON.stringify(this.map);
    }

    key(col, row) {
        return [col, row].toString();
    }
}