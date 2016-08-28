var gulp = 				require("gulp");
		sass =				require("gulp-sass"),
		concat = 			require("gulp-concat"),
		path = 				require("path"),
		watch =				require("gulp-watch"),
		plumber =			require("gulp-plumber"),
		spritesmith = require("gulp.spritesmith"),
		csso = 				require("gulp-csso"),
		buffer = 			require("vinyl-buffer"),
		imagemin = 		require("gulp-imagemin"),
		merge = 			require("merge-stream"),
		replace = 		require("gulp-replace"),
		del = 				require("del"),
		runSequence = require("run-sequence"),
		uglify = 			require("gulp-uglify"),
		templateHtml = require("gulp-template-html"),
		autoprefixer = require('gulp-autoprefixer');

gulp.task("sass", function () {
	return gulp.src("./src/styles/bootstrap.scss")
		.pipe(sass().on('error', sass.logError))
		.pipe(gulp.dest('./public/css/'))
});

gulp.task("sprites", function () {
  var spriteData = gulp.src("./src/assets/images/sprites/*.png").pipe(spritesmith({
		retinaSrcFilter: './src/assets/images/sprites/*-2x.png',
    imgName: "./public/assets/images/sprites.png",
    retinaImgName: "./public/assets/images/sprites-2x.png",
    cssName: "sprites.css",
		padding: 100,
		cssVarMap: function (sprite) {
  		sprite.name = sprite.name.replace("-1x", "");
		}
  }));

	// Pipe image stream through image optimizer and onto disk
  var imgStream = spriteData.img
    .pipe(buffer())
    .pipe(imagemin())
    .pipe(gulp.dest("."));

	// Pipe CSS stream through CSS optimizer and onto disk
  var cssStream = spriteData.css
		.pipe(replace("./public/assets", "../assets"))
    .pipe(csso())
    .pipe(gulp.dest("./public/css"));

	// Return a merged stream to handle both `end` events
  return merge(imgStream, cssStream);
});

gulp.task("css", ["sprites", "srcCss"], function() {
  return gulp.src("./public/css/*.css")
		.pipe(plumber())
    .pipe(concat("main.css"))
		.pipe(autoprefixer({
			browsers: ['last 2 versions'],
			cascade: false
		}))
    .pipe(gulp.dest("./public/css/"));
});

gulp.task("srcCss", function() {
  return gulp.src("./src/css/**/*.css")
    .pipe(concat("landing-pages.css"))
		.pipe(autoprefixer({
			browsers: ['last 2 versions'],
			cascade: false
		}))
    .pipe(gulp.dest("./public/css/"));
});

gulp.task('templateHtml', function () {
    return gulp.src('./src/content/template-01/*.html')
      .pipe(templateHtml('./src/templates/template-01/index.html'))
      .pipe(gulp.dest('./public/pages/p01'));
});

gulp.task('templateHtml2', function () {
    return gulp.src('./src/content/template-02/*.html')
      .pipe(templateHtml('./src/templates/template-02/index.html'))
      .pipe(gulp.dest('./public/pages/p02'));
});

gulp.task("js", function () {
	var files = [
		"./src/js/libraries/*.js",
		"./src/js/*.js"
	];

	return gulp.src(files)
		.pipe(concat("bundle.js"))
		.pipe(uglify())
		.pipe(gulp.dest("./public/js/"));
});

gulp.task("pre:clean", function () {
	return del([
		"./public/assets",
		"./public/css"
	]);
});

gulp.task("post:clean", function () {
	return del([
		"./public/css/sprites.css",
		"./public/css/landing-pages.css"
	]);
});

gulp.task("copy:assets", function () {
		gulp.src("./src/assets/fonts/**/*")
			.pipe(gulp.dest("./public/assets/fonts"));

		var filesToCopy = [
			"./src/assets/images/logos/**/*",
		];

		gulp.src(filesToCopy, { base: './src/assets/' })
			.pipe(gulp.dest(".public/assets"));
});


