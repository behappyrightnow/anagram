class PasteProcessor {
    rows: Array<Array<string>>;
    data: string;
    
    constructor(event) {
        this.data = this.dataFrom(event);
    }
    
    process() {
        this.rows = new Array<Array<string>>();
        this.extractRowsFrom(this.data);
    }
    
    dataFrom(event:any) {
        var data: string;
        if (event.clipboardData && event.clipboardData.getData) {
            data = event.clipboardData.getData('text/plain');
        } else if (event.originalEvent && event.originalEvent.clipboardData && event.originalEvent.clipboardData.getData) {
            data = event.originalEvent.clipboardData.getData('text/plain');
        } else if (window.clipboardData) { //IE
            data = window.clipboardData.getData("Text");
        } 
        return data;
    }
    
    extractRowsFrom(pastedData: string) {
        var lines:Array<string> = pastedData.split("\n");
        lines = this.processForMacChrome(lines);
        for (var i=0;i<lines.length;i++) {
            var line = lines[i];
            var cells:Array<string> = line.split("\t");
            for (var j=0;j<cells.length;j++) {
                cells[j] = cells[j].trim();
            }
            this.rows.push(cells);
        }
    }
    
    processForMacChrome(lines): Array<string> {
        var answer:Array<string> = lines;
        if (lines.length == 1) {
            lines = lines[0].split("\r");
            answer = lines;
        }
        return answer;
    }
}