// (function(){
angular.module('chaas', ['ngRoute']).config([
    '$routeProvider', function ($routeProvider) {
        $routeProvider.when('/:page', {
            controller: 'FitController',
            controllerAs: 'fit',
            templateUrl: '/app/views/page.html'
        }).otherwise({ redirectTo: '/HomePage' });
    }]);
// })();
//# sourceMappingURL=app.js.map

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var FitUtils = (function () {
    function FitUtils() {
    }
    FitUtils.prototype.capitalized = function (word) {
        return word.charAt(0).toUpperCase() + word.slice(1);
    };
    FitUtils.prototype.camelCaseClass = function (text) {
        var words = text.split(" ");
        var answer = "";
        for (var i = 0; i < words.length; i++) {
            answer += this.capitalized(words[i]);
        }
        return answer;
    };

    FitUtils.prototype.camelCase = function (text) {
        if (text.indexOf(" ") === -1) {
            return text;
        }
        var words = text.split(" ");
        var answer = words[0];
        for (var i = 1; i < words.length; i++) {
            answer += this.capitalized(words[i]);
        }
        return answer;
    };

    FitUtils.prototype.wikiData = function (lines, $http) {
        var tableFound = false;
        var tableElement;
        var answer = new Array();
        _.each(lines, function (line) {
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
        });
        if (tableElement !== null && tableElement !== undefined) {
            answer.push(tableElement);
        }
        return answer;
    };
    return FitUtils;
})();

var DefaultElement = (function () {
    function DefaultElement(line, $http) {
        this.contents = new Array();
        this.type = "DEFAULT";
        this.process(line, $http);
    }
    DefaultElement.prototype.process = function (line, $http) {
        var state = new WikiState.MinusOne("", "");
        var accumulation = new Array();
        state.transition(accumulation, line, 0);
        for (var i = 0; i < accumulation.length; i++) {
            this.contents.push(accumulation[i].createAtomicElement($http));
        }
    };
    return DefaultElement;
})();

/**
* See FitUtils_automata.JPG in the execJS folder to understand the finite automata implemented here.
*/
var WikiState;
(function (WikiState) {
    var State = (function () {
        function State(text, oldText) {
            this.text = text;
            this.oldText = oldText;
        }
        State.prototype.transition = function (contents, line, index) {
            var character = line[index];
            if (character === undefined) {
                this.endInputTransition(contents);
                return;
            }
            var state = this.nextState(contents, character);
            if (index < line.length - 1) {
                state.transition(contents, line, index + 1);
            } else {
                state.endInputTransition(contents);
            }
        };
        State.prototype.endInputTransition = function (contents) {
            throw "Can't call directly";
        };
        State.prototype.nextState = function (contents, character) {
            throw "Can't call directly";
        };
        State.prototype.createAtomicElement = function ($http) {
            throw "Can't call directly";
        };
        return State;
    })();
    WikiState.State = State;
    var MinusOne = (function (_super) {
        __extends(MinusOne, _super);
        function MinusOne() {
            _super.apply(this, arguments);
        }
        MinusOne.prototype.nextState = function (contents, character) {
            if (character >= 'A' && character <= 'Z') {
                return new Zero(character, this.text);
            } else {
                return new MinusOne(this.text + character, "");
            }
        };
        MinusOne.prototype.endInputTransition = function (contents) {
            contents.push(this);
        };
        MinusOne.prototype.createAtomicElement = function ($http) {
            return new TextElement(this.text);
        };
        return MinusOne;
    })(State);
    WikiState.MinusOne = MinusOne;
    var Zero = (function (_super) {
        __extends(Zero, _super);
        function Zero() {
            _super.apply(this, arguments);
        }
        Zero.prototype.nextState = function (contents, character) {
            if (character >= 'a' && character <= 'z') {
                return new One(this.text + character, this.oldText);
            } else {
                return new MinusOne(this.oldText + this.text + character, "");
            }
        };
        Zero.prototype.endInputTransition = function (contents) {
            contents.push(new MinusOne(this.oldText, ""));
        };
        return Zero;
    })(State);
    WikiState.Zero = Zero;
    var One = (function (_super) {
        __extends(One, _super);
        function One() {
            _super.apply(this, arguments);
        }
        One.prototype.nextState = function (contents, character) {
            if (character >= 'a' && character <= 'z') {
                return new One(this.text + character, this.oldText);
            } else if (character >= 'A' && character <= 'Z') {
                return new Two(this.text + character, this.oldText);
            } else {
                return new MinusOne(this.oldText + this.text + character, "");
            }
        };

        One.prototype.endInputTransition = function (contents) {
            contents.push(new MinusOne(this.oldText, ""));
        };
        return One;
    })(State);
    WikiState.One = One;
    var Two = (function (_super) {
        __extends(Two, _super);
        function Two() {
            _super.apply(this, arguments);
        }
        Two.prototype.nextState = function (contents, character) {
            if ((character >= 'a' && character <= 'z') || (character >= 'A' && character <= 'Z')) {
                return new Two(this.text + character, this.oldText);
            } else {
                contents.push(new MinusOne(this.oldText, ""));
                return new Three(this.text, character);
            }
        };

        Two.prototype.endInputTransition = function (contents) {
            contents.push(new Three(this.text, ""));
        };
        return Two;
    })(State);
    WikiState.Two = Two;
    var Three = (function (_super) {
        __extends(Three, _super);
        function Three() {
            _super.apply(this, arguments);
        }
        Three.prototype.nextState = function (contents, character) {
            contents.push(this);
            return new MinusOne(this.oldText + character, "");
        };

        Three.prototype.endInputTransition = function (contents) {
        };
        Three.prototype.createAtomicElement = function ($http) {
            return new LinkElement(this.text, $http);
        };
        return Three;
    })(State);
    WikiState.Three = Three;
})(WikiState || (WikiState = {}));

