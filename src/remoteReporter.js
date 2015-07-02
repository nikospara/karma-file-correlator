RemoteReporter.$inject = [];
function RemoteReporter() {
	this.adapters = [];

	this.onSpecComplete = function(browser, result) {
		process.send({
			type: 'specComplete',
			payload: {
				browser: browser.name,
				name: result.suite.join(' ') + ' ' + result.description,
				outcome: result.skipped ? 'SKIPPED' : (result.success ? 'SUCCESS' : 'FAILURE'),
				filename: result.filecorFilename
			}
		});
	};
}

module.exports = RemoteReporter;
