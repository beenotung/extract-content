function formatPercent(x: number, n: number): string {
  return Math.round((x / n) * 100 * 100) / 100 + '%';
}

function createButton(text: string, cb: () => void): HTMLButtonElement {
  const button = document.createElement('button');
  button.textContent = text;
  button.style.background = 'initial';
  button.style.color = 'initial';
  button.style.border = 'initial';
  button.onclick = cb;
  return button;
}

/* tslint:disable */
var markButton: HTMLButtonElement;

/* tslint:enable */

function addMarkButton() {
  if (!markButton || !markButton.parentElement) {
    markButton = createButton('mark', () => mark());
    document.body.prepend(markButton);
  }
}

function findTextContentLength(root: Node): number {
  if (root instanceof Text) {
    return root.textContent.length;
  }
  if (root instanceof Comment) {
    return 0;
  }
  if (root instanceof Element) {
    switch (root.tagName.toLowerCase()) {
      case 'script':
      case 'style':
      case 'button':
      case 'input':
        return 0;
      default:
        let acc = 0;
        root.childNodes.forEach(e => (acc += findTextContentLength(e)));
        return acc;
    }
  }
  throw new Error('unknown root node type: ' + root.constructor.name);
}

function markCore(root: Node = document.body, n?: number) {
  // console.log('mark root:', root);
  if (!(root instanceof Element)) {
    return;
  }
  root.querySelectorAll('script').forEach(e => e.remove());
  root.querySelectorAll('button.remove').forEach(e => e.remove());
  {
    const as = document.querySelectorAll('article');
    if (as.length > 0) {
      console.log('found', as.length, 'articles');
      as.forEach(a => a.remove());
      root.childNodes.forEach(e => e.remove());
      as.forEach(a => root.appendChild(a));
      return;
    }
  }
  if (!n) {
    n = findTextContentLength(root);
  }
  const children: Array<[Node, number]> = [];
  root.childNodes.forEach(e => children.push([e, findTextContentLength(e)]));
  if (children.some(([e, x]) => x / n >= 0.8 && x !== n)) {
    console.log('has match');
    children.forEach(([e, x]) => {
      if (x / n < 0.8) {
        console.log('remove', formatPercent(x, n), e);
        e.parentNode.removeChild(e);
        return;
      }
      console.log('keep', formatPercent(x, n), e);
    });
    return;
  }
  console.log('no match');
  children.forEach(([e, x]) => {
    // console.log(formatPercent(x, n), e);
    if (!(e instanceof Element)) {
      // console.log('skip', e);
      return;
    }
    // console.log('add button on', e, formatPercent(x, n));
    const button = createButton('remove ' + formatPercent(x, n), () =>
      e.parentNode.removeChild(e),
    );
    button.classList.add('remove');
    // FIXME why the button is not really added?
    console.log('prepend on', e);
    e.prepend(button);
    markCore(e, n);
  });
  // console.log('marked root:', root);
}

function mark(root: Element = document.body, n?: number) {
  markCore();
  addMarkButton();
  const style = document.createElement('style');
  style.innerHTML = `
body {
  padding: 2em;
  margin: auto;
  max-width: 40em;
}
img {
  max-width: 100%;
}
`;
  root.appendChild(style);

  /*
  return;

  let xs: Array<[Element, number]> = [];
  let es = root.children;
  for (let i = 0; i < es.length; i++) {
    let e = es.item(i);
    xs[i] = [e, e.textContent.length];
  }
  if (xs.some(([e, x]) => x / n >= 0.8)) {
    if (xs.length === 1) {
      let [e, x] = xs[0];
      console.log('deep into', e);
      return mark(e, n);
    }
    console.log('has match', {len: xs.length});
    xs.forEach(([e, x]) => {
      if (x / n < 0.8) {
        console.log('remove', e);
        e.remove();
        return addMarkButton();
      }
      console.log('keep', e, formatPercent(x, n));
      mark(e, n);
      return addMarkButton();
    })
  } else {
    console.log('no match');
    xs.forEach(([e, x]) => {
      console.log(formatPercent(x, n), e);
      let button = createButton('remove ' + formatPercent(x, n), () => e.remove());
      button.classList.add('remove');
      e.prepend(button);
    });
    xs.forEach(([e, x]) => {
      if (x / n < 0.2) {
        console.log('remove', e, formatPercent(x, n));
        e.remove();
      }
    })
  }
  addMarkButton();
  */
}

Object.assign(window, { mark });

addMarkButton();
mark(document.body);