var TextElement = (function () {
    function TextElement(text) {
        this.text = text;
        this.type = "TEXT";
    }
    return TextElement;
})();
var LinkElement = (function () {
    function LinkElement(text, $http) {
        this.text = text;

        this.type = "LINK";
        var that = this;
    }
    LinkElement.prototype.url = function () {
        return '#/' + this.text;
    };
    return LinkElement;
})();

var TableWikiElement = (function () {
    function TableWikiElement() {
        this.type = "TABLE";
        this.rows = new Array();
        this.maxCols = 1;
    }
    TableWikiElement.prototype.addRow = function (row) {
        var cells = this.parseCells(row);
        var cellElements = new Array();
        _.each(cells, function (cell) {
            cellElements.push(new CellWikiElement(cell));
        });
        this.rows.push(cellElements);
        if (cells.length > this.maxCols) {
            this.maxCols = cells.length;
        }
    };

    TableWikiElement.prototype.firstRow = function () {
        return this.rows[0];
    };

    TableWikiElement.prototype.parseCells = function (row) {
        var tempLine = row.substr(1);
        var lastSlashLoc = tempLine.lastIndexOf("|");
        tempLine = tempLine.substr(0, lastSlashLoc);
        return tempLine.split("|");
    };
    return TableWikiElement;
})();

var CellWikiElement = (function () {
    function CellWikiElement(cellEntry) {
        this.cellEntry = cellEntry;
        this.status = "IDLE";
        this.msg = null;
        this.expected = null;
        this.actual = null;
    }
    return CellWikiElement;
})();
var fitUtils = new FitUtils();

var Method = (function () {
    function Method(methodString, isInput) {
        this.methodName = fitUtils.camelCase(methodString);
        this.isInput = isInput;
    }
    Method.prototype.passInput = function (objectUnderTest, data) {
        if (objectUnderTest[this.methodName] === undefined || typeof objectUnderTest[this.methodName] !== 'function') {
            objectUnderTest[this.methodName] = data;
        } else {
            objectUnderTest[this.methodName](data);
        }
    };

    Method.prototype.fetchOutput = function (objectUnderTest) {
        var retVal;
        if (objectUnderTest[this.methodName] === undefined || typeof objectUnderTest[this.methodName] !== 'function') {
            if (objectUnderTest[this.methodName] !== undefined) {
                retVal = objectUnderTest[this.methodName];
            }
        } else {
            retVal = objectUnderTest[this.methodName]();
        }

        return retVal;
    };
    return Method;
})();
//# sourceMappingURL=FitUtils.js.map

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="scripts/FitUtils.ts"/>
var Processor = (function () {
    function Processor(fitUtils) {
        this.fitUtils = fitUtils;
    }
    Processor.prototype.initializeClass = function (classToInit, classCell) {
        var objectUnderTest = undefined;
        try  {
            var objectUnderTest = new window[classToInit]();
            classCell.status = "PASSED";
        } catch (e) {
            if (objectUnderTest === undefined) {
                //var msg =
                classCell.status = "FAILED";
                classCell.msg = "Class '" + classToInit + "' not found. Please include src file '" + classToInit + ".js' and make sure it contains a class called " + classToInit + ".";
            } else {
                classCell.status = "PASSED";
            }
        }
        return objectUnderTest;
    };
    Processor.prototype.process = function (tableEl) {
        throw "Can't call Processor directly. Please extend in subclass.";
    };
    return Processor;
})();

