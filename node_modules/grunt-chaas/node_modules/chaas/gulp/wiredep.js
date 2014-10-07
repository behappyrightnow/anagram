'use strict';

var gulp = require('gulp');

// inject bower components
gulp.task('wiredep', function () {
  var wiredep = require('wiredep').stream;

  gulp.src('app/styles/*.css')
    .pipe(wiredep({
        directory: 'bower_components'
    }))
    .pipe(gulp.dest('app/styles'));

  gulp.src('app/*.html')
    .pipe(wiredep({
      directory: 'bower_components',
      exclude: ['bootstrap']
    }))
    .pipe(gulp.dest('app'));
});
