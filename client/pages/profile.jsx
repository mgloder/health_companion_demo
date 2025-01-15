import { Link } from 'react-router-dom'

export default function Profile() {
  return (
    <>
      <h1 className="text-6xl">Profile</h1>
      <p>
        <Link to="/">Go back to the AI Health</Link>
      </p>
    </>
  )
}
