var gulp = require("gulp");
var babel = require("gulp-babel");
var plumber = require("gulp-plumber");

gulp.task("watch", function() {
  gulp.watch("src/**/*.js", ["default"]);
});

gulp.task("default", function () {
  return gulp.src("src/**/*.js")
    .pipe(plumber())
    .pipe(babel())
    .pipe(plumber.stop())
    .pipe(gulp.dest("lib"));
});
