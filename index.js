#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const {promisify} = require('util');
const vasync = require('vasync');
const commander = require('commander');
const showdown = require('showdown');
const inline = require('./lib/inline');
const forEachParallel = promisify(vasync.forEachParallel)

console.log(process.cwd());

showdown.setFlavor('github');
showdown.setOption('ghMentionsLink', 'something/');
[
  'simplifiedAutoLink',
  'excludeTrailingPunctuationFromURLs',
  'strikethrough',
  'tables',
  'ghCodeBlocks',
  'tasklists',
  'disableForced4SpacesIndentedSublists',
  'requireSpaceBeforeHeadingText',
  'openLinksInNewWindow',
  'emoji'
].forEach(option => showdown.setOption(option, true));
showdown.setOption('simpleLineBreaks', false);

const converter = new showdown.Converter({ extensions: [require('./confluence')]});

commander.version(require('./package.json').version)
  .usage('<file ...>')
  .parse(process.argv)

const fileNames = commander.args;

if (fileNames.length == 0) {
  commander.outputHelp();
  process.exit(1);
}

console.log("converting", fileNames);

function fail(msg = "an unknown error occurred", err) {
  err ? console.error(msg, err) : console.error(msg);
  process.exit(1);
}
function convertPath(filePath) {
  return path.parse(filePath).name + ".html";
}

forEachParallel({
  func: (fileName, cb) => {
    fs.readFile(fileName, 'utf-8', (err, content) => {
      err ? cb(err) : cb(null, {path: fileName, content, writePath: convertPath(fileName)})
    });
  },
  inputs: fileNames
})
.catch(err => fail("could not read all files", err))
.then(({operations, successes: jobs}) => {
  console.log({jobs});
  jobs.forEach(job => {
    const markdown = inline(job.content);
    job.result = converter.makeHtml(markdown);
  });
  return forEachParallel({
    func: (job, cb) => fs.writeFile(job.writePath, job.result, cb),
    inputs: jobs
  })
})
.catch(err => fail("could not process all jobs", err))