var DecisionProcessor = (function (_super) {
    __extends(DecisionProcessor, _super);
    function DecisionProcessor() {
        _super.apply(this, arguments);
    }
    DecisionProcessor.prototype.process = function (tableEl) {
        var firstRow = tableEl.firstRow();
        var classToInit = this.fitUtils.camelCaseClass(firstRow[0].cellEntry);
        var objectUnderTest = this.initializeClass(classToInit, firstRow[0]);
        this.processTable(tableEl, objectUnderTest, classToInit);
    };

    DecisionProcessor.prototype.processTable = function (tableEl, objectUnderTest, classToInit) {
        var methods = this.processMethods(tableEl, objectUnderTest, classToInit);
        this.processRows(tableEl, methods, objectUnderTest);
    };

    DecisionProcessor.prototype.processMethods = function (tableEl, objectUnderTest, classToInit) {
        var headerRow = tableEl.rows[1];
        var methods = new Array();
        for (var j = 0; j < headerRow.length; j++) {
            var cell = headerRow[j];
            var methodString = cell.cellEntry;
            var method;
            if (!this.hasQuestionMark(methodString)) {
                method = this.createInputMethod(methodString);
            } else {
                method = this.createOutputMethod(methodString);
            }
            methods.push(method);
            if (objectUnderTest[method.methodName] === undefined) {
                cell.status = "FAILED";
                cell.msg = classToInit + ": No method called '" + method.methodName + "'. Either initialize in constructor or provide a function with this name.";
            } else {
                cell.status = "PASSED";
            }
        }
        return methods;
    };

    DecisionProcessor.prototype.processRows = function (tableEl, methods, objectUnderTest) {
        for (var i = 2; i < tableEl.rows.length; i++) {
            var row = tableEl.rows[i];
            for (var j = 0; j < row.length; j++) {
                var cell = row[j];
                var method = methods[j];
                if (method.isInput) {
                    method.passInput(objectUnderTest, cell.cellEntry);
                }
            }
            if (objectUnderTest["execute"] !== undefined && typeof objectUnderTest["execute"] === "function") {
                objectUnderTest["execute"]();
            }
            for (var j = 0; j < row.length; j++) {
                var cell = row[j];
                var method = methods[j];
                if (!method.isInput) {
                    var retVal = method.fetchOutput(objectUnderTest);
                    if (retVal == cell.cellEntry) {
                        cell.status = "PASSED";
                    } else {
                        cell.status = "FAILED";
                        cell.msg = null;
                        cell.expected = cell.cellEntry;
                        cell.actual = retVal;
                    }
                }
            }
        }
    };

    DecisionProcessor.prototype.hasQuestionMark = function (methodString) {
        return methodString.indexOf('?') !== -1;
    };

    DecisionProcessor.prototype.createInputMethod = function (methodString) {
        return new Method(methodString, true);
    };

    DecisionProcessor.prototype.createOutputMethod = function (methodString) {
        methodString = methodString.substr(0, methodString.length - 1);
        var method = new Method(methodString, false);
        return method;
    };
    return DecisionProcessor;
})(Processor);

