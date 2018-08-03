'use strict';

(() => { // do not leak variables

  const filterName = "confluence";

  const getLatexHtml = ({latex, align = "left"}) => `
<ac:structured-macro ac:macro-id="266e3d91-bf08-4b1a-98ad-f0a3581de5c3" ac:name="latex-formatting" ac:schema-version="1">
  <ac:parameter ac:name="block-align">${align}</ac:parameter>
  <ac:plain-text-body><![CDATA[\\begin{equation}${latex}\\end{equation}]]></ac:plain-text-body>
</ac:structured-macro>
`;
  const getCodeHtml = ({code, syntax, title, linenumbers = false}) => `
<ac:structured-macro ac:macro-id="e7751190-cb37-403a-ad54-864933df7505" ac:name="code" ac:schema-version="1">
  ${syntax ? `<ac:parameter ac:name="language">${syntax}</ac:parameter>` : ""}
  ${title ? `<ac:parameter ac:name="title">${title}</ac:parameter>` : ""}
  <ac:parameter ac:name="linenumbers">${linenumbers}</ac:parameter>
  <ac:plain-text-body><![CDATA[${code}]]></ac:plain-text-body>
</ac:structured-macro>
`
  const getImageHtml = ({url}) => `
<ac:image ac:height="250">
  <ri:attachment ri:filename="${url}"/>
</ac:image>
`
  const getDrawioHtml = ({name}) => `
<ac:structured-macro ac:macro-id="a6c2e043-d8d1-4aef-b35e-3c8f919418d9" ac:name="drawio" ac:schema-version="1">
  <ac:parameter ac:name="border">true</ac:parameter>
  <ac:parameter ac:name="viewerToolbar">true</ac:parameter>
  <ac:parameter ac:name="fitWindow">false</ac:parameter>
  <ac:parameter ac:name="diagramName">${name}</ac:parameter>
  <ac:parameter ac:name="simpleViewer">false</ac:parameter>
  <ac:parameter ac:name="width"/>
  <ac:parameter ac:name="diagramWidth">1672</ac:parameter>
  <ac:parameter ac:name="revision">1</ac:parameter>
  <ac:parameter ac:name=""/>
</ac:structured-macro>
`

  const preConverters = {

    convertCodeBlocks: text => text.replace(/\`\`\`([a-zA-Z]*)(\s{[^}]+})?\n([^\`]*)\n\`\`\`/gms, (everything, syntax, options, code) => {
      const confluence_syntaxes = ["latex", ""];
      if (confluence_syntaxes.indexOf(syntax) == -1) {
        console.warn(`code syntax ${syntax} is not supported by confluence`);
      }

      const getOption = name => {
        const regex = new RegExp(`${name}=([^,}]+)`);
        const match = regex.exec(options);
        return match && match[1];
      }
      const title = getOption("title");
      const linenumbers = getOption("linenumbers") || false;
      const align = getOption("align") || "left";

      if (syntax == "latex") {
        return getLatexHtml({latex: code, align});
      } else {
        return getCodeHtml({code, syntax, title, linenumbers});
      }
    }),

    // showdown already converted all "$"s to "¨D"s
    // THANKS
    convertLatex: text => text.replace(/¨D¨D\n([^¨D]*)\n¨D¨D/gms, (everything, g1, g2) => {
      console.log("matched", g1, g2);
      return g1 ? getLatexHtml({latex: g1}) : g2;
    }),

    convertImage: text => text.replace(/!\[([^\]\n]*)\]\((.+)\)/g, (everything, title, url) => {
      if (title == "drawio") {
        return getDrawioHtml({name: url});
      } else {
        return getImageHtml({url});
      }
    })
  }

  const preFilter = {
    type: 'lang', // 'output' for a post-processing filter
    filter: (text, converter, options) => {
      return Object.keys(preConverters)
        .reduce((text, converterName) => preConverters[converterName](text), text)
    }
  };

  const addFilterToShowdown = showdown => {
    showdown.extension(filterName, () => preFilter)
  };

  // UML - Universal Module Loader
  // This enables the extension to be loaded in different environments
  if (typeof showdown !== 'undefined') {
    // global (browser or nodejs global)
    addFilterToShowdown(showdown);
  } else if (typeof define === 'function' && define.amd) {
    // AMD
    define(['showdown'], addFilterToShowdown);
  } else if (typeof exports === 'object') {
    // Node, CommonJS-like
    addFilterToShowdown(require('showdown'));
    module.exports = filterName;
  } else {
    // showdown was not found so we throw
    throw Error('Could not find showdown library');
  }

})();
