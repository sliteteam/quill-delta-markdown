render = require("./fromDelta");
const remark = require("remark");
test("remark().stringify(renders bold format", function() {
  const md = remark().stringify(
    render({})([
      {
        insert: "Hi "
      },
      {
        attributes: {
          bold: true
        },
        insert: "mom"
      }
    ])
  );
  expect(md).toEqual("Hi **mom**\n");
});
test("remark().stringify(renders italic format", function() {
  const md = remark().stringify(
    render({})([
      {
        insert: "Hi "
      },
      {
        attributes: {
          italic: true
        },
        insert: "mom"
      }
    ])
  );
  expect(md).toEqual("Hi _mom_\n");
});
test("remark().stringify(renders embed format", function() {
  expect(
    remark().stringify(
      render({})([
        {
          insert: "LOOK AT THE KITTEN!\n"
        },
        {
          insert: "\n",
          attributes: {
            type: "image",
            data: {
              url: "https://placekitten.com/g/200/300"
            }
          }
        }
      ])
    )
  ).toEqual("LOOK AT THE KITTEN!\n\n![](https://placekitten.com/g/200/300)\n");
});

test("encodes image url", function() {
  expect(
    remark().stringify(
      render({})([
        {
          insert: "LOOK AT THE KITTEN!\n"
        },
        {
          insert: "\n",
          attributes: {
            type: "image",
            data: {
              url: "https://placekitten.com/g/200/300é.jpg"
            }
          }
        }
      ])
    )
  ).toEqual(
    "LOOK AT THE KITTEN!\n\n![](https://placekitten.com/g/200/300%C3%A9.jpg)\n"
  );
});

test("removes download params for images", function() {
  expect(
    remark().stringify(
      render({})([
        {
          insert: "LOOK AT THE KITTEN!\n"
        },
        {
          insert: "\n",
          attributes: {
            type: "image",
            data: {
              url:
                "https://placekitten.com/g/200/300?params=21312321313&response-content-disposition=attachment; filename=300.jpg"
            }
          }
        }
      ])
    )
  ).toEqual(
    "LOOK AT THE KITTEN!\n\n![](https://placekitten.com/g/200/300?params=21312321313)\n"
  );
});

test("remark().stringify(renders block format", function() {
  expect(
    remark().stringify(
      render({})([
        {
          insert: "Headline"
        },
        {
          attributes: {
            type: "header-one"
          },
          insert: "\n"
        }
      ])
    )
  ).toEqual("# Headline\n");
});
test("remark().stringify(render adjacent styles correctly", function() {
  expect(
    remark().stringify(
      render({})([
        {
          attributes: {
            italic: true
          },
          insert: "juju"
        },
        {
          insert: "HH"
        },
        {
          attributes: {
            type: "unordered-list-item"
          },
          insert: "\n"
        }
      ])
    )
  ).toEqual("-   _juju_HH\n");
});
test("remark().stringify(renders lists with inline formats correctly", function() {
  expect(
    remark().stringify(
      render({})([
        {
          attributes: {
            italic: true
          },
          insert: "Glenn v. Brumby"
        },
        {
          insert: ", 663 F.3d 1312 (11th Cir. 2011)"
        },
        {
          attributes: {
            type: "ordered-list-item"
          },
          insert: "\n"
        },
        {
          attributes: {
            italic: true
          },
          insert: "Barnes v. City of Cincinnati"
        },
        {
          insert: ", 401 F.3d 729 (6th Cir. 2005)"
        },
        {
          attributes: {
            type: "ordered-list-item"
          },
          insert: "\n"
        }
      ])
    )
  ).toEqual(
    "1.  _Glenn v. Brumby_, 663 F.3d 1312 (11th Cir. 2011)\n2.  _Barnes v. City of Cincinnati_, 401 F.3d 729 (6th Cir. 2005)\n"
  );
});
test("remark().stringify(renders adjacent lists correctly, with unstyled in between", function() {
  expect(
    remark().stringify(
      render({})([
        {
          insert: "Item 1"
        },
        {
          insert: "\n",
          attributes: {
            type: "ordered-list-item"
          }
        },
        {
          insert: "Intervening paragraph"
        },
        {
          insert: "\n",
          attributes: {
            type: "unstyled"
          }
        },
        {
          insert: "Item 2"
        },
        {
          insert: "\n",
          attributes: {
            type: "ordered-list-item"
          }
        }
      ])
    )
  ).toEqual("1.  Item 1\n\nIntervening paragraph\n\n\n1.  Item 2\n");
});

