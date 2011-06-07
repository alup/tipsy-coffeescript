(function() {
  (function($) {
    var Tipsy, maybeCall;
    maybeCall = function(thing, ctx) {
      var _ref;
      return (_ref = typeof thing === "function" ? thing(ctx) : void 0) != null ? _ref : thing;
    };
    Tipsy = (function() {
      function Tipsy(element, options) {
        this.$element = $(element);
        this.options = options;
        this.enabled = true;
        this.fixTitle();
        return;
      }
      Tipsy.prototype.show = function() {
        var $tip, actualHeight, actualWidth, gravity, pos, title, tp;
        title = this.getTitle();
        if (title && this.enabled) {
          $tip = this.tip();
          $tip.find('.tipsy-inner')[this.options.html ? 'html' : 'text'](title);
          $tip[0].className = 'tipsy';
          $tip.remove().css({
            top: 0,
            left: 0,
            visibility: 'hidden',
            display: 'block'
          }).prependTo(document.body);
          pos = $.extend({}, this.$element.offset(), {
            width: this.$element[0].offsetWidth,
            height: this.$element[0].offsetHeight
          });
          actualWidth = $tip[0].offsetWidth;
          actualHeight = $tip[0].offsetHeight;
          gravity = maybeCall(this.options.gravity, this.$element[0]);
          switch (gravity.charAt(0)) {
            case 'n':
              tp = {
                top: pos.top + pos.height + this.options.offset,
                left: pos.left + pos.width / 2 - actualWidth / 2
              };
              break;
            case 's':
              tp = {
                top: pos.top - actualHeight - this.options.offset,
                left: pos.left + pos.width / 2 - actualWidth / 2
              };
              break;
            case 'e':
              tp = {
                top: pos.top + pos.height / 2 - actualHeight / 2,
                left: pos.left - actualWidth - this.options.offset
              };
              break;
            case 'w':
              tp = {
                top: pos.top + pos.height / 2 - actualHeight / 2,
                left: pos.left + pos.width + this.options.offset
              };
          }
          if (gravity.length === 2) {
            if (gravity.charAt(1) === 'w') {
              tp.left = pos.left + pos.width / 2 - 15;
            } else {
              tp.left = pos.left + pos.width / 2 - actualWidth + 15;
              $tip.css(tp).addClass('tipsy-' + gravity);
            }
          }
          $tip.find('.tipsy-arrow')[0].className = 'tipsy-arrow tipsy-arrow-' + gravity.charAt(0);
          if (this.options.className) {
            $tip.addClass(maybeCall(this.options.className, this.$element[0]));
          }
          if (this.options.fade) {
            return $tip.stop().css({
              opacity: 0,
              display: 'block',
              visibility: 'visible'
            }).animate({
              opacity: this.options.opacity
            });
          } else {
            return $tip.css({
              visibility: 'visible',
              opacity: this.options.opacity
            });
          }
        }
      };
      Tipsy.prototype.hide = function() {
        if (this.options.fade) {
          this.tip().stop().fadeOut(function() {
            $(this).remove();
          });
        } else {
          this.tip().remove();
        }
      };
      Tipsy.prototype.fixTitle = function() {
        var $e;
        $e = this.$element;
        if ($e.attr('title') || typeof ($e.attr('original-title')) !== 'string') {
          return $e.attr('original-title', $e.attr('title') || '').removeAttr('title');
        }
      };
      Tipsy.prototype.getTitle = function() {
        var $e, o, title;
        $e = this.$element;
        o = this.options;
        this.fixTitle();
        if (typeof o.title === 'string') {
          title = $e.attr(o.title === 'title' ? 'original-title' : o.title);
        } else if (typeof o.title === 'function') {
          title = o.title.call($e[0]);
        }
        title = ("" + title).replace(/(^\s*|\s*$)/, "");
        return title || (title = o.fallback);
      };
      Tipsy.prototype.tip = function() {
        var _ref;
        return (_ref = this.$tip) != null ? _ref : this.$tip = $('<div class="tipsy"></div>').html('<div class="tipsy-arrow"></div><div class="tipsy-inner"></div>');
      };
      Tipsy.prototype.validate = function() {
        if (!this.$element[0].parentNode) {
          this.hide();
          this.$element = null;
          this.options = null;
        }
      };
      Tipsy.prototype.enable = function() {
        this.enabled = true;
      };
      Tipsy.prototype.disable = function() {
        this.enabled = false;
      };
      Tipsy.prototype.toggleEnabled = function() {
        return this.enabled = !this.enabled;
      };
      return Tipsy;
    })();
    $.fn.tipsy = function(options) {
      var binder, enter, eventIn, eventOut, get, leave, tipsy;
      if (options === true) {
        this.data('tipsy');
      } else if (typeof options === 'string') {
        tipsy = this.data('tipsy');
        if (tipsy) {
          tipsy[options]();
        }
        this;
      }
      options = $.extend({}, $.fn.tipsy.defaults, options);
      get = function(ele) {
        tipsy = $.data(ele, 'tipsy');
        if (!tipsy) {
          tipsy = new Tipsy(ele, $.fn.tipsy.elementOptions(ele, options));
          $.data(ele, 'tipsy', tipsy);
        }
        return tipsy;
      };
      enter = function() {
        tipsy = get(this);
        tipsy.hoverState = 'in';
        if (options.delayIn === 0) {
          return tipsy.show();
        } else {
          tipsy.fixTitle();
          return setTimeout(function() {
            if (tipsy.hoverState === 'in') {
              tipsy.show();
            }
          }, options.delayIn);
        }
      };
      leave = function() {
        tipsy = get(this);
        tipsy.hoverState = 'out';
        if (options.delayOut === 0) {
          return tipsy.hide();
        } else {
          return setTimeout(function() {
            if (tipsy.hoverState === 'out') {
              tipsy.hide();
            }
          }, options.delayOut);
        }
      };
      if (!options.live) {
        this.each(function() {
          return get(this);
        });
      }
      if (options.trigger !== 'manual') {
        binder = options.live ? 'live' : 'bind';
        eventIn = options.trigger === 'hover' ? 'mouseenter' : 'focus';
        eventOut = options.trigger === 'hover' ? 'mouseleave' : 'blur';
        this[binder](eventIn, enter)[binder](eventOut, leave);
      }
      return this;
    };
    $.fn.tipsy.defaults = {
      className: null,
      delayIn: 0,
      delayOut: 0,
      fade: false,
      fallback: '',
      gravity: 'n',
      html: false,
      live: false,
      offset: 0,
      opacity: 0.8,
      title: 'title',
      trigger: 'hover'
    };
    $.fn.tipsy.elementOptions = function(ele, options) {
      if ($.metadata) {
        return $.extend({}, options, $(ele).metadata());
      } else {
        return options;
      }
    };
    $.fn.tipsy.autoNS = function() {
      return $(this).offset().top > ($(document).scrollTop() + $(window).height() / 2 ? 's' : 'n');
    };
    $.fn.tipsy.autoWE = function() {
      return $(this).offset().left > ($(document).scrollLeft() + $(window).width() / 2 ? 'e' : 'w');
    };
    $.fn.tipsy.autoBounds = function(margin, prefer) {
      return function() {
        var $this, boundLeft, boundTop, dir;
        dir = {
          ns: prefer[0],
          ew: (prefer.length > 1 ? prefer[1] : false)
        };
        boundTop = $(document).scrollTop() + margin;
        boundLeft = $(document).scrollLeft() + margin;
        $this = $(this);
        if ($this.offset().top < boundTop) {
          dir.ns = 'n';
        }
        if ($this.offset().left < boundLeft) {
          dir.ew = 'w';
        }
        if ($(window).width() + $(document).scrollLeft() - $this.offset().left < margin) {
          dir.ew = 'e';
        }
        if ($(window).height() + $(document).scrollTop() - $this.offset().top < margin) {
          dir.ns = 's';
        }
        return dir.ns + (dir.ew ? dir.ew : '');
      };
    };
  })(jQuery);
}).call(this);
