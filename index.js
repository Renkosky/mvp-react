import React from "./core/react.js";
import ReactDOM from "./core/ReactDOM.js";
const app = React.createElement(
  "div",
  { id: "app" },
  "Hello World from My React"
);
ReactDOM.createRoot(document.querySelector("#root")).render(app);
