function getURLVar(key) {
	var value = [];

	var query = String(document.location).split('?');

	if (query[1]) {
		var part = query[1].split('&');

		for (i = 0; i < part.length; i++) {
			var data = part[i].split('=');

			if (data[0] && data[1]) {
				value[data[0]] = data[1];
			}
		}

		if (value[key]) {
			return value[key];
		} else {
			return '';
		}
	}
}
jQuery(function($) {
	$(document).ready(function() {
		// Product List
		$('#bt-list-view').click(function() {
			$('#bt-grid-view').removeClass('active');
			$('#bt-list-view').addClass('active');
			
			$('#content .product-layout').attr('class', 'product-layout product-list col-xs-12');
			
			localStorage.setItem('bt_display', 'list');
		});
		
		// Product Grid
		$('#bt-grid-view').click(function() {
			$('#bt-list-view').removeClass('active');
			$('#bt-grid-view').addClass('active');
			
			var cols = $('#column-right, #column-left').length;

			if (cols == 2) {
				$('#content .product-layout').attr('class', 'product-layout product-grid col-lg-4 col-md-6 col-sm-12 col-xs-6');
			} else if (cols == 1) {
				$('#content .product-layout').attr('class', 'product-layout product-grid col-lg-3 col-md-4 col-sm-6 col-xs-6');
			} else {
				$('#content .product-layout').attr('class', 'product-layout product-grid col-lg-3 col-md-3 col-sm-6 col-xs-6');
			}
			
			localStorage.setItem('bt_display', 'grid');
		});
		
		if (localStorage.getItem('bt_display') == 'grid'){
			$('#bt-grid-view').trigger('click');
		} else {
			$('#bt-list-view').trigger('click');
		}
	});
});

function resizeWidth(){
	if ($('html').attr('dir') == 'rtl') {
		var rtl = true;
	} else {
		var rtl = false;
	}
	
	$('.mega-menu ul > li.parent > div').each(function(index, element) {
		if ($(this).parents('.container').length) {
			var container = $(this).parents('.container').offset();
			var menu = $(this).parents('.mega-menu').offset();
			var dropdown = $(this).parent().offset();
			
			if (rtl) {
					var right = ($(this).outerWidth() - (dropdown.left + $(this).parent().outerWidth() - container.left) + 15);
					
					if (right > 0) {
							$(this).css({
								'margin-left': '',
								'margin-right': '-' + (right)+ 'px'
							});
					} else {
							$(this).css({
								'margin-left': '',
								'margin-right': '0px'
							});
					}
			} else {
				if (((dropdown.left - container.left)+$(this).width()) > parseFloat($(this).parents('.container').width())) {
					var balance = ((dropdown.left - container.left)+$(this).width()) - parseFloat($(this).parents('.container').width() - 30);
					
					var left = (dropdown.left - container.left)-15;
					
					if (balance > 0 && balance <= left) {
						$(this).css({
							'margin-left': '-' + (balance)+ 'px',
							'margin-right': ''
						});
					} else	if (balance > 0 && balance > left) {
						$(this).css({
							'margin-left': '-' + (left)+ 'px',
							'margin-right': ''
						});
					} else {
						$(this).css({
							'margin-left': '0px',
							'margin-right': ''
						});
					}
				}
			}
		}
	});
}
var btadd = {
	'cart': function(product_id,quantity) {
		$.ajax({
			url: 'index.php?route=bossthemes/utilities/cartAdd',
			type: 'post',
			data: 'product_id=' + product_id + '&quantity=' + (typeof(quantity) != 'undefined' ? quantity : 1),
			dataType: 'json',
			success: function(json) {
				if (json['redirect']) {
					location = json['redirect'];
				}

				if (json['success']) {
					addNotice(json, 'index.php?route=checkout/checkout');
					
					setTimeout(function () {
						$('#cart #cart-total').html(json['total']);
					}, 100);
				
					$('#cart > ul').load('index.php?route=common/cart/info ul li');
				}
			}
		});
	},
	'wishlist': function(product_id) {
		$.ajax({
			url: 'index.php?route=bossthemes/utilities/wishlistAdd',
			type: 'post',
			data: 'product_id=' + product_id,
			dataType: 'json',
			success: function(json) {
				if (json['success']) {
					addNotice(json, 'index.php?route=account/wishlist');
					$('#wishlist-total').html(json['total']);
				}
			}
		});
	},
	'compare': function(product_id) {
		$.ajax({
			url: 'index.php?route=bossthemes/utilities/compareAdd',
			type: 'post',
			data: 'product_id=' + product_id,
			dataType: 'json',
			success: function(json) {
				if (json['success']) {
					addNotice(json, 'index.php?route=product/compare');
					$('#compare-total').html(json['total']);
					$('#boss_compare').load('index.php?route=extension/module/boss_compare/info #boss_compare');
				}
			}
		});
	}
};
var btremove = {
	'cart' : function(key) {
		$.ajax({
			url: 'index.php?route==bossthemes/utilities/cartRemove',
			type: 'post',
			data: 'key=' + key,
			dataType: 'json',
			beforeSend: function() {
				$('#cart > button').button('loading');
			},
			complete: function() {
				$('#cart > button').button('reset');
			},
			success: function(json) {
				// Need to set timeout otherwise it wont update the total
				setTimeout(function () {
					$('#cart #cart-total').html(json['total']);
				}, 100);

				if (getURLVar('route') == 'checkout/cart' || getURLVar('route') == 'checkout/checkout') {
					location = 'index.php?route=checkout/cart';
				} else {
					$('#cart > ul').load('index.php?route=common/cart/info ul li');
				}
			},
			error: function(xhr, ajaxOptions, thrownError) {
				alert(thrownError + "\r\n" + xhr.statusText + "\r\n" + xhr.responseText);
			}
		});
	}
};

