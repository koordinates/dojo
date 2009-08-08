dojo.provide('dojo.fx.directx');
dojo.require('dojo.fx');

(function() {
	var playFilter, applyFilter, isOwnProperty = dojo.isOwnProperty;

	// Returns true if successful

	applyFilter = dojo.fx.directx.applyTransitionFilter = function(el, name, duration, params) {
          var f, index, p;

          if (typeof el == 'string') {
            el = dojo.byId(el);
          }

          duration = duration || 1000;
          if (dojo.isHostObjectProperty(el, 'filters')) {
            if (dojo.isHostObjectProperty(el, 'currentStyle') && !el.currentStyle.hasLayout) { el.style.zoom = '1'; }
            if (el.filters.length && (f = el.filters['DXImageTransform.Microsoft.' + name])) {
              f.duration = duration / 1000;
              if (params) { for (index in params) { if (isOwnProperty(params, index)) { f[index] = params[index]; } } }
              if (f.status == 2) { f.stop(); }
              f.enabled = true;
            }
            else {
              if (typeof el.style.filter == 'string') {
                p = '';
                if (params) { for (index in params) { if (isOwnProperty(params, index)) { p += ',' + index + '=' + params[index]; } } }
                el.style.filter += ((el.style.filter)?' ':'') + 'progid:DXImageTransform.Microsoft.' + name + '(duration=' + (duration / 1000) + p + ')';
              }
            }
            if (el.filters['DXImageTransform.Microsoft.' + name]) {
              el.filters['DXImageTransform.Microsoft.' + name].apply();
              return true;
            }            
          }
	};

	// NOTE: Never call playFilter without confirmation from applyFilter

	playFilter = dojo.fx.directx.playTransitionFilter = function(el, name) {
          if (typeof el == 'string') {
            el = dojo.byId(el);
          }

          var f = el.filters['DXImageTransform.Microsoft.' + name];
          if (f) {
            if (f.status == 2) { f.stop(); }
            f.play();
          }
        };

	dojo._transition = function(el, name, duration, params, show, cbPass, cbFail) {
		var cb, canDo;
		if (applyFilter(el, name, duration, params)) {
			canDo = true;
		}

		if (canDo) {

			// Hide or show the element

			el.style.visibility = show ? 'visible' : 'hidden';

			playFilter(el, name);
		}

		// Do callback as appropriate

		cb = canDo ? cbPass : cbFail;

		if (cb) {
			dojo._getWin().setTimeout(cb, canDo ? duration : 0);
		}
	};

	dojo.fx.directx.transitionIn = function(el, name, duration, params, cbPass, cbFail) {
		dojo._transition(el, name, duration, params, true, cbPass, cbFail);
	};

	dojo.fx.directx.transitionOut = function(el, name, duration, params, cbPass, cbFail) {
		dojo._transition(el, name, duration, params, false, cbPass, cbFail);
	};
})();