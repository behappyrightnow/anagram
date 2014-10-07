/// <reference path="../lib/jasmine.d.ts"/>
/// <reference path="../app/scripts/anagram.ts"/>
describe('Anagram tests', function() {
    it("should unscramble", function() {
        var anagram = new Anagram();
        expect(anagram.unscramble("leppa")).toEqual("apple");
    });
});