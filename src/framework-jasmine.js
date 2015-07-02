var RE = /(?:\/|\\)karma-jasmine(?:\/|\\)(?:.+(?:\/|\\))adapter.js$/;

filecorJasmineFramework.$inject = ['config.files'];
function filecorJasmineFramework(files) {
	var i, path, found = false;

	for( i=0; i < files.length; i++ ) {
		if( typeof files[i] === 'string' ) {
			path = files[i];
		}
		else {
			path = files[i].pattern;
		}

		if( RE.test(path) ) {
			files.splice(i+1, 0, {pattern: __dirname + '/browser/browser-jasmine.js', included: true, served: true, watched: false});
			found = true;
			break;
		}
	}

	if( !found ) {
		throw new Error('could not locate karma-jasmine entry in files, make sure we run after karma-jasmine (i.e. \'file-correlator-jasmine\' is configured after the \'jasmine\' entry in \'frameworks\')');
	}
}

module.exports = filecorJasmineFramework;
