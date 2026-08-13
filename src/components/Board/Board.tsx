import type { CSSProperties } from 'react'
import type { Board as BoardModel } from '../../logic/board'
import { Cell } from '../Cell/Cell'
import './Board.scss'

type BoardProps = {
  board: BoardModel
  onReveal: (index: number) => void
  onToggleFlag: (index: number) => void
}

export function Board({ board, onReveal, onToggleFlag }: BoardProps) {
  const boardStyle = { '--board-columns': board.width } as CSSProperties

  return (
    <section aria-label="Minesweeper board" className="board">
      <div className="board__grid" style={boardStyle}>
        {board.cells.map((cell, index) => (
          <Cell
            cell={cell}
            gameState={board.state}
            index={index}
            key={index}
            onReveal={onReveal}
            onToggleFlag={onToggleFlag}
          />
        ))}
      </div>
    </section>
  )
}
