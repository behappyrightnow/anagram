/// <reference path="../lib/jasmine.d.ts"/>
/// <reference path="../app/scripts/anagram.ts"/>
describe('Anagram tests', function() {
    describe("should unscramble", function() {
        it("single words", function() {
            var anagram = new Anagram(["apple", "simple"]);
            expect(anagram.unscramble("leppa")).toEqual(["apple"]);
            expect(anagram.unscramble("emplis")).toEqual(["simple"]);
        });
        it("multiple words", function() {
            var anagram = new Anagram(["door", "odor"]);
            expect(anagram.unscramble("rood")).toEqual(["door","odor"]);
        });
    });

    it("makes key from word", function() {
        var anagram = new Anagram(["apple"]);
        expect(anagram.keyFrom("apple")).toEqual("aelpp");
    });

    it("should save wordlist in constructor", function() {
        var anagram = new Anagram(["apple"]);
        expect(anagram.wordList).toEqual(["apple"]);
    });
});