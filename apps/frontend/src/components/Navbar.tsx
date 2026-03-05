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
    <nav className="w-full bg-[#2B64A6] text-white font-bold">
      <ul className="flex flex-wrap">
        {navItems.map(item => (
          <li className="grow min-w-25" key={item.to}>
            <Link className="block w-full text-center py-3" to={item.to}>{item.label}</Link>
          </li>
        ))}

        <li className="grow min-w-25">
          <Link className="block w-full text-center py-3" to="apply">我要投稿</Link>
        </li>
      </ul>
    </nav>
  )
}

export default memo(Navbar)
