var xhr;
var searchUrl = {};
	searchUrl.filmweb = 'http://www.filmweb.pl/search?q=';
	searchUrl.imdb = 'http://www.imdb.com/find?s=tt&ttype=ft&q=';
	searchUrl.google = 'http://www.google.pl/search?q=';
	searchUrl.googleImage = 'http://www.google.pl/search?as_st=y&tbm=isch&tbs=iar:t&as_q=';
	searchUrl.subtitles = 'http://www.podnapisi.net/pl/ppodnapisi/search?sK=';

var urlPrefix = {};
	urlPrefix.filmweb = 'http://www.filmweb.pl';
	urlPrefix.imdb = 'http://www.imdb.com';

var editor = {};

editor.fillForm = function(
	path,
	ini,
	title,
	title_pl,
	filmweb,
	filmweb_rate,
	imdb,
	imdb_rate,
	desc,
	genres,
	duration,
	year,
	cover_path
){
	$form = $('#edit-form');

	$('#film_path').text(path);
	$('#film_ini').text(ini);
	$('#film_title').val(title);
	$('#film_title_pl').val(title_pl);
	$('#film_filmweb').val(filmweb);
	$('#film_filmweb_rate').val(filmweb_rate);
	$('#film_imdb').val(imdb);
	$('#film_imdb_rate').val(imdb_rate);
	$('#film_desc').val(desc);
	$('#film_genres').val(genres);
	$('#film_duration').val(duration);
	$('#film_year').val(year);
	$('#film_cover').text(cover_path);

	$form.find('.star.filmweb').toggle(notEmpty(filmweb_rate));
	$form.find('.star.imdb').toggle(notEmpty(imdb_rate));
};

editor.save = function()
{
	data = {};
	ini					= $('#film_ini').text();
	data.title			= $('#film_title').val();
	data.titlepl		= $('#film_title_pl').val();
	data.filmweb		= $('#film_filmweb').val();
	data.filmweb_rate	= $('#film_filmweb_rate').val();
	data.imdb			= $('#film_imdb').val();
	data.imdb_rate		= $('#film_imdb_rate').val();
	data.desc			= $('#film_desc').val();
	data.genres			= $('#film_genres').val();
	data.duration		= $('#film_duration').val();
	data.year			= $('#film_year').val();

	ret = window.saveIni(ini, data, 'Film');
	if (ret && ret.message)
	{
		alert(ret.message);
		return false;
	}

	titleEl = editor.target.find('.title-orig');
	titleEl.text(data.title);
	titleplEl = editor.target.find('.title-pl');
	titleplEl.text(data.titlepl);
	if (data.titlepl)
	{
		titleEl.hide();
		titleplEl.css('display', 'block');
	}
	else
	{
		titleplEl.hide();
		titleEl.css('display', 'block');
	}

	editor.target.find('.search-text').text($.trim(data.title + ' ' + data.titlepl + ' ' + data.genres + ' ' + data.duration + ' ' + data.year));
	editor.target.find('.info .filmweb').text(data.filmweb);
	editor.target.find('.info .filmweb_rate').css('display', notEmpty(data.filmweb_rate) ? 'inline-block' : 'none').text(data.filmweb_rate);
	editor.target.find('.info .imdb').text(data.imdb);
	editor.target.find('.info .imdb_rate').css('display', notEmpty(data.imdb_rate) ? 'inline-block' : 'none').text(data.imdb_rate);
	editor.target.find('.info .desc').text(data.desc);
	editor.target.find('.info .genres').text(data.genres);
	editor.target.find('.info .duration').text(data.duration);
	editor.target.find('.info .duration-mins').text(calcDuration(data.duration));
	editor.target.find('.info .year').text(data.year);

	editor.target = undefined;

	return true;
};