function addNotice(data, url) {
	$.jGrowl.defaults.closer = true;
	
	if (data['success']) {
		var tpl = '<h3>' + data['success'] + '</h3>';
	} else {
		var tpl = '<h3>' + data['error'] + '</h3>';
	}
	
	$.jGrowl(tpl, {
		life: 5000,
		btnGroup: '<div class="buttons"><a type="button" class="btn btn-default" href="index.php?route=common/home">' + data['button_continue'] + '</a><a type="button" class="btn btn-default" href="' + url + '">' + data['button_target'] + '</a></div>',
		header: data['title'],
		speed: 'slow'
	});
}

(function($){
	$.fn.equalHeights = function(minHeight,maxHeight) {
		this.css({
			'-webkit-transition': 'initial',
			'transition': 'initial',
			'min-height': 'initial'
		});
		
		var tallest = (minHeight) ? minHeight : 0;
		
		for (var i = 0; i < this.length; i++) {
			if (this.eq(i).outerHeight() != null && this.eq(i).outerHeight() > tallest) {
				tallest = this.eq(i).outerHeight();
			}
		}
		
		if ((maxHeight) && tallest > maxHeight) tallest = maxHeight;
		
		this.css({
			'-webkit-transition': '',
			'transition': '',
			'min-height': tallest
		});
	}
})(jQuery);

(function($){
	$.fn.btMobileMenu = function(options){
		var defaults = {
			target: null,
			className: null,
			bodyClass: null,
			onInit: null,
			onOpen: null,
			onClose: null
		}
		
		var options = $.extend({}, defaults, options);
		
		var target = $(options.target);
		var object = $(this);
		
		if (!target.length) return false;
		
		var btMobileMenu = {
			listen: function() {
				object.on('click', function() {
					if (object.hasClass(options.className)) {
						$('body').removeClass(options.bodyClass);
						object.removeClass(options.className);
						target.removeClass(options.className);
						if (typeof(options.onClose) == 'function') options.onClose(object, target);
					} else {
						$('body').addClass(options.bodyClass);
						object.addClass(options.className);
						target.addClass(options.className);
						if (typeof(options.onOpen) == 'function') options.onOpen(object, target);
					}
				});
			},
			init: function() {
				if (typeof(options.onInit) == 'function') options.onInit(object, target);
				this.listen();
			}
		}
		
		btMobileMenu.init();
		
		return this;
	}
})(jQuery);

