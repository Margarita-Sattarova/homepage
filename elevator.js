var Elevator = (function() {

    'use strict';

    var body = null;

    var animation = null;
    var duration = null;
    var customDuration = false;
    var startTime = null;
    var startPosition = null;
    var elevating = false;

    var mainAudio;
    var endAudio;

    function extend( target, source ) {
        for ( var key in source ) {
            if ( !( key in target ) ) {
                target[ key ] = source[ key ];
            }
        }
        return target;
    };

    function easeInOutQuad( t, b, c, d ) {
        t /= d/2;
        if (t < 1) return c/2*t*t + b;
        t--;
        return -c/2 * (t*(t-2) - 1) + b;
    };

    function extendParameters(options, defaults){
        for(var option in defaults){
            var t = options[option] === undefined && typeof option !== "function";
            if(t){
                options[option] = defaults[option];
            }
        }
        return options;
    }

    function animateLoop( time ) {
        if (!startTime) {
            startTime = time;
        }

        var timeSoFar = time - startTime;
        var easedPosition = easeInOutQuad(timeSoFar, startPosition, -startPosition, duration);                        
        
        window.scrollTo(0, easedPosition);

        if( timeSoFar < duration ) {
            animation = requestAnimationFrame(animateLoop);
        } else {
            animationFinished();
        }
   };

    function elevate() {

        if( elevating ) {
            return;
        }

        elevating = true;
        startPosition = (document.documentElement.scrollTop || body.scrollTop);
        
        if( !customDuration ) {
            duration = (startPosition * 1.5);
        }

        requestAnimationFrame( animateLoop );

        if( mainAudio ) {
            mainAudio.play();
        }
    }

    function resetPositions() {
        startTime = null;
        startPosition = null;
        elevating = false;
    }

    function animationFinished() {
        
        resetPositions();

        if( mainAudio ) {
            mainAudio.pause();
            mainAudio.currentTime = 0;
        }

        if( endAudio ) {
            endAudio.play();
        }
    }

    function onWindowBlur() {

        if( elevating ) {

            cancelAnimationFrame( animation );
            resetPositions();

            if( mainAudio ) {
                mainAudio.pause();
                mainAudio.currentTime = 0;
            }

            window.scrollTo(0, 0);
        }
    }

    function bindElevateToElement( element ) {
        element.addEventListener('click', elevate, false);
    }

    function main( options ) {

        body = document.body;

        var defaults = {
            duration: undefined,
            mainAudio: false,
            endAudio: false,
            preloadAudio: true,
            loopAudio: true,
        };

        options = extendParameters(options, defaults);
        
        if( options.element ) {
            bindElevateToElement( options.element );
        }

        if( options.duration ) {
            customDuration = true;
            duration = options.duration;
        }

        window.addEventListener('blur', onWindowBlur, false);

        if ( !window.Audio ) {
            return;
        }

        if( options.mainAudio ) {
            mainAudio = new Audio( options.mainAudio );
            mainAudio.setAttribute( 'preload', options.preloadAudio ); 
            mainAudio.setAttribute( 'loop', options.loopAudio );
        }

        if( options.endAudio ) {
            endAudio = new Audio( options.endAudio );
            endAudio.setAttribute( 'preload', 'true' );
        }
    }

    return extend(main, {
        elevate: elevate
    });
})();