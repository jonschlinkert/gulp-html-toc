'use strict';

require('mocha');
var fs = require('fs');
var path = require('path');
var File = require('vinyl');
var assert = require('assert');
var toc = require('../');

function read(filepath) {
  return fs.readFileSync(filepath, 'utf8');
}
function fixture(name) {
  return path.resolve(__dirname, 'fixtures', name + '.html');
}
function expected(name) {
  return read(path.resolve(__dirname, 'expected', name + '.html'));
}

describe('gulp-html-toc', function() {
  it('should export a function (sound check)', function() {
    assert.equal(typeof toc, 'function');
  });
});

describe('plugin', function() {
  it('should return an object', function() {
    assert(toc());
    assert.equal(typeof toc(), 'object');
    assert.equal(typeof toc().pipe, 'function');
  });

  it('should not fail on non-existent files', function(cb) {
    var stream = toc();
    var buffer = [];

    stream.write(new File({
      base: __dirname,
      path: __dirname + '/fooooo.txt'
    }));

    stream.on('data', function(file) {
      buffer.push(file);
    });

    stream.on('end', function() {
      assert.equal(buffer.length, 1);
      assert.equal(buffer[0].relative, 'fooooo.txt');
      cb();
    });

    stream.end();
  });

  it('should create a single-level toc', function(cb) {
    unit('one-level', {}, cb);
  });

  it('should support duplicate headings', function(cb) {
    unit('duplicate-names', {}, cb);
  });

  it('should support options.id', function(cb) {
    unit('options-id', {id: '#navigation'}, cb);
  });

  it('should support custom selectors for headings', function(cb) {
    unit('options-selectors', {selectors: 'h1,h2,h3'}, cb);
  });

  it('should not render anchors when options.anchors is false', function(cb) {
    unit('options-anchors', {anchors: false}, cb);
  });

  it('should render custom anchors when anchorTemplate is passed', function(cb) {
    unit('options-anchorTemplate', {
      anchorTemplate: function(str) {
        return '@' + str + '@';
      }
    }, cb);
  });
});

function unit(filename, options, cb) {
  var stream = toc(options);
  var buffer = [];

  var filepath = fixture(filename);

  stream.write(new File({
    base: __dirname,
    path: filepath,
    contents: fs.readFileSync(filepath)
  }));

  stream.on('data', function(file) {
    buffer.push(file);
  });

  stream.on('end', function() {
    assert.equal(buffer.length, 1);
    assert.equal(buffer[0].contents.toString(), expected(filename));
    cb();
  });

  stream.end();
}
