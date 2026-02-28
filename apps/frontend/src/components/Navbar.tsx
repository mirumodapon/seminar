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
    to: item.pageId === 'HOME' ? '' : item.pageId,
  })), [props.navItems])

  return (
    <nav className="w-full bg-blue-400">
      <ul className="flex">
        {navItems.map(item => (
          <li className="grow" key={item.to}>
            <Link className="block w-full text-center py-3" to={item.to}>{item.label}</Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default memo(Navbar)
