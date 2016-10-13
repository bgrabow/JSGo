describe("The game of Go", () => {
    var game;

    beforeEach(() => {
        game = new GoGame();
    })

    describe("Playing a stone", () => {
        describe("A basic play", ()=>{
            const [SOME_COL, SOME_ROW] = [0, 0];
            const [OTHER_COL, OTHER_ROW] = [1, 1];

            it("adds a stone to the board", ()=>{
                game.currentPlayerSelects(SOME_COL, SOME_ROW);
                expect(game.state.stoneAt(SOME_COL, SOME_ROW)).toBe(Stone.black);
            })

            it("handles string coordinates", ()=>{
                game.currentPlayerSelects(SOME_COL.toString(), SOME_ROW.toString());
                expect(game.state.stoneAt(SOME_COL.toString(), SOME_ROW.toString())).toBe(Stone.black);
            })

            it("can't be done on an occupied cell", ()=>{
                game.currentPlayerSelects(SOME_COL, SOME_ROW);
                let stonesAfterFirstPlay = game.state.cells;
                game.currentPlayerSelects(SOME_COL, SOME_ROW);
                expect(game.state.cells).toEqual(stonesAfterFirstPlay);
            })

            it("changes the current player", ()=>{
                let firstPlayer = game.state.currentPlayer;

                game.currentPlayerSelects(SOME_COL, SOME_ROW);
                expect(game.state.currentPlayer != firstPlayer).toBe(true);

                game.currentPlayerSelects(OTHER_COL, OTHER_ROW);
                expect(game.state.currentPlayer).toBe(firstPlayer);
            })
        })
    })

    describe("Passing", ()=>{
        it("changes the current player", ()=>{
            let firstPlayer = game.state.currentPlayer;
            game.currentPlayerPasses();
            expect(game.state.currentPlayer != firstPlayer).toBe(true);
        })

        it("doesn't change the contents of the board", ()=>{
            let anyNonEndedGame = {
                currentPlayer: 'black',
                cells: {
                    '8,1': 'black',
                    '13,13': 'white',
                }
            }
            let game = new GoGame(JSON.stringify(anyNonEndedGame));
            game.currentPlayerPasses();
            expect(JSON.parse(game.state.toJSON())).toEqual(jasmine.objectContaining({
                cells: anyNonEndedGame.cells,
            }));
        })

        it("ends the game if both players pass in a row", ()=>{
            game.currentPlayerPasses();
            expect(game.state.gameOver).toBe(false);
            game.currentPlayerPasses();
            expect(game.state.gameOver).toBe(true)
        })

        it('remembers that a player passed after exporting then loading a game', ()=>{
            game.currentPlayerPasses();
            let savedGame = game.state.toJSON();
            let loadedGame = new GoGame(savedGame);
            loadedGame.currentPlayerPasses();
            expect(loadedGame.state.gameOver).toBe(true);
        })
    })

    describe("Portable representation of game", ()=>{
        it("looks like this", ()=>{
            game.currentPlayerSelects(1,2);
            game.currentPlayerSelects(2,2);
            expect(JSON.parse(game.state.toJSON())).toEqual({
                currentPlayer: 'black',
                cells: {
                    '1,2': 'black',
                    '2,2': 'white',
                },
                consecutivePasses: 0,
                gameOver: false,
            });
        })

        it('can be used to initialize a game', ()=>{
            let state = {
                currentPlayer: 'white',
                cells: {
                    '3,7': 'white',
                    '8,12': 'black',
                },
            }
            let game = new GoGame(JSON.stringify(state))

            expect(game.state.stoneAt(3,7)).toBe('white');
            expect(game.state.stoneAt(8,12)).toBe('black');
            expect(JSON.parse(game.state.toJSON())).toEqual(jasmine.objectContaining({
                currentPlayer: 'white',
                cells: {
                    '3,7': 'white',
                    '8,12': 'black',
                },
            }))
        })
    })
})

