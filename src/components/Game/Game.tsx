import { useState } from 'react'
import { createBoard, revealCell, toggleFlag, type Board as BoardModel, type Level } from '../../logic/board'
import { Board } from '../Board/Board'
import { GameControls } from '../GameControls/GameControls'
import './Game.scss'

type GameProps = {
  levels: Level[]
  dataIssues: string[]
  loadError: string | null
  isLoading: boolean
}

function getStatusLabel(board: BoardModel | null, isLoading: boolean, loadError: string | null): string {
  if (loadError) {
    return 'BŁĄD WCZYTYWANIA'
  }

  if (isLoading) {
    return 'WCZYTYWANIE'
  }

  if (!board) {
    return 'BRAK PLANSZY'
  }

  if (board.state === 'won') {
    return 'WYGRANA'
  }

  if (board.state === 'lost') {
    return 'PRZEGRANA'
  }

  return board.state === 'idle' ? 'OCZEKUJE' : 'GRA W TOKU'
}

function getStatusModifier(board: BoardModel | null): string {
  if (!board) {
    return 'idle'
  }

  return board.state
}

export function Game({ levels, dataIssues, loadError, isLoading }: GameProps) {
  const [selectedLevelId, setSelectedLevelId] = useState('')
  const [board, setBoard] = useState<BoardModel | null>(null)
  const selectedLevel = levels.find((level) => level.id === selectedLevelId) ?? levels[0]
  const currentBoard = board ?? (selectedLevel ? createBoard(selectedLevel) : null)

  const handleLevelChange = (levelId: string) => {
    setSelectedLevelId(levelId)
    const nextLevel = levels.find((level) => level.id === levelId)
    setBoard(nextLevel ? createBoard(nextLevel) : null)
  }

  const handleRestart = () => {
    if (selectedLevel) {
      setBoard(createBoard(selectedLevel))
    }
  }

  const handleReveal = (index: number) => {
    setBoard((storedBoard) => {
      const boardToUpdate = storedBoard ?? (selectedLevel ? createBoard(selectedLevel) : null)
      return boardToUpdate ? revealCell(boardToUpdate, index) : null
    })
  }

  const handleToggleFlag = (index: number) => {
    setBoard((storedBoard) => {
      const boardToUpdate = storedBoard ?? (selectedLevel ? createBoard(selectedLevel) : null)
      return boardToUpdate ? toggleFlag(boardToUpdate, index) : null
    })
  }

  const remainingMines = currentBoard
    ? currentBoard.cells.filter((cell) => cell.mine).length - currentBoard.cells.filter((cell) => cell.flagged).length
    : 0

  return (
    <main className="game">
      <header className="game__topbar">
        <div className="game__brand">
          <span aria-hidden="true" className="game__brand-mark">&#10033;</span>
          <div>
            <p className="game__brand-name">Saper</p>
            <p className="game__brand-caption">PLANSZE Z PLIKU</p>
          </div>
        </div>
        <span className="game__brand-meta">LOGIKA / UI</span>
      </header>

      <section className="game__panel">
        <header className="game__header">
          <div>
            <p className="game__eyebrow">ZADANIE REKRUTACYJNE</p>
            <h1 className="game__title">Saper</h1>
            <p className="game__description">Odkrywaj bezpieczne pola i oznaczaj podejrzane miny.</p>
          </div>
        </header>

        <div className="game__telemetry">
          <div className="game__counter" aria-live="polite">
            <span aria-hidden="true" className="game__counter-icon">&#9873;</span>
            <div>
              <span className="game__counter-label">POZOSTAŁE MINY</span>
              <strong className="game__counter-value">{remainingMines}</strong>
            </div>
          </div>
          <p aria-live="polite" className={`game__status game__status--${getStatusModifier(currentBoard)}`}>
            {getStatusLabel(currentBoard, isLoading, loadError)}
          </p>
        </div>

        <GameControls
          levels={levels}
          selectedLevelId={selectedLevel?.id ?? ''}
          onLevelChange={handleLevelChange}
          onRestart={handleRestart}
        />
      </section>

      {dataIssues.length > 0 ? (
        <p className="game__notice" role="status">
          Pominięto {dataIssues.length} nieprawidłowych wpisów podczas wczytywania plansz.
        </p>
      ) : null}

      {currentBoard ? (
        <Board board={currentBoard} onReveal={handleReveal} onToggleFlag={handleToggleFlag} />
      ) : (
        <div className="game__empty">
          Dodaj <code>public/saper-plansze.json</code>, aby wczytać plansze.
        </div>
      )}

      <footer className="game__footer">
        Lewy przycisk myszy odkrywa pole <span aria-hidden="true">·</span> prawy przycisk ustawia lub usuwa flagę
      </footer>
    </main>
  )
}