(function($) {
	var cycleTimer = [];
	
	$.fn.onresize = function(handle, options) {
		var objects = $(this);
		
		var defaults = {
			returnAll: false,
			cycle: 300,
			onResizeEnd: null
		}
		
		var opt = $.extend({}, defaults, options);
		
		var onresize = {
			runTime: function() {
				cycleTimer[objects.selector] = setInterval(function() {
					var elm = objects.eq(Math.floor(Math.random() * objects.length));
					
					var d_w = parseFloat(elm.attr('data-width'));
					var d_h = parseFloat(elm.attr('data-height'));
					
					if (d_w != elm.outerWidth() ||	d_h != elm.outerHeight()) {
						objects.trigger('onresize');
					}
				}, opt.cycle);
			},
			callBack: function(callBack) {
				if (typeof(callBack) == 'function') {
					if (opt.returnAll) {
						callBack(objects);
					} else {
						objects.each(function() {
							callBack($(this));
						});
					}
				}
			},
			addListener: function() {
				var _this = this;
				var timeEnd;
				var delay;
				
				objects.on('onresize', function(event) {
					clearTimeout(delay);
					delay = setTimeout(function() {
						objects.each(function() {
							$(this).attr('data-width', $(this).outerWidth()).attr('data-height', $(this).outerHeight());
						});
						_this.callBack(handle);
					}, 50);
					
					if (typeof(opt.onResizeEnd) == 'function') {
						clearTimeout(timeEnd);
						timeEnd = setTimeout(function() {_this.callBack(opt.onResizeEnd);}, opt.cycle+10);
					}
				});
				
				var timer;
				
				$(window).resize(function() {
					clearTimeout(timer);
					timer = setTimeout(function() {objects.trigger('onresize');}, opt.cycle);
				});
			},
			init: function() {
				this.addListener();
				this.runTime();
			},
			destroy: function() {
				clearInterval(cycleTimer[objects.selector]);
				objects.unbind('onresize').removeData('onresize');
			}
		}
		
		if (objects.length > 0) {
			onresize.destroy();
			onresize.init();
		}
		
		return this;
	};
})(jQuery);

