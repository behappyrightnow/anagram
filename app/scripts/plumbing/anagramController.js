/// <reference path="../logic/anagram.ts"/>
/// <reference path="../../resources/dictEn.ts"/>
var AnagramCtrl = (function () {
    function AnagramCtrl($scope) {
        var anagram = new Anagram(EN_WORDS);
        $scope.unscramble = function () {
            $scope.unscrambledWords = anagram.unscramble($scope.word);
        };
    }
    return AnagramCtrl;
})();
//# sourceMappingURL=anagramController.js.map
