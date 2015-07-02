# karma-file-correlator

A set of Karma plugins to correlate specifications with the files that contain them
and a filter to execute only a subset of specifications or files.

The reason for developing this plugin is to be able to correlate failed specifications with
files, so as to be able to run only the failed files from a TDD-type build script.

For the time being, it only works with Jasmine; It should not be difficult to bind more
testing frameworks. The relevant files are `src/framework-jasmine.js` and
`src/browser/browser-jasmine.js`.

## Usage

	npm install karma-file-correlator --save-dev

And in Karma configuration:

```javascript
module.exports = function(config) {
	...
	plugins: [..., 'karma-jasmine', 'karma-file-correlator'],
	...
	frameworks: ['jasmine', 'file-correlator-jasmine'],
	...
	reporters: [..., 'file-correlator-remote'],
	...
	preprocessors: {
		'**/*.spec.js': [..., 'file-correlator']
	},
	...
};
```

## How it works

There is a browser component and a couple of server-side components. The first component to act
is the server-side preprocessor. It processes the source of the specified files (the specs) to
add the information about the file that is currently being executed.

Then the browser component records the current file and intercepts Karma's `__karma__.result`
method to add information about the current file in the `result` object. This information is added
in a new property called `filecorFilename` (a string). This result gets transmitted to the Karma
reporters together with the standard result information.

You may develop or extend any Karma reporter to take advantage of this information.
Karma-file-correlator comes with a simple reporter, the `file-correlator-remote` reporter,
that sends an object using Node's `process.send()`. The object has 2 fields, `type` that is
always `'specComplete'` (for now) and `payload`. The `payload` for the `'specComplete'` type
contains the following fields:

- `browser`: The name of the current browser
- `name`: Full name of the specification
- `outcome`: A string, `'SKIPPED'`, `'SUCCESS'`, or `'FAILURE'`
- `filename`: The name of the file containing the spec

In the use case that drives the development of this plugin, the build scripts listen to these
messages and record failed specs to be re-run in the next TDD cycle.

### The Jasmine `specFilter`

Karma-file-correlator currently **replaces** the spec filter from karma-jasmine. This means that
the `grep` options **will not work**. Instead, the filter accepts two whitelists: one for files and
one for full spec names. If neither is present (`undefined` or `null`), then the filter takes no
effect and all specs are executed. The filter reads the `specs` and `files` properies of
`__karma__.config` and expects them to be arrays of strings. If either or both are given, then only
the specs that are explicitly mentioned in `specs` or are contained in a file mentioned in `files`
will run.
