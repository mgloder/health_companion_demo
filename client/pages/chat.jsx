import { Link } from 'react-router-dom'

export default function Chat() {
  return (
    <>
      <h1 className="text-6xl">Chat</h1>
      <p>
        <Link to="/">Go back to the AI Health</Link>
      </p>
    </>
  )
}
