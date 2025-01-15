import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <>
      <h1 className="text-6xl">This route is rendered for Homepage</h1>
      <p>
        <Link to="/">Go back to the AI Health</Link>
      </p>
      <div className="flex -space-x-2 overflow-hidden">
        <Link to="/profile">
        <img className="inline-block size-10 rounded-full ring-2 ring-white"
             src="https://images.unsplash.com/photo-1491528323818-fdd1faba62cc?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
             alt="" />
        </Link>
      </div>
    </>
  )
}