(function($) {
	$.fn.btsticky = function(options) {
		var object = $(this);
		
		var defaults = {
			stickyPoint: 0,
			top: 0,
			left: 0,
			stickTo: null,
			className: null,
			off: false,
			responsive: null,
			onInit: null,
			endInit: null,
			onStick: null,
			endStick: null,
			offStick: null
		}
		
		var options = $.extend({}, defaults, options);
		var opts = $.extend({}, defaults, options);
		var activeFlag = false;
		
		var btsticky = {
			getBreakpoint: function() {
				if (!options.responsive) return null;
				
				var breakpoint = false;
				var points = [], point;
				
				for (point in options.responsive) {
					if (options.responsive.hasOwnProperty(point)) {
						points.push(point);
					}
				}
				
				points.sort(function (a, b) {
					return parseInt(a, 10) > parseInt(b, 10);
				});
				
				for (var i = 0; i < points.length; i++) {
					point = points[i];
					if (point >= window.innerWidth && !breakpoint) {
						breakpoint = point;
					}
				}
				
				return breakpoint || 'max';
			},
			checkResponsive: function() {
				if (!options.responsive) return false;
				
				var breakpoint = this.getBreakpoint();
				
				if (breakpoint == 'max' || breakpoint == null) {
					opts = $.extend({}, defaults, options);
				} else {
					opts = $.extend({}, options, options.responsive[breakpoint]);
				}
			},
			listen: function() {
				var _this = this;
				var timer;
				
				$(window).resize(function() {
					clearTimeout(timer);
					timer = setTimeout(function() {
						_this.checkResponsive();
						$(window).scroll();
					}, 500);
				});
				
				$(window).scroll(function() {
					if (!opts.off) {
						if (opts.stickTo) {
							var stickyPoint = $(opts.stickTo).offset().top;
						} else {
							var stickyPoint = opts.stickyPoint;
						}
						
						if ($(window).scrollTop() > stickyPoint && !object.hasClass(opts.className)) {
							object.addClass(opts.className);
							object.css({
								position: 'fixed',
								top: opts.top,
								left: opts.left
							});
							
							if (typeof(opts.onStick) == 'function') opts.onStick(object);
						} else if($(window).scrollTop() <= stickyPoint) {
							object.removeClass(opts.className);
							object.css({
								position: '',
								top: '',
								left: ''
							});
							
							if (typeof(opts.endStick) == 'function') opts.endStick(object);
						}
						
						activeFlag = true;
					} else {
						if (activeFlag) {
							if (object.hasClass(opts.className)) {
								object.removeClass(opts.className);
							}
							
							object.css({
								position: '',
								top: '',
								left: ''
							});
							
							if (typeof(opts.offStick) == 'function') opts.offStick(object);
							
							activeFlag = false;
						}
					}
				});
			},
			init: function() {
				if (typeof(opts.onInit) == 'function') opts.onInit(object);
				this.checkResponsive();
				this.listen();
				$(window).scroll();
				if (typeof(opts.endInit) == 'function') opts.endInit(object);
			}
		}
		
		btsticky.init();
		
		return this;
	};
})(jQuery);

jQuery(document).ready(function($) {
	var timer;
	
	$(window).resize(function() {
		clearTimeout(timer);
		timer = setTimeout(resizeWidth, 500);
	});
	
	resizeWidth();
	
	if ($('#column-left').length && $('#column-right').length) {
		$('#content').addClass('has-column-left-right');
	} else if ($('#column-left').length) {
		$('#content').addClass('has-column-left');
	} else if ($('#column-right').length) {
		$('#content').addClass('has-column-right');
	}
});

