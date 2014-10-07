/*
 * grunt-chaas
 * https://github.com/behappyrightnow/grunt-chaas
 *
 * Copyright (c) 2014 SmartOrg
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {
  var path = require('path'),
      fs = require('fs'),
      rootpath = path.dirname(__dirname),
      modulepath = path.join(rootpath, 'node_modules'),
      distpath = path.join(modulepath, 'chaas/dist');

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  grunt.loadTasks(path.join(modulepath, 'grunt-contrib-connect/tasks'));

  grunt.registerTask('chaas', 'Grunt plugin for behappyrightnow/chaas', function() {
    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
      punctuation: '.',
      separator: ', '
    });

    var base = grunt.option('path') || './';

    if ( ! grunt.config('chaas.base') ){
      grunt.config('chaas.base', base);
    }

    grunt.config.merge({
      chaas: grunt.file.readJSON(path.join(base, 'chaas.json')),
      connect: {
        chaas: {
          options: {
            protocol: 'http',
            hostname: 'localhost',
            port: 6789,
            base: [ distpath, base ],
            open: 'http://localhost:6789/chaas.html',
            middleware: function(connect, options, middlewares){
              middlewares.unshift(function updateWiki(request, response, next){
                if ( request.url !== '/page' || request.method !== 'POST' ){
                  return next();
                }
                var name = request.body.name,
                    contents = request.body.contents || '';

                if ( !name ) {
                  response.statusCode = 404;
                  response.end(JSON.stringify({ message: 'Missing parameter: name' }));
                }

                if ( !contents ) { // Do something appropriate?
                }

                var wiki = grunt.config.get('chaas.wiki'),
                    path = grunt.config.get('chaas.base');

                fs.writeFileSync(path + wiki + name, contents);

                response.statusCode = 200;

                response.end();
              });

              middlewares.unshift(connect.urlencoded());

              return middlewares;
            }, // END middleware
          }
        }
      }
    });

    grunt.task.run('connect:chaas:keepalive');
  });

};
