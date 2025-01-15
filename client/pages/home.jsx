import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <>
      <p>This route is rendered for Homepage</p>
      <p>
        <Link to="/">Go back to the AI Health</Link>
      </p>
      <div className="flex -space-x-1 overflow-hidden">
        <img className="inline-block size-6 rounded-full ring-2 ring-white"
             src="https://images.unsplash.com/photo-1491528323818-fdd1faba62cc?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
             alt="" />
      </div>
    </>
  )
}
