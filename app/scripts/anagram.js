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
        var answer = new Array();
        for (var i = 0; i < this.wordList.length; i++) {
            if (this.keyFrom(word) === this.keyFrom(this.wordList[i])) {
                answer.push(this.wordList[i]);
            }
        }
        return answer;
    };

    Anagram.prototype.keyFrom = function (word) {
        return word.split("").sort().join("");
    };
    return Anagram;
})();
//# sourceMappingURL=anagram.js.map
