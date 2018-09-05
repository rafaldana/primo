/*
TO DO:
    - flaga --prod
    - sourcemap
    - cleancss
    - dla js uglify
    - kopiowanie assets (!js,scss,img)

*/

var gulp =          require('gulp'),
    sass =          require('gulp-sass'),
    concat =        require('gulp-concat'),
    uglify =        require('gulp-uglify'),
    autoprefixer =  require('gulp-autoprefixer'),
    del =           require('del'),
    browser =       require('browser-sync').create(),
    panini =        require('panini'),
    imagemin =      require('gulp-imagemin');

//CLEAN
function clean() {
    return del('dist');
}

//COPY
function copy() {
    return gulp.src(['src/assets/**/*', '!src/assets/{img,js,scss}/**/*'])
        .pipe(gulp.dest('dist/assets'));
}

//SASS//
function styles() {
    return gulp.src('src/assets/scss/app.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer({
            browsers: ['last 2 versions']
        }))
        .pipe(gulp.dest('dist/assets/css'))
        .pipe(browser.reload({ stream: true }));
}

//SCRIPTS//
function scripts() {
    return gulp.src('src/assets/js/**/*.js')
        .pipe(concat('app.js'))
        .pipe(uglify())
        .pipe(gulp.dest('dist/assets/js'));
}

//PAGES
function pages() {
    return gulp.src('src/pages/**/*.html')
        .pipe(panini({
            root: 'src/pages/',
            layouts: 'src/layouts/',
            partials: 'src/partials/',
            data: 'src/data/',
            helpers: 'src/helpers/'
        }))
        .pipe(gulp.dest('dist'));
}

function resetPages(done) {
    panini.refresh();
    done();
}

//IMAGES
function images() {
    return gulp.src('src/assets/img/**/*')
        .pipe(imagemin())
        .pipe(gulp.dest('dist/assets/img'))
}

//SERVE
function serve(done) {
    browser.init({
        server: "./dist",
        port: 8000
    });
    done();
}

function reload(done) {
    browser.reload();
    done();
}

//WATCH
function watch() {
    gulp.watch(['src/assets/**/*', '!src/assets/{img,js,scss}/**/*'], copy);
    gulp.watch('src/pages/**/*.html').on('all', gulp.series(pages, browser.reload));
    gulp.watch('src/{layouts,partials}/**/*.html').on('all', gulp.series(resetPages, pages, browser.reload));
    gulp.watch('src/scss/**/*.scss').on('all', styles);
    gulp.watch('src/js/**/*.js').on('all', gulp.series(scripts, browser.reload));
    gulp.watch('src/assets/img/**/*').on('all', gulp.series(images, browser.reload));
}

//BUILD
var build = gulp.series(clean, gulp.parallel(pages, styles, scripts, images));
gulp.task('build', build);

//DEFAULT
var def = gulp.series(pages, styles, scripts, serve, watch);
gulp.task('default', def);