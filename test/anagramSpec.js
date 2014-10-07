/// <reference path="../lib/jasmine.d.ts"/>
/// <reference path="../app/scripts/anagram.ts"/>
describe('Anagram tests', function () {
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
    });*/
    it("makes key from word", function () {
        var anagram = new Anagram(["apple"]);
        expect(anagram.keyFrom("apple")).toEqual("aelpp");
    });

    it("should save make dictionary in constructor", function () {
        var anagram = new Anagram(["apple", "simple"]);
        expect(anagram.wordDict).toNotBe(null);
        expect(anagram.wordDict["aelpp"]).toEqual(["apple"]);
        expect(anagram.wordDict["eilmps"]).toEqual(["simple"]);
    });

    describe("should make dictionary with keys", function () {
        it("for one to one mappings", function () {
            var anagram = new Anagram(["apple", "simple"]);
            var keys = Object.keys(anagram.wordDict);
            expect(keys.length).toBe(2);
            var expectedKeys = ["aelpp", "eilmps"];
            for (var i = 0; i < expectedKeys.length; i++) {
                expect(keys.indexOf(expectedKeys[i]) !== -1).toBe(true);
            }
        });
        it("for one to many mappings", function () {
            var anagram = new Anagram(["odor", "door", "easel", "lease"]);
            var keys = Object.keys(anagram.wordDict);
            expect(keys.length).toBe(2);
            var expectedKeys = ["door", "aeels"];
            for (var i = 0; i < expectedKeys.length; i++) {
                expect(keys.indexOf(expectedKeys[i]) !== -1).toBe(true);
            }
            var doorWords = ["odor", "door"];
            var aeelsWords = ["easel", "lease"];
            expect(anagram.wordDict["door"]).toEqual(doorWords);
            expect(anagram.wordDict["aeels"]).toEqual(aeelsWords);
        });
    });
});
//# sourceMappingURL=anagramSpec.js.map
