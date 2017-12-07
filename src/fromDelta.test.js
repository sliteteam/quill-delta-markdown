const render = require('./fromDelta')

test('renders bold format', function() {
  const md = render({})([
    {
      insert: 'Hi ',
    },
    {
      attributes: {
        bold: true,
      },
      insert: 'mom',
    },
  ])
  expect(md).toEqual('Hi **mom**\n')
})

test('renders italic format', function () {
  const md = render({})([
    {
      insert: 'Hi ',
    },
    {
      attributes: {
        italic: true,
      },
      insert: 'mom',
    },
  ])
  expect(md).toEqual('Hi _mom_\n')
})

test('renders embed format', function() {
  expect(
    render([
      {
        insert: 'LOOK AT THE KITTEN!\n',
      },
      {
        insert: '\n',
        attributes: {
          type: 'image',
          data: {
            url: 'https://placekitten.com/g/200/300',
          },
        },
      },
    ])
  ).toEqual('LOOK AT THE KITTEN!\n![](https://placekitten.com/g/200/300)\n')
})

test('encodes image url', function() {
  expect(
    render([
      {
        insert: 'LOOK AT THE KITTEN!\n',
      },
      {
        insert: '\n',
        attributes: {
          type: 'image',
          data: {
            url: 'https://placekitten.com/g/200/300(1).jpg',
          },
        },
      },
    ])
  ).toEqual('LOOK AT THE KITTEN!\n![](https://placekitten.com/g/200/300%281%29.jpg)\n')
})

test('removes download params for images', function () {
  expect(
    render([
      {
        insert: 'LOOK AT THE KITTEN!\n',
      },
      {
        insert: '\n',
        attributes: {
          type: 'image',
          data: {
            url: 'https://placekitten.com/g/200/300?params=21312321313&response-content-disposition=attachment; filename=300.jpg',
          },
        },
      },
    ])
  ).toEqual('LOOK AT THE KITTEN!\n![](https://placekitten.com/g/200/300?params=21312321313)\n')
})

test('renders block format', function() {
  expect(
   render({})([
      {
        insert: 'Headline',
      },
      {
        attributes: {
          type: 'header-one',
        },
        insert: '\n',
      },
    ])
  ).toEqual('# Headline\n')
})

test('renders lists with inline formats correctly', function() {
  expect(
   render({})([
      {
        attributes: {
          italic: true,
        },
        insert: 'Glenn v. Brumby',
      },
      {
        insert: ', 663 F.3d 1312 (11th Cir. 2011)',
      },
      {
        attributes: {
          type: 'ordered-list-item',
        },
        insert: '\n',
      },
      {
        attributes: {
          italic: true,
        },
        insert: 'Barnes v. City of Cincinnati',
      },
      {
        insert: ', 401 F.3d 729 (6th Cir. 2005)',
      },
      {
        attributes: {
          type: 'ordered-list-item',
        },
        insert: '\n',
      },
    ])
  ).toEqual(
    '1. *Glenn v. Brumby*, 663 F.3d 1312 (11th Cir. 2011)\n2. *Barnes v. City of Cincinnati*, 401 F.3d 729 (6th Cir. 2005)\n'
  )
})

test('renders adjacent lists correctly', function() {
  expect(
    render([
      {
        insert: 'Item 1',
      },
      {
        insert: '\n',
        attributes: {
          type: 'ordered-list-item',
        },
      },
      {
        insert: 'Item 2',
      },
      {
        insert: '\n',
        attributes: {
          type: 'ordered-list-item',
        },
      },
      {
        insert: 'Item 3',
      },
      {
        insert: '\n',
        attributes: {
          type: 'ordered-list-item',
        },
      },
      {
        insert: 'Intervening paragraph\nItem 4',
      },
      {
        insert: '\n',
        attributes: {
          type: 'ordered-list-item',
        },
      },
      {
        insert: 'Item 5',
      },
      {
        insert: '\n',
        attributes: {
          type: 'ordered-list-item',
        },
      },
      {
        insert: 'Item 6',
      },
      {
        insert: '\n',
        attributes: {
          type: 'ordered-list-item',
        },
      },
    ])
  ).toEqual(
    '1. Item 1\n2. Item 2\n3. Item 3\n\nIntervening paragraph\n1. Item 4\n2. Item 5\n3. Item 6\n'
  )
})

