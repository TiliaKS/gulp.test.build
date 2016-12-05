'use strict';
const gulp = require('gulp');
const $ = require('gulp-load-plugins')({
	pattern: ['gulp-*', 'gulp.*', 'webpack', 'autoprefixer', 'del']
});
const path = require('path');
const webpackconfig = require('./webpack.config.js');
const browserSync = require('browser-sync').create();
const settings = require('./gulp-settings.js');
const postcssPlagins = [
	$.autoprefixer({
		browsers: ['last 2 version']
	})
];
// ES-2015 handler
const webpackHandler = (dev, cb) => {
	$.webpack(webpackconfig(dev), (err, stats) => {
		if (err) throw new $.util.PluginError('webpack', err);
		$.util.log('[webpack]', stats.toString({
			// output options
		}));
		cb();
	});
}

const allSass = () => {
	return gulp.src(
		[
			path.resolve(__dirname, settings.scssDir.entry + '*.scss'),
			'!' + path.resolve(__dirname, settings.scssDir.entry + settings.scssDir.mainFileName + '.scss')
		],
		{
			base: path.resolve(__dirname, settings.scssDir.entry)
		}
	)
	.pipe($.sass().on('error', $.sass.logError))
	.pipe($.postcss(postcssPlagins))
	.pipe(gulp.dest(path.resolve(__dirname, settings.scssDir.output)));
};

const mainSass = () => {
	const scssUrl = path.resolve(__dirname, settings.scssDir.entry + settings.scssDir.mainFileName);

	return gulp.src(
		scssUrl + '.scss',
		{
			base: scssUrl
		}
	)
	.pipe($.sourcemaps.init())
	.pipe($.sass().on('error', $.sass.logError))
	.pipe($.postcss(postcssPlagins))
	.pipe($.sourcemaps.write('./', {includeContent: true}))
	.pipe(gulp.dest(path.resolve(__dirname, settings.scssDir.mainFileOutput + settings.scssDir.mainFileName)))
	.pipe(browserSync.stream());
};

/*
 * all development tasks
*/
// compile from sass to css
gulp.task('sassTask', gulp.series(allSass, mainSass));

// compile ES-2015 to ES5;
gulp.task(function webpackDev(cb) {
	webpackHandler(true, cb);
});

// compile from pug to html
gulp.task(function pugTask() {
	return gulp.src(
			path.resolve(__dirname, settings.pugDir.entry + '*.pug'),
			{
				base: path.resolve(__dirname, settings.pugDir.entry)
			}
		)
		.pipe($.pug(
			{
				pretty: '\t'
			}
		).on('error', err => {
			console.log(err);
			cb();
		}))
		.pipe(gulp.dest(path.resolve(__dirname, settings.pugDir.output)));
});

// copy images
gulp.task(function copyImages() {
	return gulp.src(
		path.resolve(__dirname, settings.imagesDir.entry + '**/*'),
		{
			base: path.resolve(__dirname, settings.imagesDir.entry)
		}
	).pipe(gulp.dest(path.resolve(__dirname, settings.imagesDir.output)));
});

gulp.task(function watch(cb) {
	let jsES6 = '';

	settings.jsES6.names.forEach(function(item, index) {
		jsES6 += ((index !== 0 ? '|' : '(') + item + '.js' + (index === settings.jsES6.names.length - 1 ? ')' : ''))
	});

	gulp.watch(
		path.resolve(__dirname, settings.scssDir.entry + '**/*.scss'),
		gulp.series('sassTask')
	);

	gulp.watch(
		path.resolve(__dirname, settings.pugDir.entry + '**/*.pug'),
		gulp.series('pugTask')
	);

	gulp.watch(
		[
			path.resolve(__dirname, settings.jsDir.entry + '*'),
			'!' + path.resolve(__dirname, settings.jsDir.entry + '*' + jsES6),
			'!' + path.resolve(__dirname, settings.jsDir.entry + 'modules')
		],
		gulp.series(copyScripts)
	);

	gulp.watch(
		[
			path.resolve(__dirname, settings.jsDir.entry + 'modules/**/*.js'),
			path.resolve(__dirname, settings.jsDir.entry + '*' + jsES6)
		],
		gulp.series('webpackDev')
	);

	gulp.watch(
		path.resolve(__dirname, settings.imagesDir.entry + '**/*'),
		gulp.series('copyImages')
	);

	gulp.watch(
		[
			path.resolve(__dirname, settings.jsDir.output + '*.js'),
			'./*.html'
		],
		gulp.series('reloadPage')
	);

	cb();
});

