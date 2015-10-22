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
                <form>
                  <input
                    class="form-control"
                    type="text"
                    name="inputWord"
                    onChange={this.setWord}/>
                </form>
                <UnscrambledWords wordToUnscramble={this.state.word}/>
            </div>
        );
    },
    setWord: function(event) {
        this.setState({word: event.target.value});
    }
});
var UnscrambledWords = React.createClass({
    render: function() {
        var results = this.getResults();
        return (
            <ul>
            {results.map(this.renderWord)}
            </ul>
        );
    },
    getResults: function() {
        var word = this.props.wordToUnscramble;
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
