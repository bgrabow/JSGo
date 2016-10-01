describe("A suite", () => {
    it("contains spec with an expectation", () => {
        expect(true).toBe(true);
    })
})

describe("The game of Go", () => {
    describe("Playing a stone", () => {
        describe("A basic play", ()=>{
            var game;
            const [SOME_COL, SOME_ROW] = [0, 0];
            const [OTHER_COL, OTHER_ROW] = [1, 1];

            beforeEach(() => {
                game = new GoGame();
            })

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
})