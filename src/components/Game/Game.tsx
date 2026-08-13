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
    return loadError
  }

  if (isLoading) {
    return 'Loading board data...'
  }

  if (!board) {
    return 'No playable board is available.'
  }

  if (board.state === 'won') {
    return 'You won!'
  }

  if (board.state === 'lost') {
    return 'Game over. Mines are shown.'
  }

  return board.state === 'idle' ? 'Choose a cell to start.' : 'Game in progress.'
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
      <header className="game__header">
        <div>
          <p className="game__eyebrow">Frontend recruitment task</p>
          <h1 className="game__title">Minesweeper</h1>
          <p className="game__description">Reveal safe cells, flag suspected mines, and clear the board.</p>
        </div>
        <div className="game__counter" aria-live="polite">
          <span className="game__counter-label">Mines left</span>
          <strong className="game__counter-value">{remainingMines}</strong>
        </div>
      </header>

      <GameControls
        levels={levels}
        selectedLevelId={selectedLevel?.id ?? ''}
        onLevelChange={handleLevelChange}
        onRestart={handleRestart}
      />

      <p aria-live="polite" className="game__status">
        {getStatusLabel(currentBoard, isLoading, loadError)}
      </p>

      {dataIssues.length > 0 ? (
        <p className="game__notice" role="status">
          {dataIssues.length} invalid data entries were ignored while loading the boards.
        </p>
      ) : null}

      {currentBoard ? (
        <Board board={currentBoard} onReveal={handleReveal} onToggleFlag={handleToggleFlag} />
      ) : (
        <div className="game__empty">
          Add <code>public/saper-plansze.json</code> to load the predefined boards.
        </div>
      )}

      <footer className="game__footer">
        Left click reveals a cell. Right click toggles a flag.
      </footer>
    </main>
  )
}