editor.startEdit = function($el)
{
	editor.cleanAutocompletes();
	editor.target = $el;

	fpath         = $el.find('.play').data('fpath');
	fini          = $el.find('.play').data('path') + '/' + $el.find('.play').data('nam') + '.ini';
	ftitle        = $el.find('.main.title-orig').text();
	ftitlepl      = $el.find('.main.title-pl').text();
	ffilmweb      = $el.find('.info .filmweb').text();
	ffilmweb_rate = $el.find('.info .filmweb_rate').text();
	fimdb         = $el.find('.info .imdb').text();
	fimdb_rate    = $el.find('.info .imdb_rate').text();
	fdesc         = $el.find('.info .desc').text();
	fgenres       = $el.find('.info .genres').text();
	fduration     = $el.find('.info .duration').text();
	fyear         = $el.find('.info .year').text();
	fcover_path   = ($el.find('.no-cover').length > 0) ?
						$el.find('.play').data('path') + '/' + $el.find('.play').data('nam') + '.jpg' : '';

	editor.fillForm(
		fpath,
		fini,
		ftitle,
		ftitlepl,
		ffilmweb,
		ffilmweb_rate,
		fimdb,
		fimdb_rate,
		fdesc,
		fgenres,
		fduration,
		fyear,
		fcover_path
	);

	$.blockUI({
		title:  'Edytowany film: <span class="normal">' + ftitle + '</span>',
		message: $form,
		fadeIn:  0,
		fadeOut: 0
	});
};

editor.cleanAutocompletes = function()
{
	$('.autocomplete').remove();
	$('.focus').removeClass('focus');
};

editor.search = function(service, title)
{
	xhr = $.ajax({
		url: searchUrl[service] + title,
		success: function(data, textStatus, jqXHR)
		{
			results = 0;
			$('.autocomplete').remove();
			$ac = $('#film_' + service).closest('.input-wrap').append('<ul class="autocomplete" />').find('.autocomplete').hide();
			if (service == 'filmweb')
			{
				$all = $('.resultsList:first', data);
				$all.find('.filmInfo').find('dt:not(:first)').prepend(' | ');
				$all.find('.filmInfo dd').find('li:not(:first)').prepend(', ');
				$all.find('.filmInfo dt').append(' ');
				$all.find('.hitDesc').each(function(i)
				{
					$this = $(this);
					$res = $this.find('h3 a');
					title = $res.html();
					link = $res.attr('href');
					details = $this.find('.filmInfo').text();

					$ac.append('<li data-link="' + link + '"><span class="title">' + title + '</span><span class="details">' + details + '</span></li>');
					results++;
				});
			}
			else if (service == 'imdb')
			{
				$('.findList', data).find('.result_text').each(function(i)
				{
					$this = $(this);
					$res = $this.find('a:first');
					title = $res.html();
					link = $res.attr('href');
					details = $this.text().match(/\(\d{4}\)/);

					$ac.append('<li data-link="' + link + '"><span class="title">' + title + '</span><span class="details">' + details + '</span></li>');
					results++;
				});
			}

			if (results == 1)
			{
				// weź to jedno wpisz od razu do pola
				$('#film_' + service).val(urlPrefix[service] + $ac.find('li').data('link')).change();
				editor.cleanAutocompletes();
			}
			else
			{
				if (results)
				// znalezionych jest kilka, pokaż opcje wyboru
				{
					$('.autocomplete li').click(function(e)
					{
						e.stopPropagation();
						$('#film_' + service).val(urlPrefix[service] + $(this).data('link')).change();
						editor.cleanAutocompletes();
					});
				}
				else
				// nic nie znalazło, zaproponuj link do strony
				{
					$ac.append('<li class="not-found">Nie znaleziono żadnych dopasowań. <br> Kliknij tutaj, aby poszukać na stronie</li>');
					$('.autocomplete li').click(function(e)
					{
						e.stopPropagation();
						window.open(searchUrl[service] + $form.find('#film_title').val().toLowerCase());
						editor.cleanAutocompletes();
					});
				}

				// pokaż listę opcji
				$('#film_' + service).addClass('focus');
				$ac.show();

				$(document).unbind('click').unbind('keypress')
					.keypress(function(e)
					{
						switch(e.keyCode)
						{
							case 27: // ESC
								$(document).trigger('click');
								break;
						}
					});

				setTimeout(function()
				{
					$(document).click(function(e)
					{
						$(document).unbind('click').unbind('keypress');
						editor.cleanAutocompletes();
					});
				}, 0);
			}
		}
	});
};

