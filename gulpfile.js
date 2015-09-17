var gulp = require('gulp');
var path = require('path');
var babel = require('gulp-babel');
var exec = require('child_process').exec;

gulp.task('clean', function (done) {
    var fs = require('fs-extra');
    fs.remove(path.join('build'), done);
});

gulp.task('build src', ['clean'], function () {
    return gulp.src([path.join('src', '**/*.babel')])
               .pipe(babel())
               .pipe(gulp.dest(path.join('build')));
});

gulp.task('build test', ['clean'], function() {
    return gulp.src([path.join('test', '**/*.babel')])
               .pipe(babel())
               .pipe(gulp.dest(path.join('build', 'test')));
});

gulp.task('test', ['build src', 'build test'], function (done) {
    exec('istanbul cover ./node_modules/mocha/bin/_mocha build/test/spec.js --report lcovonly -- -R spec && cat ./coverage/lcov.info | ./node_modules/coveralls/bin/coveralls.js && rm -rf ./coverage', function(err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);

        if(err !== null) {
            console.error('code coverage failed!');
            process.exit(1);
        } else {
            done();
        }
    });
    var mocha = require('gulp-mocha');
    return gulp.src('build/test/spec.js', { read: false }).pipe(mocha());
});

gulp.task('default', ['test']);
gulp.task('cov', [], function(done) {
    exec('istanbul cover _mocha build/test/spec.js -- -R spec', function(err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);

        if(err !== null) {
            console.error('code coverage failed!');
            process.exit(1);
        } else {
            done();
            exec('open coverage/lcov-report/index.html');
        }
    });
});
