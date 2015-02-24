window.addEvent('domready', function(){
	$$('.itemize').each(function(el)
	{
		new InputItemizer(el);
	})
});