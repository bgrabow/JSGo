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
        this.state = GoRules.evaluate({col: parseInt(col), row: parseInt(row)}, this.state);
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

class StateHistory {
    constructor(initialState) {
        
    }

    add(newState) {

    }

    hasDuplicateState(pendingState, history) {

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

        let stateWithPlacedStone = state.addStone(action.col, action.row, currentPlayer);
        let cellGroups = new CellGrouper(state).cellGroups;
        let stateWithoutCapturedStones = removeOnePlayersDeadStones(cellGroups, stateWithPlacedStone, otherPlayer);
        let newState = stateWithoutCapturedStones.nextPlayer();
        let cellGrouperAfterCapture = new CellGrouper(newState);

        return placedStoneIsAlive(action.col, action.row, cellGrouperAfterCapture) ?
                newState :
                state;

        function placedStoneIsAlive(col, row, cellGrouper) {
            return cellGrouper.groupContaining(col, row).hasLiberties;
        }

        function removeOnePlayersDeadStones(cellGroups, state, player) {
            var cellGroups = new CellGrouper(state).cellGroups;

            return cellGroups.filter(g => { return g.color === player })
                            .filter(g => { return !g.hasLiberties })
                            .reduce((removingGroups, g) => {
                                return g.cells.reduce((removingStones, cell) => {
                                    return removingStones.removeStone(cell.col, cell.row);
                                }, removingGroups);
                            }, state);
        }
    }


    static hasAdjacentLiberty(col, row, cellIndex) {
        return GoRules.adjacentPositions(col, row).some(([adjCol, adjRow]) => {
            return !cellIndex[[adjCol, adjRow]];
        });
    }

    static adjacentPositions(col, row) {
        return [[col-1,row],
        [col+1,row],
        [col,row-1],
        [col,row+1]].filter(([col,row]) => { return inBounds(col, row) })

        function inBounds(col, row) {
            return col >= 0 && row >= 0 && col <= 19 && row <= 19;
        }
    }
}

class RuleOfKo {
    static evaluate(pendingState, history) {
        return history.hasDuplicateState(pendingState) ? 
                history.currentState() :
                pendingState;
    }
}

class CellGrouper {
    constructor(state) {
        var theCellGrouper = this;

        this.cells = extractCells(state);
        this.cellIndex = index(this.cells);
        this.cellGroups = group();
        this.groupContaining = (col, row)=>{
            return theCellGrouper.cellGroups.find(group => {
                return group.cells.some(cell => cell.col === col && cell.row === row)
            }) || new CellGroup(Stone.empty);
        }
    
        function extractCells(state) {
            var occupiedCells = [];
            state.cells.eachCell((col, row, color) => {
                occupiedCells.push({col: col, row: row, color: color});
            })
            return occupiedCells;
        }

        function group() {
            var ungroupedCells = theCellGrouper.cells.slice();
            var cellGroups = [];

            while(ungroupedCells.length > 0) {
                var newGroup;
                [newGroup, ungroupedCells] = makeOneGroup(ungroupedCells.pop(), ungroupedCells)
                cellGroups.push(newGroup);
            }
            return cellGroups;

            function makeOneGroup(seedCell, groupingCandidates) {
                var newGroup = new CellGroup(seedCell.color, theCellGrouper.cellIndex);
                var groupInsertionQueue = [seedCell];
                var ungroupedCellIndex = index(groupingCandidates);

                while(groupInsertionQueue.length > 0) {
                    var currentCell = groupInsertionQueue.shift();
                    newGroup = newGroup.push(currentCell);
                    
                    var adjacentPositions = GoRules.adjacentPositions(currentCell.col, currentCell.row);
                    var adjUngroupedCells = adjacentPositions.filter(([col, row]) => cellIsUngrouped(col, row, ungroupedCellIndex));
                    var adjacentStones = adjUngroupedCells.map(([col, row]) => theCellGrouper.cellIndex[[col, row]]);
                    var adjUngSameColorCells = adjacentStones.filter(stone => stone.color === newGroup.color);
                    adjUngSameColorCells.forEach(stone => {
                            groupInsertionQueue.push(stone);
                            delete ungroupedCellIndex[[stone.col, stone.row]];
                        });
                }
                return [newGroup, values(ungroupedCellIndex)];

                function cellIsUngrouped(col, row, ungroupedCellIndex) {
                    return ungroupedCellIndex.hasOwnProperty([col, row]);
                }
            }
        }

        function index(cellArray) {
            var cellIndex = {};
            cellArray.forEach(cell => {
                cellIndex[[cell.col, cell.row]] = cell;
            })
            return cellIndex;
        }

        function values(cellIndex) {
            return Object.keys(cellIndex).map(key => cellIndex[key]);
        }
    }
}

class CellGroup {
    constructor(color, cellIndex, cells, hasLiberties) {
        this.color = color;
        this.cellIndex = cellIndex || {};
        this.cells = cells || [];
        this.hasLiberties = hasLiberties || false;
    }

    push(cell) {
        let newCells = this.cells.slice()
        newCells.push(cell);
        let newHasLiberties = this.hasLiberties || GoRules.hasAdjacentLiberty(cell.col, cell.row, this.cellIndex)
        return new CellGroup(this.color, this.cellIndex, newCells, newHasLiberties);
    }
}