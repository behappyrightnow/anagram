/// <reference path="../logic/anagram.ts"/>
/// <reference path="../../resources/dictEn.ts"/>
class AnagramCtrl {
    unscrambledWords: Array<string>;
    anagram: Anagram;
    word: string;
    constructor() {
        this.anagram = new Anagram(EN_WORDS);
    }
    unscramble() {
        this.unscrambledWords = this.anagram.unscramble(this.word);
    }
}