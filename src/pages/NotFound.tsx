import { Link, useLocation } from 'react-router-dom'

export default function NotFound() {
  const { pathname } = useLocation()
  return (
    <div className="pt-16 text-[13.5px]">
      <div className="text-muted">
        <span className="text-green">$</span> cd {pathname}
      </div>
      <div className="mt-2 text-red">bash: cd: {pathname}: No such file or directory</div>
      <Link to="/" className="mt-6 inline-block text-blue hover:underline">
        cd ~
      </Link>
    </div>
  )
}
