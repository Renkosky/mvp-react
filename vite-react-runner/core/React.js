//@ts-ignore
let workInProgressRoot = null;
let currentRoot = null;
let nextWorkOfUnit = null;
let deletions = [];
let wipFiber = null;
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
  workInProgressRoot = {
    dom: container,
    props: {
      children: [component],
    },
  };
  nextWorkOfUnit = workInProgressRoot;
}

function workerLoop(deadLine) {
  let shouldYeild = false;
  while (!shouldYeild && nextWorkOfUnit) {
    // 一直执行，直到时间不够
    nextWorkOfUnit = performUnitOfWork(nextWorkOfUnit);

    // 如果是同一个节点，直接跳过
    if (workInProgressRoot?.sibling?.type === nextWorkOfUnit?.type) {
      nextWorkOfUnit = undefined;
    }

    //单位是微秒
    shouldYeild = deadLine.timeRemaining() < 1;
  }
  if (workInProgressRoot && !nextWorkOfUnit) {
    commitRoot();
  }
  requestIdleCallback(workerLoop);
}

function createDom(type) {
  return type === "TEXT_ELEMENT"
    ? document.createTextNode("")
    : document.createElement(type);
}

function updateProps(dom, nextprops, preProps) {
  // 1. old 有属性 new没有需要删除
  Object.keys(preProps).forEach((name) => {
    if (name !== "children" && !nextprops.hasOwnProperty(name)) {
      dom.removeAttribute(name);
    }
  });
  // 2. new 有属性 old没有需要添加
  // 3. old new 都有属性，需要更新
  Object.keys(nextprops).forEach((name) => {
    if (name !== "children") {
      if (nextprops[name] !== preProps[name]) {
        if (name.startsWith("on")) {
          const eventName = name.slice(2)?.toLowerCase();
          dom.removeEventListener(eventName, preProps[name]);
          dom.addEventListener(eventName, nextprops[name]);
        } else {
          dom[name] = nextprops[name];
        }
      }
    }
  });
}

function reconcileChildren(fiber, children) {
  // 3. create new fiber 转换链表设置指针
  let oldFiber = fiber.alternate?.child;
  let prevSibling = null;
  let newFiber = null;
  children.forEach((child, index) => {
    const isSameType = child && oldFiber && child.type === oldFiber.type;
    if (isSameType) {
      // update
      newFiber = {
        type: child.type,
        props: child.props,
        dom: oldFiber.dom,
        parent: fiber,
        sibling: null,
        child: null,
        effectTag: "UPDATE",
        alternate: oldFiber,
      };
    } else {
      if (!child) return;
      newFiber = {
        type: child.type,
        props: child.props,
        dom: null,
        parent: fiber,
        sibling: null,
        child: null,
        effectTag: "PLACEMENT",
      };
      if (oldFiber) {
        deletions.push(oldFiber);
      }
    }

    if (oldFiber) {
      // 移动指针
      oldFiber = oldFiber.sibling;
    }

    if (index === 0) {
      // 设置子节点
      fiber.child = newFiber;
    } else {
      // 设置兄弟节点
      prevSibling.sibling = newFiber;
    }
    // 设置上一个节点
    if (newFiber) {
      prevSibling = newFiber;
    }
  });
  while (oldFiber) {
    deletions.push(oldFiber);

    oldFiber = oldFiber.sibling;
  }
}

function updateFunctionComponent(fiber) {
  wipFiber = fiber;
  const chilidren = [fiber.type(fiber.props)];
  reconcileChildren(fiber, chilidren);
}

function updateHostComponent(fiber) {
  const children = fiber.props.children;
  if (!fiber?.dom) {
    const dom = createDom(fiber.type);
    fiber.dom = dom;
    // fiber.parent?.dom?.appendChild(dom);
    // 2. add props
    updateProps(dom, fiber.props, {});
  }

  reconcileChildren(fiber, children);
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
  deletions.forEach(commitDeletion);
  commitWork(workInProgressRoot.child);
  currentRoot = workInProgressRoot;
  workInProgressRoot = null;
  deletions = [];
}

// 递归提交
function commitWork(fiber) {
  if (!fiber) return;
  let fiberParentDom = findParentDom(fiber);
  if (fiber.dom) {
    if (fiber.effectTag === "UPDATE") {
      updateProps(fiber.dom, fiber.props, fiber.alternate?.props);
    } else if (fiber.effectTag === "PLACEMENT") {
      fiberParentDom.appendChild(fiber.dom);
    }
  }

  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

function commitDeletion(fiber) {
  if (fiber?.dom) {
    let fiberParent = findParentDom(fiber);
    console.log(fiber.dom, "fiber.dom");
    console.log(fiberParent, "fiberParent");
    fiberParent.removeChild(fiber.dom);
  } else {
    commitDeletion(fiber.child);
  }
}

function findParentDom(fiber) {
  let parent = fiber.parent;
  while (!parent.dom) {
    parent = parent.parent;
  }
  return parent.dom;
}

function update() {
  // create dom
  // console.log(container, "container", component, "component");
  let currentFiber = wipFiber;
  return () => {
    workInProgressRoot = {
      ...currentFiber,
      alternate: currentFiber,
    };
    nextWorkOfUnit = workInProgressRoot;
  };
}

requestIdleCallback(workerLoop);

const React = {
  createElement,
  render,
  update,
};

export default React;
