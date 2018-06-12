'use strict';

const fs = require('fs');

module.exports = text => text.replace(/^\/inline (.+)$/gm, (match, uri) => {
  const content = fs.readFileSync(uri, "utf-8");
  return content;
})
