// Gulp and plugins
var gulp = require("gulp"),
	// concat = require("gulp-concat"),
	plumber = require("gulp-plumber"),
	rename = require("gulp-rename"),
	uglify = require("gulp-uglify"),
	jshint = require("gulp-jshint"),
	jscs = require('gulp-jscs'),
	sass = require('gulp-sass'),
	minifycss = require('gulp-minify-css');

var paths = {
	source: "src/",
	dist: "dist/"
};

gulp.task('js', function(){
	return gulp.src(paths.source + 'js/*.js')
		.pipe(jshint(".jshintrc"))
		.pipe(plumber())
		.pipe(jscs())
		.pipe(plumber())
		.pipe(gulp.dest('js', {cwd: paths.dist}))
	    .pipe(rename(function(path){
			path.basename += '.min';
		}))
		.pipe(uglify())
	    .pipe(gulp.dest('js', {cwd: paths.dist}));
});


gulp.task('css', function(){
	return gulp.src(paths.source + 'scss/*.scss')
		.pipe(sass())
		.pipe(gulp.dest('css', {cwd: paths.dist}))
	    .pipe(rename(function(path){
			path.basename += '.min';
		}))
		.pipe(minifycss())
	    .pipe(gulp.dest('css', {cwd: paths.dist}));
});


//-----------------------------------------
//
//	Main gulp tasks
//
//-----------------------------------------

// Production Build Task
gulp.task('default', ['js', 'css'], function(){
	// Done!
});

gulp.task('watch', function(){
	gulp.watch(paths.source + 'scss/*.scss', ['css']);
});