editor.init = function()
{
	$form = $('#edit-form');

	$.ajaxSetup ({
		cache: true,
		dataType: 'html',
		timeout: 8000,
		dataFilter: function(data)
		{
			// prevent loading images
			return data.replace(/src/ig, 'data-src');
		},
		beforeSend: function()
		{
			$('#edit-form .loader').css('visibility', 'visible');
		},
		complete: function(jqXHR, textStatus)
		{
			$('#edit-form .loader').css('visibility', 'hidden');
		}
	});

	$form.find('.blockCancel').click(function()
	{
		$.unblockUI();
	});

	$form.find('label a').click(function(e)
	{
		e.preventDefault();
		$this = $(this);
		title = $form.find('#film_title').val() || $form.find('#film_title_pl').val();

		if ($this.hasClass('find-filmweb'))
		{
			editor.search('filmweb', title.toLowerCase());
		}
		else if ($this.hasClass('find-imdb'))
		{
			editor.search('imdb', title.toLowerCase().replace(/ /g, '+'));
		}
	});

	$form.find('#film_filmweb').bind('dblclick change', function(e)
	{
		url = $(this).val();
		if(testUrl(url, 'filmweb.pl'))
		{
			xhr = $.ajax({
				url: url,
				error: function(data, textStatus, jqXHR)
				{
					$('#film_filmweb_rate').val('');
					$('.star.filmweb').hide();
				},
				success: function(data, textStatus, jqXHR)
				{
					$html = $('[typeof="v:Movie"]', data);
					filmRate = $.trim($html.find('[rel="v:rating"][property="v:average"]').text());
					filmPlot = $.trim($html.find('.filmPlot').text());
					filmGenres = $html.find('.filmInfo th:contains("gatunek")').next('td').html();
					filmDuration = $.trim($html.find('.filmTime').text());
					filmTitlePl = $.trim($html.find('h1[rel="v:rating"] a[property="v:name"]').text());
					filmTitle = $.trim($html.find('h2.text-large.caption').text());
					filmYear = $.trim($html.find('#filmYear').text().replace('(', '').replace(')', ''));

					img = editor.target.find('.no-cover');
					if (img.length > 0)
					{
						url = $html.find('.filmPosterBox .film_mini img').data('src').replace('.6.', '.5.');
						downloadCover(url, $('#film_cover').text(), editor.target);
					}

					if ($('#film_title').val() == '')
					{
						if (filmTitlePl && !filmTitle)
							$('#film_title').val(filmTitlePl);
						else if (filmTitle)
							$('#film_title').val(filmTitle);
					}

					if ($('#film_title_pl').val() == '')
					{
						if (filmTitlePl && filmTitle)
							$('#film_title_pl').val(filmTitlePl);
					}

					if (filmRate && filmRate != '-')
					{
						$('#film_filmweb_rate').val(filmRate);
						$('.star.filmweb').show();
					}
					else
					{
						$('#film_filmweb_rate').val('');
						$('.star.filmweb').hide();
					}

					if (filmPlot)
						$('#film_desc').val(filmPlot);

					if (filmGenres)
					{
						$genres = $(filmGenres);
						$genres.find('li:not(:last)').append(', ');
						$('#film_genres').val($genres.text());
					}

					if (filmDuration)
						$('#film_duration').val(filmDuration);

					if (filmYear)
						$('#film_year').val(filmYear);
				}
			});

			$('.blockCancel').click(function()
			{
				if (xhr) xhr.abort();
			});
		}
		else if (!url)
		{
			$('#film_filmweb').val('');
			$('#film_filmweb_rate').val('');
			$('.star.filmweb').hide();
		}
		else
		{
			alert('Niepoprawny adres!');
			$('#film_filmweb').focus();
		}
	});

	$form.find('#film_imdb').bind('dblclick change', function(e)
	{
		url = $(this).val();
		if(testUrl(url, 'imdb.com'))
		{
			xhr = $.ajax({
				url: url,
				error: function(data, textStatus, jqXHR)
				{
					$('#film_imdb_rate').val('');
					$('.star.imdb').hide();
				},
				success: function(data, textStatus, jqXHR) {
					$html = $('.article.title-overview', data);
					filmRate = $html.find('.star-box-giga-star').text().replace(/\s/g, '').replace('.', ',');

					if (filmRate)
					{
						$('#film_imdb_rate').val(filmRate);
						$('.star.imdb').show();
					}
					else
					{
						$('#film_imdb_rate').val('');
						$('.star.imdb').hide();
					}
				}
			});
		}
		else if (!url)
		{
			$('#film_imdb').val('');
			$('#film_imdb_rate').val('');
			$('.star.imdb').hide();
		}
		else
		{
			alert('Niepoprawny adres!');
			$('#film_imdb').focus();
		}
	});

	$form.find('form').submit(function(e)
	{
		e.preventDefault();

		if (editor.save());
			$.unblockUI();
	});
};

