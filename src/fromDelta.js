const Delta = require('quill-delta')
const remark = require('remark')
const u = require('unist-builder')
const _ = require('lodash')

const defaultConvertInline = ({ insert, attributes = {} }) => {
  const {
      bold,
    italic,
    entity = { type: '', data: {} },
    } = attributes

  let inline = u('text', insert)
  if (bold) {
    inline = u('strong', [inline])
  }
  if (italic) {
    inline = u('emphasis', [inline])
  }
  if (entity.type.toLowerCase() === 'link') {
    inline = u('link', { url: entity.data.url, title: null }, [inline])
  }
  return inline
}

const defaultConvertLine = ({ type, data, depth }) => {
  switch (type) {
    case 'unstyled': {
      return {
        type: 'paragraph'
      }
    }
    case 'header-one': {
      return {
        type: 'heading',
        depth: 1,
      }
    }
    case 'header-two': {
      return {
        type: 'heading',
        depth: 2,
      }
    }
    case 'unordered-list-item': {
      return {
        type: 'listItem',
        checked: null,
        depth: depth || 0,
        ordered: false,
      }
    }
    case 'ordered-list-item': {
      return {
        type: 'listItem',
        checked: null,
        depth: depth || 0,
        ordered: true,
      }
    }
    case 'todo-block': {
      return {
        type: 'listItem',
        checked: data.checked,
        depth: depth || 0,
        ordered: false,
      }
    }
  }
  return {
    type: 'paragraph'
  }
}

const defaultLineWrapper = ({ type, ordered, checked, depth }) => {
  switch (type) {
    case 'listItem': {
      return {
        type: 'list',
        ordered,
        checked,
        depth,
      }
    }
  }
}


const convertFromDeltaToMarkdown = ({
  convertInline = defaultConvertInline,
  convertLine = defaultConvertLine,
  lineWrapper = defaultLineWrapper,
}) => deltaOps => {
  const delta = new Delta(deltaOps)
  let lines = []

  // Format each line
  delta.eachLine((line, attributes) => {
    const { type, ordered, checked, depth } = convertLine(attributes)
    const children = line.ops.map(convertInline)
    lines = lines.concat(
      u(type, { ordered, checked, depth }, children)
    )
  })

  // Wrap line for lists
  // const { wrappers, items } = lines.reduce(({ previous, wrappers, items, previousKey }, line) => {
  //   let wrapper = lineWrapper(line)
  //   if (!wrapper) {
  //     return {
  //       wrappers,
  //       items: items.concat(line),
  //       previous: {},
  //       previousKey,
  //     }
  //   } else if (_.isEqual(previous, wrapper)) {
  //     return {
  //       wrappers,
  //       items: items.concat(Object.assign({ parent: previousKey }, line)),
  //       previous,
  //       previousKey,
  //     }
  //   } else {
  //     const key = Object.keys(wrappers).length
  //     return {
  //       wrappers: Object.assign({ [key]: wrapper }, wrappers),
  //       items: items.concat(wrapper).concat(Object.assign({ key }, line)),
  //       previous: wrapper,
  //       previousKey: key,
  //     }
  //   }
  // }, { wrappers: {}, items: [], previousWrapper: {}, previousKey: null })

  let root = u('root', lines)
  return remark().stringify(root)
}

module.exports = convertFromDeltaToMarkdown