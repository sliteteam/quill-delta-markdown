const _ = require("lodash");

var id = 0;

class Node {
  constructor({
    depth = 0,
    text = "",
    type = "",
    checked = false,
    children = [],
    ordered = false
  }) {
    this.id = ++id;
    this.depth = depth;
    this.text = text;
    this.type = type;
    this.checked = checked;
    this.children = children;
    this.ordered = ordered;
  }

  append(e) {
    if (!(e instanceof Node)) {
      e = new Node(e);
    }
    if (e._parent) {
      _.pull(e._parent.children, e);
    }
    e._parent = this;
    this.children = this.children.concat(e);
  }

  parent() {
    return this._parent;
  }
}

module.exports = Node;
