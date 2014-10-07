/// <reference path="../../app/scripts/logic/anagram.ts"/>
class AnagramUnscrambler {
    dictionary: {};
    word: string;
    unscrambled: string;
    constructor() {
        this.dictionary = {};
        this.word = "";
        this.unscrambled = "";
    }
    execute() {
        var words = this.dictionary.split(",");
        for (var i=0;i<words.length;i++) {
            words[i] = words[i].trim();
        }
        var anagram = new Anagram(words);
        this.unscrambled = anagram.unscramble(this.word).toString();
    }
}