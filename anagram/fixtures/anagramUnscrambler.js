/// <reference path="../../app/scripts/logic/anagram.ts"/>
var AnagramUnscrambler = (function () {
    function AnagramUnscrambler() {
        this.dictionary = {};
        this.word = "";
        this.unscrambled = "";
    }
    AnagramUnscrambler.prototype.execute = function () {
        var words = this.dictionary.split(",");
        for (var i = 0; i < words.length; i++) {
            words[i] = words[i].trim();
        }
        var anagram = new Anagram(words);
        this.unscrambled = anagram.unscramble(this.word).toString();
    };
    return AnagramUnscrambler;
})();
//# sourceMappingURL=anagramUnscrambler.js.map
