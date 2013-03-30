/**
 * @author Idered
 * @url    idered.pl
 */

/* global jQuery, DevTools */
var App = App || (function($) {

	var Ajax   = {},
		Config = {},
		Utils  = {},
		Public = {};

	Config = {
		debug: true,
		devDomains: ['localhost', '.dev']
	};

	/**
	 * Contain ajax callbacks
	 */
	Ajax = {
		/**
		 * Callback for successful submissions
		 * @param  {object} data Response from ajax request
		 */
		onSuccess: function(data) {
			if (Config.debug) {
				console.log('Request successful: ',  data);
			}
		}, // onSuccss

		/**
		 * Callback for failed submissions
		 */
		onFail: function() {
			if (Config.debug) {
				console.error('Request failed: ',  arguments);
			}
		}, // onFail

		/**
		 * Public callbacks
		 */
		callbacks: {
			/**
			 * Sample callback that is called before ajax request
			 * @param  {jquery} form jQuery object of form element
			 */
			sampleCallbackBefore: function(form) {
				console.log('[Event] Before callback', form);
			}, // sampleCallbackBefore

			/**
			 * Sample callback that is called after ajax request
			 * @param  {object} data Response
			 */
			sampleCallbackAfter: function(data) {
				console.log('[Event] After callback', data);
			} // sampleCallbackAfter
		}
	}; // Ajax

	/**
	 * Helper functions, toolbox
	 */
	Utils = {
		init: function() {
			Utils.ajaxForms();
			Utils.placeholder();
			Utils.submitShorcut();

			Config.isDevDomain = $.grep(Config.devDomains, function(domain) {
				return location.host.match(new RegExp(domain + '$', 'gi'));
			});

			if (Config.debug && Config.isDevDomain) {
				/* Load DevTools here */
				DevTools.loadModule('cssRefresh', {
					interval: 400
				});
				// DevTools.loadModule('windowSize');
			}
		}, //init

		/**
		 * Placeholder shim
		 */
		placeholder: function() {
			if(!('placeholder' in document.createElement('input'))) {
				$('[placeholder]').focus(function() {
					var input = $(this);
					if (input.val() === input.attr('placeholder')) {
						input.val('').removeClass('placeholder');
					}
				}).blur(function() {
					var input = $(this);
					if (input.val() === '' || input.val() === input.attr('placeholder')) {
						input.val(input.attr('placeholder')).addClass('placeholder');
					}
				}).blur();
				$('[placeholder]').parents('form').submit(function() {
					$(this).find('[placeholder]').each(function() {
						var input = $(this);
						if (input.val() === input.attr('placeholder')) {
							input.val('');
						}
					});
				});
			}
		}, // placeholder

		/**
		 * Submit forms using Ctlr + Enter shorcut
		 */
		submitShorcut: function() {
			var isCtrl = false;

			$('textarea, input').keyup(function(key) {
				if (key.which === 17) { isCtrl = false; }
			}).keydown(function(key) {
				if (key.which === 17) { isCtrl = true; }
				if (key.which === 13 && isCtrl === true) {
					$(this).closest('form').submit();
					return false;
				}
			});
		}, // submitShortcut

		ajaxForms: function() {
			$('[data-remote]').on('submit', function() {
				var form = $(this),
					callbacks = {
						before: Ajax.callbacks[form.data('callback-before')],
						after: Ajax.callbacks[form.data('callback-after')]
					};

				if (typeof callbacks.before === 'function') {
					callbacks.before.apply(App, form);
				}

				$.ajax({
					type: form.attr('method') || 'GET',
					url: form.attr('action'),
					data: form.serialize(),
					dataType: form.data('type') || 'json'
				}).fail(function() {
					Ajax.onFail.apply(App, arguments);
				}).done(function() {
					Ajax.onSuccess.apply(App, arguments);

					if (typeof callbacks.after === 'function') {
						callbacks.after.apply(App, arguments);
					}
				});
				return false;
			});
		} // ajaxForms
	}; // Utils

	Public = {
		init: function() {
			Utils.init();
			$('.dropdown').dropdown();
			$('.js-toggle-nav').toggles('.site-nav', 'is-open');
		} // init
	}; // Public

	return Public;

})(window.jQuery);

jQuery(document).ready(App.init);