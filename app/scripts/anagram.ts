class Anagram {
    wordList: Array<string>;
    constructor(wordList:Array<string>) {
        this.wordList = wordList;
    }
    unscramble(word:string): string {
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