var QueryProcessor = (function (_super) {
    __extends(QueryProcessor, _super);
    function QueryProcessor() {
        _super.apply(this, arguments);
    }
    QueryProcessor.prototype.process = function (tableEl) {
        var firstRow = tableEl.firstRow();
        var classToInit = firstRow[0].cellEntry;
        var colonIndex = classToInit.indexOf(":");
        classToInit = classToInit.substr(colonIndex + 1);
        classToInit = this.fitUtils.camelCaseClass(classToInit);
        var objectUnderTest = this.initializeClass(classToInit, firstRow[0]);
        this.checkQueryMethodIn(objectUnderTest, firstRow, classToInit);
        var results = this.callQueryMethod(objectUnderTest, firstRow);
        var fieldHeaders = this.processFieldHeadersIn(tableEl);
        this.processRows(tableEl, fieldHeaders, results);
    };

    QueryProcessor.prototype.checkQueryMethodIn = function (objectUnderTest, firstRow, classToInit) {
        var cell = firstRow[1];
        if (objectUnderTest["query"] === undefined) {
            cell.status = "FAILED";
            cell.msg = "Method query() not found in class " + classToInit;
        } else {
            cell.status = "PASSED";
        }
    };

    QueryProcessor.prototype.callQueryMethod = function (objectUnderTest, firstRow) {
        var queryParameter = firstRow[1].cellEntry;
        return objectUnderTest["query"](queryParameter);
    };

    QueryProcessor.prototype.processFieldHeadersIn = function (tableEl) {
        return _.pluck(tableEl.rows[1], 'cellEntry');
    };

    QueryProcessor.prototype.matchedRow = function (resultRow, fieldHeaders, tableEl) {
        var highestMatchCount = 0;
        var matchedRow = -1;
        for (var rowIndex = 2; rowIndex < tableEl.rows.length; rowIndex++) {
            var row = tableEl.rows[rowIndex];
            var matchCount = 0;
            for (var colIndex = 0; colIndex < fieldHeaders.length; colIndex++) {
                var actual = resultRow[fieldHeaders[colIndex]];
                var expected = row[colIndex].cellEntry;
                if (actual == expected) {
                    matchCount++;
                    if (matchCount > highestMatchCount) {
                        highestMatchCount = matchCount;
                        matchedRow = rowIndex;
                    }
                }
            }
        }
        return matchedRow;
    };

    QueryProcessor.prototype.processRows = function (tableEl, fieldHeaders, results) {
        var surplus = this.matchResultsToTableAndReturnSurplus(results, fieldHeaders, tableEl);
        for (var i = 2; i < tableEl.rows.length; i++) {
            var row = tableEl.rows[i];
            this.processRow(row, results, fieldHeaders);
        }
        this.processSurplusRows(surplus, results, fieldHeaders, tableEl);
    };

    QueryProcessor.prototype.processSurplusRows = function (surplus, results, fieldHeaders, tableEl) {
        for (var i = 0; i < surplus.length; i++) {
            var surplusRow = results[surplus[i]];
            this.processSurplusRow(fieldHeaders, surplusRow, tableEl);
        }
    };

    QueryProcessor.prototype.processSurplusRow = function (fieldHeaders, surplusRow, tableEl) {
        var tableRow = new Array();
        for (var j = 0; j < fieldHeaders.length; j++) {
            var cellEntry = surplusRow[fieldHeaders[j]];
            tableRow.push(new CellWikiElement(cellEntry));
        }
        tableRow[0].status = "IGNORED";
        tableRow[0].msg = "surplus";
        tableEl.rows.push(tableRow);
    };

    QueryProcessor.prototype.processRow = function (row, results, fieldHeaders) {
        var matchedIndex = row[0].foundIndex;
        if (matchedIndex !== undefined) {
            var actualRow = results[matchedIndex];
            for (var j = 0; j < fieldHeaders.length; j++) {
                if (row[j].cellEntry === '') {
                    row[j].status = "IGNORED";
                    row[j].actual = actualRow[fieldHeaders[j]];
                    continue;
                }
                if (row[j].cellEntry === actualRow[fieldHeaders[j]]) {
                    row[j].status = "PASSED";
                } else {
                    row[j].status = "FAILED";
                    row[j].expected = row[j].cellEntry;
                    row[j].actual = actualRow[fieldHeaders[j]];
                }
            }
        } else {
            row[0].status = "FAILED";
            row[0].msg = "missing";
        }
    };

    QueryProcessor.prototype.matchResultsToTableAndReturnSurplus = function (results, fieldHeaders, tableEl) {
        var surplus = new Array();
        for (var i = 0; i < results.length; i++) {
            var resultRow = results[i];
            var matchedRow = this.matchedRow(resultRow, fieldHeaders, tableEl);
            if (matchedRow !== -1) {
                tableEl.rows[matchedRow][0].foundIndex = i;
            } else {
                surplus.push(i);
            }
        }
        return surplus;
    };
    return QueryProcessor;
})(Processor);

