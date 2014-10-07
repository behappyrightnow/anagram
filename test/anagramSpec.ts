describe('Anagram tests', function() {
    it("should unscramble", function() {
        var anagram = new Anagram();
        expect(anagram.unscramble("leppa")).toEqual("apple");
    });
});