// var realFavicon = require ('gulp-real-favicon');
// var fs = require('fs');
//
// // File where the favicon markups are stored
// var FAVICON_DATA_FILE = 'faviconData.json';
//
// // Generate the icons. This task takes a few seconds to complete.
// // You should run it at least once to create the icons. Then,
// // you should run it whenever RealFaviconGenerator updates its
// // package (see the check-for-favicon-update task below).
// gulp.task('generate-favicon', function(done) {
// 	realFavicon.generateFavicon({
// 		masterPicture: 'src/assets/images/logos/tapad-square.svg',
// 		dest: 'public',
// 		iconsPath: '/',
// 		design: {
// 			ios: {
// 				pictureAspect: 'noChange',
// 				assets: {
// 					ios6AndPriorIcons: false,
// 					ios7AndLaterIcons: true,
// 					precomposedIcons: false,
// 					declareOnlyDefaultIcon: true
// 				}
// 			},
// 			desktopBrowser: {},
// 			windows: {
// 				pictureAspect: 'noChange',
// 				backgroundColor: '#2b5797',
// 				onConflict: 'override',
// 				assets: {
// 					windows80Ie10Tile: true,
// 					windows10Ie11EdgeTiles: {
// 						small: false,
// 						medium: true,
// 						big: true,
// 						rectangle: false
// 					}
// 				}
// 			},
// 			androidChrome: {
// 				pictureAspect: 'noChange',
// 				themeColor: '#ffffff',
// 				manifest: {
// 					name: 'tapad',
// 					display: 'browser',
// 					orientation: 'notSet',
// 					onConflict: 'override',
// 					declared: true
// 				},
// 				assets: {
// 					legacyIcon: false,
// 					lowResolutionIcons: false
// 				}
// 			},
// 			safariPinnedTab: {
// 				pictureAspect: 'blackAndWhite',
// 				threshold: 47.65625,
// 				themeColor: '#5bbad5'
// 			}
// 		},
// 		settings: {
// 			compression: 3,
// 			scalingAlgorithm: 'Mitchell',
// 			errorOnImageTooSmall: false
// 		},
// 		versioning: {
// 			paramName: 'v',
// 			paramValue: '1'
// 		},
// 		markupFile: FAVICON_DATA_FILE
// 	}, function() {
// 		done();
// 	});
// });
//
// // Inject the favicon markups in your HTML pages. You should run
// // this task whenever you modify a page. You can keep this task
// // as is or refactor your existing HTML pipeline.
// gulp.task('inject-favicon-markups', function() {
// 	gulp.src([ 'src/rawhtml/index.html' ])
// 		.pipe(realFavicon.injectFaviconMarkups(JSON.parse(fs.readFileSync(FAVICON_DATA_FILE)).favicon.html_code))
// 		.pipe(gulp.dest('src/rawhtml/out'));
// });
//
// // Check for updates on RealFaviconGenerator (think: Apple has just
// // released a new Touch icon along with the latest version of iOS).
// // Run this task from time to time. Ideally, make it part of your
// // continuous integration system.
// gulp.task('check-for-favicon-update', function(done) {
// 	var currentVersion = JSON.parse(fs.readFileSync(FAVICON_DATA_FILE)).version;
// 	realFavicon.checkForUpdates(currentVersion, function(err) {
// 		if (err) {
// 			throw err;
// 		}
// 	});
// });

gulp.task("watch", ["dev"], function () {
	gulp.watch("./src/js/*.js", ["js"]);
});

gulp.task("production", function (callback) {
	runSequence(
		"pre:clean",
		["css", "js", "templateHtml", "templateHtml2"],
		"copy:assets",
		"post:clean",
		callback
	);
});

gulp.task("dev", function (callback) {
	runSequence(
		"pre:clean",
		["css", "js"],
		"copy:assets",
		callback
	);
});

gulp.task("default", ["production"]);