function applyConstruct(ctor, params) {
    var obj, newobj;

    // Create the object with the desired prototype
    if (typeof Object.create === "function") {
        // ECMAScript 5
        obj = Object.create(ctor.prototype);
    } else if ({}.__proto__) {
        // Non-standard __proto__, supported by some browsers
        obj = {};
        obj.__proto__ = ctor.prototype;
        if (obj.__proto__ !== ctor.prototype) {
            // Setting it didn't work
            obj = makeObjectWithFakeCtor();
        }
    } else {
        // Fallback
        obj = makeObjectWithFakeCtor();
    }

    // Set the object's constructor
    obj.constructor = ctor;

    // Apply the constructor function
    newobj = ctor.apply(obj, params);

    // If a constructor function returns an object, that
    // becomes the return value of `new`, so we handle
    // that here.
    if (typeof newobj === "object") {
        obj = newobj;
    }

    // Done!
    return obj;

    // Subroutine for building objects with specific prototypes
    function makeObjectWithFakeCtor() {
        function fakeCtor() {
        }
        fakeCtor.prototype = ctor.prototype;
        return new fakeCtor();
    }
}
var ScriptProcessor = (function (_super) {
    __extends(ScriptProcessor, _super);
    function ScriptProcessor() {
        _super.apply(this, arguments);
    }
    ScriptProcessor.prototype.process = function (tableEl) {
        var firstRow = tableEl.firstRow();
        var classToInit = firstRow[1].cellEntry;
        classToInit = this.fitUtils.camelCaseClass(classToInit);
        var args = new Array();
        for (var i = 2; i < firstRow.length; i++) {
            args.push(firstRow[i].cellEntry);
        }
        var objectUnderTest = this.callConstructor(classToInit, args, firstRow);

        var reservedWords = ["reject", "check", "note", "check not", "ensure", "show"];
        this.processRows(tableEl, reservedWords, objectUnderTest);
    };

    ScriptProcessor.prototype.callConstructor = function (classToInit, args, firstRow) {
        try  {
            var classType = null;
            if (classToInit.indexOf(".") !== -1) {
                var pieces = classToInit.split(".");
                classType = window[pieces[0]];
                for (var i = 1; i < pieces.length; i++) {
                    classType = classType[pieces[i]];
                }
            } else {
                classType = window[classToInit];
            }
            var objectUnderTest = applyConstruct(classType, args);
            console.log(firstRow, firstRow.length);
            for (var j = 2; j < firstRow.length; j++) {
                firstRow[j].status = "PASSED";
            }
            return objectUnderTest;
        } catch (err) {
            for (var i = 2; i < firstRow.length; i++) {
                firstRow[i].status = "FAILED";
                firstRow[i].msg = "Exception thrown " + err;
            }
        }
    };

    ScriptProcessor.prototype.processRows = function (tableEl, reservedWords, objectUnderTest) {
        var rows = tableEl.rows;
        for (var i = 1; i < rows.length; i++) {
            var row = rows[i];
            this.processRow(row, reservedWords, objectUnderTest);
        }
    };

    ScriptProcessor.prototype.processRow = function (row, reservedWords, objectUnderTest) {
        var methodCell = row[0];
        var methodString = methodCell.cellEntry;
        if (reservedWords.indexOf(methodString) !== -1) {
            methodString = this.fitUtils.camelCase(methodString);
            if (this.isReservedWord(methodString)) {
                this[methodString](objectUnderTest, row);
            } else {
                methodCell.status = "IDLE";
                methodCell.msg = "reserved word: " + methodString;
            }
        } else {
            var results = this.methodFromRow(row);
            this.runRowTest(row[0], results, objectUnderTest, true, false);
        }
        //        return {methodCell: methodCell, methodString: methodString, method: method, argsArray: argsArray};
    };

    ScriptProcessor.prototype.isReservedWord = function (methodString) {
        return this[methodString] !== undefined;
    };

    ScriptProcessor.prototype.runRowTest = function (resultingCell, results, objectUnderTest, valueToCompare, inverse) {
        var argsArray = results.argsArray;
        var method = results.method;

        if (objectUnderTest[method.methodName] !== undefined) {
            var result = null;
            if (typeof objectUnderTest[method.methodName] === "function") {
                result = objectUnderTest[method.methodName].apply(objectUnderTest, argsArray);
            } else {
                result = objectUnderTest[method.methodName];
            }

            var compareResult = inverse ? (result != valueToCompare) : (result == valueToCompare);
            if (compareResult) {
                this.methodPassed(resultingCell, method);
            } else {
                this.methodFailed(resultingCell, method, result);
            }
        } else {
            this.methodDoesNotExist(resultingCell, method);
        }
    };

    ScriptProcessor.prototype.check = function (objectUnderTest, row) {
        var results = this.methodFromRow(row.slice(1, row.length - 1));
        var resultCell = row[row.length - 1];
        this.runRowTest(resultCell, results, objectUnderTest, resultCell.cellEntry, false);
    };

    ScriptProcessor.prototype.checkNot = function (objectUnderTest, row) {
        var results = this.methodFromRow(row.slice(1, row.length - 1));
        var resultCell = row[row.length - 1];
        this.runRowTest(resultCell, results, objectUnderTest, resultCell.cellEntry, true);
    };

    ScriptProcessor.prototype.reject = function (objectUnderTest, row) {
        var results = this.methodFromRow(row.slice(1));
        this.runRowTest(row[0], results, objectUnderTest, false, false);
    };

    ScriptProcessor.prototype.ensure = function (objectUnderTest, row) {
        var results = this.methodFromRow(row.slice(1));
        this.runRowTest(row[0], results, objectUnderTest, true, false);
    };

    ScriptProcessor.prototype.show = function (objectUnderTest, row) {
        var results = this.methodFromRow(row.slice(1));
        var method = results.method;
        var argsArray = results.argsArray;
        if (objectUnderTest[method.methodName] !== undefined) {
            var result = objectUnderTest[method.methodName].apply(objectUnderTest, argsArray);
            var cell = new CellWikiElement(result + "");
            cell.status = "SHOW";
            console.log(result);
            row.push(cell);
        }
    };

    ScriptProcessor.prototype.methodFromRow = function (row) {
        var methodString = row[0].cellEntry;
        var argsArray = [];
        if (methodString[methodString.length - 1] != ";") {
            if (row.length > 1) {
                argsArray.push(row[1].cellEntry);
            }
            for (var j = 2; j < row.length; j += 2) {
                var argCell = row[j + 1];
                var methodCell = row[j];
                argsArray.push(argCell.cellEntry);
                methodString = methodString + " " + methodCell.cellEntry;
            }
        } else {
            for (var j = 1; j < row.length; j++) {
                var argCell = row[j];
                argsArray.push(argCell.cellEntry);
            }
            methodString = methodString.replace(";", "");
        }
        var method = this.createMethod(methodString);
        return { argsArray: argsArray, method: method };
    };

    ScriptProcessor.prototype.methodFailed = function (methodCell, method, result) {
        methodCell.status = "FAILED";
        methodCell.msg = method.methodName + " failed. Got: " + result;
    };

    ScriptProcessor.prototype.methodPassed = function (methodCell, method) {
        methodCell.status = "PASSED";
        methodCell.msg = "found method: " + method.methodName;
    };

    ScriptProcessor.prototype.methodDoesNotExist = function (methodCell, method) {
        methodCell.status = "FAILED";
        methodCell.msg = "couldn't find method: " + method.methodName;
    };

    ScriptProcessor.prototype.createMethod = function (methodString) {
        return new Method(methodString, true);
    };
    return ScriptProcessor;
})(Processor);
//# sourceMappingURL=FitProcessors.js.map

