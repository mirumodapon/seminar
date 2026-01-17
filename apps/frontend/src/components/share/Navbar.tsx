import { NavLink } from 'react-router'

interface Props {
  links: { label: string, path: string }[]
}

function Navbar({ links }: Props) {
  return (
    <nav className="w-screen bg-blue-500">
      <ul className="w-100 flex justify-center gap-3">
        {links.map(link => (
          <li className="p-3" key={link.path}>
            <NavLink to={link.path}>{link.label}</NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default Navbar
