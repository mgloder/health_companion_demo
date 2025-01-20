export default function ExercisePanel() {
  return (
    <>
      <div className="flex items-center justify-between bg-white rounded-xl p-3 shadow-sm">
        <div className="flex items-center gap-3">
                  <span className="bg-black p-2 rounded-full">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#D1FD57">
                      <path
                        d="M20 8V7c0-1.1-.9-2-2-2h-3c0-1.7-1.3-3-3-3S9 3.3 9 5H6c-1.1 0-2 .9-2 2v1c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-8c0-1.1-.9-2-2-2zm-8-3c.6 0 1 .4 1 1s-.4 1-1 1-1-.4-1-1 .4-1 1-1z" />
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
    </>
  );
}