var PasteProcessor = (function () {
    function PasteProcessor(event) {
        this.data = this.dataFrom(event);
    }
    PasteProcessor.prototype.process = function () {
        this.rows = new Array();
        this.extractRowsFrom(this.data);
    };

    PasteProcessor.prototype.dataFrom = function (event) {
        var data;
        if (event.clipboardData && event.clipboardData.getData) {
            data = event.clipboardData.getData('text/plain');
        } else if (event.originalEvent && event.originalEvent.clipboardData && event.originalEvent.clipboardData.getData) {
            data = event.originalEvent.clipboardData.getData('text/plain');
        } else if (window.clipboardData) {
            data = window.clipboardData.getData("Text");
        }
        return data;
    };

    PasteProcessor.prototype.extractRowsFrom = function (pastedData) {
        var lines = pastedData.split("\n");
        lines = this.processForMacChrome(lines);
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            var cells = line.split("\t");
            for (var j = 0; j < cells.length; j++) {
                cells[j] = cells[j].trim();
            }
            this.rows.push(cells);
        }
    };

    PasteProcessor.prototype.processForMacChrome = function (lines) {
        var answer = lines;
        if (lines.length == 1) {
            lines = lines[0].split("\r");
            answer = lines;
        }
        return answer;
    };
    return PasteProcessor;
})();
//# sourceMappingURL=pasteProcessor.js.map

