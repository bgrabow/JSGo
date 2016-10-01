describe("A suite", () => {
    it("contains spec with an expectation", () => {
        expect(true).toBe(true);
    })
})

describe("The game of Go", () => {
    describe("The board", () => {
        it("can have at most one stone per cell", () => {
            var game = new GoGame();
            game.currentPlayerSelects(0, 0);
            game.currentPlayerSelects(0, 0);
            expect(game.state.cells.size()).toBe(1);
        })
    })

    describe("Current player", () => {
        var game;

        beforeEach(() => {
            game = new GoGame();
        })

        it("starts with black's turn", () => {
            expect(game.currentPlayer()).toBe(Player.black);
        })

        it("alternates after each stone is played", () => {
            let [someCol, someRow] = [0, 0];
            let [otherCol, otherRow] = [1, 1];

            game.currentPlayerSelects(someCol, someRow);
            expect(game.currentPlayer()).toBe(Player.white);

            game.currentPlayerSelects(otherCol, otherRow);
            expect(game.currentPlayer()).toBe(Player.black);
        })
    })
})