/*-------------- Opencart default code --------------*/
jQuery(function($) {
	$(document).ready(function() {
		// Highlight any found errors
		$('.text-danger').each(function() {
			var element = $(this).parent().parent();

			if (element.hasClass('form-group')) {
				element.addClass('has-error');
			}
		});

		// Currency
		$('#form-currency .currency-select').on('click', function(e) {
			e.preventDefault();

			$('#form-currency input[name=\'code\']').val($(this).attr('name'));

			$('#form-currency').submit();
		});

		// Language
		$('#form-language .language-select').on('click', function(e) {
			e.preventDefault();

			$('#form-language input[name=\'code\']').val($(this).attr('name'));

			$('#form-language').submit();
		});

		/* Search */
		$('#search button').on('click', function() {
			var url = $('base').attr('href') + 'index.php?route=product/search';

			var value = $('#search input[name="search"]').val();

			if (value) {
				url += '&search=' + encodeURIComponent(value);
			}

			var category_id = $('#search select[name="category_id"]').val();

			if (category_id) {
				url += '&category_id=' + encodeURIComponent(category_id);
			}

			location = url;
		});

		$('#search input[name="search"]').on('keydown', function(e) {
			if (e.keyCode == 13) {
				$('#search button').trigger('click');
			}
		});

		// Menu
		$('#menu .dropdown-menu').each(function() {
			var menu = $('#menu').offset();
			var dropdown = $(this).parent().offset();

			var i = (dropdown.left + $(this).outerWidth()) - (menu.left + $('#menu').outerWidth());

			if (i > 0) {
				$(this).css('margin-left', '-' + (i + 10) + 'px');
			}
		});

		// Product List
		$('#list-view').click(function() {
			$('#content .product-grid > .clearfix').remove();

			$('#content .row > .product-grid').attr('class', 'product-layout product-list col-xs-12');
			$('#grid-view').removeClass('active');
			$('#list-view').addClass('active');

			localStorage.setItem('display', 'list');
		});

		// Product Grid
		$('#grid-view').click(function() {
			// What a shame bootstrap does not take into account dynamically loaded columns
			var cols = $('#column-right, #column-left').length;

			if (cols == 2) {
				$('#content .product-list').attr('class', 'product-layout product-grid col-lg-6 col-md-6 col-sm-12 col-xs-12');
			} else if (cols == 1) {
				$('#content .product-list').attr('class', 'product-layout product-grid col-lg-4 col-md-4 col-sm-6 col-xs-12');
			} else {
				$('#content .product-list').attr('class', 'product-layout product-grid col-lg-3 col-md-3 col-sm-6 col-xs-12');
			}

			$('#list-view').removeClass('active');
			$('#grid-view').addClass('active');

			localStorage.setItem('display', 'grid');
		});

		if (localStorage.getItem('display') == 'list') {
			$('#list-view').trigger('click');
			$('#list-view').addClass('active');
		} else {
			$('#grid-view').trigger('click');
			$('#grid-view').addClass('active');
		}

		// Checkout
		$(document).on('keydown', '#collapse-checkout-option input[name=\'email\'], #collapse-checkout-option input[name=\'password\']', function(e) {
			if (e.keyCode == 13) {
				$('#collapse-checkout-option #button-login').trigger('click');
			}
		});

		// tooltips on hover
		$('[data-toggle=\'tooltip\']').tooltip({container: 'body'});

		// Makes tooltips work on ajax generated content
		$(document).ajaxStop(function() {
			$('[data-toggle=\'tooltip\']').tooltip({container: 'body'});
		});
	});
});
// Cart add remove functions
var cart = {
	'add': function(product_id, quantity) {
		$.ajax({
			url: 'index.php?route=checkout/cart/add',
			type: 'post',
			data: 'product_id=' + product_id + '&quantity=' + (typeof(quantity) != 'undefined' ? quantity : 1),
			dataType: 'json',
			beforeSend: function() {
				$('#cart > button').button('loading');
			},
			complete: function() {
				$('#cart > button').button('reset');
			},
			success: function(json) {
				$('.alert-dismissible, .text-danger').remove();

				if (json['redirect']) {
					location = json['redirect'];
				}

				if (json['success']) {
					$('#content').parent().before('<div class="alert alert-success alert-dismissible"><i class="fa fa-check-circle"></i> ' + json['success'] + ' <button type="button" class="close" data-dismiss="alert">&times;</button></div>');

					// Need to set timeout otherwise it wont update the total
					setTimeout(function () {
						$('#cart > button').html('<span id="cart-total"><i class="fa fa-shopping-cart"></i> ' + json['total'] + '</span>');
					}, 100);

					$('html, body').animate({ scrollTop: 0 }, 'slow');

					$('#cart > ul').load('index.php?route=common/cart/info ul li');
				}
			},
			error: function(xhr, ajaxOptions, thrownError) {
				alert(thrownError + "\r\n" + xhr.statusText + "\r\n" + xhr.responseText);
			}
		});
	},
	'update': function(key, quantity) {
		$.ajax({
			url: 'index.php?route=checkout/cart/edit',
			type: 'post',
			data: 'key=' + key + '&quantity=' + (typeof(quantity) != 'undefined' ? quantity : 1),
			dataType: 'json',
			beforeSend: function() {
				$('#cart > button').button('loading');
			},
			complete: function() {
				$('#cart > button').button('reset');
			},
			success: function(json) {
				// Need to set timeout otherwise it wont update the total
				setTimeout(function () {
					$('#cart > button').html('<span id="cart-total"><i class="fa fa-shopping-cart"></i> ' + json['total'] + '</span>');
				}, 100);

				if (getURLVar('route') == 'checkout/cart' || getURLVar('route') == 'checkout/checkout') {
					location = 'index.php?route=checkout/cart';
				} else {
					$('#cart > ul').load('index.php?route=common/cart/info ul li');
				}
			},
			error: function(xhr, ajaxOptions, thrownError) {
				alert(thrownError + "\r\n" + xhr.statusText + "\r\n" + xhr.responseText);
			}
		});
	},
	'remove': function(key) {
		$.ajax({
			url: 'index.php?route=checkout/cart/remove',
			type: 'post',
			data: 'key=' + key,
			dataType: 'json',
			beforeSend: function() {
				$('#cart > button').button('loading');
			},
			complete: function() {
				$('#cart > button').button('reset');
			},
			success: function(json) {
				// Need to set timeout otherwise it wont update the total
				setTimeout(function () {
					$('#cart > button').html('<span id="cart-total"><i class="fa fa-shopping-cart"></i> ' + json['total'] + '</span>');
				}, 100);

				if (getURLVar('route') == 'checkout/cart' || getURLVar('route') == 'checkout/checkout') {
					location = 'index.php?route=checkout/cart';
				} else {
					$('#cart > ul').load('index.php?route=common/cart/info ul li');
				}
			},
			error: function(xhr, ajaxOptions, thrownError) {
				alert(thrownError + "\r\n" + xhr.statusText + "\r\n" + xhr.responseText);
			}
		});
	}
}

