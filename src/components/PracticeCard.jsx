import SlokaDisplay from './SlokaDisplay'
import Player from './Player'
import { SHOW_LANGUAGES } from '../config'

// Card 1 — the focused practice surface: verse text on top, player below, in a
// single card so the learner sees the words and the controls together.
const PracticeCard = (props) => {
  const { item, displayItem, language } = props
  // The card shows the whole selected range (displayItem); the player walks the
  // individual current item.
  const shown = displayItem || item
  return (
    <div className="bg-paper-card border border-paper-line rounded-2xl p-5 sm:p-7">
      {SHOW_LANGUAGES && shown && <SlokaDisplay item={shown} language={language} />}
      {item ? (
        <Player {...props} />
      ) : (
        <p className="text-center text-sm text-ink-500 py-10">
          Pick a verse to begin.
        </p>
      )}
    </div>
  )
}

export default PracticeCard