test("remark().stringify(renders 2 paragraphes", function() {
  expect(
    remark().stringify(
      render({})([
        {
          insert: "a paragraph"
        },
        {
          insert: "\n",
          attributes: {
            type: "unstyled"
          }
        },
        {
          insert: "other paragraph"
        },
        {
          insert: "\n",
          attributes: {
            type: "unstyled"
          }
        }
      ])
    )
  ).toEqual("a paragraph\nother paragraph\n\n");
});
test("remark().stringify(renders adjacent inline formats correctly", function() {
  expect(
    remark().stringify(
      render({})([
        {
          attributes: {
            italic: true
          },
          insert: "Italics! "
        },
        {
          attributes: {
            italic: true,
            entity: {
              type: "LINK",
              data: {
                url: "http://example.com"
              }
            }
          },
          insert: "Italic link"
        },
        {
          attributes: {
            entity: {
              type: "LINK",
              data: {
                url: "http://example.com"
              }
            }
          },
          insert: " regular link"
        }
      ])
    )
  ).toEqual(
    "_Italics! _[_Italic link_](http://example.com)[ regular link](http://example.com)" +
      "\n"
  );
});

test("remark().stringify(render an inline link", function() {
  expect(
    remark().stringify(
      render({})([
        {
          insert: "Go to Google",
          attributes: {
            entity: {
              type: "LINK",
              data: {
                url: "https://www.google.fr"
              }
            }
          }
        }
      ])
    )
  ).toEqual("[Go to Google](https://www.google.fr)" + "\n");
});
test("remark().stringify(renders todo block", function() {
  expect(
    remark().stringify(
      render({})([
        {
          insert: "First todo"
        },
        {
          attributes: {
            type: "todo-block",
            data: {
              checked: false
            }
          },
          insert: "\n"
        },
        {
          insert: "Second todo"
        },
        {
          attributes: {
            type: "todo-block",
            data: {
              checked: true
            }
          },
          insert: "\n"
        }
      ])
    )
  ).toEqual("-   [ ] First todo" + "\n" + "-   [x] Second todo" + "\n");
});
test("remark().stringify(renders a separator block", function() {
  expect(
    remark().stringify(
      render({})([
        {
          insert: "Before\n"
        },
        {
          attributes: {
            type: "separator"
          },
          insert: "\n"
        },
        {
          insert: "After\n"
        }
      ])
    )
  ).toEqual("Before" + "\n" + "\n" + "---" + "\n\n" + "\n" + "After" + "\n");
});
test("remark().stringify(renders an unordered list with indented list", function() {
  expect(
    remark().stringify(
      render({})([
        {
          insert: "Item A"
        },
        {
          insert: "\n",
          attributes: {
            type: "unordered-list-item",
            data: { depth: 0 }
          }
        },
        {
          insert: "Item 1"
        },
        {
          insert: "\n",
          attributes: {
            type: "unordered-list-item",
            data: { depth: 1 }
          }
        },
        {
          insert: "Item 2"
        },
        {
          insert: "\n",
          attributes: {
            type: "unordered-list-item",
            data: { depth: 1 }
          }
        },
        {
          insert: "Item B"
        },
        {
          insert: "\n",
          attributes: {
            type: "unordered-list-item",
            data: { depth: 0 }
          }
        }
      ])
    )
  ).toEqual(
    "-   Item A\n" + "    -   Item 1\n" + "    -   Item 2\n" + "-   Item B\n"
  );
});
test("remark().stringify(renders an ordered list with indented list", function() {
  expect(
    remark().stringify(
      render({})([
        {
          insert: "Item A"
        },
        {
          insert: "\n",
          attributes: {
            type: "ordered-list-item",
            data: { depth: 0 }
          }
        },
        {
          insert: "Item 1"
        },
        {
          insert: "\n",
          attributes: {
            type: "ordered-list-item",
            data: { depth: 1 }
          }
        },
        {
          insert: "Item 2"
        },
        {
          insert: "\n",
          attributes: {
            type: "ordered-list-item",
            data: { depth: 1 }
          }
        },
        {
          insert: "Item B"
        },
        {
          insert: "\n",
          attributes: {
            type: "ordered-list-item",
            data: { depth: 0 }
          }
        }
      ])
    )
  ).toEqual(
    "1.  Item A\n" + "    1.  Item 1\n" + "    2.  Item 2\n" + "2.  Item B\n"
  );
});
test("remark().stringify(renders an ordered list with indented lists", function() {
  expect(
    remark().stringify(
      render({})([
        {
          insert: "Item A"
        },
        {
          insert: "\n",
          attributes: {
            type: "ordered-list-item",
            data: { depth: 0 }
          }
        },
        {
          insert: "Item 1"
        },
        {
          insert: "\n",
          attributes: {
            type: "ordered-list-item",
            data: { depth: 1 }
          }
        },
        {
          insert: "Item 2"
        },
        {
          insert: "\n",
          attributes: {
            type: "ordered-list-item",
            data: { depth: 1 }
          }
        },
        {
          insert: "Item ALPHA"
        },
        {
          insert: "\n",
          attributes: {
            type: "ordered-list-item",
            data: { depth: 2 }
          }
        },
        {
          insert: "Item BETA"
        },
        {
          insert: "\n",
          attributes: {
            type: "ordered-list-item",
            data: { depth: 2 }
          }
        },
        {
          insert: "Item B"
        },
        {
          insert: "\n",
          attributes: {
            type: "ordered-list-item",
            data: { depth: 0 }
          }
        }
      ])
    )
  ).toEqual(
    "1.  Item A\n" +
      "    1.  Item 1\n" +
      "    2.  Item 2\n" +
      "        1.  Item ALPHA\n" +
      "        2.  Item BETA\n" +
      "2.  Item B\n"
  );
});

