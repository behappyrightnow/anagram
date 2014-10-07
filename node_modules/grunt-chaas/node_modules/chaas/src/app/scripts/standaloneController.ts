class StandaloneController extends FitController {
    loadData($http) {
        this.pageContents = fitUtils.wikiData([
            "This will map to a class called ShouldIBuyChaas. Each row in the table is a test.",
            "",
            "|should I buy chaas|",
            "|cash in wallet|credit card|pints of chaas remaining|go to store?|",
            "|0|no|0|no|",
            "|10|no|0|yes|",
            "|0|yes|0|yes|",
            "|10|yes|0|yes|",
            "|0|no|1|no|",
            "|10|no|1|no|",
            "|0|yes|1|no|",
            "|10|yes|1|no|",
            "",
            "This is an example of executable documentation!",
            "Now let's try a Query table",
            "|Query:employees hired before|10-Dec-1980|",
            "|company number|employee number|first name|last name|hire date|",
            "|4808147|9942|Bill|Mitchell|19-Dec-1966|",
            "|4808147|1429|Bob|Mastin|10-Oct-1975|",
            "|5123122|||||",
            "",
            "Now, let's see a script table.",
            "|script|login dialog driver|Bob|xyzzy|",
            "|login with username|Bob|and password|xyzzy|",
            "|login with username and password;|Bob|xyzzy|",
            "|check|login message|Bob logged in.|",
            "|reject|login with username|Bob|and password|bad password|",
            "|check|login message|Bob not logged in.|",
            "|check not|login message|Bob logged in.|",
            "|ensure|login with username|Bob|and password|xyzzy|",
            "|note|this is a comment|",
            "|show|number of login attempts|"
        ], mockHttp);
    }
}

function mockHttp(someData) {
    return {
        success: function(fn) {
            return mockHttp(someData);
        },
        error: function(fn) {
            return mockHttp(someData);
        }
    }
}