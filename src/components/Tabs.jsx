export function Tabs(props) {
    const { todos, selectedTab, setSelectedTab } = props // deconstructing the attribute property into 'todos'

    const tabs = ['All', 'Open', 'Completed']
    return (
        <nav className="tab-container">
            {/* (value, key) */}
            {/* (var, index) */}
            {tabs.map((tab, tabIndex) => {
                // === operator compares two operands returning a bool
                // ? if     : otherwise

                // ? the logic is if tab === 'All' return all
                // : otherwise filter out incompletes
                // : otherwise filter out complets

                const numOfTasks = tab === 'All' ? // is comparing two operands
                    todos.length :
                    tab === 'Open' ?
                        todos.filter(val => !val.complete).length :
                        todos.filter(val => val.complete).length

                return (
                    <button
                        onClick={() => { setSelectedTab(tab) }}
                        key={tabIndex}
                        className={"tab-button " + (tab === selectedTab ? ' tab-selected' : ' ')}>
                        <h4>{tab} <span>({numOfTasks})</span></h4>
                    </button>
                )
            })}
            {/* horizontal */}
            <hr />
        </nav>
    )
}