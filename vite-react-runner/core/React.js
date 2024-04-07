//@ts-ignore
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
      children: children.map((child) => {
        const isTextNode =
          typeof child === "string" || typeof child === "number";
        return isTextNode ? createTextNode(child) : child;
      }),
    },
  };
}

function render(component, container) {
  // create dom
  console.log(container, "container", component, "component");
  nextWorkOfUnit = {
    dom: container,
    props: {
      children: [component],
    },
  };
  root = nextWorkOfUnit;
}
let root = null;
let nextWorkOfUnit = null;

function workerLoop(deadLine) {
  let shouldYeild = false;
  while (!shouldYeild && nextWorkOfUnit) {
    // 一直执行，直到时间不够
    nextWorkOfUnit = performUnitOfWork(nextWorkOfUnit);
    //单位是微秒
    shouldYeild = deadLine.timeRemaining() < 1;
  }
  if (root && !nextWorkOfUnit) {
    commitRoot();
  }
  requestIdleCallback(workerLoop);
}

function createDom(type) {
  return type === "TEXT_ELEMENT"
    ? document.createTextNode("")
    : document.createElement(type);
}

function updateProps(dom, props) {
  Object.keys(props)
    .filter((key) => key !== "children")
    .forEach((name) => {
      dom[name] = props[name];
    });
}

function initChildren(fiber, children) {
  // 3. create new fiber 转换链表设置指针

  let prevSibling = null;
  children.forEach((child, index) => {
    const newFiber = {
      type: child.type,
      props: child.props,
      dom: null,
      parent: fiber,
      sibling: null,
      child: null,
    };
    if (index === 0) {
      fiber.child = newFiber;
    } else {
      prevSibling.sibling = newFiber;
    }
    prevSibling = newFiber;
  });
}

function updateFunctionComponent(fiber) {
  const chilidren = [fiber.type(fiber.props)];
  initChildren(fiber, chilidren);
}

function updateHostComponent(fiber) {
  const children = fiber.props.children;
  if (!fiber?.dom) {
    console.log(fiber, "fiber");
    const dom = createDom(fiber.type);
    fiber.dom = dom;
    // fiber.parent?.dom?.appendChild(dom);
    // 2. add props
    updateProps(dom, fiber.props);
  }

  initChildren(fiber, children);
}

/**
 *
 * @param {*} work
 * @returns
 */
function performUnitOfWork(fiber) {
  // TODO
  // 1. add dom
  const isFunctionComponent = fiber.type instanceof Function;
  if (isFunctionComponent) {
    updateFunctionComponent(fiber);
  } else {
    updateHostComponent(fiber);
  }
  if (fiber.child) {
    return fiber.child;
  }
  let nextfiber = fiber;
  while (nextfiber) {
    if (nextfiber.sibling) {
      return nextfiber.sibling;
    }
    nextfiber = nextfiber.parent;
  }
  // return fiber.parent?.sibling;
}

function commitRoot() {
  // 统一最后提交
  commitWorker(root.child);
  root = null;
}

function commitWorker(fiber) {
  if (!fiber) return;
  let fiberParentDom = findParentDom(fiber);
  fiber.dom && fiberParentDom.appendChild(fiber.dom);
  commitWorker(fiber.child);
  commitWorker(fiber.sibling);
}

function findParentDom(fiber) {
  let parent = fiber.parent;
  while (!parent.dom) {
    parent = parent.parent;
  }
  return parent.dom;
}

requestIdleCallback(workerLoop);

const React = {
  createElement,
  render,
};

export default React;
