function createTextNode(text) {
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: text,
      children: [],
    },
  };
}

function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) =>
        typeof child === "object" ? child : createTextNode(child)
      ),
    },
  };
}

function render(component, container) {
  // create dom
  const dom =
    component.type === "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(component.type);
  // add props
  Object.keys(component.props)
    .filter((key) => key !== "children")
    .forEach((name) => {
      dom[name] = component.props[name];
    });

  // render children
  component.props.children.forEach((child) => {
    this.render(child, dom);
  });
  // append to container
  container.appendChild(dom);
}

const React = {
  createElement,
  render,
};
export default React;