/**
 * Things to do after app started
 */
window.init = function()
{
	listFilms();
	editor.init();
	$('#q').focus();
}

$(function()
{
	var fontSize = 1;

	$('#refresh a').click(function(e)
	{
		e.preventDefault();
		listFilms();
	});

	$('#q').on('keyup change', function()
	{
		if ($(this).val() != '')
		{
			$('#films').find('li .search-text:not(:contains(' + $(this).val() + '))').parent().slideUp();
			$found = $('#films').find('li .search-text:contains(' + $(this).val() + ')');
			$found.parent().slideDown(function(){
				$found.removeAttr('style');
			});
			$('.film-cnt').text($found.length);
			$('#qclear').show();
		}
		else
		{
			$('#qclear').hide();
			$found = $('#films').find('li');
			$found.slideDown(function(){
				$found.removeAttr('style');
			});
			$('.film-cnt').text($found.length);
		}
	});

	$('#qclear').click(function()
	{
		$('#q').val('').keyup();
	});

	$('#action a').click(function(e)
	{
		e.preventDefault();
		$this = $(this);

		switch(true)
		{
			case $this.hasClass('dice'):
				$('.film .play').removeClass('selected');
				$('.film').removeClass('active');
				
				$films = $('#films .film:visible');
				if ($('#films .film.marked:visible').length > 0)
					$films = $('#films .film.marked:visible');

				$random = $films.eq( Math.floor(Math.random() * $films.length) );
				$('body').stop().animate({scrollTop: $random.offset().top - 60}, 300, function(){
					$random.find('.play').addClass('selected').focus();
					$random.closest('li').addClass('active');
				});
				break;
		}
	});

	$('#toggle a').click(function(e)
	{
		e.preventDefault();
		$this = $(this);

		$this.toggleClass('current');

		switch(true)
		{
			case $this.hasClass('rates'):
				$("#films").toggleClass('show-rates', $this.hasClass('current'));
				break;
			case $this.hasClass('bar'):
				$("#films").toggleClass('show-bar', $this.hasClass('current'));
				break;
			case $this.hasClass('marked'):
				$("#films").toggleClass('show-marked', $this.hasClass('current'));
				break;
		}
	});

	$('#view a').click(function(e)
	{
		e.preventDefault();
		$this = $(this);

		$('#view a').removeClass('current');
		$this.addClass('current');

		switch(true)
		{
			case $this.hasClass('tiles'):
				$("#films").removeClass('list');
				break;

			case $this.hasClass('list'):
				$("#films").addClass('list');
				break;
		}
	});

	$('#sort a').click(function(e)
	{
		e.preventDefault();
		$this = $(this);

		$('#sort a').removeClass('current');
		$this.addClass('current');
		$this.toggleClass('asc');

		ord = $this.hasClass('asc') ? 'asc' : 'desc';

		switch(true)
		{
			case $this.hasClass('path'):
				$("#films>li").tsort(".play", {attr: 'data-path', order: ord});
				break;

			case $this.hasClass('az'):
				$("#films>li").tsort("span.title:visible", {order: ord});
				break;

			case $this.hasClass('za'):
				$("#films>li").tsort("span.title:visible", {order: ord});
				break;

			case $this.hasClass('rates-filmweb'):
				$("#films>li").tsort(".info .filmweb_rate", {order: ord});
				break;

			case $this.hasClass('rates-imdb'):
				$("#films>li").tsort(".info .imdb_rate", {order: ord});
				break;

			case $this.hasClass('year'):
				$("#films>li").tsort(".info .year", {order: ord});
				break;

			case $this.hasClass('time'):
				$("#films>li").tsort(".info .duration-mins", {order: ord});
				break;
		}
	});

	$('#font-size a').click(function(e)
	{
		e.preventDefault();
		$this = $(this);

		switch(true)
		{
			case $this.hasClass('minus'):
				if (fontSize > .85)
					fontSize -= 0.15;
				break;

			case $this.hasClass('reset'):
				fontSize = 1;
				break;

			case $this.hasClass('plus'):
				if (fontSize < 1.15)
					fontSize += 0.15;
				break;
		}

		$('#films').css('fontSize', fontSize + 'em');
	});

	$.contextMenu(
	{
		selector: ".film",
		events: {
			show: function(opts)
			{
				this.addClass('menu');
			},
			hide: function(opts)
			{
				this.removeClass('menu');
			}
		},
		items: {
			filmwebSearch: {
					name: 'Wyszukaj na Filmwebie',
					icon: 'filmweb',
					disabled: function(key, opt)
					{
						return notEmpty(opt.$trigger.find('.info .filmweb').text());
					},
					callback: function(key, opt)
					{
						clickedTitle = opt.$trigger.find('.title:visible').text();
						window.open(searchUrl.filmweb + clickedTitle.toLowerCase());
					}
			},
			filmweb: {
					name: 'Zobacz na Filmwebie',
					icon: 'filmweb',
					disabled: function(key, opt)
					{
						return !notEmpty(opt.$trigger.find('.info .filmweb').text());
					},
					callback: function(key, opt)
					{
						window.open(opt.$trigger.find('.info .filmweb').text());
					}
			},
			imdbSearch: {
					name: 'Wyszukaj w IMDb',
					icon: 'imdb',
					disabled: function(key, opt)
					{
						return notEmpty(opt.$trigger.find('.info .imdb').text());
					},
					callback: function(key, opt)
					{
						clickedTitle = opt.$trigger.find('.title:visible').text();
						window.open(searchUrl.imdb + clickedTitle);
					}
			},
			imdb: {
					name: 'Zobacz na IMDb',
					icon: 'imdb',
					disabled: function(key, opt)
					{
						return !notEmpty(opt.$trigger.find('.info .imdb').text());
					},
					callback: function(key, opt)
					{
						window.open(opt.$trigger.find('.info .imdb').text());
					}
			},
			googleImage: {
					name: 'Szukaj okładki w Google',
					icon: 'google',
					disabled: function(key, opt)
					{
						return !opt.$trigger.find('.cover').hasClass('no-cover');
					},
					callback: function(key, opt)
					{
						clickedTitle = opt.$trigger.find('.title:visible').text();

						// search tall images
						window.open(searchUrl.googleImage + clickedTitle);
					}
			},
			google: {
					name: 'Szukaj w Google',
					icon: 'google',
					disabled: function(key, opt)
					{
						return opt.$trigger.find('.cover').hasClass('no-cover');
					},
					callback: function(key, opt)
					{
						clickedTitle = opt.$trigger.find('.title:visible').text();

						// normal search
						window.open(searchUrl.google + clickedTitle);
					}
			},
			subtitles: {
					name: 'Szukaj napisów',
					icon: 'subtitles',
					callback: function(key, opt)
					{
						clickedTitle = opt.$trigger.find('.title-orig:first').text();
						window.open(searchUrl.subtitles + clickedTitle);
					}
			},
			sep: '---------',
			mark: {
					name: 'Zaznacz',
					icon: 'mark',
					disabled: function(key, opt)
					{
						return opt.$trigger.hasClass('marked');
					},
					callback: function(key, opt)
					{
						opt.$trigger.toggleClass('marked');
					}
			},
			unmark: {
					name: 'Odznacz',
					icon: 'unmark',
					disabled: function(key, opt)
					{
						return !opt.$trigger.hasClass('marked');
					},
					callback: function(key, opt)
					{
						opt.$trigger.toggleClass('marked');
					}
			},
			copy: {
					name: 'Kopiuj tytuł do schowka',
					icon: 'copy',
					callback: function(key, opt)
					{
						clickedTitle = opt.$trigger.find('.title:visible').text();
						Clipboard.copy(clickedTitle);
					}
			},
			openfolder: {
					name: 'Otwórz katalog z filmem',
					icon: 'open-folder',
					callback: function(key, opt)
					{
						clickedPath = opt.$trigger.find('.play').attr('data-path');
						window.open(clickedPath);
					}
			},
			edit: {
					name: 'Edytuj',
					icon: 'edit',
					callback: function(key, opt)
					{
						editor.startEdit(opt.$trigger);
					}
			}
		}
	});

	$.contextMenu(
	{
		selector: "#toggle .marked",
		className: 'fixed',
		items: {
			mark: {
					name: 'Zaznacz wszystkie',
					icon: 'mark',
					callback: function(key, opt)
					{
						$('#films li').addClass('marked');
					}
			},
			unmark: {
					name: 'Odznacz wszystkie',
					icon: 'unmark',
					callback: function(key, opt)
					{
						$('#films li').removeClass('marked');
					}
			}
		}
	});

	// keymap
	$(window).keydown(function(e)
	{
		var $targetElement;

		if ($('.active').length < 1)
			$('#films .film:first').addClass('active');

		switch(e.which)
		{
			// ESC
			case 27:
				$('.selected').removeClass('selected');
				$('#qclear').click();
				$.unblockUI();
				return;
				break;

			// F5
			case 116:
				listFilms();
				return;
				break;

			// F8
			case 119:
				copyListToText();
				alert('Skopiowano listę filmów do schowka');
				return;
				break;

			// F9
			case 120:
				copyListToHtml();
				alert('Skopiowano listę <ul> filmów do schowka');
				return;
				break;

			// F11
			case 122:
				if (window.frame.state == 'fullscreen')
					window.frame.restore();
				else
					window.frame.fullscreen();
				return;
				break;

			// F12
			case 123:
				window.frame.openDevTools();
				return;
				break;

			// CTRL + F
			case 70:
				if (e.ctrlKey)
				{
					e.preventDefault();
					$('#q').focus();
					return;
				}
				break;

			// CTRL + C
			case 67:
				if (e.ctrlKey)
				{
					e.preventDefault();
					clickedTitle = $('.selected').find('.title:visible').text();
					if (clickedTitle)
						Clipboard.copy(clickedTitle);
					return;
				}
				break;

			// left arrow
			case 37:
				$targetElement = $('.active').prevAll('li:visible:first');
				break;

			// right arrow
			case 39:
				$targetElement = $('.active').nextAll('li:visible:first');
				break;

			// top arrow
			case 38:
				break;

			// down arrow
			case 40:
				break;
		}

		if ($targetElement && $targetElement.length == 1)
		{
			$('.active').removeClass('active');
			$targetElement.addClass('active').find('.play').focus();
			return;
		}
	});

	$("[title]").tooltip({
		disabled: true,
		hide: null,
		show: {
			effect: null,
			delay: 250
		},
		position: {
			my: "center top+15",
			at: "center bottom",
			using: function(position, feedback) {
				$(this).css(position);
				$("<div>")
					.addClass("arrow")
					.addClass(feedback.vertical)
					.addClass(feedback.horizontal)
					.appendTo(this);
			}
		}
	}).on("mouseenter", function ()
	{
		$(this)
			.tooltip("enable")
			.tooltip("open");
	}).on("mouseleave", function ()
	{
		$(this)
			.tooltip("close")
			.tooltip("disable");
	});
});