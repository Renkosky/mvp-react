import React from "./core/React.js";

function CounterContain(){
  
  return   <div>
    CounterContain
    <Counter num={10}></Counter>
    <Counter num={20}></Counter>
  </div>
}

function Counter({num}){
  return <div>counter:{num}</div>
}
const App = <div>hi! react

<CounterContain />
</div>

export default App