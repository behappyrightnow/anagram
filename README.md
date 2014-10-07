# Step 14

Setup for Chaas. 

Issue:
    sudo npm install behappyrightnow/grunt-chaas

Then, make a file called Gruntfile.js with the following content:

    module.exports = function(grunt) {
        grunt.loadNpmTasks('grunt-chaas')
    }

Finally, make a file called chaas.json with the following entries:

    {
      "fixtures": ["anagram/fixtures/"],
      "logic": ["app/scripts/logic/"],
      "wiki": "anagram/stories/"
    }

Also, make these folders.

You can now run chaas by issuing:
    grunt chaas
    
Make sure that the folder where you issue this contains chaas.json.

We have done all this in this step and checked it in but node_modules should be in your .gitignore.