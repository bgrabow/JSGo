describe("A suite", () => {
    it("contains spec with an expectation", () => {
        expect(true).toBe(true);
    })
})

describe("The game of Go", () => {
    it("can have at most one stone per cell", () => {
        var game = new GoGame();
        game.currentPlayerSelects(0, 0);
        game.currentPlayerSelects(0, 0);
        expect(game.state.cells.size()).toBe(1);
    })
})