(function () {
    angular.module('chaas').factory('CONFIG', [
        '$q', '$http', function ($q, $http) {
            var deferred = $q.defer();

            $http.get('/chaas.json').success(function (data) {
                angular.extend(deferred.promise, data);

                deferred.resolve();
            });

            return angular.extend(deferred.promise, {
                path: function () {
                    return _.reduce(arguments, function (memo, part) {
                        return memo.replace(/\/$/, '') + '/' + part;
                    });
                }
            });
        }]);
})();

// <reference path="../app.ts">
// (function(){
var FitController = (function () {
    function FitController($http, $routeParams, CONFIG) {
        var _this = this;
        CONFIG.then(function () {
            _this.config = CONFIG;

            _this.loadData($http, $routeParams.page);
        });

        this.editMode = false;
        this.rawText = "";
        this.$http = $http;
    }
    FitController.prototype.loadData = function ($http, page) {
        this.pageTitle = page;
        var that = this;
        console.log("Loading data from " + this.config.path(this.config.wiki, page));
        $http({ method: 'GET', url: this.config.path(this.config.wiki, page) }).success(function (data, status, headers, config) {
            that.rawText = data;
            var lines = data.split("\n");
            that.pageContents = fitUtils.wikiData(lines, $http);
        }).error(function (data, status, headers, config) {
            console.log("error!");
        });
    };
    FitController.prototype.runFitTestsOnPage = function () {
        var _this = this;
        console.log("Running fit tests");
        var tables = _.filter(this.pageContents, function (element) {
            return element.type === 'TABLE';
        });
        _.each(tables, function (table) {
            _this.process(table);
        });
    };

    FitController.prototype.process = function (tableEl) {
        var processor = this.createProcessor(tableEl.firstRow());
        processor.process(tableEl);
    };

    FitController.prototype.createProcessor = function (firstRow) {
        if (firstRow.length === 1) {
            return new DecisionProcessor(fitUtils);
        } else {
            var firstCell = firstRow[0].cellEntry.toUpperCase();
            if (firstCell.indexOf("QUERY") !== -1) {
                return new QueryProcessor(fitUtils);
            } else if (firstCell.indexOf("SCRIPT") !== -1) {
                return new ScriptProcessor(fitUtils);
            } else {
                throw "Could not understand which Processor needs to be instantiated!";
            }
        }
    };

    FitController.prototype.editPage = function () {
        this.editMode = true;
    };

    FitController.prototype.savePage = function () {
        var lines = this.rawText.split("\n");
        this.pageContents = fitUtils.wikiData(lines, this.$http);
        this.editMode = false;
        console.log(this.pageTitle);
        console.log(this.rawText);
        var that = this;
        var data = { name: this.pageTitle, contents: this.rawText };
        jQuery.post("/page", data).done(function (data) {
            console.log("Done posting data");
        });
        /*this.$http({method:"POST",url:"/page",data:data}
        ).
        success(function(data, status, headers, config) {
        console.log("Saved successfully");
        }).
        error(function(data, status, headers, config) {
        console.log("Error! Could not save "+that.rawText);
        });*/
    };

    FitController.prototype.pasteContent = function (event) {
        var pasteProcessor = new PasteProcessor(event);
        pasteProcessor.process();
        if (pasteProcessor.rows !== undefined && pasteProcessor.rows.length > 0) {
            this.rawText += "\n";
        }
        for (var i = 0; i < pasteProcessor.rows.length; i++) {
            var row = pasteProcessor.rows[i];
            var line = "|";
            for (var j = 0; j < row.length && row[j] !== ""; j++) {
                line += row[j];
                if (j >= 0 && j < row.length) {
                    line += "|";
                }
            }
            this.rawText += line + "\n";
        }
        this.savePage();
        console.log("Pasted ", pasteProcessor.rows);
    };
    return FitController;
})();