var voucher = {
	'add': function() {

	},
	'remove': function(key) {
		$.ajax({
			url: 'index.php?route=checkout/cart/remove',
			type: 'post',
			data: 'key=' + key,
			dataType: 'json',
			beforeSend: function() {
				$('#cart > button').button('loading');
			},
			complete: function() {
				$('#cart > button').button('reset');
			},
			success: function(json) {
				// Need to set timeout otherwise it wont update the total
				setTimeout(function () {
					$('#cart > button').html('<span id="cart-total"><i class="fa fa-shopping-cart"></i> ' + json['total'] + '</span>');
				}, 100);

				if (getURLVar('route') == 'checkout/cart' || getURLVar('route') == 'checkout/checkout') {
					location = 'index.php?route=checkout/cart';
				} else {
					$('#cart > ul').load('index.php?route=common/cart/info ul li');
				}
			},
			error: function(xhr, ajaxOptions, thrownError) {
				alert(thrownError + "\r\n" + xhr.statusText + "\r\n" + xhr.responseText);
			}
		});
	}
}

var wishlist = {
	'add': function(product_id) {
		$.ajax({
			url: 'index.php?route=account/wishlist/add',
			type: 'post',
			data: 'product_id=' + product_id,
			dataType: 'json',
			success: function(json) {
				$('.alert-dismissible').remove();

				if (json['redirect']) {
					location = json['redirect'];
				}

				if (json['success']) {
					$('#content').parent().before('<div class="alert alert-success alert-dismissible"><i class="fa fa-check-circle"></i> ' + json['success'] + ' <button type="button" class="close" data-dismiss="alert">&times;</button></div>');
				}

				$('#wishlist-total span').html(json['total']);
				$('#wishlist-total').attr('title', json['total']);

				$('html, body').animate({ scrollTop: 0 }, 'slow');
			},
			error: function(xhr, ajaxOptions, thrownError) {
				alert(thrownError + "\r\n" + xhr.statusText + "\r\n" + xhr.responseText);
			}
		});
	},
	'remove': function() {

	}
}

var compare = {
	'add': function(product_id) {
		$.ajax({
			url: 'index.php?route=product/compare/add',
			type: 'post',
			data: 'product_id=' + product_id,
			dataType: 'json',
			success: function(json) {
				$('.alert-dismissible').remove();

				if (json['success']) {
					$('#content').parent().before('<div class="alert alert-success alert-dismissible"><i class="fa fa-check-circle"></i> ' + json['success'] + ' <button type="button" class="close" data-dismiss="alert">&times;</button></div>');

					$('#compare-total').html(json['total']);

					$('html, body').animate({ scrollTop: 0 }, 'slow');
				}
			},
			error: function(xhr, ajaxOptions, thrownError) {
				alert(thrownError + "\r\n" + xhr.statusText + "\r\n" + xhr.responseText);
			}
		});
	},
	'remove': function() {

	}
}