describe('Rules of Go', ()=>{
    describe('capturing a single stone', ()=>{
        it('a stone is not captured when it has remaining liberties', ()=>{
            let state = new State(parse([
                "...................",
                "..b................",
                ".bw................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
            ]), Player.black);
            
            var result = CapturingRules.evaluate({col: 2, row: 3}, state) 

            expect(result.newState).toEqual(jasmine.objectContaining({
                currentPlayer: Player.white,
                cells: parse([
                    "...................",
                    "..b................",
                    ".bw................",
                    "..b................",
                    "...................",
                    "...................",
                    "...................",
                    "...................",
                    "...................",
                    "...................",
                    "...................",
                    "...................",
                    "...................",
                    "...................",
                    "...................",
                    "...................",
                    "...................",
                    "...................",
                    "...................",
                ]),
            }))
        })

        it('a stone is captured when it has no liberties', ()=>{
            let state = new State(parse([
                "...................",
                "..b................",
                ".bwb...............",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
            ]), Player.black);
            
            var result = CapturingRules.evaluate({col: 2, row: 3}, state)
            expect(result.newState).toEqual(jasmine.objectContaining({
                currentPlayer: Player.white,
                cells: parse([
                    "...................",
                    "..b................",
                    ".b.b...............",
                    "..b................",
                    "...................",
                    "...................",
                    "...................",
                    "...................",
                    "...................",
                    "...................",
                    "...................",
                    "...................",
                    "...................",
                    "...................",
                    "...................",
                    "...................",
                    "...................",
                    "...................",
                    "...................",
                ]),
            }))
        })
        
        it('works for both players and in different positions', ()=>{
            let state = new State(parse([
                "...................",
                ".......w...........",
                "......wbw..........",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
            ]), Player.white);
            
            var result = CapturingRules.evaluate({col: 7, row: 3}, state)
            expect(result.newState).toEqual(jasmine.objectContaining({
                currentPlayer: Player.black,
                cells: parse([
                    "...................",
                    ".......w...........",
                    "......w.w..........",
                    ".......w...........",
                    "...................",
                    "...................",
                    "...................",
                    "...................",
                    "...................",
                    "...................",
                    "...................",
                    "...................",
                    "...................",
                    "...................",
                    "...................",
                    "...................",
                    "...................",
                    "...................",
                    "...................",
                ]),
            }))
        })
        
        it('stones adjacent to the edge of the board do not get liberty from the edge', ()=>{
            let state = new State(parse([
                "w..................",
                "b..................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
            ]), Player.black);
            
            var result = CapturingRules.evaluate({col: 1, row: 0}, state)
            expect(result.newState).toEqual(jasmine.objectContaining({
                currentPlayer: Player.white,
                cells: parse([
                    ".b.................",
                    "b..................",
                    "...................",
                    "...................",
                    "...................",
                    "...................",
                    "...................",
                    "...................",
                    "...................",
                    "...................",
                    "...................",
                    "...................",
                    "...................",
                    "...................",
                    "...................",
                    "...................",
                    "...................",
                    "...................",
                    "...................",
                ]),
            }))
        })
    })

    describe('capturing a group of stones', ()=>{
        it('a stone is not captured when its group has remaining liberties', ()=>{
            let state = new State(parse([
                "...................",
                "..b................",
                ".bww...............",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
            ]), Player.black);
            
            var result = CapturingRules.evaluate({col: 2, row: 3}, state)
            expect(result.newState).toEqual(jasmine.objectContaining({
                currentPlayer: Player.white,
                cells: parse([
                    "...................",
                    "..b................",
                    ".bww...............",
                    "..b................",
                    "...................",
                    "...................",
                    "...................",
                    "...................",
                    "...................",
                    "...................",
                    "...................",
                    "...................",
                    "...................",
                    "...................",
                    "...................",
                    "...................",
                    "...................",
                    "...................",
                    "...................",
                ]),
            }))
        })

        it('a group is captured when it has no liberties', ()=>{
            let state = new State(parse([
                "...................",
                "..bb...............",
                ".bwwb..............",
                "...b...............",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
            ]), Player.black);
            
            var result = CapturingRules.evaluate({col: 2, row: 3}, state)
            expect(result.newState).toEqual(jasmine.objectContaining({
                currentPlayer: Player.white,
                cells: parse([
                    "...................",
                    "..bb...............",
                    ".b..b..............",
                    "..bb...............",
                    "...................",
                    "...................",
                    "...................",
                    "...................",
                    "...................",
                    "...................",
                    "...................",
                    "...................",
                    "...................",
                    "...................",
                    "...................",
                    "...................",
                    "...................",
                    "...................",
                    "...................",
                ]),
            }))
        })
    })

    describe('playing a stone in a cell with no liberties', ()=>{
        it('is allowed if doing so will capture some adjacent stones', ()=>{
            let state = new State(parse([
                "..w................",
                ".wbw...............",
                ".b.b...............",
                "..b................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
            ]), Player.white);

            var result = CapturingRules.evaluate({col: 2, row: 2}, state)
            expect(result.legalMove).toBe(true);
            expect(result.newState).toEqual(jasmine.objectContaining({
                currentPlayer: Player.black,
                cells: parse([
                    "..w................",
                    ".w.w...............",
                    ".bwb...............",
                    "..b................",
                    "...................",
                    "...................",
                    "...................",
                    "...................",
                    "...................",
                    "...................",
                    "...................",
                    "...................",
                    "...................",
                    "...................",
                    "...................",
                    "...................",
                    "...................",
                    "...................",
                    "...................",
                ])
            }))
        })
        it('is not allowed if the placed stone will still have no liberties after capturing enemy stones', ()=>{
            let state = new State(parse([
                "..w................",
                ".wb................",
                ".b.b...............",
                "..b................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
            ]), Player.white);

            var result = CapturingRules.evaluate({col: 2, row: 2}, state)
            expect(result.legalMove).toBe(false);
            expect(result.newState).toEqual(jasmine.objectContaining({
                currentPlayer: Player.white,
                cells: parse([
                    "..w................",
                    ".wb................",
                    ".b.b...............",
                    "..b................",
                    "...................",
                    "...................",
                    "...................",
                    "...................",
                    "...................",
                    "...................",
                    "...................",
                    "...................",
                    "...................",
                    "...................",
                    "...................",
                    "...................",
                    "...................",
                    "...................",
                    "...................",
                ])
            }))
        })
    })

    describe('the rule of Ko', ()=>{
        it('is implemented end-to-end', ()=>{
            let game = new GoGame();
            game.currentPlayerSelects(1,2);
            game.currentPlayerSelects(1,1);
            game.currentPlayerSelects(2,3);
            game.currentPlayerSelects(2,0);
            game.currentPlayerSelects(3,2);
            game.currentPlayerSelects(3,1);
            game.currentPlayerSelects(2,1);
            game.currentPlayerSelects(2,2);
            game.currentPlayerSelects(2,1);
            let finalState = new State(parse([
                "..w................",
                ".w.w...............",
                ".bwb...............",
                "..b................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
            ]), Player.black);
            expect(game.state.cells).toEqual(finalState.cells);
            expect(game.state.currentPlayer).toEqual(finalState.currentPlayer);
        })

        it('does not allow replicating a previous game state', ()=>{
            let firstState = new State(parse([
                "..w................",
                ".wbw...............",
                ".b.b...............",
                "..b................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
            ]), Player.white);
            let history = new StateHistory(firstState);
            let secondState = new State(parse([
                "..w................",
                ".w.w...............",
                ".bwb...............",
                "..b................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
            ]), Player.black);
            var intermediateResult = RuleOfKo.evaluate({}, secondState, history)
            expect(intermediateResult.legalMove).toBe(true);
            expect(intermediateResult.newState).toBe(secondState);

            history.add(secondState);

            let thirdState = new State(parse([
                "..w................",
                ".wbw...............",
                ".b.b...............",
                "..b................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
                "...................",
            ]), Player.white);

            var finalResult = RuleOfKo.evaluate({}, thirdState, history)
            expect(finalResult.legalMove).toBe(false);
            expect(finalResult.newState).toBe(secondState);
        })
    })
})

