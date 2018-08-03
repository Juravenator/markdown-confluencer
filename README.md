# markdown-confluencer

A handy utility to convert markdown files into HTML compatible with the
[Confluence source editor](https://marketplace.atlassian.com/apps/1210722/confluence-source-editor)

## Installation
```bash
npm install -g markdown-confluencer
```

## Usage
Given a set of input filepaths, it will read them, convert them, and write them
out in the current directory with the '.html' extension.
```
markdown-confluencer <files...>
```

For example:
```
markdown-confluencer myfancydoc.md myotherfancydoc.md
```
will generate myfancydoc.html and myotherfancydoc.html
