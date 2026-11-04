export function Footer(props) {
    const { page } = props
    // each link is an object; .map() below turns them into <li> elements, like the tabs in Tabs.jsx
    const links = [
        { label: 'Home', href: '#' },
        { label: 'Backlog', href: '#backlog' },
        { label: 'Tutorial', href: 'https://github.com/jamezmca/todo-app-rfc' },
        { label: 'GitHub', href: 'https://github.com/alphanatic' },
    ]

    // Home is current for any hash that isn't another page
    function isCurrent(href, page) {
        if (href === '#') { return page !== '#backlog' }
        return href === page
    }

    return (
        <footer className="main-footer">
            <nav>
                <ul>
                    {links.map((link) => {
                        const isExternal = link.href.startsWith('http')
                        return (
                            <li key={link.label}>
                                <a
                                    className="main-footer-btn"
                                    href={link.href}
                                    aria-current={isCurrent(link.href, page) ? 'page' : undefined}
                                    target={isExternal ? '_blank' : undefined}
                                    rel={isExternal ? 'noreferrer' : undefined}>
                                    {link.label}
                                </a>
                            </li>
                        )
                    })}
                </ul>
            </nav>
        </footer>
    )
}
