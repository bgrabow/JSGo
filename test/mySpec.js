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

            it("can't be done on an occupied cell", ()=>{
                game.currentPlayerSelects(SOME_COL, SOME_ROW);
                let stonesAfterFirstPlay = game.state.cells.size();
                game.currentPlayerSelects(SOME_COL, SOME_ROW);
                expect(game.state.cells.size()).toBe(stonesAfterFirstPlay);
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
})