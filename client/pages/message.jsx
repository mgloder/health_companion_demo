import { Link } from 'react-router-dom'

export default function Message() {
  return (
    <>
      <h1 className="text-6xl">Message</h1>
      <p>
        <Link to="/">Go back to the AI Health</Link>
      </p>
    </>
  )
}
