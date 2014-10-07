/// <reference path="scripts/FitUtils.ts"/>
class Processor {
    fitUtils: FitUtils;
    constructor(fitUtils: FitUtils) {
        this.fitUtils = fitUtils;
    }
    initializeClass(classToInit, classCell:CellWikiElement):any {
        var objectUnderTest = undefined;
        try {
            var objectUnderTest = new window[classToInit]();
            classCell.status = "PASSED";
        }
        catch (e){
            if (objectUnderTest === undefined) {
                //var msg =
                classCell.status = "FAILED";
                classCell.msg = "Class '" + classToInit + "' not found. Please include src file '" + classToInit + ".js' and make sure it contains a class called " + classToInit + ".";
            } else {
                classCell.status = "PASSED";
            }
        }
        return objectUnderTest;
    }
    process(tableEl: TableWikiElement) {
        throw "Can't call Processor directly. Please extend in subclass.";
    }
}

class DecisionProcessor extends Processor {
    process(tableEl: TableWikiElement) {
        var firstRow: Array<CellWikiElement> = tableEl.firstRow();
        var classToInit = this.fitUtils.camelCaseClass(firstRow[0].cellEntry);
        var objectUnderTest = this.initializeClass(classToInit, firstRow[0]);
        this.processTable(tableEl, objectUnderTest, classToInit);
    }

    processTable(tableEl, objectUnderTest, classToInit) {
        var methods = this.processMethods(tableEl, objectUnderTest, classToInit);
        this.processRows(tableEl, methods, objectUnderTest);
    }

    processMethods(tableEl, objectUnderTest, classToInit):Array<Method> {
        var headerRow = tableEl.rows[1];
        var methods = new Array<Method>();
        for (var j = 0; j < headerRow.length; j++) {
            var cell = headerRow[j];
            var methodString = cell.cellEntry;
            var method: Method;
            if (!this.hasQuestionMark(methodString)) {
                method = this.createInputMethod(methodString);
            } else {
                method = this.createOutputMethod(methodString);
            }
            methods.push(method);
            if (objectUnderTest[method.methodName] === undefined) {
                cell.status = "FAILED";
                cell.msg = classToInit+": No method called '"+method.methodName+"'. Either initialize in constructor or provide a function with this name."
            } else {
                cell.status = "PASSED";
            }
        }
        return methods;
    }

