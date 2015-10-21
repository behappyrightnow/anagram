///<reference path="../../../lib/react.d.ts"/>
var Anagram = React.createClass({
    getInitialState: function() {
        return {
            word: ""
        };
    },
    render: function() {
        return (
            <div>
                <h1>Anagram Demo</h1>
                <p/>
                Enter word to unscramble:
                <form><input class="form-control" type="text" name="inputWord" onKeyPress={this.setWord} /></form>
                <UnscrambledWords wordToUnscramble={this.state.word}/>
            </div>
        );
    },
    setWord: function(event) {
        debugger;
        this.setState({word: event.currentTarget.inputWord.value});
    }
});
var UnscrambledWords = React.createClass({
    render: function() {
        debugger;
        var results = this.getResults();
        return (
            <ul>
            {results.map(this.renderWord)}
            </ul>
        );
    },
    getResults: function() {
        debugger;
        var word = this.props.word;
        if (word === undefined) { return new Array();}
        var anagram = new Anagram(EN_WORDS);
        var unscrambledWords = anagram.unscramble(word);
        return unscrambledWords;
    },
    renderWord: function(word) {
        debugger;
        return (
            <li>
                {word}
            </li>
        );
    }

});
ReactDOM.render(<Anagram />, document.getElementById("anagramHolder"));
