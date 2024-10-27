import { useState } from 'react'

export function TodoInput(props) {
    const { handleAddTodo } = props
    const [inputValue, setInputValue] = useState('')
    console.log(inputValue)
    return (
        <div className="input-container">
            <input value={inputValue} onChange={(e) => { setInputValue(e.target.value) }} placeholder="Add task" />
            <button onClick={() => {
                if(!inputValue) { return }
                handleAddTodo(inputValue)
                setInputValue('') // sets it back to blank when executed
            }}>
                <i className="fa-solid fa-plus"></i>
            </button>
        </div>
    )
}

// input = dynamic i.e. statefull value