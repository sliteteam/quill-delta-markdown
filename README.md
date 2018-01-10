## Installation

```
npm install --save @sliteteam/quill-delta-markdown
```

## Usage

1 - Use it to convert your delta document to markdown
```javascript
const { fromDelta } = require('@slite/quill-markdown-delta')
const markdown = fromDelta(deltaFromElseWhere)
```

2 - Use it to convert your markdown document to delta ops
```javascript
const { toDelta } = require('@slite/quill-markdown-delta')
const deltaOps = toDelta(txtFromElseWhere)
```

## Test

```
npm install
npm test
```

## About

A great thank you to Bart Visscher (bartv2) who started this lib ( here https://github.com/bartv2/quill-delta-markdown ).
We will work towards the goal to give it gack to the original repo!