test("remark().stringify(renders a simple list", function() {
  expect(
    remark().stringify(
      render({})([
        {
          insert: "Item A"
        },
        {
          insert: "\n",
          attributes: {
            type: "ordered-list-item",
            data: { depth: 0 }
          }
        },
        {
          insert: "Item B"
        },
        {
          insert: "\n",
          attributes: {
            type: "ordered-list-item",
            data: { depth: 0 }
          }
        }
      ])
    )
  ).toEqual("1.  Item A\n" + "2.  Item B\n");
});
test("remark().stringify(render mix", function() {
  expect(
    remark().stringify(
      render({})([
        {
          insert: "lala"
        },
        {
          insert: "\n",
          attributes: {
            type: "unstyled",
            data: {
              id: "38eie",
              depth: 0
            }
          }
        },
        {
          insert: "un"
        },
        {
          insert: "\n",
          attributes: {
            type: "ordered-list-item",
            data: {
              id: "8hugk",
              depth: 0
            }
          }
        },
        {
          insert: "deux"
        },
        {
          insert: "\n",
          attributes: {
            type: "ordered-list-item",
            data: {
              id: "9d555",
              depth: 0
            }
          }
        },
        {
          insert: "plus profond1"
        },
        {
          insert: "\n",
          attributes: {
            type: "ordered-list-item",
            data: {
              id: "fj1d1",
              depth: 1
            }
          }
        },
        {
          insert: "encore plus profond1"
        },
        {
          insert: "\n",
          attributes: {
            type: "ordered-list-item",
            data: {
              id: "1b930",
              depth: 2
            }
          }
        },
        {
          insert: "nouvelle list"
        },
        {
          insert: "\n",
          attributes: {
            type: "unordered-list-item",
            data: {
              id: "842fh",
              depth: 1
            }
          }
        },
        {
          insert: "un truc dedans"
        },
        {
          insert: "\n",
          attributes: {
            type: "unordered-list-item",
            data: {
              id: "208v4",
              depth: 2
            }
          }
        },
        {
          insert: "\n",
          attributes: {
            type: "separator",
            data: {
              atomic: true,
              depth: 0
            }
          }
        },
        {
          insert: "checkbox"
        },
        {
          insert: "\n",
          attributes: {
            type: "todo-block",
            data: {
              id: "6bbps",
              depth: 0
            }
          }
        },
        {
          insert: "checkbox checked"
        },
        {
          insert: "\n",
          attributes: {
            type: "todo-block",
            data: {
              id: "9ohh2",
              checked: true,
              depth: 0
            }
          }
        },
        {
          insert: "\n",
          attributes: {
            type: "unstyled",
            data: {
              id: "3b05n",
              depth: 0
            }
          }
        },
        {
          insert: "\n",
          attributes: {
            type: "file",
            data: {
              atomic: true,
              depth: 0,
              url:
                'https://storage.googleapis.com/slite-api-files-production/files%2F876f6040-b067-431c-ad5c-0738bc540bc7%2Fdemandeid.pdf?GoogleAccessId=storage-production@notex-146908.iam.gserviceaccount.com&Expires=2143892673&Signature=JV0bMcsAsfrOAzb8umQVGafSr3TF42ZbQfTuJZBSbHJWmHttNS8ADx%2BqTJBKPkR%2B1%2FPTG0ZHE9bwHxic55mWw0GhlYjWHhYkvxXqoVfdKeaEHJAdyv%2FuVzbS6PDU%2F7SDxqJOu%2FmBTB%2BmJhPU%2BarlYWVieQa2E%2BXoYk%2Baf9wv%2BPWD9PVrOpG%2FLarAHDD8HrAQ2HoA9VTzk%2B6f848pug8hBZikcDpH9w0uHEjldzADR0PA%2B6BY%2FVdOnsSekEwOUD8t8m8lujjZWFCBFRy%2FiqnyvQ8dKDZIPZGafMZskEXEiSEKp%2BHbIxYoqLkVMIoPTjP2usGFZYXlg9dHDpL5owa0Hg%3D%3D&response-content-disposition=attachment; filename="demandeid.pdf"',
              __typename: "Media",
              noteId: "rJKLPjM~M",
              name: "demandeid.pdf",
              meta: {
                size: 540205
              },
              createdAt: "2017-12-13T13:44:33.000Z",
              createdBy: "S15WGQspZ"
            }
          }
        },
        {
          insert: "\n",
          attributes: {
            type: "unstyled",
            data: {
              id: "f2bs8",
              depth: 0
            }
          }
        },
        {
          insert: "\n",
          attributes: {
            type: "unstyled",
            data: {
              id: "6bedj",
              depth: 0
            }
          }
        },
        {
          insert: "\n",
          attributes: {
            type: "unstyled",
            data: {
              id: "7abjs",
              depth: 0
            }
          }
        },
        {
          insert: "\n",
          attributes: {
            type: "unstyled",
            data: {
              id: "emrcn",
              depth: 0
            }
          }
        },
        {
          insert: "\n",
          attributes: {
            type: "image",
            data: {
              atomic: true,
              depth: 0,
              url:
                'https://storage.googleapis.com/slite-api-files-production/files%2F5e784cec-ab9e-4062-8f45-4c2cb03d3a7b%2Fi--search.png?GoogleAccessId=storage-production@notex-146908.iam.gserviceaccount.com&Expires=2143899403&Signature=H71%2BO4R49B4cjN%2Bq4eV3BgsG14DLpMjQXliD359BU%2FFY73QzQOQ0BzFPGseJ2YXKryaBS%2FSdx9nlybrLeu8oRtI%2FxIW8f50TTxnBEIPnxjhOhIkXEMeXdJ7xNRO7kWVy5B%2BvX3OvpBy0ETjXdSmVx7FrU%2FgHpweubkEUOfgVxuNOYk%2Bcs%2FbfPrEXSSz0KsDAkbkormUi9F%2BtUbjQIp%2FRURRm4ShTx7L5gHU0dusbeRudPP6xITYffgaWxvTn9WZwZNqipDTA5uVcl1AA7S4tnhaaj3akwv7J3KyDnJkL6eQkbkUpzjvX3E9obvgjmkZjIIREqRJ5UMO8%2FW8%2FibmDcw%3D%3D&response-content-disposition=attachment; filename="i--search.png"'
            }
          }
        },
        {
          insert: "\n",
          attributes: {
            type: "unstyled",
            data: {
              id: "5p8f9",
              depth: 0
            }
          }
        },
        {
          insert: "\n",
          attributes: {
            type: "unstyled",
            data: {
              id: "bi82",
              depth: 0
            }
          }
        }
      ])
    )
  ).toEqual(
    "lala\n\n\n1.  un\n2.  deux\n    1.  plus profond1\n        1.  encore plus profond1\n        -   un truc dedans\n    -   nouvelle list\n\n---\n\n\n-   [ ] checkbox\n-   [x] checkbox checked\n\n\n\n![](https://storage.googleapis.com/slite-api-files-production/files%252F5e784cec-ab9e-4062-8f45-4c2cb03d3a7b%252Fi--search.png?GoogleAccessId=storage-production@notex-146908.iam.gserviceaccount.com)\n"
  );
});
test("remark().stringify(render raw link", function() {
  const md = remark().stringify(
    render({})([
      {
        insert: "http://google.com"
      }
    ]),
    { gfm: false }
  );
  expect(md).toEqual("http&#x3A;//google.com\n"); //Can't give options to stringify here
});
test("remark().stringify(render raw link", function() {
  const md = remark().stringify(
    render({})([
      {
        insert: "ko http://google.com ok"
      },
      {
        insert: "\n",
        attributes: {
          type: "unstyled",
          data: {
            id: "2jc4j",
            depth: 0
          }
        }
      }
    ]),
    { options: { gfm: false } }
  );
  expect(md).toEqual("ko http&#x3A;//google.com ok\n\n"); //Can't give options to stringify here
});

