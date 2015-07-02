var path = require('path');

createPreprocessor.$inject = [];
function createPreprocessor() {
	return function(content, file, done) {
		// file has:
		// .path
		// .originalPath
		// .contentPath
		var fileName = JSON.stringify(path.normalize(file.originalPath));
		done(null, '__filecor__.setCurrentFile(' + fileName + ');' + content + '\n;\n__filecor__();\n');
	}
}

module.exports = createPreprocessor;
