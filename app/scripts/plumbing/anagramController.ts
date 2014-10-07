/// <reference path="../logic/anagram.ts"/>
/// <reference path="../../resources/dictEn.ts"/>
class AnagramCtrl {
    constructor($scope) {
        var anagram = new Anagram(EN_WORDS);
        $scope.unscramble = function () {
            $scope.unscrambledWords = anagram.unscramble($scope.word);
        }
    }
}