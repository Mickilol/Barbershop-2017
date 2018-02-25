var gulp = require("gulp");
var less = require("gulp-less");
var plumber = require("gulp-plumber");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer"); // Для webkit, transformation и т.д.
var mqpacker = require("css-mqpacker"); // Объединение медиа выражений
var minify = require("gulp-csso"); // Минификация css файла
var rename = require("gulp-rename");
var imagemin = require("gulp-imagemin"); // Минификация изображений
var svgstore = require("gulp-svgstore"); // Создание svg спрайта
var svgmin = require("gulp-svgmin"); //Минификация svg файлов

var server = require("browser-sync");
var run = require("run-sequence"); // Позволяет запускать task последовательно друг за другом, а не синхронно 
var del = require("del");


gulp.task("less", function() {
  gulp.src("less/style.less")
  .pipe(plumber()) // обработка ошибок без остановки скрипта
  .pipe(less())
  .pipe(postcss([
    autoprefixer({browsers: [
      "last 1 version",
      "last 2 Chrome versions",
      "last 2 Firefox versions",
      "last 2 Opera versions",
      "last 2 Edge versions"
    ]}),
    mqpacker({
      sort: true
    })
  ]))
  
  .pipe(gulp.dest("css"))
  .pipe(minify())
  .pipe(rename("style.min.css"))
  .pipe(gulp.dest("css"))
  
  .pipe(server.reload({stream: true}));
});

gulp.task("images", function() {
  return gulp.src("build/img/**/*.{png,jpg,gif}")
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.jpegtran({progressize: true})
    ]))
    .pipe(gulp.dest("build/img"));
});

gulp.task("symbols", function() {
  return gulp.src("build/img/**/icon-*.svg")
    .pipe(svgmin())
    .pipe(svgstore({
      inlineSvg: true  
    }))
    .pipe(rename("symbols.svg"))
    .pipe(gulp.dest("build/img"));
});

gulp.task("serve",/*["less"],*/ function() {
  server.init({
    server: "build"
  });
  
  gulp.watch("less/**/*.less", ["less"]);
  gulp.watch("*.html").on("change" , server.reload);
 });

gulp.task("clean", function() {
  return del("build");
});
gulp.task("copy", function() {
  return gulp.src([
    "fonts/**/*.{woff,woff2}",
    "img/**",
    "js/**",
    "*html"
  ], {
    base: "." // Для сохранения путей и вложенностей для файлов
  })
  .pipe(gulp.dest("build"));
});

gulp.task("build", function(fn) {
  run(
      "clean", 
      "copy", 
      "less", 
      "images", 
      "symbols", 
      fn
    );
});

