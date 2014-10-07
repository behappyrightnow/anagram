/// <reference path="../lib/jasmine.d.ts"/>
/// <reference path="../app/scripts/anagram.ts"/>
describe('Anagram tests', function() {
    /*
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
    });*/

    it("should make dictionary with keys", function() {
        var anagram = new Anagram(["apple", "simple"]);
        var keys = Object.keys(anagram.wordDict);
        expect(keys.length).toBe(2);
        var expectedKeys = ["aelpp", "eilmps"];
        for (var i=0;i<expectedKeys.length;i++) {
            expect(keys.indexOf(expectedKeys[i])!==-1).toBe(true);
        }
    });
});