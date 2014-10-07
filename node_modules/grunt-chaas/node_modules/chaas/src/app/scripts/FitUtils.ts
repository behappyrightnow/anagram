
class FitUtils {
    capitalized(word: string) {
        return word.charAt(0).toUpperCase() + word.slice(1);
    }
    camelCaseClass(text:string) {
        var words = text.split(" ");
        var answer = "";
        for (var i=0;i<words.length;i++) {
            answer += this.capitalized(words[i]);
        }
        return answer;
    }

    camelCase(text:string) {
        if (text.indexOf(" ") === -1) {
            return text;
        }
        var words = text.split(" ");
        var answer = words[0];
        for (var i=1;i<words.length;i++) {
            answer += this.capitalized(words[i]);
        }
        return answer;
    }

    wikiData(lines:Array<string>, $http):Array<WikiElement> {
        var tableFound:boolean = false;
        var tableElement:TableWikiElement;
        var answer: Array<WikiElement> = new Array();
        _.each(lines, function(line) {
            if (!tableFound) {
                if (line.charAt(0) === '|') {
                    tableFound = true;
                    tableElement = new TableWikiElement();
                    tableElement.addRow(line);
                } else {
                    answer.push(new DefaultElement(line, $http));
                }
            } else if (tableFound) {
                if (line.charAt(0) !== '|') {
                    tableFound = false;
                    answer.push(tableElement);
                    tableElement = null;
                    answer.push(new DefaultElement(line));
                } else {
                    tableElement.addRow(line);
                }
            }
        })
        if (tableElement !== null && tableElement !== undefined) {
            answer.push(tableElement);
        }
        return answer;
    }
}

interface WikiElement {
    type: string;
}

class DefaultElement implements WikiElement {
    contents: Array<BasicElement>;
    type: string;

    constructor(line:string, $http) {
        this.contents = new Array<any>();
        this.type = "DEFAULT";
        this.process(line, $http);
    }
    process(line:string, $http) {
        var state = new WikiState.MinusOne("","");
        var accumulation = new Array<WikiState.State>();
        state.transition(accumulation, line, 0);
        for (var i = 0; i < accumulation.length;i++) {
            this.contents.push(accumulation[i].createAtomicElement($http));
        }
    }
}

/**
 * See FitUtils_automata.JPG in the execJS folder to understand the finite automata implemented here.
 */
module WikiState {
    export class State {
        text: string;
        oldText: string;
        constructor(text:string, oldText: string) {
            this.text = text;
            this.oldText = oldText;
        }
        transition(contents:Array<State>,line:string, index:number) {
            var character:string = line[index];
            if (character === undefined) {
                this.endInputTransition(contents);
                return;
            }
            var state:State = this.nextState(contents, character);
            if (index < line.length-1) {
                state.transition(contents, line, index+1);
            } else {
                state.endInputTransition(contents);
            }
        }
        endInputTransition(contents:Array<State>) {
            throw "Can't call directly";
        }
        nextState(contents: Array<State>,character:string):State {
            throw "Can't call directly";
        }
        createAtomicElement($http):BasicElement {
            throw "Can't call directly";
        }
    }
    export class MinusOne extends State {
        nextState(contents: Array<State>,character:string):State {
            if (character>='A' && character<='Z') {
                return new Zero(character, this.text)
            } else {
                return new MinusOne(this.text+character,"")
            }
        }
        endInputTransition(contents:Array<State>) {
            contents.push(this);
        }
        createAtomicElement($http) {
            return new TextElement(this.text);
        }
    }
    export class Zero extends State {
        nextState(contents: Array<State>,character:string):State {
            if (character>='a' && character<='z') {
                return new One(this.text+character, this.oldText);
            } else {
                return new MinusOne(this.oldText+this.text+character,"");
            }
        }
        endInputTransition(contents:Array<State>) {
            contents.push(new MinusOne(this.oldText, ""));
        }
    }
    export class One extends State {
        nextState(contents: Array<State>,character:string):State {
            if (character>='a' && character<='z') {
                return new One(this.text+character, this.oldText)
            } else if (character>='A' && character<='Z') {
                return new Two(this.text+character, this.oldText)
            } else {
                return new MinusOne(this.oldText+this.text+character, "")
            }
        }

