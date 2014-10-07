'use strict';
/// <reference path="../../typeScriptHeaders/jquery/jquery.d.ts"/>
/// <reference path="../../typeScriptHeaders/jasmine/jasmine.d.ts"/>
/// <reference path="../../src/app/scripts/FitUtils.ts"/>
describe('FitUtils', function () {
    var fitUtils: FitUtils;
    beforeEach(function() {
       fitUtils = new FitUtils();
    });
    it("should camel case Class properly", function() {
        expect(fitUtils.camelCaseClass("should i buy milk")).toBe("ShouldIBuyMilk");
    });
    it("should camel case properly", function() {
        expect(fitUtils.camelCase("cash in wallet")).toBe("cashInWallet");
    });
    describe("Wiki Element Creation", function() {
        it("should turn strings into Default Elements", function() {
            var listOfStrings = ["Hello", "World", "Again"];
            var wikiElements:Array<WikiElement> = fitUtils.wikiData(listOfStrings);
            expect(wikiElements).not.toBe(undefined);
            expect(wikiElements.length).toBe(3);
            for (var i=0;i<wikiElements.length;i++) {
                expect(wikiElements[i]).not.toBe(undefined);
                expect(wikiElements[i].type).toBe("DEFAULT");
            }
        });
        it("should turn piped strings into Table Elements", function () {
            var listOfStrings = ["|Hello|World|", "|This Is|A|Table|"];
            var wikiElements = fitUtils.wikiData(listOfStrings);
            expect(wikiElements).not.toBe(undefined);
            expect(wikiElements.length).toBe(1);
            for (var i = 0; i < wikiElements.length; i++) {
                var element:TableWikiElement = wikiElements[i];
                expect(element).not.toBe(undefined);
                expect(element.type).toBe("TABLE");
                expect(element.maxCols).toBe(3);
                expect(element.rows.length).toBe(2);
            }
        });
        it("should be able to handle multiple tables", function () {
            var listOfStrings = [
                "First Table",  "|Hello|World|",   "|This Is |A Table|","",
                "Second Table", "|Yankee|Doodle|", "|Went To|Town|",    "",
            ];
            var wikiElements = fitUtils.wikiData(listOfStrings);
            expect(wikiElements).not.toBe(undefined);
            expect(wikiElements.length).toBe(6);
            var expectedType = ["DEFAULT", "TABLE", "DEFAULT", "DEFAULT", "TABLE","DEFAULT"]
            for (var i = 0; i < wikiElements.length; i++) {
                expect(wikiElements[i]).not.toBe(undefined);
                expect(wikiElements[i].type).toBe(expectedType[i]);
            }
        });

    });
    describe("Table Wiki Element", function() {
        var tableWikiElement: TableWikiElement;
        beforeEach(function() {
            tableWikiElement = new TableWikiElement();
        });
        it("number of rows initially 0", function() {
            expect(tableWikiElement.rows.length).toBe(0);
        });
        describe("add a row", function() {
            beforeEach(function() {
                tableWikiElement.addRow("|hello|world|");
            });
            it("number of rows increments when row is added", function() {
                expect(tableWikiElement.rows.length).toBe(1);
                expect(tableWikiElement.rows[0][0].cellEntry).toBe("hello");
                expect(tableWikiElement.rows[0][1].cellEntry).toBe("world");
            });
            it("first row set properly", function() {
                expect(tableWikiElement.firstRow()).toBe(tableWikiElement.rows[0]);
            });
        });

    });
    describe("Default Wiki Element", function() {
        var defaultWikiElement: DefaultElement;
        beforeEach(function() {
            defaultWikiElement = new DefaultElement("Hello, I have a CamelCase link here.", mockHttp);
        });
        it("type is default", function() {
            expect(defaultWikiElement.type).toBe("DEFAULT");
        });
        it("should break line into elements", function() {
            var contents = defaultWikiElement.contents;
            expect(contents.length).toBe(3);
            expect(contents[0].text).toBe("Hello, I have a ");
            expect(contents[0].type).toBe("TEXT");
            expect(contents[1].text).toBe("CamelCase");
            expect(contents[1].url()).toBe("#/CamelCase");
            expect(contents[1].type).toBe("LINK");
            expect(contents[2].text).toBe(" link here.");
            expect(contents[2].type).toBe("TEXT");
        });
        it("should deal with blank lines", function() {
            defaultWikiElement = new DefaultElement("", mockHttp);
            var contents = defaultWikiElement.contents;
            expect(contents.length).toBe(1);
            expect(contents[0].text).toBe("");
            expect(contents[0].type).toBe("TEXT");
        });
    });
});