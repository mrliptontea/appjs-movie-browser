/**
 * Uses backend utilities to find films
 * And then uses the app DOM to build list
 * of films to play.
 */
function listFilms()
{
	var $files = $('#films'),
		$loading = $('#loading-bar'),
		cnt = 0;

	$loading.show();
	$files.empty();
	
	setTimeout(function()
	{
		films = window.findFilms();

		// build a list of films found
		for(f in films)
		{
			film = films[f];
			$li = $('.files.abstract li').clone();

			$li.find('.search-text').text($.trim(film.title + ' ' + film.titlepl + ' ' + film.genres + ' ' + film.duration + ' ' + film.year));
			$li.find('a').attr('data-path', film.path);
			$li.find('a').attr('data-fpath', film.path + '/' + film.nam + film.ext);
			$li.find('a').attr('data-nam', film.nam);
			$li.find('a').attr('data-ext', film.ext);
			$li.find('.title-pl').html(film.titlepl);
			$li.find('.title-orig').html(film.title);

			$li.find('.info .filmweb').html(film.filmweb);
			$li.find('.info .filmweb_rate').css('display', notEmpty(film.filmweb_rate) ? 'inline-block' : 'none').html(film.filmweb_rate);
			$li.find('.info .imdb').html(film.imdb);
			$li.find('.info .imdb_rate').css('display', notEmpty(film.imdb_rate) ? 'inline-block' : 'none').html(film.imdb_rate);
			$li.find('.info .desc').html(film.desc);
			$li.find('.info .genres').html(film.genres);
			$li.find('.info .duration').html(film.duration);
			$li.find('.info .duration-mins').html(calcDuration(film.duration));
			$li.find('.info .year').html(film.year);

			if (film.titlepl)
			{
				$li.find('.title-pl').css('display', 'block');
				$li.find('.title-orig').hide();
			}

			if(film.cover != false) $li.find('.cover').attr('src', 'file:///' + film.path + '/' + film.cover).removeClass('no-cover');

			$files.append($li);
			cnt++;
		}

		$('.film-cnt').html(cnt);
		$('#sort a').removeClass('current');
		$('#sort a.path').addClass('current');

		$('.film .mark-tick').on('click', function(e)
		{
			e.preventDefault();
			e.stopPropagation();
			toggleMark($(this));
		})

		$('.film .play').on('click', function(e)
		{
			e.preventDefault();
			$this = $(this);

			if (e.ctrlKey)
			{
				toggleMark($this);
				return;
			}

			if ($this.hasClass('selected'))
			{
				$this.removeClass('selected');
				window.playFilm($this.attr('data-fpath'));
			}
			else
			{
				$('.film .play').removeClass('selected');
				$('.film').removeClass('active');
				$this.addClass('selected').focus();
				$this.closest('li').addClass('active');
			}
		});

		$('.film .title, .film .cover, .film .mark-tick').on({
			'mouseenter': function()
			{
				if ($('#films.show-bar').length == 0)
					return;
				$('#info-bar').html($(this).closest('.film').find('.info').clone().html());
				$('#info-bar').stop(true, false).delay(100).animate({
					height	: 250,
					opacity	: 1
				}, 400);
			},
			'mouseleave': function()
			{
				if ($('#films.show-bar').length == 0)
					return;
				$('#info-bar').stop(true, false).delay(800).animate({
					height	: 0,
					opacity	: 0
				}, 400);
			}
		});

		$loading.fadeOut(250);
	}, 5);
}

function toggleMark(obj)
{
	obj.closest('.film').toggleClass('marked');
}

function downloadCover(url, path, element)
{
	window.getImage(url, path, function()
	{
		img = element.find('img.cover');
		if (img.hasClass('no-cover'))
		{
			img.attr('src', path);
			img.removeClass('no-cover');
		}
	});
}

function copyListToText()
{
	html = '';
	$('.film:visible').each(function()
	{
		title = $(this).find('.title:visible').html();

		html += title + '\n';
	});

	Clipboard.copy(html);
}

function copyListToHtml()
{
	html = '<ul style="line-height: 1.5em;">\n';
	$('.film:visible').each(function()
	{
		title = $(this).find('.title:visible').html();
		filmwebUrl = $(this).find('.details .filmweb').html();

		html += '\t<li><a href="' + filmwebUrl + '">' + title + '</a></li>\n';
	});
	html += '</ul>';

	Clipboard.copy(html);
}

/**
 * Adds jQuery ability to select text inside of element
 */
$.fn.selText = function()
{
	var obj = this[0];
	var selection = obj.ownerDocument.defaultView.getSelection();
	selection.setBaseAndExtent(obj, 0, obj, 999);
	return this;
};

/**
 * jQuery selector :contains() with case insensitive behaviour
 */
jQuery.expr[':'].contains = function(a, i, m)
{
	return (a.textContent || a.innerText || "").toUpperCase().indexOf(m[3].toUpperCase()) >= 0;
};

testUrl = function(url, contains)
{
	return url.indexOf(contains) !== -1
	&& (/^([a-z]([a-z]|\d|\+|-|\.)*):(\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?((\[(|(v[\da-f]{1,}\.(([a-z]|\d|-|\.|_|~)|[!\$&'\(\)\*\+,;=]|:)+))\])|((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=])*)(:\d*)?)(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*|(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)|((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)|((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)){0})(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(url));
};

notEmpty = function(val)
{
	return !(val == null || val == '' || val == undefined);
};

calcDuration = function(txt)
{
	if (!txt)
		return '';

	t = (txt).match(/((\d+)\s*godz\.)?\s*((\d+)\s*min\.)?/i)
	h = parseInt(t[1] ? t[2] : 0, 10);
	m = parseInt(t[3] ? t[4] : 0, 10);

	return h * 60 + m;
}

/**
 * Handling clipboard
 */
var Clipboard = {};
Clipboard.createTextArea = function(value)
{
	var txt = document.createElement('textarea');
	txt.style.position = "absolute";
	txt.style.left = "-100%";
	if (value != null) txt.value = value;
	document.body.appendChild(txt);
	return txt;
};

Clipboard.copy = function(data)
{
	if (data == null) return;
	var txt = Clipboard.createTextArea(data);
	txt.select();
	document.execCommand('Copy');
	document.body.removeChild(txt);
};
