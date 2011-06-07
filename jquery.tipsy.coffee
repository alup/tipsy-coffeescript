# tipsy, facebook style tooltips for jquery
# -- CoffeeScript version --
# (c) 2011 andreas loupasakis [alup@aloop.org]
# released under the MIT license
#
# Kudos to jason frame for the jquery plugin
#

(($) ->
    
    maybeCall = (thing, ctx) ->
        # (typeof thing == 'function') ? (thing.call(ctx)) : thing
        thing?(ctx) ? thing

    class Tipsy
        constructor: (element, options) ->
            this.$element = $(element)
            this.options = options
            this.enabled = true
            this.fixTitle()
            return

        show: ->
            title = this.getTitle()
            if title and this.enabled
                $tip = this.tip()
                $tip.find('.tipsy-inner')[if this.options.html then 'html' else 'text'](title)
                $tip[0].className = 'tipsy'; # reset classname in case of dynamic gravity
                $tip.remove().css({top: 0, left: 0, visibility: 'hidden', display: 'block'}).prependTo(document.body)
                pos = $.extend({}, this.$element.offset(), {
                    width: this.$element[0].offsetWidth,
                    height: this.$element[0].offsetHeight
                })
                actualWidth = $tip[0].offsetWidth
                actualHeight = $tip[0].offsetHeight
                gravity = maybeCall(this.options.gravity, this.$element[0])
                switch gravity.charAt(0)
                    when 'n' then tp = {top: pos.top + pos.height + this.options.offset, left: pos.left + pos.width / 2 - actualWidth / 2}
                    when 's' then tp = {top: pos.top - actualHeight - this.options.offset, left: pos.left + pos.width / 2 - actualWidth / 2}
                    when 'e' then tp = {top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left - actualWidth - this.options.offset}
                    when 'w' then tp = {top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left + pos.width + this.options.offset}
                    # TODO: Explain this :)

                if gravity.length == 2
                    if gravity.charAt(1) == 'w'
                        tp.left = pos.left + pos.width / 2 - 15
                    else
                        tp.left = pos.left + pos.width / 2 - actualWidth + 15
                # TODO: Explain this :)
    
                $tip.css(tp).addClass('tipsy-' + gravity)
                $tip.find('.tipsy-arrow')[0].className = 'tipsy-arrow tipsy-arrow-' + gravity.charAt(0)
                if this.options.className
                    $tip.addClass(maybeCall(this.options.className, this.$element[0]))
                if this.options.fade
                    $tip.stop().css({opacity: 0, display: 'block', visibility: 'visible'}).animate({opacity: this.options.opacity})
                else
                    $tip.css({visibility: 'visible', opacity: this.options.opacity})
            return
        hide: ->
            if this.options.fade
                this.tip().stop().fadeOut( ->
                    $(this).remove()
                    return
                )
            else
                this.tip().remove()
            return
 

        fixTitle: ->
            $e = this.$element
            if $e.attr('title') or typeof($e.attr('original-title')) != 'string'
                $e.attr('original-title', $e.attr('title') or '').removeAttr('title')
            return
 
        getTitle: ->
            $e = this.$element
            o = this.options
            this.fixTitle()
            if typeof(o.title) == 'string'
                title = $e.attr(if o.title == 'title' then 'original-title' else o.title)
            else if typeof(o.title) == 'function' 
                title = o.title.call($e[0])
            title = "#{title}".replace(/(^\s*|\s*$)/, "")
            title or= o.fallback

        tip: ->
            this.$tip ?= $('<div class="tipsy"></div>').html('<div class="tipsy-arrow"></div><div class="tipsy-inner"></div>')

        validate: ->
            if not this.$element[0].parentNode
                this.hide()
                this.$element = null
                this.options = null
            return

        enable: ->
            this.enabled = true
            return
            
        disable: ->
            this.enabled = false
            return

        toggleEnabled: ->
            this.enabled = not this.enabled
            return

    $.fn.tipsy = (options) ->
        if options == true
            this.data('tipsy')
        else if typeof(options) == 'string'
            tipsy = this.data('tipsy')
            if tipsy
                tipsy[options]()
            this
        
        options = $.extend({}, $.fn.tipsy.defaults, options)

        get = (ele) ->
            tipsy = $.data(ele, 'tipsy')
            unless tipsy
                tipsy = new Tipsy(ele, $.fn.tipsy.elementOptions(ele, options))
                $.data(ele, 'tipsy', tipsy)
            tipsy

        enter = ->
            tipsy = get(this)
            tipsy.hoverState = 'in'
            if options.delayIn == 0
                tipsy.show()
            else
                tipsy.fixTitle()
                setTimeout(->
                    tipsy.show() if tipsy.hoverState == 'in'
                    return
                , options.delayIn)
        leave = ->
            tipsy = get(this)
            tipsy.hoverState = 'out'
            if options.delayOut == 0
                tipsy.hide()
            else
                setTimeout(->
                    tipsy.hide() if tipsy.hoverState == 'out'
                    return
                , options.delayOut)

        unless options.live
            this.each(->
                get(this)
                return
            )
        if options.trigger != 'manual'
            binder   = if options.live then 'live' else 'bind'
            eventIn  = if options.trigger == 'hover' then 'mouseenter' else 'focus'
            eventOut = if options.trigger == 'hover' then 'mouseleave' else 'blur'
            this[binder](eventIn, enter)[binder](eventOut, leave)
        this

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
    }
    
    # Overwrite this method to provide options on a per-element basis.
    # For example, you could store the gravity in a 'tipsy-gravity' attribute:
    # return $.extend({}, options, {gravity: $(ele).attr('tipsy-gravity') || 'n' });
    # (remember - do not modify 'options' in place!)
    $.fn.tipsy.elementOptions = (ele, options) ->
        if $.metadata then $.extend({}, options, $(ele).metadata()) else options
    
    $.fn.tipsy.autoNS = ->
        $(this).offset().top > (if $(document).scrollTop() + $(window).height() / 2 then 's' else 'n')
    
    $.fn.tipsy.autoWE = ->
        $(this).offset().left > (if $(document).scrollLeft() + $(window).width() / 2 then 'e' else 'w')
    
   
    # yields a closure of the supplied parameters, producing a function that takes
    # no arguments and is suitable for use as an autogravity function like so:
    #
    # @param margin (int) - distance from the viewable region edge that an
    #        element should be before setting its tooltip's gravity to be away
    #        from that edge.
    # @param prefer (string, e.g. 'n', 'sw', 'w') - the direction to prefer
    #        if there are no viewable region edges effecting the tooltip's
    #        gravity. It will try to vary from this minimally, for example,
    #        if 'sw' is preferred and an element is near the right viewable 
    #        region edge, but not the top edge, it will set the gravity for
    #        that element's tooltip to be 'se', preserving the southern
    #        component.
     
    $.fn.tipsy.autoBounds = (margin, prefer) ->
        () ->
             dir = {ns: prefer[0], ew: (if prefer.length > 1 then prefer[1] else false)}
             boundTop = $(document).scrollTop() + margin
             boundLeft = $(document).scrollLeft() + margin
             $this = $(this)
             
             dir.ns = 'n' if $this.offset().top < boundTop
             dir.ew = 'w' if $this.offset().left < boundLeft
             dir.ew = 'e' if $(window).width() + $(document).scrollLeft() - $this.offset().left < margin
             dir.ns = 's' if $(window).height() + $(document).scrollTop() - $this.offset().top < margin
             dir.ns + (if dir.ew then dir.ew else '')
 
    return
)(jQuery)
