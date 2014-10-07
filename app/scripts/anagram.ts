class Anagram {
    wordDict: {};
    constructor(wordList:Array<string>) {
        this.makeDictFrom(wordList);
    }
    makeDictFrom(wordList:Array<string>) {
        this.wordDict = {};
        for (var i=0;i<wordList.length;i++) {
            var word = wordList[i];
            var key = this.keyFrom(word);
            if (key in this.wordDict) {
                this.wordDict[key].push(word);
            } else {
                this.wordDict[key] = [word];
            }
        }
    }
    unscramble(word:string): Array<string> {
        var answer: Array<string> = new Array<string>();
        for (var i=0;i<this.wordList.length;i++) {
            if (this.keyFrom(word) === this.keyFrom(this.wordList[i])) {
                answer.push(this.wordList[i]);
            }
        }
        return answer;
    }

    keyFrom(word: string): string {
        return word.split("").sort().join("");
    }
}