module.exports = {
	'preprocessor:file-correlator': ['factory', require('./src/preprocessor')],
	'framework:file-correlator-jasmine': ['factory', require('./src/framework-jasmine')],
	'reporter:file-correlator-remote': ['type', require('./src/remoteReporter')]
};
