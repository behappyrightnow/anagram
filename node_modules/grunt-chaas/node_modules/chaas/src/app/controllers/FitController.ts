// <reference path="../app.ts">
// (function(){
    class FitController {
        config: any;

        pageContents:Array<WikiElement>;

        pageTitle: string;

        editMode: boolean;

        rawText: string;

        $http: any;

        constructor($http, $routeParams, CONFIG){
            CONFIG.then(()=>{
                this.config = CONFIG;

                this.loadData($http, $routeParams.page);
            });

            this.editMode = false;
            this.rawText = "";
            this.$http = $http;
        }

        loadData($http, page) {
            this.pageTitle = page;
             var that = this;
            console.log("Loading data from "+this.config.path(this.config.wiki, page));
             $http({method: 'GET', url: this.config.path(this.config.wiki, page) }).
                success(function(data, status, headers, config) {
                     that.rawText = data;
                     var lines = data.split("\n");
                     that.pageContents = fitUtils.wikiData(lines, $http);
                }).
                error(function(data, status, headers, config) {
                  console.log("error!");
                });
        }
        runFitTestsOnPage() {
            console.log("Running fit tests");
            var tables = _.filter(this.pageContents, function(element) {
                return element.type === 'TABLE';
            });
            _.each(tables, (table:TableWikiElement) => { this.process(table) });
        }

        process(tableEl:TableWikiElement) {
            var processor:Processor = this.createProcessor(tableEl.firstRow());
            processor.process(tableEl);
        }

        createProcessor(firstRow:any):Processor {
            if (firstRow.length === 1) {
                return new DecisionProcessor(fitUtils);
            } else {
                var firstCell:string = firstRow[0].cellEntry.toUpperCase();
                if (firstCell.indexOf("QUERY") !== -1) {
                    return new QueryProcessor(fitUtils);
                } else if (firstCell.indexOf("SCRIPT") !== -1) {
                    return new ScriptProcessor(fitUtils);
                } else {
                    throw "Could not understand which Processor needs to be instantiated!";
                }
            }
        }

        editPage() {
            this.editMode = true;
        }

        savePage() {
            var lines = this.rawText.split("\n");
            this.pageContents = fitUtils.wikiData(lines, this.$http);
            this.editMode = false;
            console.log(this.pageTitle);
            console.log(this.rawText);
            var that = this;
            var data = {name: this.pageTitle, contents: this.rawText};
            jQuery.post("/page", data).done(function(data) {
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
        }

        pasteContent(event) {
            var pasteProcessor: PasteProcessor = new PasteProcessor(event);
            pasteProcessor.process();
            if (pasteProcessor.rows !== undefined && pasteProcessor.rows.length>0) {
                this.rawText += "\n";
            }
            for (var i=0;i<pasteProcessor.rows.length;i++) {
                var row = pasteProcessor.rows[i];
                var line = "|";
                for (var j=0;j<row.length && row[j]!=="";j++) {
                    line += row[j];
                    if (j>=0 && j<row.length) {
                        line += "|";
                    }
                }
                this.rawText += line+"\n";
            }
            this.savePage();
            console.log("Pasted ", pasteProcessor.rows);
        }
    } // END FitController

    angular.module('chaas')
        .controller('FitController', FitController);

// })();

