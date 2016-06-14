var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var browserSync = require('browser-sync');
var useref = require('gulp-useref');
var uglify = require('gulp-uglify');
var gulpIf = require('gulp-if');
var minifyCSS = require('gulp-minify-css');
var imagemin = require('gulp-imagemin');
var cache = require('gulp-cache');
var del = require('del');
var runSequence = require('run-sequence');

// syntaxis basica de una tarea de gulp
gulp.task('hello', function() {
  console.log('Hola DevRock!');
});

// Development Tasks
// -----------------

// Iniciamos browserSync server
gulp.task('browserSync', function() {
  browserSync({
    server: {
      baseDir: 'app'
    }
  })
});

gulp.task('sass', function() {
  return gulp.src('app/scss/**/*.scss') // Tomamos todos los archivos con la extensión .scss en app/scss y directorios anidados
    .pipe(sass()) // Pasamos por la libreria gulp-sass
    .pipe(gulp.dest('app/css')) // guardamos el archivo en la carpeta css
    .pipe(browserSync.reload({ // recargamos el navegador con Browser Sync
      stream: true
    }));
});

// Watchers
gulp.task('watch', function() {
  gulp.watch('app/scss/**/*.scss', ['sass']);
  gulp.watch('app/*.html', browserSync.reload);
  gulp.watch('app/js/**/*.js', browserSync.reload);
});

// Tareas de optimización
// ------------------

// Optimizando CSS y JavaScript
gulp.task('useref', function() {
  var assets = useref.assets();
  return gulp.src('app/*.html')
    .pipe(assets)
    // Minifica solo si es un archivo CSS
    .pipe(gulpIf('*.css', minifyCSS()))
    // Uglyfica solo si es un archivo Javascript
    .pipe(gulpIf('*.js', uglify()))
    .pipe(assets.restore())
    .pipe(useref())
    .pipe(gulp.dest('dist'))
});

// Optimización de Imagenes
gulp.task('images', function() {
  return gulp.src('app/img/**/*.+(png|jpg|jpeg|gif|svg)')
  // Agarramos las imagenes y las hacemos pasar por imagemin
  .pipe(cache(imagemin({
      interlaced: true,
    })))
  .pipe(gulp.dest('dist/img'))
});

// Copiamos las fuentes
gulp.task('fonts', function() {
  return gulp.src('app/fonts/**/*')
  .pipe(gulp.dest('dist/fonts'))
});

// Limpiamos la carpeta dist
gulp.task('clean', function(callback) {
  del('dist');
  return cache.clearAll(callback);
});

gulp.task('clean:dist', function(callback) {
  del(['dist/**/*', '!dist/img', '!dist/img/**/*'], callback)
});

// Secuencias de Deploy/Build
// ---------------
gulp.task('default', function(callback) {
  runSequence(['sass', 'browserSync', 'watch'], callback)
});

gulp.task('build', function(callback) {
  runSequence('clean:dist',
    ['sass', 'useref', 'images', 'fonts'], callback)
});
