import { TodoCard } from "./TodoCard";

export function TodoList(props) {
    // deconstructing the attribute property into 'todos' 
    const { todos, selectedTab } = props

    
    const filteredTodosList = selectedTab === 'All' ? // assigns ALL of the todos to the filtered todo list
        todos : // elif val.complete === True then filter out all incompletes
        selectedTab === 'Completed' ?
            todos.filter(val => val.complete) :     // filter = completed (done)
            todos.filter(val => !val.complete)      // filter != completed (undone)


    return (
        <>
            {filteredTodosList.map((todo, todoIndex) => {
                return (
                    <TodoCard
                        key={todoIndex} // keys can not be destructured
                        todoIndex={todos.findIndex(val => val.input == todo.input)}
                        {...props}
                        todo={todo}/>
                )
            })}
        </>
    )
}