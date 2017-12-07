const _ = require('lodash')
const defaultConverters = require('./fromDelta.converters')
const Node = require('./utils/Node')

exports = module.exports = function(ops, converters = defaultConverters) {
  return _.trimEnd(convert(ops, converters).render()) + '\n'
}

function convert(ops, converters) {
  var group, line, el, activeInline, beginningOfLine
  var root = new Node()

  function newLine() {
    el = line = new Node(['', '\n'])
    root.append(line)
    activeInline = {}
  }
  newLine()

  for (var i = 0; i < ops.length; i++) {
    var op = ops[i]

    if (_.isObject(op.insert)) {
      for (var k in op.insert) {
        if (converters.embed[k]) {
          applyStyles(op.attributes)
          converters.embed[k].call(el, op.insert[k], op.attributes)
        }
      }
    } else {
      var lines = op.insert.split('\n')

      if (isLinifyable(op.attributes, converters)) {
        // Some line-level styling (ie headings) is applied by inserting a \n
        // with the style; the style applies back to the previous \n.
        // There *should* only be one style in an insert operation.

        for (var j = 1; j < lines.length; j++) {
          for (var attr in op.attributes) {
            if (attr === 'type' && converters.block[op.attributes.type]) {
              var fn = converters.block[op.attributes.type]
              if (typeof fn == 'object') {
                if (group && group.type != attr) {
                  group = null
                }
                if (!group && fn.group) {
                  group = {
                    el: fn.group(),
                    type: attr,
                    value: op.attributes[k],
                    distance: 0,
                  }
                  root.append(group.el)
                }

                if (group) {
                  group.el.append(line)
                  group.distance = 0
                }
                fn = fn.line
              }

              fn.call(line, op.attributes, group)
              newLine()
              break
            }
          }
        }
        beginningOfLine = true
      } else {
        for (var l = 0; l < lines.length; l++) {
          if ((l > 0 || beginningOfLine) && group && ++group.distance >= 2) {
            group = null
          }
          applyStyles(op.attributes, ops[i + 1] && ops[i + 1].attributes)
          el.append(lines[l])
          if (l < lines.length - 1) {
            newLine()
          }
        }
        beginningOfLine = false
      }
    }
  }

  return root

  function applyStyles(attrs, next) {
    var first = [],
      then = []
    attrs = attrs || {}

    var tag = el,
      seen = {}
    while (tag._format) {
      seen[tag._format] = true
      if (!attrs[tag._format]) {
        for (var k in seen) {
          delete activeInline[k]
        }
        el = tag.parent()
      }

      tag = tag.parent()
    }

    for (var attr in attrs) {
      if (converters.inline[attr]) {
        if (activeInline[attr]) {
          if (activeInline[attr] != attrs[attr]) {
            // ie when two links abut
          } else {
            continue // do nothing -- we should already be inside this style's tag
          }
        }

        if (next && attrs[attr] == next[attr]) {
          first.push(attr) // if the next operation has the same style, this should be the outermost tag
        } else {
          then.push(attr)
        }
        activeInline[attr] = attrs[attr]
      }
    }

    first.forEach(apply)
    then.forEach(apply)

    function apply(fmt) {
      var newEl = converters.inline[fmt].call(null, attrs[fmt])
      if (_.isArray(newEl)) {
        newEl = new Node(newEl)
      }
      newEl._format = fmt
      el.append(newEl)
      el = newEl
    }
  }
}

function isLinifyable(attrs, converters) {
  for (var k in attrs) {
    if (k === 'type' && converters.block[attrs.type]) {
      return true
    }
  }
  return false
}
