import { Check } from 'lucide-react'

const SlokaGrid = ({ slokas, currentIndex, completedSlokas, onSlokaSelect }) => {
  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-6 md:p-8">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">All Slokas</h3>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded"></div>
            <span className="text-gray-600">Current</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-gray-600">Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-200 rounded"></div>
            <span className="text-gray-600">Not Started</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Progress</span>
          <span className="font-bold">
            {completedSlokas.length} / {slokas.length} ({Math.round((completedSlokas.length / slokas.length) * 100)}%)
          </span>
        </div>
        <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-500"
            style={{ width: `${(completedSlokas.length / slokas.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2">
        {slokas.map((sloka, index) => {
          const isCompleted = completedSlokas.includes(sloka.id)
          const isCurrent = index === currentIndex

          return (
            <button
              key={sloka.id}
              onClick={() => onSlokaSelect(index)}
              className={`
                aspect-square rounded-lg font-bold text-sm relative
                transition-all transform hover:scale-110 hover:shadow-lg
                ${isCurrent 
                  ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg scale-110 ring-4 ring-purple-300' 
                  : isCompleted
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }
              `}
              title={`Sloka ${sloka.number}`}
            >
              {isCompleted && !isCurrent && (
                <Check className="w-3 h-3 absolute top-0.5 right-0.5" />
              )}
              {sloka.number}
            </button>
          )
        })}
      </div>

      {/* Section Legend */}
      <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl">
        <div className="text-xs text-gray-700 space-y-1">
          <div className="font-bold text-purple-800 mb-2">Sections:</div>
          <div className="grid grid-cols-2 gap-2">
            <div>📿 Dhyanam (Introduction)</div>
            <div>🙏 Main Sahasranamam</div>
            <div>🌟 Phala Sruti (Conclusion)</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SlokaGrid
