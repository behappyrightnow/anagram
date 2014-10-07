'use strict';
/// <reference path="../../typeScriptHeaders/jquery/jquery.d.ts"/>
/// <reference path="../../typeScriptHeaders/jasmine/jasmine.d.ts"/>
/// <reference path="../../src/app/scripts/FitProcessors.ts"/>
describe('FitProcessors', function () {
    describe('Decision Processor', function() {
        var decisionProcessor: DecisionProcessor;
        beforeEach(function() {
            var fitUtils = new FitUtils();
            var wikiElements:Array<WikiElement> = fitUtils.wikiData(["|add ten|","|number|result?|","|10|20|"]);
            var tableElement:TableWikiElement = wikiElements[0];
            decisionProcessor = new DecisionProcessor(tableElement);
        });
        it("should not be undefined", function() {
            expect(decisionProcessor).not.toBe(undefined);
        });
        it("should detect question mark", function(){
            var methodName = "my query method?";
            expect(decisionProcessor.hasQuestionMark(methodName)).toBe(true);
            var methodName = "regular input method";
            expect(decisionProcessor.hasQuestionMark(methodName)).toBe(false);
        });
        it("should create an input method", function() {
            var methodString = "new method";
            var method = decisionProcessor.createInputMethod(methodString);
            expect(method instanceof Method).toBe(true);
            expect(method.isInput).toBe(true);
        });
        it("should create an output method", function() {
            var methodString = "new output method?";
            var method = decisionProcessor.createOutputMethod(methodString);
            expect(method instanceof Method).toBe(true);
            expect(method.isInput).toBe(false);
        });
        it("should generate name for input and output method correctly", function() {
            var methodString = "input method";
            var method = decisionProcessor.createInputMethod(methodString);
            expect(method.methodName).toBe("inputMethod");
            var methodString = "output method?";
            var method = decisionProcessor.createOutputMethod(methodString);
            expect(method.methodName).toBe("outputMethod");
        });

        describe("handles classes with attributes and execute() correctly", function() {
            var tableEl: TableWikiElement;
            var methods: Array<Method>;
            var objectUnderTest: any;
            beforeEach(function() {
                tableEl = new TableWikiElement();
                tableEl.addRow("|Division|");
                tableEl.addRow("|numerator|denominator|quotient?|remainder?|");
                tableEl.addRow("|10|4|2|2|");
                tableEl.addRow("|10|3|3|1|");
                methods = new Array<Method>();
                methods.push(decisionProcessor.createInputMethod("numerator"));
                methods.push(decisionProcessor.createInputMethod("denominator"));
                methods.push(decisionProcessor.createOutputMethod("quotient?"));
                methods.push(decisionProcessor.createOutputMethod("remainder?"));
                objectUnderTest = new window.testClasses["Division"];
            });
            it("should produce correct results", function() {
                decisionProcessor.processRows(tableEl, methods, objectUnderTest);
                expect(tableEl.rows[2][2].status).toBe("PASSED");
                expect(tableEl.rows[2][3].status).toBe("PASSED");
                expect(tableEl.rows[3][2].status).toBe("PASSED");
                expect(tableEl.rows[3][3].status).toBe("PASSED");
            });
            it("should barf when object has no input accessors", function() {
                objectUnderTest = new window.testClasses["DivisionNoInputAccessors"];
                decisionProcessor.processMethods(tableEl, objectUnderTest, "DivisionNoInputAccessors");
                expect(tableEl.rows[1][0].status).toBe("FAILED");
                expect(tableEl.rows[1][0].msg).toEqual("DivisionNoInputAccessors: No input method called 'numerator'. Either initialize in constructor or provide a function with this name.");
                expect(tableEl.rows[1][1].status).toBe("FAILED");
                expect(tableEl.rows[1][1].msg).toEqual("DivisionNoInputAccessors: No input method called 'denominator'. Either initialize in constructor or provide a function with this name.");
            });
        });
        describe("handles classes with setters and getters correctly", function() {
            var tableEl: TableWikiElement;
            var methods: Array<Method>;
            var objectUnderTest: any;
            beforeEach(function() {
                tableEl = new TableWikiElement();
                tableEl.addRow("|Addition|");
                tableEl.addRow("|first|second|sum?|");
                tableEl.addRow("|1|2|3|");
                tableEl.addRow("|10|3|13|");
                methods = new Array<Method>();
                methods.push(decisionProcessor.createInputMethod("first"));
                methods.push(decisionProcessor.createInputMethod("second"));
                methods.push(decisionProcessor.createOutputMethod("sum?"));
                objectUnderTest = new window.testClasses["Addition"];
                decisionProcessor.processRows(tableEl, methods, objectUnderTest);
            });
            it("should produce correct results", function() {
                expect(tableEl.rows[2][2].status).toBe("PASSED");
                expect(tableEl.rows[3][2].status).toBe("PASSED");
            });
        });


    });
    describe("Query Processor", function() {
        var queryProcessor: QueryProcessor;
        var tableElement: TableWikiElement;
        var objectUnderTest: any;
        beforeEach(function() {
            var fitUtils = new FitUtils();
            var wikiElements:Array<WikiElement> =
                fitUtils.wikiData([
                    "|query:people over|21|",
                    "|name|age|sex|",
                    "|John Doe|23|M|",
                    "|Jane Poe|22|F|"
                ]);
            tableElement = wikiElements[0];
            queryProcessor = new QueryProcessor(tableElement);
            objectUnderTest = new window.testClasses["PeopleOver"];
        });
        it("should not be undefined", function() {
            expect(queryProcessor).not.toBe(undefined);
        });
        it("should pass query parameter to query method", function() {
            queryProcessor.callQueryMethod(objectUnderTest, tableElement.rows[0]);
            expect(objectUnderTest.queryParam).toEqual('21');
        });
        it("should return results from query method", function() {
            var results = queryProcessor.callQueryMethod(objectUnderTest, tableElement.rows[0]);
            var peopleOver = new testClasses.PeopleOver();
            expect(results).toEqual(peopleOver.query(21));
        });
        it("should pluck field headers", function() {
            var fieldHeaders = queryProcessor.processFieldHeadersIn(tableElement);
            expect(fieldHeaders).toEqual(['name', 'age','sex']);
        });
        describe("query method detection", function() {
            it("should detect query method properly", function() {
                queryProcessor.checkQueryMethodIn(objectUnderTest, tableElement.rows[0], "PeopleOver");
                expect(tableElement.rows[0][1].status).toEqual("PASSED");
                expect(tableElement.rows[0][1].msg).toBeNull();
            });
            it("should fail if query method is not found", function() {
                tableElement.rows[0][0].cellEntry = "query:people under";
                objectUnderTest = new window.testClasses['PeopleUnder'];
                queryProcessor.checkQueryMethodIn(objectUnderTest, tableElement.rows[0], "PeopleUnder");
                expect(tableElement.rows[0][1].status).toEqual("FAILED");
                expect(tableElement.rows[0][1].msg).toEqual('Method query() not found in class PeopleUnder');
            });
        });
        describe("should match results to table and return surplus", function() {
            it("all rows should be found", function() {
                var fieldHeaders = ['name', 'age', 'sex'];
                var surplus = queryProcessor.matchResultsToTableAndReturnSurplus(objectUnderTest.query(21), fieldHeaders, tableElement);
                expect(surplus.length).toBe(0);
                expect(tableElement.rows[2][0].foundIndex).toBe(1);
                expect(tableElement.rows[3][0].foundIndex).toBe(0);
            });
            it("should return surplus properly", function() {
                var fieldHeaders = ['name', 'age', 'sex'];
                var results = objectUnderTest.query(21);
                results.push({name:'Alice', age:28, sex:'Z'});

                var surplus = queryProcessor.matchResultsToTableAndReturnSurplus(results, fieldHeaders, tableElement);
                expect(surplus.length).toBe(1);
                expect(tableElement.rows[2][0].foundIndex).toBe(1);
                expect(tableElement.rows[3][0].foundIndex).toBe(0);
                expect(surplus[0]).toBe(2);
            });

            describe("row matching", function() {
                var fieldHeaders: Array<string>;
                beforeEach(function() {
                    fieldHeaders = ["name", "age", "sex"];
                })
                it("should not find any match", function() {
                    var resultRow = {
                        name: "Alice",
                        age: 28,
                        sex: 'Z'
                    };
                    expect(queryProcessor.matchedRow(resultRow, fieldHeaders, tableElement)).toBe(-1);
                });
                it("should match one parameter - F", function() {
                    var resultRow = {
                        name: "Alice",
                        age: 28,
                        sex: 'F'
                    };
                    expect(queryProcessor.matchedRow(resultRow, fieldHeaders, tableElement)).toBe(3);
                });
                it("should match one parameter - M", function() {
                    var resultRow = {
                        name: "Alice",
                        age: 28,
                        sex: 'M'
                    };
                    expect(queryProcessor.matchedRow(resultRow, fieldHeaders, tableElement)).toBe(2);
                });
                it("should match one parameter - age", function() {
                    var resultRow = {
                        name: "Alice",
                        age: 23,
                        sex: 'Z'
                    };
                    expect(queryProcessor.matchedRow(resultRow, fieldHeaders, tableElement)).toBe(2);
                });
                it("should match one parameter - name", function() {
                    var resultRow = {
                        name: "Jane Poe",
                        age: 28,
                        sex: 'Z'
                    };
                    expect(queryProcessor.matchedRow(resultRow, fieldHeaders, tableElement)).toBe(3);
                });
            });

        });

    });
    describe("Script Processor", function () {
        var scriptProcessor: ScriptProcessor;
        var tableElement: TableWikiElement;
        var classToInit: string;
        var objectUnderTest: any;
        beforeEach(function () {
            var wikiElements = fitUtils.wikiData([
                "|script|counter|10|",
                "|check|count|10|",
                "|increment by|2|",
                "|show|increment count by one|",
                "|check|count|13|"
            ]);
            tableElement = wikiElements[0];
            scriptProcessor = new ScriptProcessor(fitUtils);
            classToInit = "testClasses.Counter";
        });
        it("should not be undefined", function() {
            expect(scriptProcessor).not.toBe(undefined);
            expect(scriptProcessor).not.toBeNull();
        });
        it("should call constructor correctly", function() {
            var firstRow = tableElement.rows[0];
            var objectUnderTest = scriptProcessor.callConstructor(classToInit, ["10"], firstRow);
            expect(firstRow[2].status).toBe("PASSED");
            expect(objectUnderTest.count).toBe(10);
        })
        it("should run check correctly", function() {
            var row = tableElement.rows[1];
            var objectUnderTest = scriptProcessor.callConstructor(classToInit, ["10"], tableElement.rows[0]);
            scriptProcessor.processRow(row, ["check"], objectUnderTest);
            expect(row[2].status).toBe("PASSED");
        });
        it("should call increment correctly", function() {
            var row = tableElement.rows[2];
            var objectUnderTest = scriptProcessor.callConstructor(classToInit, ["10"], tableElement.rows[0]);
            scriptProcessor.processRow(row, ["check"], objectUnderTest);
            expect(row[0].status).toBe("PASSED");
        });
        it("should show result in table", function() {
            var row = tableElement.rows[3];
            var objectUnderTest = scriptProcessor.callConstructor(classToInit, ["10"], tableElement.rows[0]);
            scriptProcessor.processRow(row, ["show"], objectUnderTest);
            expect(row[2].cellEntry).toBe('11');
            expect(row[2].status).toBe("SHOW");
        });
    });
});
module testClasses {
    export class DivisionNoInputAccessors {
        numerator:number;
        denominator:number;
        quotient:number;
        remainder:number;

