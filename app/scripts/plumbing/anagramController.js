/// <reference path="../logic/anagram.ts"/>
/// <reference path="../../resources/dictEn.ts"/>
var AnagramCtrl = (function () {
    function AnagramCtrl() {
        this.anagram = new Anagram(EN_WORDS);
    }
    AnagramCtrl.prototype.unscramble = function () {
        this.unscrambledWords = this.anagram.unscramble(this.word);
    };
    return AnagramCtrl;
})();
//# sourceMappingURL=anagramController.js.map
