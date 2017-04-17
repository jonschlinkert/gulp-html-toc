'use strict';

var through = require('through2');
var PluginError = require('plugin-error');
var toc = require('html-toc');

/**
 * Add navigation to page
 */

module.exports = function(options) {
  return through.obj(function(file, enc, next) {
    if (file.isNull()) {
      next(null, file);
      return;
    }

    try {
      file.contents = new Buffer(toc(file.contents.toString(), options));
    } catch (err) {
      this.emit('error', new PluginError('gulp-html-toc', err, {fileName: file.path}));
      return;
    }

    next(null, file);
  });
};