    processRows(tableEl, methods, objectUnderTest) {
        for (var i = 2; i < tableEl.rows.length; i++) {
            var row = tableEl.rows[i];
            for (var j = 0; j < row.length; j++) {
                var cell:CellWikiElement = row[j];
                var method:Method = methods[j];
                if (method.isInput) {
                    method.passInput(objectUnderTest, cell.cellEntry);
                }
            }
            if(objectUnderTest["execute"] !== undefined && typeof objectUnderTest["execute"] === "function") {
                objectUnderTest["execute"]();
            }
            for (var j = 0; j < row.length; j++) {
                var cell: CellWikiElement = row[j];
                var method:Method = methods[j];
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
    }

    hasQuestionMark(methodString): boolean {
        return methodString.indexOf('?') !== -1;
    }

    createInputMethod(methodString): Method {
        return new Method(methodString, true);
    }

    createOutputMethod(methodString): Method {
        methodString = methodString.substr(0, methodString.length - 1);
        var method: Method = new Method(methodString, false);
        return method;
    }

}

class QueryProcessor extends Processor {
    
    process(tableEl: TableWikiElement) {
        var firstRow: Array<CellWikiElement> = tableEl.firstRow();
        var classToInit = firstRow[0].cellEntry;
        var colonIndex = classToInit.indexOf(":");
        classToInit = classToInit.substr(colonIndex+1);
        classToInit = this.fitUtils.camelCaseClass(classToInit);
        var objectUnderTest = this.initializeClass(classToInit, firstRow[0]);
        this.checkQueryMethodIn(objectUnderTest, firstRow, classToInit);
        var results = this.callQueryMethod(objectUnderTest, firstRow);
        var fieldHeaders = this.processFieldHeadersIn(tableEl);
        this.processRows(tableEl, fieldHeaders, results);
    }

    checkQueryMethodIn(objectUnderTest:any, firstRow:Array<CellWikiElement>, classToInit: string) {
        var cell:CellWikiElement = firstRow[1];
        if (objectUnderTest["query"] === undefined) {
            cell.status = "FAILED";
            cell.msg = "Method query() not found in class " + classToInit;
        } else {
            cell.status = "PASSED";
        }
    }

    callQueryMethod(objectUnderTest, firstRow:Array<CellWikiElement>) {
        var queryParameter = firstRow[1].cellEntry;
        return objectUnderTest["query"](queryParameter);
    }

    processFieldHeadersIn(tableEl:TableWikiElement): Array<string> {
        return _.pluck(tableEl.rows[1], 'cellEntry');
    }

    matchedRow(resultRow, fieldHeaders:Array<string>, tableEl: TableWikiElement) {
        var highestMatchCount = 0;
        var matchedRow = -1;
        for (var rowIndex=2;rowIndex<tableEl.rows.length;rowIndex++) {
            var row = tableEl.rows[rowIndex];
            var matchCount = 0;
            for (var colIndex=0;colIndex<fieldHeaders.length;colIndex++) {
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
    }

    processRows(tableEl:TableWikiElement, fieldHeaders:Array<string>, results:Array<any>) {
        var surplus = this.matchResultsToTableAndReturnSurplus(results, fieldHeaders, tableEl);
        for (var i=2;i<tableEl.rows.length;i++) {
            var row = tableEl.rows[i];
            this.processRow(row, results, fieldHeaders);
        }
        this.processSurplusRows(surplus, results, fieldHeaders, tableEl);
    }

    processSurplusRows(surplus, results, fieldHeaders, tableEl) {
        for (var i = 0; i < surplus.length; i++) {
            var surplusRow = results[surplus[i]];
            this.processSurplusRow(fieldHeaders, surplusRow, tableEl);
        }
    }

    processSurplusRow(fieldHeaders, surplusRow, tableEl) {
        var tableRow = new Array<CellWikiElement>();
        for (var j = 0; j < fieldHeaders.length; j++) {
            var cellEntry = surplusRow[fieldHeaders[j]];
            tableRow.push(new CellWikiElement(cellEntry));
        }
        tableRow[0].status = "IGNORED";
        tableRow[0].msg = "surplus";
        tableEl.rows.push(tableRow);
    }

    processRow(row, results, fieldHeaders) {
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
    }

    matchResultsToTableAndReturnSurplus(results, fieldHeaders, tableEl):Array<number> {
        var surplus:Array<number> = new Array();
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
    }
}

function applyConstruct(ctor, params) {
    var obj, newobj;

    // Create the object with the desired prototype
    if (typeof Object.create === "function") {
        // ECMAScript 5
        obj = Object.create(ctor.prototype);
    }
    else if ({}.__proto__) {
        // Non-standard __proto__, supported by some browsers
        obj = {};
        obj.__proto__ = ctor.prototype;
        if (obj.__proto__ !== ctor.prototype) {
            // Setting it didn't work
            obj = makeObjectWithFakeCtor();
        }
    }
    else {
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
class ScriptProcessor extends Processor {
    process(tableEl:TableWikiElement) {
        var firstRow: Array<CellWikiElement> = tableEl.firstRow();
        var classToInit = firstRow[1].cellEntry;
        classToInit = this.fitUtils.camelCaseClass(classToInit);
        var args:Array<string> = new Array<string>();
        for (var i=2;i<firstRow.length;i++) {
            args.push(firstRow[i].cellEntry);
        }
        var objectUnderTest = this.callConstructor(classToInit, args, firstRow);

        var reservedWords:Array<string> = ["reject", "check", "note", "check not", "ensure", "show"];
        this.processRows(tableEl, reservedWords, objectUnderTest);
    }

    callConstructor(classToInit, args, firstRow) {
        try {
            var classType = null;
            if (classToInit.indexOf(".") !== -1) {
                var pieces = classToInit.split(".");
                classType = window[pieces[0]];
                for (var i=1;i<pieces.length;i++) {
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
        }
        catch (err) {
            for (var i = 2; i < firstRow.length; i++) {
                firstRow[i].status = "FAILED";
                firstRow[i].msg = "Exception thrown "+err;
            }
        }
    }

    processRows(tableEl: TableWikiElement, reservedWords:Array<string>, objectUnderTest:any) {
        var rows = tableEl.rows;
        for (var i = 1; i < rows.length; i++) {
            var row = rows[i];
            this.processRow(row, reservedWords, objectUnderTest);
        }
    }

    processRow(row, reservedWords, objectUnderTest) {
        var methodCell = row[0];
        var methodString = methodCell.cellEntry;
        if (reservedWords.indexOf(methodString) !== -1) {
            methodString = this.fitUtils.camelCase(methodString);
            if(this.isReservedWord(methodString)) {
                this[methodString](objectUnderTest, row);
            }
            else {
                methodCell.status = "IDLE";
                methodCell.msg = "reserved word: " + methodString;
            }
        }
        else {
            var results = this.methodFromRow(row);
            this.runRowTest(row[0], results, objectUnderTest, true, false);
        }
//        return {methodCell: methodCell, methodString: methodString, method: method, argsArray: argsArray};
    }

    isReservedWord(methodString) {
        return this[methodString] !== undefined;
    }

    runRowTest(resultingCell: CellWikiElement, results, objectUnderTest: any, valueToCompare: any, inverse: boolean) {
            var argsArray = results.argsArray;
            var method = results.method;

            if (objectUnderTest[method.methodName] !== undefined) {
                var result = null;
                if (typeof objectUnderTest[method.methodName] === "function") {
                    result = objectUnderTest[method.methodName].apply(objectUnderTest, argsArray);
                } else {
                    result = objectUnderTest[method.methodName];
                }

                var compareResult = inverse? (result != valueToCompare) : (result == valueToCompare);
                if (compareResult) {
                    this.methodPassed(resultingCell, method);
                }
                else {
                    this.methodFailed(resultingCell, method, result);
                }
            }
            else {
                this.methodDoesNotExist(resultingCell, method);
            }
    }

    check(objectUnderTest: any, row: Array<CellWikiElement>) {

        var results = this.methodFromRow(row.slice(1, row.length-1));
        var resultCell = row[row.length-1];
        this.runRowTest(resultCell, results, objectUnderTest, resultCell.cellEntry, false);

    }

    checkNot(objectUnderTest: any, row: Array<CellWikiElement>) {
        var results = this.methodFromRow(row.slice(1, row.length-1));
        var resultCell = row[row.length-1];
        this.runRowTest(resultCell, results, objectUnderTest, resultCell.cellEntry, true);
    }

    reject(objectUnderTest: any, row: Array<CellWikiElement>) {

        var results = this.methodFromRow(row.slice(1));
        this.runRowTest(row[0], results, objectUnderTest, false, false);
    }

    ensure(objectUnderTest: any, row: Array<CellWikiElement>) {

        var results = this.methodFromRow(row.slice(1));
        this.runRowTest(row[0], results, objectUnderTest, true, false);
    }

    show(objectUnderTest: any, row: Array<CellWikiElement>) {

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
    }

    methodFromRow(row) {
        var methodString = row[0].cellEntry;
        var argsArray = [];
        if (methodString[methodString.length - 1] != ";") {
            if(row.length > 1) {
                argsArray.push(row[1].cellEntry);
            }
            for (var j = 2; j < row.length; j += 2) {
                var argCell = row[j+1];
                var methodCell = row[j];
                argsArray.push(argCell.cellEntry);
                methodString = methodString + " " + methodCell.cellEntry;
            }
        }
        else {
            for (var j = 1; j < row.length; j++) {
                var argCell = row[j];
                argsArray.push(argCell.cellEntry);
            }
            methodString = methodString.replace(";", "");
        }
        var method = this.createMethod(methodString);
        return {argsArray: argsArray, method: method};
    }

    methodFailed(methodCell: CellWikiElement, method: Method, result: any) {
        methodCell.status = "FAILED";
        methodCell.msg = method.methodName + " failed. Got: " + result;
    }

    methodPassed(methodCell: CellWikiElement, method: Method) {
        methodCell.status = "PASSED";
        methodCell.msg = "found method: " + method.methodName;
    }

    methodDoesNotExist(methodCell: CellWikiElement, method: Method) {
        methodCell.status = "FAILED";
        methodCell.msg = "couldn't find method: " + method.methodName;
    }

    createMethod(methodString): Method {
        return new Method(methodString, true);
    }
}