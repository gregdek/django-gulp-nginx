const prefixer = require('autoprefixer')
const sync     = require('browser-sync')
const cssnano  = require('cssnano')
const del      = require('del')
const fs       = require('fs')
const gulp     = require('gulp')
const changed  = require('gulp-changed')
const include  = require('gulp-file-include')
const htmlmin  = require('gulp-htmlmin')
const imagemin = require('gulp-imagemin')
const plumber  = require('gulp-plumber')
const postcss  = require('gulp-postcss')
const sass     = require('gulp-sass')
const maps     = require('gulp-sourcemaps')
const notifier = require('node-notifier')
const rollup   = require('rollup')
const babel    = require('rollup-plugin-babel')
const commonjs = require('rollup-plugin-commonjs')
const resolve  = require('rollup-plugin-node-resolve')
const uglify   = require('gulp-uglify')
const concat   = require('gulp-concat')
const proxy    = require('http-proxy-middleware')
const ngAnnotate = require('gulp-ng-annotate')

// error handler

const onError = function(error) {
  notifier.notify({
    'title': 'Error',
    'message': 'Compilation failure.'
  })

  console.log(error)
  this.emit('end')
}

// clean

gulp.task('clean', function() {
   del([
     'dist/fonts/**',
     'dist/images/**',
     'dist/js/**',
     'dist/lib/**',
     'dist/templates/**',
     'dist/videos/**',
     'dist/favicon.ico'     
   ])
})

// html

gulp.task('html', ['images'], function() {
  return gulp.src('src/templates/**/*.html')
    .pipe(plumber({ errorHandler: onError }))
    .pipe(include({ prefix: '@', basepath: 'dist/images/' }))
    .pipe(htmlmin({ collapseWhitespace: true, removeComments: true }))
    .pipe(gulp.dest('dist/templates'))
})

// sass

const processors = [
  prefixer({ browsers: 'last 2 versions' }),
  cssnano({ safe: true })
]

gulp.task('sass', function() {
  return gulp.src('src/sass/style.scss')
    .pipe(plumber({ errorHandler: onError }))
    .pipe(maps.init())
    .pipe(sass())
    .pipe(postcss(processors))
    .pipe(maps.write('./maps', { addComment: false }))
    .pipe(gulp.dest('dist/'))
})

// js

//const read = {
//    entry: 'src/js/**/*.js',
//    sourceMap: true,
//    plugins: [
//        resolve({ jsnext: true, main: true }),
//        commonjs(),
//        babel({ exclude: 'node_modules/**' }),
//        uglify()
//    ]
//}
//
//const write = {
//    format: 'iife',
//    sourceMap: true
//}
//
//gulp.task('js', function() {
//  return rollup
//    .rollup(read)
//    .then(function(bundle) {
//        // generate the bundle
//        const files = bundle.generate(write)
//        // write the files to dist
//        fs.writeFileSync('dist/demo.min.js', files.code)
//        fs.writeFileSync('dist/maps/demo.min.js.map', files.map.toString())
//    })
//})

gulp.task('clean-js', function() {
    del(['dist/js/**'])
})

gulp.task('js', ['clean-js'], function() {
    return gulp.src('src/js/**/*.js')
        .pipe(maps.init())
        .pipe(concat('demo.min.js'))
        .pipe(uglify())
        .pipe(maps.write())
        .pipe(gulp.dest('dist/js'));
})

//gulp.task('js', function () {
//  return gulp.src('src/js/**/*.js')
//    .pipe(ngAnnotate())
//    .pipe(uglify())
//    .pipe(gulp.dest('dist/js/'));
//});

// images

gulp.task('images', function() {
  return gulp.src('src/images/**/*.{gif,jpg,png,svg}')
    .pipe(plumber({ errorHandler: onError }))
    .pipe(changed('dist/images'))
    .pipe(imagemin({ progressive: true, interlaced: true }))
    .pipe(gulp.dest('dist/images'))
})

// fonts, videos, favicon

const others = [
  {
    name: 'fonts',
    src:  '/fonts/**/*.{woff,woff2}',
    dest: '/fonts'
  }, {
    name: 'videos',
    src:  '/videos/**/*',
    dest: '/videos'
  }, {
    name: 'favicon',
    src:  '/favicon.ico',
    dest: ''
  }, {
    name: 'lib',
    src: '/lib/**/*',
    dest: '/lib'
  } 
]

others.forEach(function(object) {
  gulp.task(object.name, function() {
    return gulp.src('src' + object.src)
      .pipe(plumber({ errorHandler: onError }))
      .pipe(gulp.dest('dist' + object.dest))
  })
})

// server

const server = sync.create()
const reload = sync.reload

const sendMaps = function(req, res, next) {
  const filename = req.url.split('/').pop()
  const extension = filename.split('.').pop()

  if(extension === 'css' || extension === 'js') {
    res.setHeader('X-SourceMap', '/maps/' + filename + '.map')
  }

  return next()
}

gulp.task('server', function() {
    var target_url = 'http://django:8080'
    var proxyPages = proxy('/',    {target: target_url, xfwd: true})

    // var staticProxy = proxy('/static', {target: target_url, xfwd: true})
    // var adminProxy  = proxy('/admin',  {target: target_url, xfwd: true})

    sync({
        notify: false, 
        port: 8080,
        watchOptions: {
            ignored: '*.map'
        },
        server: {
            baseDir: "dist",
            middleware: [proxyPages]
        }
    });
})

// watch

gulp.task('watch', function() {
  gulp.watch('src/templates/**/*.html', ['html', reload])
  gulp.watch('src/sass/**/*.scss', ['sass', reload])
  gulp.watch('src/js/**/*.js', ['js', reload])
  gulp.watch('src/images/**/*.{gif,jpg,png,svg}', ['images', reload])
})

// build and default tasks

gulp.task('build', ['clean'], function() {
    try {
        // create dist directories
        fs.mkdirSync('dist')
    } catch (err) {
        // whatever.
    }

    try {
        fs.mkdirSync('dist/maps')
    } catch (err) {
        // whatever.
    }


  // run the tasks
  gulp.start('html', 'sass', 'js', 'images', 'fonts', 'videos', 'favicon', 'lib')
})

gulp.task('default', ['build', 'server', 'watch'])
