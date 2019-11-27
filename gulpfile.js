var gulp = require('gulp');
var gulpLoadPlugins = require('gulp-load-plugins');
var plugins = gulpLoadPlugins();

const minify = require('gulp-minify');
gulp.task('minifier_js', function() {
  return gulp.src([
	'assets/js/model.js',
	'assets/js/controler.js',
	'assets/js/mentions_legales.js',
  ])
    .pipe(minify({
        ext:{
            src:'.js',
            min:'.min.js'
        }
    }))
    .pipe(gulp.dest('assets/js'))
});

var concat = require('gulp-concat');
gulp.task('concat_min_js', function() {
    return gulp.src([
	  'assets/js/model.min.js',
	  'assets/js/controler.min.js',
    ])
    .pipe(plugins.concat('sviewer_generator.min.js'))
    .pipe(gulp.dest('assets/js'));
});

gulp.task('concat_ml_min_js', function() {
    return gulp.src([
	  'assets/js/model.min.js',
	  'assets/js/mentions_legales.min.js',
    ])
    .pipe(plugins.concat('sv_mentions_legales.min.js'))
    .pipe(gulp.dest('assets/js'));
});

var concatCss = require('gulp-concat-css');
gulp.task('concat_css', function() {
    return gulp.src([
		'assets/css/leaflet.css',
        'assets/css/select2.css',
		'assets/css/select2-bootstrap.css',
		'assets/css/application.css',
    ])
    .pipe(plugins.concatCss('sviewer_generator.min.css'))
    .pipe(plugins.cleanCss())
    .pipe(gulp.dest('assets/css'));

});