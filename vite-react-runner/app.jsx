import React from "./core/React.js";

let count = 10
let props = {id:'111'}
function CounterContain(){
    
  return   <div {...props}>
    CounterContain
    <Counter num={count}></Counter>
    <Counter num={20}></Counter>
  </div>
}

function Counter({num}){
  const handleClick = ()=>{
    console.log('click')
    count++
    props = []
    React.update()
    }
  return <div onClick={handleClick}>counter:{num}</div>
}
const App = <div>hi! react

<CounterContain />
</div>

export default App