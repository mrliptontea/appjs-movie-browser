// movie files possible extensions
var extensions = ['.mkv', '.mp4', '.avi', '.divx', '.mov', '.wmv', '.mpeg', '.mpg'];
// windows current drive letter
var currentDrive = process.cwd().split(':')[0];

/** import modules */
var fs = require('fs')
,	path = require('path')
,	open = require('open')
,	http = require('http')
,	child_process = require('child_process')
;
var app = module.exports = require('appjs');
// ini files modules:
var ini = require('ini') // includes encoding to ini
,	nodeini = require('node-ini') // has better parser
;

/** configurable */
var paths,
	player,
	cmdopts,
	config
;

// defaults
config = {
	crawler: {
		folders:	['C:/Filmy']
	},
	player: {
		bin:		"mpc-hc.exe",
		options:	['/fullscreen', '/play']
	}
};

// load config file
try {
	config = nodeini.parseSync('./config.ini');
} catch (ex) {
	console.log(ex);
}

paths	= config.crawler.folders;
cmdopts = config.player.options;
player	= config.player.bin.replace('%X%', currentDrive);

/** utilities */
var in_array = function(arr, obj)
{
	for(var i = 0; i < arr.length; i++)
	{
		if(arr[i] == obj) return true;
	}
	return false;
};

var traverseFilmsPaths = function(tpath)
{
	var files = fs.readdirSync(tpath);
	var film, cover;
	for(var i in files)
	{
		var tfile = tpath + '/' + files[i];
		var stats = fs.statSync(tfile);
		if(stats.isFile())
		{
			ext = path.extname(tfile);
			nam = path.basename(tfile, ext);

			if (in_array(extensions, ext))
			{
				title = path.basename(tpath);
				titlepl = '';
				ininame = tpath + '/' + nam + '.ini';
				cover = false;
				if (fs.existsSync(tpath + '/' + nam + '.jpg'))
					cover = nam + '.jpg';
				else if (fs.existsSync(tpath + '/folder.jpg'))
					cover = 'folder.jpg';

				filmweb = null;
				filmweb_rate = null;
				imdb = null;
				imdb_rate = null;
				desc = null;
				genres = null;
				duration = null;
				year = null;

				if (fs.existsSync(ininame))
				{
					try {
						customData = ini.parse(fs.readFileSync(ininame, 'utf-8'))

						if (customData.Film.title)
							title = customData.Film.title;

						if (customData.Film.titlepl)
							titlepl = customData.Film.titlepl;

						if (customData.Film.filmweb)
							filmweb = customData.Film.filmweb;

						if (customData.Film.filmweb_rate)
							filmweb_rate = customData.Film.filmweb_rate;

						if (customData.Film.imdb)
							imdb = customData.Film.imdb;

						if (customData.Film.imdb_rate)
							imdb_rate = customData.Film.imdb_rate;

						if (customData.Film.desc)
							desc = customData.Film.desc;

						if (customData.Film.genres)
							genres = customData.Film.genres;

						if (customData.Film.duration)
							duration = customData.Film.duration;

						if (customData.Film.year)
							year = customData.Film.year;
					}
					catch (ex) { }
				}

				if (!films[files[i]])
				{
					films[files[i]] = {
						path			: path.dirname(tfile),
						nam				: nam,
						ext				: ext,
						ini				: ininame,
						title			: title,
						titlepl			: titlepl,
						cover			: cover,
						filmweb			: filmweb,
						filmweb_rate	: filmweb_rate,
						imdb			: imdb,
						imdb_rate		: imdb_rate,
						desc			: desc,
						genres			: genres,
						duration		: duration,
						year			: year
					};
				}
			}
		}
		else if(stats.isDirectory())
		{
			traverseFilmsPaths(tfile);
		}
	}
};

var findFilms = function()
{
	films = {};

	// look for drives that contain folders with films
	for(var j = 0; j < paths.length; j++)
	{
		folder = paths[j].replace('%X%', currentDrive);
		if(fs.existsSync(folder))
			traverseFilmsPaths(folder);
	}

	return films;
};

var playFilm = function(filmPath)
{
	if (fs.existsSync(player))
	{
		var run_options = cmdopts.slice();
		run_options.push(filmPath);
		child_process.spawn(player, run_options);
	}
	else
	{
		open(filmPath);
	}
};

var saveIni = function(file, data, section)
{
	return fs.writeFileSync(file, ini.stringify(data, section));
};

var getImage = function (url, savePath, callback)
{
	var request = http.get(url, function(res)
	{
		var imagedata = '';
		res.setEncoding('binary');

		res.on('data', function(chunk)
		{
			imagedata += chunk;
		})

		res.on('end', function(){
			fs.writeFile(savePath, imagedata, 'binary', function(err)
			{
				if (err) throw err;
				callback();
			})
		})
	});
};

app.serveFilesFrom(__dirname + '/content');

var window = app.createWindow(
{
	icons:				__dirname + '/content/icons',
	width:				1280,
	height:				720,
	left:				-1,
	top:				-1,
	autoResize:			false,
	resizable:			true,
	showChrome:			true,
	opacity:			1,
	alpha:				false,
	fullscreen:			false,
	disableSecurity:	true
});

window.on('create', function()
{
	window.frame.show();
	window.frame.center();
	window.frame.maximize();

	// window.frame.openDevTools();
});

window.on('ready', function()
{
	window.open = open;

	window.findFilms = findFilms;
	window.playFilm = playFilm;
	window.saveIni = saveIni;
	window.getImage = getImage;

	window.init();
});