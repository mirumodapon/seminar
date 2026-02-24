import { memo, useMemo } from 'react'
import { Link } from 'react-router'

interface NavItem {
  pageId: string
  title: string
}

interface Props {
  navItems: NavItem[]
}

function Navbar(props: Props) {
  const navItems = useMemo(() => props.navItems.map(item => ({
    label: item.title,
    to: item.pageId,
  })), [props.navItems])

  return (
    <nav>
      <ul>
        {navItems.map(item => (
          <li key={item.to}>
            <Link to={item.to}>{item.label}</Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default memo(Navbar)
