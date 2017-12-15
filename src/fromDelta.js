const Delta = require("quill-delta");
const u = require("unist-builder");
const Node = require("./utils/Node");
const printTree = require("print-tree");
const defaultConvertInline = ({ insert, attributes = {} }) => {
  const { bold, italic, entity = { type: "", data: {} } } = attributes;

  let inline = u("text", insert);
  if (bold) {
    inline = u("strong", [inline]);
  }
  if (italic) {
    inline = u("emphasis", [inline]);
  }
  if (entity.type.toLowerCase() === "link") {
    inline = u("link", { url: entity.data.url, title: null }, [inline]);
  }
  return inline;
};

function handleImageUrl(url) {
  if (url.indexOf("&") > 0) url = url.substring(0, url.indexOf("&"));
  return encodeURI(url);
}

const defaultConvertLine = ({ type, data }) => {
  switch (type) {
    case "unstyled": {
      return {
        type: "unstyled"
      };
    }
    case "header-one": {
      return {
        type: "heading",
        depth: 1
      };
    }
    case "header-two": {
      return {
        type: "heading",
        depth: 2
      };
    }
    case "unordered-list-item": {
      return {
        type: "listItem",
        checked: null,
        depth: data ? data.depth || 0 : 0,
        ordered: false
      };
    }
    case "ordered-list-item": {
      return {
        type: "listItem",
        checked: null,
        depth: data ? data.depth || 0 : 0,
        ordered: true
      };
    }
    case "todo-block": {
      return {
        type: "listItem",
        checked: data.checked === undefined ? false : data.checked,
        depth: data ? data.depth || 0 : 0,
        ordered: false
      };
    }
    case "image": {
      return {
        type: "image",
        url: handleImageUrl(data.url)
      };
    }
    case "separator": {
      return {
        type: "separator"
      };
    }
    case "table-cell": {
      return {
        type: "tableCell",
        rowBreak: data.rowBreak
      };
    }
    case "code-block": {
      return {
        type: "code"
      };
    }
  }
  return {
    type: "paragraph"
  };
};

const insertListInChildren = children => {
  let lists = [];
  let listItems = [];
  let others = [];
  let style = { ordered: -1 };
  children.forEach(child => {
    if (child.type === "listItem") {
      //  checking if the list at the same depth is of the same type.
      //  if it is, we will use its type, otherwise, a new one is created
      if (style.ordered !== -1 && child.ordered !== style.ordered) {
        lists = lists.concat([listItems]);
        listItems = [];
      }
      listItems = listItems.concat(child);
      style = { ordered: child.ordered, checked: child.checked };
    } else {
      others = others.concat(child);
    }
  });
  lists = lists.concat([listItems]);
  lists.map(list => {
    if (list.length) {
      others = others.concat(
        u("list", { ordered: list[0].ordered, start: 1 }, list)
      );
    }
  });
  return others;
};

function closeUpList(currentNode) {
  if (currentNode) {
    while (currentNode.depth > 0) {
      let parentNode = currentNode.parent();
      parentNode.children = insertListInChildren(parentNode.children);
      currentNode = parentNode;
    }
    let parentNode = currentNode.parent();
    parentNode.children = insertListInChildren(parentNode.children);
  }
}

function handleListItem(currentNode, data, rootNode) {
  data.children = [u("paragraph", {}, data.children)];
  if (!currentNode) {
    currentNode = new Node(data);
    rootNode.append(currentNode);
  } else {
    if (data.depth === currentNode.depth) {
      let newNode = new Node(data);
      currentNode.parent().append(newNode);
      currentNode = newNode;
    } else if (data.depth > currentNode.depth) {
      let newNode = new Node(data);
      currentNode.append(newNode);
      currentNode = newNode;
    } else {
      while (currentNode.depth > data.depth) {
        let parentNode = currentNode.parent();
        parentNode.children = insertListInChildren(parentNode.children);
        currentNode = currentNode.parent();
      }
      currentNode.parent().append(data);
    }
  }
  return currentNode;
}

function handleUnstyled(
  currentNode,
  { ordered, checked, depth, url },
  line,
  rootNode
) {
  let data = u(
    "text",
    { ordered, checked, depth, url },
    line.ops[0].insert + "\n"
  );
  closeUpList(currentNode);
  rootNode.children = rootNode.children.concat(data);
}

function handleTableCell(
  currentNode,
  { rowBreak, children },
  rootNode,
  currentTable
) {
  if (!currentTable)
    currentTable = u("table", { align: ["left", "center"] }, [
      // Alignment to maybe change in the future if customizable
      u("tableRow", {}, [])
    ]);
  currentTable.children[
    currentTable.children.length - 1
  ].children = currentTable.children[
    currentTable.children.length - 1
  ].children.concat(u("tableCell", {}, children));
  if (rowBreak)
    currentTable.children = currentTable.children.concat(u("tableRow", {}, []));
  return currentTable;
}

function closeUpTable(currentTable, rootNode) {
  if (
    currentTable &&
    !currentTable.children[currentTable.children.length - 1].children.length
  ) {
    currentTable.children.pop();
    rootNode.children = rootNode.children.concat(currentTable);
  }
}

function CloseUpTableAndList(currentTable, currentNode, rootNode) {
  closeUpTable(currentTable, rootNode);
  closeUpList(currentNode);
}

const convertFromDeltaToMdAST = ({
  convertInline = defaultConvertInline,
  convertLine = defaultConvertLine
}) => deltaOps => {
  const delta = new Delta(deltaOps);
  let rootNode = new Node({ depth: -1 });
  let currentNode = null;
  let currentTable = null;

  delta.eachLine((line, attributes) => {
    const { type, ordered, checked, depth, url, rowBreak } = convertLine(
      attributes
    );
    let children = line.ops.map(convertInline);
    let data = u(type, { ordered, checked, depth, url, rowBreak }, children);
    switch (type) {
      case "listItem": {
        closeUpTable(currentTable, rootNode);
        currentNode = handleListItem(currentNode, data, rootNode);
        break;
      }
      case "unstyled": {
        if (!line.ops.length) break;
        CloseUpTableAndList(currentTable, currentNode, rootNode);
        currentNode = handleUnstyled(currentNode, data, line, rootNode);
        break;
      }
      case "separator": {
        data = u("text", { ordered, checked, depth, url }, "---\n");
        CloseUpTableAndList(currentTable, currentNode, rootNode);
        rootNode.children = rootNode.children.concat(data);
        break;
      }
      case "tableCell": {
        currentTable = handleTableCell(
          currentNode,
          data,
          rootNode,
          currentTable
        );
        closeUpList(currentNode);
        break;
      }
      case "code": {
        data = u(type, {}, "```\n" + children[0].value + "\n```"); // to change to real code type, but doesn't work for now
        CloseUpTableAndList(currentTable, currentNode, rootNode);
        rootNode.children = rootNode.children.concat(data);
        break;
      }
      default: {
        CloseUpTableAndList(currentTable, currentNode, rootNode);
        rootNode.children = rootNode.children.concat(data);
      }
    }
  });
  CloseUpTableAndList(currentTable, currentNode, rootNode);
  //printTree(rootNode, node => node.type, node => node.children);
  let root = u("root", rootNode);
  return root;
};

module.exports = convertFromDeltaToMdAST;
