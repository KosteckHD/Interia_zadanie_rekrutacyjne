import type { ChangeEvent } from 'react'
import type { Level } from '../../logic/board'
import './GameControls.scss'

type GameControlsProps = {
  levels: Level[]
  selectedLevelId: string
  onLevelChange: (levelId: string) => void
  onRestart: () => void
}

export function GameControls({
  levels,
  selectedLevelId,
  onLevelChange,
  onRestart,
}: GameControlsProps) {
  const handleLevelChange = (event: ChangeEvent<HTMLSelectElement>) => {
    onLevelChange(event.target.value)
  }

  return (
    <div className="game-controls">
      <label className="game-controls__field">
        <span className="game-controls__label">WYBIERZ PLANSZĘ</span>
        <select
          className="game-controls__select"
          disabled={levels.length === 0}
          value={selectedLevelId}
          onChange={handleLevelChange}
        >
          {levels.length === 0 ? <option value="">Brak plansz</option> : null}
          {levels.map((level) => (
            <option key={level.id} value={level.id}>
              {level.name}
            </option>
          ))}
        </select>
      </label>
      <button className="game-controls__restart" type="button" onClick={onRestart}>
        <span aria-hidden="true" className="game-controls__restart-mark">&#8635;</span>
        Zrestartuj grę
      </button>
    </div>
  )
}
