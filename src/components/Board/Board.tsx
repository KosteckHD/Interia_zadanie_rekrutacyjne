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
    <section aria-label="Plansza sapera" className="board">
      <div className="board__header">
        <span>PLANSZA <strong>{board.width}&times;{board.height}</strong></span>
        <span>LEWY / PRAWY PRZYCISK</span>
      </div>
      <div className="board__scroll">
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
      </div>
    </section>
  )
}