gulp.task(function reloadPage(cb) {
	browserSync.reload();
	cb();
});

// server
const serve = (cb) => (
	browserSync.init({
		server: {
			baseDir: './',
			port: 3010,
			directory: true,
			notify: false
		}
	}, cb)
);

const clearScripts = (cb) => {
	let jsES6 = '';

	settings.jsES6.names.forEach(function(item, index) {
		jsES6 += ((index !== 0 ? '|' : '(') + item + '.js' + (index === settings.jsES6.names.length - 1 ? ')' : ''))
	});

	$.del(
		[
			path.resolve(__dirname, settings.jsDir.output + '*'),
			'!' + path.resolve(__dirname, settings.jsDir.output + '*' +jsES6)
		],
		{
			read: false
		}
	).then(paths => {
		cb();
	});
}

const copyScripts = () => {
	let jsES6 = '';

	settings.jsES6.names.forEach(function(item, index) {
		jsES6 += ((index !== 0 ? '|' : '(') + item + '.js' + (index === settings.jsES6.names.length - 1 ? ')' : ''))
	});

	return gulp.src(
		[
			path.resolve(__dirname, settings.jsDir.entry + '*'),
			'!' + path.resolve(__dirname, settings.jsDir.entry + '*' + jsES6),
			'!' + path.resolve(__dirname, settings.jsDir.entry + 'modules')
		],
		{
			base: path.resolve(__dirname, settings.jsDir.entry)
		}
	)
	.pipe(gulp.dest(settings.jsDir.output));
}
// build scripts
gulp.task('build', gulp.series(clearScripts, copyScripts));

/*
 * optimization on gulp dist
*/

const beautifyMainCss = () => {
	const cssUrl = path.resolve(__dirname, settings.scssDir.mainFileOutput + settings.scssDir.mainFileName);

	return gulp.src(
			`${cssUrl}.css`,
			{
				base: path.resolve(__dirname, settings.scssDir.output)
			}
		)
		.pipe($.csscomb())
		.pipe(gulp.dest(cssUrl));
};

const beautifyOtherCss = () => {
	const cssUrl = path.resolve(__dirname, settings.scssDir.output);

	return gulp.src(
			[
				`${cssUrl}*.css`,
				`!${cssUrl}*min.css`
			],
			{
				base: cssUrl
			}
		)
		.pipe($.csscomb())
		.pipe(gulp.dest(cssUrl));
};

// css beautify
gulp.task('beautify', gulp.parallel(beautifyMainCss, beautifyOtherCss));


// image optimization
gulp.task(function imagesOptimize() {
	const entry = path.resolve(__dirname, settings.imagesDir.entry + '**/*.+(png|jpg|gif|svg)');
	const output = path.resolve(__dirname, settings.imagesDir.output);

	return gulp.src(
		entry,
			{
				base: path.resolve(__dirname, settings.imagesDir.entry)
			}
		)
		.pipe($.cached('imagesOptimize'))
		.pipe($.imagemin())
		.pipe(gulp.dest(output));
});

// remove JS source map
gulp.task(function webpackDist(cb) {
	webpackHandler(false, cb);
});

gulp.task(function removeScssSourceMap(cb) {
	$.del(
		[
			path.resolve(settings.scssDir.output, '**/*.css.map'),
			path.resolve(__dirname, settings.scssDir.mainFileOutput + '*.css.map')
		],
		{
			read: false
		}
	).then(paths => {
		cb();
	});
});

/*
 * run main development tasks
*/
gulp.task('clear', done => {
	$.cached.caches = {};
	done();
});
gulp.task('dist', gulp.series('build', 'webpackDist', 'imagesOptimize', 'removeScssSourceMap', 'beautify'));
gulp.task('default', gulp.parallel('clear', 'build', 'webpackDev', 'sassTask', 'copyImages', 'pugTask', 'watch', serve));
