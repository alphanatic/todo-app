export function TodoCard(props) {
    const { todo, handleDeleteTodo, todoIndex, handleCompleteTodo } = props

    console.log(handleDeleteTodo)

    return (
        <div className="card todo-item">
            <p>{todo.input}</p>
            <button onClick={() => {handleCompleteTodo(todoIndex)}} disabled={todo.complete}>
                <h6>Done</h6>
            </button>
            <button onClick={() => {
                handleDeleteTodo(todoIndex)
            }}>
                <h6>Delete</h6>
            </button>
        </div>
    )
}