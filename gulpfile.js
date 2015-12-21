var gulp = require('gulp'),
    concat = require('gulp-concat'),
    header = require('gulp-header'),
    connect = require('gulp-connect'),
    open = require('gulp-open'),
    jshint = require('gulp-jshint'),
    tap = require('gulp-tap'),
    stylish = require('jshint-stylish'),
    fs = require('fs'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    pathes = {
      root: './',
      build: {
        root: './build/'
      },
      dist: {
        root: './dist/'
      },
      demo: {
        root: './demo/'
      },
      source: {
        root: './src/'
      }
    },
    presentr = {
      filename: 'presentr',
      jsFiles: [
        'src/start.js',
        'src/core.js',
        'src/navigation.js',
        'src/hash.js',
        'src/utils.js',
        'src/storage.js',
        'src/end.js'
      ],
      data: require('./package.json'),
      info: [
        '/*',
        ' * <%= data.name %> <%= data.version %>',
        ' * ',
        ' * <%= data.homepage %>',
        ' * Copyright <%= date.year %>, <%= data.author %>',
        ' *',
        ' * <%= data.license %> License',
        ' *',
        ' */',
        ''
      ],
      date: {
        year: (new Date()).getFullYear()
      }
    };

    function addJSIndent (file, t) {
        var addIndent = '  ';
        var filename = file.path.split('src\\')[1];

        console.log(filename);

        if (filename !== 'start.js' && filename !== 'end.js') {
            var fileLines = fs.readFileSync(file.path).toString().split('\n');
            var newFileContents = '';
            for (var i = 0; i < fileLines.length; i++) {
                newFileContents += addIndent + fileLines[i] + (i === fileLines.length ? '' : '\n');
            }
            file.contents = new Buffer(newFileContents);
        }
    }

    gulp.task('build', function(){
      gulp.src(presentr.jsFiles)
          .pipe(tap(function(file, t){
            addJSIndent(file, t);
          }))
          .pipe(concat(presentr.filename + '.js'))
          .pipe(header(presentr.info.join('\n'), {data: presentr.data, date: presentr.date}))
          .pipe(gulp.dest(pathes.build.root))
          .pipe(jshint())
          .pipe(jshint.reporter(stylish))
          .pipe(connect.reload());
    });

    gulp.task('dist', function(){
      gulp.src(pathes.build.root + presentr.filename + '.js')
          .pipe(gulp.dest(pathes.dist.root))
          .pipe(uglify())
          .pipe(header(presentr.info.join('\n'), {data: presentr.data, date: presentr.date}))
          .pipe(rename(function(path){
            path.basename += '.min';
          }))
          .pipe(gulp.dest(pathes.dist.root));
    });

    gulp.task('connect', function(){
      connect.server({
        root: pathes.root,
        livereload: true,
        port: 3000
      });
    });

    gulp.task('html', function(){
      gulp.src(pathes.demo.root + '*.html')
          .pipe(connect.reload());
    });

    gulp.task('js', function(){
      gulp.src(pathes.source.root + '*.js')
          .pipe(connect.reload());
    });

    gulp.task('watch', function(){
      gulp.watch([pathes.demo.root + '*.html', pathes.source.root + '*.js'], ['html', 'js', 'build']);
    });

    gulp.task('open', function(){
      return gulp.src(pathes.demo.root + 'index.html')
                  .pipe(open({uri: 'http://localhost:3000/' + pathes.demo.root + 'index.html'}));
    });

    gulp.task('server', ['connect', 'watch', 'open']);