describe('string literal representation of board', ()=>{
    let board = [
        "...................",
        "..b................",
        ".bwb...............",
        "...................",
        "...................",
        "...................",
        "...................",
        "...................",
        "...................",
        "...................",
        "...................",
        "...................",
        "...................",
        "...................",
        "...................",
        "...................",
        "...................",
        "...................",
        "...................",
    ];
    let stoneMap = new StoneMap().set(2,1, Stone.black)
                                .set(1,2, Stone.black)
                                .set(2,2, Stone.white)
                                .set(3,2, Stone.black);

    it('can be converted to a live StoneMap with parse', ()=>{
        expect(parse(board)).toEqual(stoneMap);
    })
    it('can be extracted from a live StoneMap object with prettyPrint', ()=>{
        expect(prettyPrint(stoneMap)).toEqual(board);
    })
})

describe('state history', ()=>{
    describe("compares an input state's board with boards in the state history", ()=>{
        var firstState, secondState, thirdState;
        var history;

        beforeEach(()=>{
            firstState = {uniqueData: 'a'}
            secondState = {uniqueData: 'b'}
            thirdState = {uniqueData: 'c'}
        })

        it('can store a single state', ()=>{
            history = new StateHistory(firstState);
            expect(history.currentState).toBe(firstState);
        })

        it('can store a linear history of states', ()=>{
            history = new StateHistory(firstState);
            history.add(secondState);
            history.add(thirdState);
            expect(history.currentState).toBe(thirdState);
        })

        it('detects duplicate board states by hashcode', ()=>{
            firstState.cells = {hashCode: 1};
            secondState.cells = {hashCode: 2};
            thirdState.cells = {hashCode: 1};
            
            let history = new StateHistory(firstState);
            history.add(secondState);
            expect(history.hasDuplicateState(thirdState)).toBe(true);
        })

        it('does not use anything other than hasCode to determine uniqueness', ()=>{
            firstState.cells = {hashCode: 1};
            secondState.cells = {hashCode: 2};
            thirdState.cells = {hashCode: 3};
            
            let history = new StateHistory(firstState);
            history.add(secondState);
            expect(history.hasDuplicateState(thirdState)).toBe(false);
        })
    })
})

describe("StoneMap", ()=>{
    it("stores stones", ()=>{
        let stoneMap = new StoneMap();
        stoneMap = stoneMap.set(0, 0, Stone.black);
        expect(stoneMap.has(0,0)).toBe(true);
        expect(stoneMap.get(0,0)).toBe(Stone.black);
        expect(stoneMap.size()).toBe(1);
    })

    it("has blank cells until a stone is placed", ()=>{
        let stoneMap = new StoneMap();
        expect(stoneMap.has(0,0)).toBe(false);
        expect(stoneMap.get(0,0)).toBe(undefined);
        expect(stoneMap.size()).toBe(0);
    })

    it("can be converted to JSON", ()=>{
        let stoneMap = new StoneMap();
        expect(stoneMap.set(0, 0, Stone.black)
                    .set(1, 2, Stone.white)
                    .toJSON()).toEqual(
            '{"0,0":"black","1,2":"white"}'
        )
    })

    it('has a hashCode for identifying duplicate board states', ()=>{
        let stoneMap = new StoneMap();
        expect(stoneMap.hashCode).toBe(prettyPrint(stoneMap).join(''));
    })
})