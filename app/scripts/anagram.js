var Anagram = (function () {
    function Anagram(wordList) {
        this.makeDictFrom(wordList);
    }
    Anagram.prototype.makeDictFrom = function (wordList) {
        this.wordDict = {};
        for (var i = 0; i < wordList.length; i++) {
            var word = wordList[i];
            var key = this.keyFrom(word);
            if (key in this.wordDict) {
                this.wordDict[key].push(word);
            } else {
                this.wordDict[key] = [word];
            }
        }
    };
    Anagram.prototype.unscramble = function (word) {
        var answer = word === undefined ? [] : this.wordDict[this.keyFrom(word)];
        return answer === undefined ? [] : answer;
    };

    Anagram.prototype.keyFrom = function (word) {
        return word.split("").sort().join("");
    };
    return Anagram;
})();
//# sourceMappingURL=anagram.js.map
