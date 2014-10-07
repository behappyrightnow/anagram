var gulp = require('gulp');
var tsc  = require('gulp-typescript-compiler');
require('require-dir')('./gulp');

gulp.task('tsc-app', function () {
  return gulp
    .src(['src/**/*.ts'])
    .pipe(tsc({
        module: '',
        target: 'ES5',
        sourcemap: false,
        logErrors: true
    }))
    .pipe(gulp.dest('src'));
});

gulp.task('tsc-fixture', function () {
  return gulp
    .src(['examples/**/*.ts'])
    .pipe(tsc({
        module: '',
        target: 'ES5',
        sourcemap: false,
        logErrors: true
    }))
    .pipe(gulp.dest('examples'));
});

gulp.task('tsc', ['tsc-app', 'tsc-fixture']);