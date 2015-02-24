/*
---

script: InputItemizer.js

name: InputItemizer

description: Turns an input field into a field that can container multiple individual values

license: MIT-style license

authors:
  - Matt McCloskey

requires:
  - Core/MooTools

provides: [InputItemizer]

...
*/
var InputItemizer = new Class({
	Implements: [Options, Events],
	options: {
		name: 'items',
		seperator: ',',
		operator: ':',
		min_input_width: 80
	},
	
	initialize: function(element, options)
	{
		this.setOptions(options);
		this.input = $(element).set('type', 'hidden');
		this.options.name = this.input.get('name') || this.options.name;
		this.value = this.input.get('value');
		this.values = [];
		this.element = new Element('div', {'class': 'input-itemizer'})
							.inject(this.input, 'before')
							.addClass(this.input.get('class'));
		
		// So that a blank input has height
		this.spacer = new Element('span', {'class': 'input-itemizer-spacer', 'html': '&nbsp;', 'styles': {'width': 1}})
							.inject(this.element);

		if(this.value.length > 0)
		{
			this.value.split(this.options.seperator).each(function(value)
			{
				this.values.push(value);
				this.make_token(value);
			}.bind(this));
		}
		
		this.element.addEventListener('click', function(e)
		{
			var $target = $(e.target);
			if($target.hasClass('input-itemizer-remove'))
			{
				// Remove
				e.preventDefault();
				this.remove_value(null, $target.getParent('.input-itemizer-token'));
			}
			else
			{
				// Create input
				e.preventDefault();
				e.stopPropagation();
				this.create_input();
			}
		}.bind(this));
	},

	add_value: function(value)
	{
		value = value.trim();
		this.make_token(value);
		this.value = this.serialize();
		this.input.set('value', this.value);
		this.fireEvent('newvalue', [value]);
		this.fireEvent('change');
	},

	remove_value: function(value, el)
	{
		if(typeof el === 'undefined')
		{
			var tokens = this.getElements('.input-itemizer-token'),
				i = 0,
				l = tokens.length;
			for(i; i < l; i++)
			{
				if(tokens[i].retrieve('value') === value)
				{
					el = tokens[i];
					break;
				}
			}
		}
		else
		{
			value = el.retrieve('value');
		}
		el.destroy();
		this.value = this.serialize();
		this.input.set('value', this.value);
		this.fireEvent('removevalue', [value]);
		this.fireEvent('change');
	},
	
	create_input: function()
	{
		if(this.item_input) 
		{
			return false;
		}
		this.item_input = new Element('input', {'type': 'text', 'size': '1', 'class': 'input-itemizer-input', styles: {'width': this.options.min_input_width}})
								.inject(this.element);
		this.item_input_measure = new Element('span')
								.inject(this.element);
		this.copyStyles(this.element, this.item_input);
		this.copyStyles(this.element, this.item_input_measure);
		this.item_input_measure.setStyles({'position': 'absolute', 'top': 0, 'left': 0, 'visibility': 'hidden', 'padding': 0});

		this.item_input.addEvents({
			'keydown': function(e)
			{
				// Seperator and operator chars are reserved
				if([this.options.seperator, this.options.operator].contains(e.key))
				{
					e.preventDefault();
					return false;
				}

				var $this = $(e.target),
					key = ['enter', 'up', 'down', 'left', 'right', 'backspace', 'delete', 'esc'].contains(e.key) ? '' : e.key;
				if(e.key === 'space') key = '&nbsp;';
				this.item_input_measure.set('html', this.item_input.get('value').replace(' ', '&nbsp;') + key + key);

				// Set the width of the input
				$this.setStyle('width', Math.max(this.options.min_input_width,
												Math.min(
													this.item_input_measure.getSize().x
														+ this.item_input.getStyle('padding-left').toInt()
														+ this.item_input.getStyle('padding-right').toInt(),
													this.element.getSize().x 
														- this.element.getStyle('padding-left').toInt() 
														- this.element.getStyle('padding-right').toInt()
														- this.item_input.getStyle('margin-left').toInt()
														- this.item_input.getStyle('margin-right').toInt()
												)
										));
				
				if(e.key === 'enter' || e.key === 'tab')
				{
					e.stop();
					if($this.get('value') !== '')
					{
						this.add_value($this.get('value'));
					}
					$this.set('value', '').setStyle('width', this.options.min_input_width);
				}
				else if((e.key === 'backspace' || e.key === 'delete') && $this.get('value').length === 0)
				{
					e.stop();
					this.remove_input();
				}
			}.bind(this),

			'keypress': function(e)
			{
				// Seperator and operator chars are reserved
				if([this.options.seperator, this.options.operator].contains(e.key))
				{
					e.preventDefault();
				}
			}.bind(this),

			'blur': function(e)
			{
				this.fireEvent('inputblur', [this.item_input.get('value')]);
				this.remove_input();
			}.bind(this)
		});

		if ( ! this.itemizer_remove_input)
		{
			this.itemizer_remove_input = this.remove_input.bind(this);
			$(document.body).addEvent('click', this.itemizer_remove_input);
		}

		this.item_input.focus();
		
		this.fireEvent('addinput', [this.input]);
	},
	
	remove_input: function()
	{
		if(this.item_input)
		{
			this.item_input.destroy();
			this.item_input_measure.destroy();
			this.item_input = false;
		}
		$(document.body).removeEvent('click', this.itemizer_remove_input);
		this.itemizer_remove_input = false;
	},
	
	make_token: function(value)
	{
		var parts = value.split(this.options.operator),
			value = parts[0],
			display = parts.length > 1 ? parts[1] : value,
			el = new Element('span', {'class': 'input-itemizer-token', 'html': '<span class="input-itemizer-value">' + display + '</span>'})
					.inject(this.item_input ? this.item_input : this.element, this.item_input ? 'before' : 'bottom')
					.store('value', value),
			remove = new Element('a', {'href': '#', 'class': 'input-itemizer-remove', 'html': '&times;'})
					.inject(el);
	},
	
	// Return string value
	serialize: function()
	{
		var value = '';
		this.element.getElements('.input-itemizer-token').each(function(el)
		{
			if(value.length > 0)
			{
				value += this.options.seperator;
			}
			value += el.retrieve('value');
		}.bind(this));
		return value;
	},

	// Helper to make input match other text
	copyStyles: function(from, to, styles)
	{
		styles = styles || ['padding', 'font-weight', 'font-family', 'font-style', 'font-size', 'line-height', 'border'];
		
		styles.each(function(key)
		{
			to.setStyle(key, from.getStyle(key));
		}.bind(this));
		
		// setStyles doesn't work for font-family
		if(styles['font-family']) to.style.fontFamily = from.getStyle('font-family');
		
		return this;
	}
	
});