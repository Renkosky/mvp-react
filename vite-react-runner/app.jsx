import React from "./core/React.js";

let count = 10
let props = {id:'111'}
let showBar = false
let countBar = 10
function CounterContain(){

  const changeShowBar = ()=>{
    const update = React.update
    showBar = !showBar
    update()
  }    

  return <div {...props}>
    CounterContain
    <Foo/>
    <Bar/>
    {/* <Counter num={20}></Counter>
    <button onClick={changeShowBar}>changeShowBar</button>
    {showBar ? <div>showBar</div> : <Foo/>}
    {showBar &&  bar} */}
  </div>
}

function Counter({num}){
  const handleClick = ()=>{
    const update = React.update
    console.log('click')
    count++
    props = []
    update()
  }
  return <button onClick={handleClick}>counter:{num}</button>
}

function Foo(){
  const update = React.update()

  function handleClick(){
    count++
    update()
  }


  return <div>
  <button onClick={handleClick}>Foo: {count}</button>
</div>
}

function Bar(){
  const update = React.update()

  function handleClick(){
    countBar++
    update()
  }
  console.log(countBar,'countBar');
  return <div>
    <button onClick={handleClick}>Bar: {countBar}</button>
  </div>
}
const App = <div>hi! react

<CounterContain />
</div>

export default App