test('renders adjacent inline formats correctly', function() {
  expect(
    render([
      {
        attributes: {
          italic: true,
        },
        insert: 'Italics! ',
      },
      {
        attributes: {
          italic: true,
          entity: {
            type: 'LINK',
            data: {
              url: 'http://example.com',
            },
          },
        },
        insert: 'Italic link',
      },
      {
        attributes: {
          entity: {
            type: 'LINK',
            data: {
              url: 'http://example.com',
            },
          },
        },
        insert: ' regular link',
      },
    ])
  ).toEqual(
    '*Italics! [Italic link](http://example.com)*[ regular link](http://example.com)' +
      '\n'
  )
})

test('render an inline link', function() {
  expect(
   render({})([
      {
        insert: 'Go to Google',
        attributes: {
          entity: {
            type: 'LINK',
            data: {
              url: 'https://www.google.fr',
            },
          },
        },
      }
    ])
  ).toEqual('[Go to Google](https://www.google.fr)' + '\n')
})

test('renders todo block', function() {
  expect(
   render({})([
      {
        insert: 'First todo',
      },
      {
        attributes: {
          type: 'todo-block',
          data: {
            checked: false,
          },
        },
        insert: '\n',
      },
      {
        insert: 'Second todo',
      },
      {
        attributes: {
          type: 'todo-block',
          data: {
            checked: true,
          },
        },
        insert: '\n',
      },
    ])
  ).toEqual('- [ ] First todo' + '\n' + '- [x] Second todo' + '\n')
})

test('renders a separator block', function() {
  expect(
    render([
      {
        insert: 'Before\n',
      },
      {
        attributes: {
          type: 'separator',
        },
        insert: '\n',
      },
      {
        insert: 'After\n',
      },
    ])
  ).toEqual('Before' + '\n' + '\n' + '---' + '\n' + '\n' + 'After' + '\n')
})

test('renders an unordered list with indented list', function() {
  expect(
    render([
      {
        insert: 'Item A',
      },
      {
        insert: '\n',
        attributes: {
          type: 'unordered-list-item',
          data: { depth: 0 }
        },
      },
      {
        insert: 'Item 1',
      },
      {
        insert: '\n',
        attributes: {
          type: 'unordered-list-item',
          data: { depth: 1 }
        },
      },
      {
        insert: 'Item 2',
      },
      {
        insert: '\n',
        attributes: {
          type: 'unordered-list-item',
          data: { depth: 1 }
        },
      },
      {
        insert: 'Item B',
      },
      {
        insert: '\n',
        attributes: {
          type: 'unordered-list-item',
          data: { depth: 0 }
        },
      },
    ])
  ).toEqual(
    '- Item A\n' +
    '  - Item 1\n' +
    '  - Item 2\n' +
    '- Item B\n'
  )
})


test('renders an ordered list with indented list', function() {
  expect(
    render([
      {
        insert: 'Item A',
      },
      {
        insert: '\n',
        attributes: {
          type: 'ordered-list-item',
          data: { depth: 0 }
        },
      },
      {
        insert: 'Item 1',
      },
      {
        insert: '\n',
        attributes: {
          type: 'ordered-list-item',
          data: { depth: 1 }
        },
      },
      {
        insert: 'Item 2',
      },
      {
        insert: '\n',
        attributes: {
          type: 'ordered-list-item',
          data: { depth: 1 }
        },
      },
      {
        insert: 'Item B',
      },
      {
        insert: '\n',
        attributes: {
          type: 'ordered-list-item',
          data: { depth: 0 }
        },
      },
    ])
  ).toEqual(
    '1. Item A\n' +
    '  2. Item 1\n' +
    '  3. Item 2\n' +
    '4. Item B\n'
  )
})