test("remark().stringify(render table", function() {
  const md = remark().stringify(
    render({})([
      {
        insert: "top-left"
      },
      {
        insert: "\n",
        attributes: {
          type: "table-cell",
          data: {
            tableId: "fpd9c",
            rowBreak: false,
            id: "ehd4q",
            depth: 0
          }
        }
      },
      {
        insert: "top-right"
      },
      {
        insert: "\n",
        attributes: {
          type: "table-cell",
          data: {
            tableId: "fpd9c",
            rowBreak: true,
            id: "8oklr",
            depth: 0
          }
        }
      },
      {
        insert: "bot-left"
      },
      {
        insert: "\n",
        attributes: {
          type: "table-cell",
          data: {
            tableId: "fpd9c",
            rowBreak: false,
            id: "fvru0",
            depth: 0
          }
        }
      },
      {
        insert: "bot-right"
      },
      {
        insert: "\n",
        attributes: {
          type: "table-cell",
          data: {
            tableId: "fpd9c",
            rowBreak: true,
            id: "f2q6a",
            depth: 0
          }
        }
      },
      {
        attributes: {
          type: "unstyled",
          data: {
            id: "f4u9a",
            depth: 0
          }
        },
        insert: "\n"
      }
    ])
  );
  expect(md).toEqual(
    "| top-left | top-right |\n| :------- | :-------: |\n| bot-left | bot-right |\n"
  );
});
test("remark().stringify(render table", function() {
  expect(
    remark().stringify(
      render({})([
        {
          insert: "foo()"
        },
        {
          insert: "\n",
          attributes: {
            type: "code-block",
            data: {
              id: "f4u9a",
              depth: 0
            }
          }
        }
      ])
    )
  ).toEqual("    ```\n    foo()\n    ```\n");
});
