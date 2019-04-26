var gulp = require('gulp');
var gulpLoadPlugins = require('gulp-load-plugins');
var plugins = gulpLoadPlugins();

const minify = require('gulp-minify');
gulp.task('minifier_js', function() {
  gulp.src([
	'assets/js/configuration.js',
	'assets/js/model_controleur.js',
	'assets/js/vue.js',
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
	  'assets/js/configuration.min.js',
	  'assets/js/vue.min.js',
	  'assets/js/model_controleur.min.js',
    ])
    .pipe(plugins.concat('sviewer_generator.min.js'))
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