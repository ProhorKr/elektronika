// VARIABLES & PATHS

let fileswatch   = 'html,htm,txt,json,md,woff2', // List of files extensions for watching & hard reload (comma separated)
    imageswatch  = 'jpg,jpeg,png,webp,svg', // List of images extensions for watching & compression (comma separated)
    baseDir      = 'app', // Base directory path without «/» at the end
    online       = true; // If «false» - Browsersync will work offline without internet connection

let paths = {

    scripts: {
        src: [
			'node_modules/jquery/dist/jquery.min.js', // npm vendor example (npm i --save-dev jquery)
			'node_modules/owl.carousel/dist/owl.carousel.min.js', //Owl-carousel
			'node_modules/slick-carousel/slick/slick.min.js', //Owl-carousel
			'node_modules/flexslider/jquery.flexslider-min.js', //Owl-carousel
            baseDir + '/js/script.js' // Always at the end
        ],
        dest: baseDir + '/js',
    },

    styles: {
        src:  baseDir + '/scss/*.scss',
        dest: baseDir + '/css',
    },

    images: {
        src:  baseDir + '/images/src/**/*',
        dest: baseDir + '/images/dest',
    },

    cssOutputName: 'styles.min.css',
    jsOutputName:  'script.min.js',

}

// LOGIC

const { src, dest, parallel, series, watch } = require('gulp');
const scss         = require('gulp-sass');
const cleancss     = require('gulp-clean-css');
const concat       = require('gulp-concat');
const purge 	   = require('gulp-css-purge');
const csso 	  	   = require('gulp-csso');
const browserSync  = require('browser-sync').create();
const uglify       = require('gulp-uglify-es').default;
const autoprefixer = require('gulp-autoprefixer');
const imagemin     = require('gulp-imagemin');
const newer        = require('gulp-newer');
const sourcemaps   = require('gulp-sourcemaps');
const del          = require('del');

function browsersync() {
	browserSync.init({
		server: { baseDir: baseDir + '/' },
		notify: false,
		online: online
	})
}

function scripts() {
	return src(paths.scripts.src)
	.pipe(concat(paths.jsOutputName))
	.pipe(uglify())
	.pipe(dest(paths.scripts.dest))
	.pipe(browserSync.stream())
}

function styles() {
	return src(paths.styles.src)
	// .pipe(sourcemaps.init())
	.pipe(scss())
	.pipe(concat(paths.cssOutputName))
	.pipe(autoprefixer({ overrideBrowserslist: ['last 10 versions'], grid: true }))
	// .pipe(purge({
    //         trim : true,
    //         shorten : true,
    //         verbose : true
    //     }))
	.pipe(csso())
	// .pipe(cleancss( {level: { 1: { specialComments: 0 } } }))
	// .pipe(sourcemaps.write())
	.pipe(dest(paths.styles.dest))
	.pipe(browserSync.stream())
}

function images() {
	return src(paths.images.src)
	.pipe(newer(paths.images.dest))
	.pipe(imagemin())
	.pipe(dest(paths.images.dest))
}

function cleanimg() {
	return del('' + paths.images.dest + '/**/*', { force: true })
}

function cleanbuild() {
	return del('res', { force: true })
}

function startwatch() {
	watch(baseDir  + '/**/scss/**/*', styles);
	watch(baseDir  + '/**/*.{' + imageswatch + '}', images);
	watch(baseDir  + '/**/*.{' + fileswatch + '}').on('change', browserSync.reload);
	watch([baseDir + '/**/*.js', '!' + paths.scripts.dest + '/*.min.js'], scripts);
}

function buildRes(){
	return src([ // Выбираем нужные файлы
		'app/css/**/*.min.css',
		'app/css/**/*.css',
		'app/js/**/*.min.js',
		'app/images/dest/**/*',
		'app/**/*.html',
		], { base: 'app' }) // Параметр "base" сохраняет структуру проекта при копировании
	.pipe(dest('res'))
}

exports.browsersync = browsersync;
exports.assets      = series(cleanimg, styles, scripts, images);
exports.styles      = styles;
exports.scripts     = scripts;
exports.images      = images;
exports.cleanimg    = cleanimg;
exports.cleanbuild    = cleanbuild;
exports.build 	    = series(cleanbuild, styles, scripts, images, buildRes);
exports.default     = parallel(images, styles, scripts, browsersync, startwatch);