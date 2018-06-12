#!/usr/bin/env node
'use strict';

const fs = require('fs');
const showdown = require('showdown');
const inline = require('./inline');

showdown.setFlavor('github');
showdown.setOption('simplifiedAutoLink', true);
showdown.setOption('excludeTrailingPunctuationFromURLs', true);
showdown.setOption('strikethrough', true);
showdown.setOption('tables', true);
showdown.setOption('ghCodeBlocks', true);
showdown.setOption('tasklists', true);
showdown.setOption('disableForced4SpacesIndentedSublists', true);
showdown.setOption('simpleLineBreaks', true);
showdown.setOption('requireSpaceBeforeHeadingText', true);
showdown.setOption('ghMentionsLink', 'something/');
showdown.setOption('openLinksInNewWindow', true);
showdown.setOption('emoji', true);

const converter = new showdown.Converter({ extensions: [
  require('./confluence')
]});

const markdown = inline(fs.readFileSync("rate-limiting.md", "utf-8"));

const html = converter.makeHtml(markdown);
fs.writeFileSync("result.html", html);