/* Agree to Terms */
$(document).delegate('.agree', 'click', function(e) {
	e.preventDefault();

	$('#modal-agree').remove();

	var element = this;

	$.ajax({
		url: $(element).attr('href'),
		type: 'get',
		dataType: 'html',
		success: function(data) {
			html  = '<div id="modal-agree" class="modal">';
			html += '  <div class="modal-dialog">';
			html += '	 <div class="modal-content">';
			html += '	   <div class="modal-header">';
			html += '		 <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>';
			html += '		 <h4 class="modal-title">' + $(element).text() + '</h4>';
			html += '	   </div>';
			html += '	   <div class="modal-body">' + data + '</div>';
			html += '	 </div>';
			html += '  </div>';
			html += '</div>';

			$('body').append(html);

			$('#modal-agree').modal('show');
		}
	});
});

// Autocomplete */
(function($) {
	$.fn.autocomplete = function(option) {
		return this.each(function() {
			this.timer = null;
			this.items = new Array();

			$.extend(this, option);

			$(this).attr('autocomplete', 'off');

			// Focus
			$(this).on('focus', function() {
				this.request();
			});

			// Blur
			$(this).on('blur', function() {
				setTimeout(function(object) {
					object.hide();
				}, 200, this);
			});

			// Keydown
			$(this).on('keydown', function(event) {
				switch(event.keyCode) {
					case 27: // escape
						this.hide();
						break;
					default:
						this.request();
						break;
				}
			});

			// Click
			this.click = function(event) {
				event.preventDefault();

				value = $(event.target).parent().attr('data-value');

				if (value && this.items[value]) {
					this.select(this.items[value]);
				}
			}

			// Show
			this.show = function() {
				var pos = $(this).position();

				$(this).siblings('ul.dropdown-menu').css({
					top: pos.top + $(this).outerHeight(),
					left: pos.left
				});

				$(this).siblings('ul.dropdown-menu').show();
			}

			// Hide
			this.hide = function() {
				$(this).siblings('ul.dropdown-menu').hide();
			}

			// Request
			this.request = function() {
				clearTimeout(this.timer);

				this.timer = setTimeout(function(object) {
					object.source($(object).val(), $.proxy(object.response, object));
				}, 200, this);
			}

			// Response
			this.response = function(json) {
				html = '';

				if (json.length) {
					for (i = 0; i < json.length; i++) {
						this.items[json[i]['value']] = json[i];
					}

					for (i = 0; i < json.length; i++) {
						if (!json[i]['category']) {
							html += '<li data-value="' + json[i]['value'] + '"><a href="#">' + json[i]['label'] + '</a></li>';
						}
					}

					// Get all the ones with a categories
					var category = new Array();

					for (i = 0; i < json.length; i++) {
						if (json[i]['category']) {
							if (!category[json[i]['category']]) {
								category[json[i]['category']] = new Array();
								category[json[i]['category']]['name'] = json[i]['category'];
								category[json[i]['category']]['item'] = new Array();
							}

							category[json[i]['category']]['item'].push(json[i]);
						}
					}

					for (i in category) {
						html += '<li class="dropdown-header">' + category[i]['name'] + '</li>';

						for (j = 0; j < category[i]['item'].length; j++) {
							html += '<li data-value="' + category[i]['item'][j]['value'] + '"><a href="#">&nbsp;&nbsp;&nbsp;' + category[i]['item'][j]['label'] + '</a></li>';
						}
					}
				}

				if (html) {
					this.show();
				} else {
					this.hide();
				}

				$(this).siblings('ul.dropdown-menu').html(html);
			}

			$(this).after('<ul class="dropdown-menu"></ul>');
			$(this).siblings('ul.dropdown-menu').delegate('a', 'click', $.proxy(this.click, this));

		});
	}
})(window.jQuery);