        endInputTransition(contents:Array<State>){
            contents.push(new MinusOne(this.oldText, ""));
        }
    }
    export class Two extends State {
        nextState(contents: Array<State>,character:string):State {
            if ((character>='a' && character<='z')||(character>='A' && character<='Z')) {
                return new Two(this.text+character, this.oldText)
            } else {
                contents.push(new MinusOne(this.oldText,""));
                return new Three(this.text,character);
            }
        }

        endInputTransition(contents:Array<State>){
            contents.push(new Three(this.text,""));
        }
    }
    export class Three extends State {
        nextState(contents: Array<State>,character:string):State {
            contents.push(this);
            return new MinusOne(this.oldText+character,"");
        }

        endInputTransition(contents:Array<State>){

        }
        createAtomicElement($http) {
            return new LinkElement(this.text, $http);
        }
    }
}
interface BasicElement {
    text:string;
}
class TextElement implements BasicElement {
    text: string;
    type: string;
    constructor(text:string) {
        this.text = text;
        this.type = "TEXT";
    }
}
class LinkElement implements BasicElement{
    text: string;
    type: string;
    exists: boolean;
    constructor(text:string, $http) {
        this.text = text;

        this.type = "LINK";
        var that = this;
    }

    url(){
      return '#/' + this.text;
    }
}

class TableWikiElement implements WikiElement {
    rows: Array<Array<CellWikiElement>>;
    type: string;
    tableStart: boolean;
    maxCols: number;

    constructor() {
        this.type = "TABLE";
        this.rows = new Array();
        this.maxCols = 1;
    }
    addRow(row: string) {
        var cells = this.parseCells(row);
        var cellElements = new Array<CellWikiElement>();
        _.each(cells, function(cell) {
            cellElements.push(new CellWikiElement(cell));
        })
        this.rows.push(cellElements);
        if (cells.length > this.maxCols) {
            this.maxCols = cells.length;
        }
    }

    firstRow(): Array<CellWikiElement> {
        return this.rows[0];
    }


    parseCells(row) {
        var tempLine:string = row.substr(1);
        var lastSlashLoc = tempLine.lastIndexOf("|");
        tempLine = tempLine.substr(0,lastSlashLoc);
        return tempLine.split("|");
    }

}

class CellWikiElement {
    cellEntry: string;
    status: string;
    msg: string;
    expected: string;
    actual: string;
    constructor(cellEntry:string) {
        this.cellEntry = cellEntry;
        this.status = "IDLE";
        this.msg = null;
        this.expected = null;
        this.actual = null;
    }
}
var fitUtils = new FitUtils();

class Method {
    methodName: string;
    isInput: boolean;
    constructor(methodString, isInput: boolean) {
        this.methodName = fitUtils.camelCase(methodString);
        this.isInput = isInput;
    }

    passInput(objectUnderTest, data:any) {
        if (objectUnderTest[this.methodName]=== undefined ||
            typeof objectUnderTest[this.methodName] !== 'function') {
            objectUnderTest[this.methodName] = data;
        } else {
            objectUnderTest[this.methodName](data);
        }
    }


    fetchOutput(objectUnderTest) {
        var retVal: any;
        if (objectUnderTest[this.methodName]=== undefined ||
            typeof objectUnderTest[this.methodName] !== 'function') {
            if (objectUnderTest[this.methodName] !== undefined) {
                retVal = objectUnderTest [this.methodName];
            }
        } else {
            retVal = objectUnderTest[this.methodName]();
        }

        return retVal;
    }
}
