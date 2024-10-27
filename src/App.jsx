
import { Header } from "./components/Header"
import { Tabs } from "./components/Tabs"
import { TodoInput } from "./components/TodoInput"
import { TodoList } from "./components/TodoList"

import { useState, useEffect } from 'react'



function App() {
  // const todos = [
  //   { input: 'Hello! Add your first todo!', complete: true },
  //   { input: 'Get the groceries!', complete: false },
  //   { input: 'Learn how to web design', complete: false },
  //   { input: 'Say hi to gran gran', complete: true },
  // ]
  // [array, setterFunciton] = useState([]) // can be left empty but we set an empty list
  const [todos, setTodos] = useState([
    { input: 'Hello! Add your first todo!', complete: true }
  ])
  //  [statefulVariable, setterFunction] the later is used to update or modify the value associated
  //  = useState destructures the array
  const [selectedTab, setSelectedTab] = useState('Open')




  function handleAddTodo(newTodo) {
    const newTodoList = [...todos, { input: newTodo, complete: false }]
    setTodos(newTodoList)
    handleSaveData(newTodoList)

  }

  function handleCompleteTodo(index) {
    // update/edit/modify
    let newTodoList = [...todos] //duplciate of todos
    let completedTodo = todos[index] //accesing the specific todo we are completing
    completedTodo['complete'] = true //modify status
    newTodoList[index] = completedTodo // updated entry
    setTodos(newTodoList) // overrided state to match the new list
    handleSaveData(newTodoList)
  }

  function handleDeleteTodo(index) {
    let newTodoList = todos.filter((val, valIndex) => {
      return valIndex !== index
    })
    setTodos(newTodoList)
    handleSaveData(newTodoList)
  }

  function handleSaveData(currTodos) {
    localStorage.setItem('todo-app', JSON.stringify({ todos: currTodos })) // key todos, value of todo-list
  }

  // 1. Invoke the useEffect Hook, preferably right above the JSX.
  // 2. It takes 2 args; Arrow Func + Dependency Arr
  // 3. The Dependy Arr's contents determines when the useEffect Logic gets called, and then the prior function gets executed; [] = run as soon as page is available; a.k.a the on mount event
  // 4. if local storage != avail then exit; guard clause
  // 5. .getItem(key) is a method and the parenthesis hold the label of the data we want to fetch; in json we just give it the key
  // 6. now you also have to define a function in order to save todos to the database; see function HandleSaveData() {}; just above

  useEffect(() => {
    if (!localStorage || !localStorage.getItem('todo-app')) { return }
    // console.log('here')
    let db = JSON.parse(localStorage.getItem('todo-app'))
    setTodos(db.todos)
  }, [])






  return (
    <>
      {/* label = property */}
      {/* we can give the tags 'an attribute' propterty */}
      {/* this means that we need to tell the child component to expect it */}
      <Header todos={todos} />
      <Tabs selectedTab={selectedTab} setSelectedTab={setSelectedTab} todos={todos} />
      <TodoList handleCompleteTodo={handleCompleteTodo} handleDeleteTodo={handleDeleteTodo} selectedTab={selectedTab} todos={todos} />
      <TodoInput handleAddTodo={handleAddTodo} />
    </>
  )
}

export default App