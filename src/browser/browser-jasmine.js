(function(window) {

	var cache = {}, specToSuiteMap = {}, originalKarmaResultMethod, currentFile;

	window.__filecor__ = function() {
		var jasmineEnv, ts, i, children, knownSuites;

		jasmineEnv = window.jasmine.getEnv();
		ts = jasmineEnv.topSuite();
		children = ts.children;
		knownSuites = Object.getOwnPropertyNames(cache).map(function(n) { return cache[n]; }).reduce(function(p,c) { return p.concat(c); }, []);

		for( i=0; i < children.length; i++ ) {
			if( knownSuites.indexOf(children[i]) < 0 ) {
				addSuite(children[i]);
			}
		}

		function addSuite(s) {
			var list = cache[currentFile];
			if( !list ) {
				list = [];
				cache[currentFile] = list;
			}
			s.filecorFilename = currentFile;
			list.push(s);
			relateSpecsWithSuites(s);
		}
	};
	window.__filecor__.setCurrentFile = function(f) {
		currentFile = f;
	};

	function relateSpecsWithSuites(s) {
		var i, constructorName;
		for( i=0; i < s.children.length; i++ ) {
			constructorName = functionName(s.children[i].constructor);
			if( constructorName === 'Suite' ) {
				relateSpecsWithSuites(s.children[i]);
			}
			else if( constructorName === 'Spec' ) {
				specToSuiteMap[s.children[i].getFullName()] = s;
			}
		}
	}

	function functionName(fun) {
		var ret = fun.toString();
		ret = ret.substr('function '.length);
		ret = ret.substr(0, ret.indexOf('('));
		return ret;
	}



	originalKarmaResultMethod = window.__karma__.result.originalKarmaResultMethod;
	if( !originalKarmaResultMethod ) {
		originalKarmaResultMethod = window.__karma__.result;
	}

	window.__karma__.result = function(result) {
		result.filecorFilename = retrieveFilename(currentSuite);
		originalKarmaResultMethod.call(window.__karma__, result);
	};
	window.__karma__.result.originalKarmaResultMethod = originalKarmaResultMethod;



	var currentSuite = window.jasmine.getEnv().topSuite(), currentFile;

	function isTopLevelSuite(suite) {
		return suite.description === 'Jasmine_TopLevel_Suite';
	}

	function findChildWithDescription(suite, descr) {
		var i;
		for( i=0; i < suite.children.length; i++ ) {
			if( suite.children[i].description === descr ) {
				return suite.children[i];
			}
		}
		return null;
	}

	function retrieveFilename(suite) {
		while( suite && !suite.filecorFilename ) {
			suite = suite.parentSuite;
		}
		return suite ? suite.filecorFilename : null;
	}

	window.jasmine.getEnv().addReporter({
		suiteStarted: function(result) {
			if( !isTopLevelSuite(result) ) {
				currentSuite = findChildWithDescription(currentSuite, result.description);
			}
		},

		suiteDone: function(result) {
			// In the case of xdescribe, only "suiteDone" is fired.
			// We need to skip that.
			if( result.description === currentSuite.description ) {
				currentSuite = currentSuite.parentSuite;
			}
		}
	});


	window.jasmine.getEnv().specFilter = (function() {
		var
			whiteLists = readConfig(window.__karma__.config),
			specs = whiteLists.specs,
			files = whiteLists.files;

		return function(spec) {
			return (!specs && !files) || (specs && specs.indexOf(spec.getFullName()) >= 0) || (files && files.indexOf(currentFile) >= 0);
		};

		function readConfig(cfg) {
			cfg = JSON.parse(cfg.args[0] || '{}');

			return {
				specs: cfg.specs || null,
				files: cfg.files || null
			};
		}
	})();


	window.__filecor__.cache = cache;
	window.__filecor__.specToSuiteMap = specToSuiteMap;

})(window);