angular.module('chaas').controller('FitController', FitController);
// })();

(function () {
    angular.module('chaas').directive('chaasFixture', function chaasFixtureDirective() {
        return {
            restrict: 'E',
            controller: [
                'CONFIG', '$http', '$element', '$scope', function chaasFixtureLink(CONFIG, $http, $element, $scope) {
                    $scope.processListing = function (listing, path) {
                        _.each(listing.split('\n'), function (basename) {
                            if (!/.js$/.test(basename))
                                return;
                            $element.append($('<script>', {
                                type: 'text/javascript',
                                src: path + basename
                            }));
                        }); // END _.each
                    };
                    CONFIG.then(function () {
                        var allPaths = new Array();
                        debugger;
                        allPaths = CONFIG.logic.concat(CONFIG.fixtures);
                        for (var i = 0; i < allPaths.length; i++) {
                            var path = allPaths[i];
                            (function (path) {
                                $http.get(path).success(function (listing) {
                                    $scope.processListing(listing, path);
                                });
                            })(path);
                        }
                    }); // END CONFIG.then()
                }]
        };
    });
})();
//# sourceMappingURL=chaas-fixture.js.map

(function(module) {
try {
  module = angular.module('chaas');
} catch (e) {
  module = angular.module('chaas', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('views/page.html',
    '<a ng-href="/#/HomePage"><img src="data:image/png;base64,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" class="logo"></a>&nbsp;&nbsp;<b class="pageTitle">{{fit.pageTitle}}</b> <i class="fa fa-pencil-square-o fa-3x pull-right" ng-click="fit.editPage()" ng-if="fit.editMode === false"></i><div ng-if="fit.editMode === false" ng-paste="fit.pasteContent($event)"><span ng-repeat="element in fit.pageContents"><span ng-if="element.type===\'DEFAULT\'"><span ng-repeat="content in element.contents"><span ng-if="content.type===\'TEXT\'">{{content.text}}</span> <span ng-if="content.type===\'LINK\'"><a ng-href="{{content.url()}}">{{content.text}}</a></span></span></span><p ng-if="element.type === \'TABLE\'"><button ng-click="fit.runFitTestsOnPage()" class="btn btn-primary">Run Tests</button></p><table class="table table-bordered table-condensed" ng-if="element.type===\'TABLE\'"><tr ng-repeat="row in element.rows track by $index"><td ng-repeat="cell in row track by $index" ng-class="{greenCell: cell.status === \'PASSED\', redCell: cell.status === \'FAILED\', yellowCell: cell.status === \'IGNORED\', blueCell: cell.status === \'SHOW\'}" colspan="{{row.length<element.maxCols?($index===row.length-1?element.maxCols-row.length+1:1):1}}">{{cell.cellEntry}} <span ng-if="cell.status === \'FAILED\' || cell.status === \'IGNORED\'"><br>&nbsp;<p><span ng-if="cell.msg !== null"><i>{{cell.msg}}</i></span> <span ng-if="cell.msg === null"><span ng-if="cell.expected !== null && cell.expected !==\'\'">Expected: <i>{{cell.expected}}</i><br>But got: <i>{{cell.actual}}</i></span> <span ng-if="cell.expected === null || cell.expected === \'\'"><i>{{cell.actual}}</i></span></span></p></span></td></tr></table><br></span></div><div ng-if="fit.editMode === true"><textarea class="form-control editBox" ng-model="fit.rawText" rows="20"></textarea><br><button class="btn btn-primary" ng-click="fit.savePage()">Save</button></div>');
}]);
})();
