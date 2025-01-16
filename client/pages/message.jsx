import { Link } from 'react-router-dom'
import { ChevronLeft, X } from 'react-feather'
import marryProfile from '../assets/marry-profile.svg'

export default function Message() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-gray-600">
            <ChevronLeft size={24} />
          </Link>
          <h1 className="text-xl font-medium">SisChat</h1>
        </div>
        <img 
          src={marryProfile} 
          alt="Profile" 
          className="w-8 h-8 rounded-full"
        />
      </div>

      {/* Check in Notes Card */}
      <div className="p-4">
        <div className="bg-white rounded-2xl p-6 relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="text-blue-500">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-4-8V8l6 3-6 3z" fill="currentColor"/>
              </svg>
            </div>
            <h2 className="text-xl text-blue-900">Check in Notes</h2>
            <button className="absolute right-4 top-4 bg-blue-100 rounded-full p-2">
              <X size={20} className="text-blue-500" />
            </button>
          </div>

          <div className="space-y-4 text-blue-900">
            <p>I spoke with Marry today. She is doing very well,exceeding her exercise goals and staying healthy overall! 💪</p>
            <p>We will continue to focus on her goal to achieve a healthier lifestyle in 6 months.</p>
            <p>🎯 I am super excited for Marry and she has been an inspiration!😆</p>
          </div>

          {/* Goals Section */}
          <div className="mt-6 space-y-4">
            <div className="flex gap-2">
              <span className="bg-black text-[#D1FD57] px-3 py-1 rounded-full text-sm">Goal</span>
              <span className="text-blue-900">Lose 5 kg in 2025</span>
            </div>

            <div className="flex gap-2">
              <span className="bg-black text-[#D1FD57] px-3 py-1 rounded-full text-sm">Weekly Plan</span>
            </div>

            {/* Exercise Plans */}
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-white rounded-xl p-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="bg-black p-2 rounded-full">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#D1FD57">
                      <path d="M20 8V7c0-1.1-.9-2-2-2h-3c0-1.7-1.3-3-3-3S9 3.3 9 5H6c-1.1 0-2 .9-2 2v1c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-8c0-1.1-.9-2-2-2zm-8-3c.6 0 1 .4 1 1s-.4 1-1 1-1-.4-1-1 .4-1 1-1z"/>
                    </svg>
                  </span>
                  <span>High intensity exercise</span>
                </div>
                <span className="text-blue-500">120<span className="text-sm ml-1">min</span></span>
              </div>

              <div className="flex gap-4">
                <div className="flex-1 flex items-center justify-between bg-white rounded-xl p-3 shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="text-blue-500">🎾</span>
                    <span>Tennis</span>
                  </div>
                  <span className="text-blue-500">90<span className="text-sm ml-1">min</span></span>
                </div>

                <div className="flex-1 flex items-center justify-between bg-white rounded-xl p-3 shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="text-blue-500">🏃‍♂️</span>
                    <span>Jogging</span>
                  </div>
                  <span className="text-blue-500">30<span className="text-sm ml-1">min</span></span>
                </div>
              </div>

              <div className="flex items-center justify-between bg-white rounded-xl p-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="bg-black p-2 rounded-full">🧘‍♀️</span>
                  <span>Meditation</span>
                </div>
                <span className="text-blue-500">30<span className="text-sm ml-1">min per day</span></span>
              </div>

              <div className="flex items-center justify-between bg-white rounded-xl p-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="bg-black p-2 rounded-full">🌙</span>
                  <span>Sleep</span>
                </div>
                <span className="text-blue-500">7<span className="text-sm ml-1">hours per day</span></span>
              </div>

              <div className="flex items-center justify-between bg-white rounded-xl p-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="bg-black p-2 rounded-full">🍳</span>
                  <span>Home cooked meals</span>
                </div>
                <span className="text-blue-500">3<span className="text-sm ml-1">times</span></span>
              </div>
            </div>
          </div>

          {/* Start Button */}
          <button className="w-full bg-blue-500 text-white rounded-full py-3 mt-6">
            Start !
          </button>
        </div>
      </div>

      {/* Input Box */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
        <div className="flex items-center gap-4">
          <button className="text-blue-500">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.418 0-8-3.582-8-8s3.582-8 8-8 8 3.582 8 8-3.582 8-8 8z"/>
              <path d="M13 7h-2v5H6v2h5v5h2v-5h5v-2h-5V7z"/>
            </svg>
          </button>
          <input 
            type="text" 
            placeholder="Ask me anything ..." 
            className="flex-1 bg-gray-100 rounded-full px-4 py-2 focus:outline-none"
          />
          <button>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#999">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-5-7l-3 3.72L9 13l-3 4h12l-4-5z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
