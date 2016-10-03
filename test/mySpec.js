describe("A suite", () => {
    it("contains spec with an expectation", () => {
        expect(true).toBe(true);
    })
})

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
                let firstPlayer = game.currentPlayer();

                game.currentPlayerSelects(SOME_COL, SOME_ROW);
                expect(game.currentPlayer() != firstPlayer).toBe(true);

                game.currentPlayerSelects(OTHER_COL, OTHER_ROW);
                expect(game.currentPlayer()).toBe(firstPlayer);
            })
        })
    })

    describe("Passing", ()=>{
        it("changes the current player", ()=>{
            let firstPlayer = game.currentPlayer();
            game.currentPlayerPasses();
            expect(game.currentPlayer() != firstPlayer).toBe(true);
        })

        it("doesn't change the contents of the board", ()=>{
            game.currentPlayerPasses();
            expect(JSON.parse(game.state.toJSON())).toEqual({
                currentPlayer: 'white',
                cells: {},
            })
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
                }
            });
        })
    })
})

describe("StoneMap", ()=>{
    it("stores stones", ()=>{
        let stoneMap = new StoneMap();
        stoneMap.set(0, 0, Stone.black);
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
        stoneMap.set(0, 0, Stone.black);
        stoneMap.set(1, 2, Stone.white);
        expect(stoneMap.toJSON()).toEqual(
            '{"0,0":"black","1,2":"white"}'
        )
    })
})