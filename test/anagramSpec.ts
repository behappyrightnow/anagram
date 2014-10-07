/// <reference path="../lib/jasmine.d.ts"/>
/// <reference path="../app/scripts/anagram.ts"/>
describe('Anagram tests', function() {
    it("should unscramble", function() {
        var anagram = new Anagram(["apple", "simple"]);
        expect(anagram.unscramble("leppa")).toEqual("apple");
        expect(anagram.unscramble("emplis")).toEqual("simple");
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