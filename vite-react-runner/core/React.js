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
  console.log(container, "container", component, "component");
  nextWorkOfUnit = {
    dom: container,
    props: {
      children: [component],
    },
  };
  requestIdleCallback(workerLoop);
}

let nextWorkOfUnit = null;

function workerLoop(deadLine) {
  //单位是微秒
  console.log(deadLine.timeRemaining());
  let shouldYeild = false;
  while (!shouldYeild) {
    // 一直执行，直到时间不够
    nextWorkOfUnit = performUnitOfWork(nextWorkOfUnit);
    shouldYeild = deadLine.timeRemaining() < 1;
  }
  requestIdleCallback(workerLoop);
}
/**
 *
 * @param {*} work
 * @returns
 */
function performUnitOfWork(work) {
  // TODO
  // 1. add dom
  if (work?.dom) {
    console.log(work, "work");
    const dom =
      work.type === "TEXT_ELEMENT"
        ? document.createTextNode("")
        : document.createElement(work.type);
    work.dom = dom;
    work.parent?.dom?.appendChild(dom);
    // 2. props
    Object.keys(work.props)
      .filter((key) => key !== "children")
      .forEach((name) => {
        dom[name] = work.props[name];
      });
    // 3. create new fiber 转换链表设置指针
    const children = work.props.children;
    let prevSibling = null;
    children.forEach((child, index) => {
      const newFiber = {
        type: child.type,
        props: child.props,
        dom: null,
        parent: work,
        sibling: null,
        child: null,
      };
      if (index === 0) {
        work.child = newFiber;
      } else {
        prevSibling.sibling = newFiber;
      }
      prevSibling = newFiber;
    });
    // 4. return next unit of work 返回下一个要执行的任务
    if (work.child) {
      return work.child;
    }
    if (work.sibling) {
      return work.sibling;
    }
    return work.parent?.sibling;
  }
}

const React = {
  createElement,
  render,
};

export default React;
