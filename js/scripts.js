"use strict";

var Stone = {
    empty: 'empty',
    black: 'black',
    white: 'white',
}

var Player = {
    empty: Stone.empty,
    black: Stone.black,
    white: Stone.white,
}

class GoGame {
    constructor(stateJSON) {
        this.observers = [];
        this.state = stateJSON ? State.parse(stateJSON) : new State();
    }

    subscribe(observer) {
        this.observers.push(observer);
        this.notify(observer);
    }

    currentPlayerSelects(col, row) {
        this.state = GoRules.evaluate({col: col, row: row}, this.state);
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

    notify(observer) {
        let stateJSON = this.state.toJSON();
        let recipients = observer ? [observer] : this.observers;
        recipients.forEach(observer => {
            observer.notify(stateJSON);
        })
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

            return new State(this.cells.set(col, row, this.currentPlayer), this.currentPlayer);
        }

        this.removeStone = (col, row) => {
            if (this.gameOver) return this;

            return new State(this.cells.remove(col, row), this.currentPlayer)
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

            return new State(this.cells, Player.empty, this.consecutivePasses, true);
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
                consecutivePasses: this.consecutivePasses,
                gameOver: this.gameOver,
            })
        }
    }

    static parse(stateJSON) {
        let state = JSON.parse(stateJSON);
        return new State(new StoneMap(state.cells),
                        state.currentPlayer,
                        state.consecutivePasses,
                        state.gameOver);
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

    remove(col, row) {
        let mapCopy = this.clone(this.map);
        delete mapCopy[this.key(col, row)];
        return new StoneMap(mapCopy);
    }

    toJSON() {
        return JSON.stringify(this.map);
    }

    key(col, row) {
        return [col, row].toString();
    }

    eachCell(func) {
        Object.getOwnPropertyNames(this.map).forEach(key => {
            var [col,row] = key.split(',').map(s => parseInt(s));
            func(col, row, this.get(col, row));
        });
    }
}

class GoRules {
    static evaluate(action, state) {
        if(state.stoneAt(action.col, action.row) !== Stone.empty) return state;

        // First remove stones from other player if they have no liberties
        // Second check if new stone has any liberties after other side's stones are removed.
        //      If not, abort action and return failure.
        // Third check if new state is a replica of any state that came before it.
        //      If it is, abort action and return failure.
        //      This could get tricky...
        let currentPlayer = state.currentPlayer;
        let otherPlayer = state.nextPlayer().currentPlayer;

        let newState = state.addStone(action.col, action.row, currentPlayer);
        let otherPlayersStonesRemoved = GoRules.removeOnePlayersDeadStones(newState, otherPlayer);

        return otherPlayersStonesRemoved.nextPlayer();
    }

    static removeOnePlayersDeadStones(state, player) {
        var newState = state;

        state.cells.eachCell((col, row, color) => {
            if (color !== player) return;
            if (GoRules.hasAdjacentLiberty(col, row, state)) return;

            newState = newState.removeStone(col, row);
        })

        return newState;
    }

    static hasAdjacentLiberty(col, row, state) {
        return GoRules.adjacentCells(col, row).some(([adjCol, adjRow]) => {
            return state.stoneAt(adjCol, adjRow) === Stone.empty;
        });
    }

    static adjacentCells(col, row) {
        return [[col-1,row],
        [col+1,row],
        [col,row-1],
        [col,row+1]]
    }
}