        execute() {
            this.quotient = Math.floor(this.numerator / this.denominator);
            this.remainder = this.numerator % this.denominator;
        }

    }

    export class Division {
        numerator:number;
        denominator:number;
        quotient:number;
        remainder:number;

        constructor() {
            this.numerator = 0;
            this.denominator = 1;
        }

        execute() {
            this.quotient = Math.floor(this.numerator / this.denominator);
            this.remainder = this.numerator % this.denominator;
        }

    }

    export class Addition {
        a:number;
        b:number;

        first(a:number) {
            this.a = a;
        }

        second(b:number) {
            this.b = b;
        }

        sum():number {
            return Number(this.a) + Number(this.b);
        }
    }

    export class PeopleOver {
        queryParam:number;

        query(queryParam:number) {
            this.queryParam = queryParam;
            return [
                {
                    "name": "Jane Poe",
                    "age": 22,
                    "sex": 'F'
                },
                {
                    "name": "John Doe",
                    "age": 23,
                    "sex": 'M'
                }
            ]
        }
    }

    export class PeopleUnder {

    }

    export class Counter {
        count:number;

        constructor(startingPoint:number) {
            this.count = Number(startingPoint);
        }

        incrementCountByOne():string {
            this.count += 1;
            return this.count;
        }

        incrementBy(by:number):string {
            this.count += Number(by);
            return true;
        }
    }
}