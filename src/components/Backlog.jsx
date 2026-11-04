import { useState } from 'react'
import { backlog } from '../backlog'
import '../backlog.css'

const tiers = [
    { id: 'critical', label: 'Critical' },
    { id: 'important', label: 'Important' },
    { id: 'less', label: 'Less critical' },
]
const kinds = { bug: 'Bug', habit: 'Habit', feature: 'Feature', cleanup: 'Cleanup' }
const tierLabels = { critical: 'Critical', important: 'Important', less: 'Less critical' }

// Turns 'use `trim()` here' into ['use ', <code>trim()</code>, ' here']
function withCode(text) {
    return text.split('`').map((part, i) => i % 2 === 1 ? <code key={i}>{part}</code> : part)
}

function StatusChip(props) {
    const { item } = props
    if (item.status === 'done') {
        return <span className="chip done" title={item.doneAt}>Done</span>
    }
    return <span className="chip open">Open</span>
}

// Difficulty as a three-dot meter, so it never reads as a rank chip
const grades = { easy: 1, medium: 2, hard: 3 }

function Grade(props) {
    const { grade } = props
    const filled = grades[grade]
    return (
        <span className={'grade ' + grade} title={'Difficulty: ' + grade}>
            {[1, 2, 3].map(dot => <span key={dot} className={dot <= filled ? 'dot on' : 'dot'}></span>)}
            {grade}
        </span>
    )
}

function scrollToItem(e, id) {
    e.preventDefault() // a #hash link would switch pages, so scroll instead
    document.getElementById(id).scrollIntoView({ behavior: 'smooth' })
}

function BacklogItem(props) {
    const { item, rank } = props
    return (
        <article className={'item ' + item.tier} id={item.id}>
            <header>
                <h3><span className="n">{rank}</span>{item.title}</h3>
                <span className={'chip ' + item.tier}>{tierLabels[item.tier]}</span>
                <StatusChip item={item} />
                <span className="kind">{kinds[item.kind]}</span>
                <Grade grade={item.grade} />
            </header>
            <div className="both">
                <div className="box why">
                    <span className="label">Why it matters</span>
                    {item.why.map((paragraph, i) => <p key={i}>{withCode(paragraph)}</p>)}
                </div>
                <div className="box task">
                    <span className="label">Your task</span>
                    <dl>
                        <dt>Files</dt>
                        <dd>{item.files.map((file, i) => <div key={i}>{withCode(file)}</div>)}</dd>
                        <dt>Do</dt><dd>{withCode(item.task)}</dd>
                        <dt>Learn</dt><dd>{withCode(item.concept)}</dd>
                        {item.tryIt && <><dt>Try it</dt><dd>{withCode(item.tryIt)}</dd></>}
                        {item.hint && (
                            <><dt>Hint</dt><dd><details><summary>Show hint</summary>{withCode(item.hint)}</details></dd></>
                        )}
                        <dt>Done when</dt><dd>{withCode(item.doneWhen)}</dd>
                        {item.dependsOn && <><dt>Depends on</dt><dd>{withCode(item.dependsOn)}</dd></>}
                    </dl>
                </div>
            </div>
        </article>
    )
}

export function Backlog() {
    const [shownKind, setShownKind] = useState('all')

    // rank = position in the full list, so numbers stay the same when filtering
    const ranked = backlog.map((item, i) => ({ item, rank: i + 1 }))
    const shown = shownKind === 'all' ? ranked : ranked.filter(entry => entry.item.kind === shownKind)
    const doneCount = backlog.filter(item => item.status === 'done').length

    return (
        <div className="backlog">
            <section className="hero">
                <span className="eyebrow">Todo app · Backlog · 2026-10-13</span>
                <h1><span className="w1">JavaScript</span> <span className="w2">Practice</span> <span className="w3">Backlog</span></h1>
                <p className="sub">{doneCount} of {backlog.length} done</p>
                <p>Fixes from the code review, ranked from most to least critical. Each one is yours to write: the box on the left explains the problem, the box on the right is the task.</p>
            </section>

            <div className="callout">
                <b>How to work this list</b>
                <ol>
                    <li>Work in rank order, and check <b>Depends on</b> before starting an item.</li>
                    <li>Write the fix yourself. Open the hint only when you are stuck, and run <b>Try it</b> in the browser console before you start.</li>
                    <li>Check the <b>Done when</b> line, then get your change reviewed.</li>
                    <li>When it passes, its status becomes Done with the date and time (in <code>src/backlog.js</code>).</li>
                </ol>
            </div>

            <div className="filter">
                Show:
                {['all', ...Object.keys(kinds)].map(kind => (
                    <button key={kind} aria-pressed={shownKind === kind} onClick={() => setShownKind(kind)}>
                        {kind === 'all' ? 'All' : kinds[kind]}
                    </button>
                ))}
            </div>

            <h2 className="important">Overview</h2>
            <div className="scroll">
                <table>
                    <thead>
                        <tr><th>#</th><th>Item</th><th>Rank</th><th>Kind</th><th>Status</th><th>Grade</th></tr>
                    </thead>
                    <tbody>
                        {shown.map(({ item, rank }) => (
                            <tr key={item.id}>
                                <td>{rank}</td>
                                <td><a href={'#' + item.id} onClick={(e) => scrollToItem(e, item.id)}>{item.title}</a></td>
                                <td><span className={'chip ' + item.tier}>{tierLabels[item.tier]}</span></td>
                                <td><span className="kind">{kinds[item.kind]}</span></td>
                                <td><StatusChip item={item} /></td>
                                <td><Grade grade={item.grade} /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {tiers.map(tier => {
                const inTier = shown.filter(entry => entry.item.tier === tier.id)
                if (inTier.length === 0) { return null }
                return (
                    <section key={tier.id}>
                        <h2 className={tier.id}>{tier.label}</h2>
                        {inTier.map(({ item, rank }) => <BacklogItem key={item.id} item={item} rank={rank} />)}
                    </section>
                )
            })}
        </div>
    )
}
