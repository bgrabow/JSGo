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
        this.state = this.state.pass();
        if(this.state.consecutivePasses >= 2) {
            this.state = this.state.endGame();
        } else {
            this.state = this.state.nextPlayer();
        }
        
        this.notify();
    }

    currentPlayer() { return this.state.currentPlayer }

    notify() {
        this.observer.notify(this.state.toJSON());
    }
}

class State {
    constructor(inCells, player, consecutivePasses, gameOver) {
        this.cells = inCells || new StoneMap();
        this.currentPlayer = player || Player.black;
        this.consecutivePasses = consecutivePasses || 0;
        this.gameOver = gameOver || false;

        this.addStone = (col, row) => {
            if (this.gameOver) return this;

            return new State(this.cells.set(col, row, this.currentPlayer), this.currentPlayer, 0);
        }

        this.pass = () => {
            if (this.gameOver) return this;

            return new State(this.cells, this.currentPlayer, this.consecutivePasses + 1);
        }

        this.nextPlayer = () => {
            if (this.gameOver) return this;

            let nextPlayer = this.currentPlayer == Player.black ? Player.white : Player.black;
            return new State(this.cells, nextPlayer, this.consecutivePasses);
        }

        this.endGame = ()=>{
            if (this.gameOver) return this;

            return new State(this.cells, this.currentPlayer, this.consecutivePasses, true);
        }

        this.stoneAt = (col, row) => {
            return this.cells.has(col, row) ?
                   this.cells.get(col, row) :
                   Stone.empty;
        }

        this.toJSON = () => {
            return JSON.stringify({
                currentPlayer: this.currentPlayer,
                cells: JSON.parse(this.cells.toJSON()),
                gameOver: this.gameOver,
            })
        }
    }
}

class StoneMap {
    constructor(stoneMap) {
        this.map = stoneMap || {};
    }

    clone(map) {
        return JSON.parse(JSON.stringify(map));
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
        let mapCopy = this.clone(this.map);
        mapCopy[this.key(col, row)] = value;
        return new StoneMap(mapCopy);
    }

    toJSON() {
        return JSON.stringify(this.map);
    }

    key(col, row) {
        return [col, row].toString();
    }
}