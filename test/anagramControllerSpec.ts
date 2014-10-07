/// <reference path="../lib/jasmine.d.ts"/>
/// <reference path="../app/scripts/plumbing/anagramController.ts"/>
describe("Anagram Controller Tests", function() {
    var anagramController: AnagramCtrl;
    beforeEach(function() {
        anagramController = new AnagramCtrl();
    });
    it("should produce correct unscrambled list", function() {
        anagramController.word = "leppa";
        anagramController.unscramble();
        expect(anagramController.unscrambledWords).toEqual(["apple"]);
    });
});