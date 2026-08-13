import type { CSSProperties } from 'react'
import type { Board as BoardModel } from '../../logic/board'
import { Cell } from '../Cell/Cell'
import './Board.scss'

type BoardProps = {
  board: BoardModel
  levelName: string
  onReveal: (index: number) => void
  onToggleFlag: (index: number) => void
}

export function Board({ board, levelName, onReveal, onToggleFlag }: BoardProps) {
  const boardStyle = {
    '--board-columns': board.width,
    '--board-rows': board.height,
  } as CSSProperties

  return (
    <section aria-label="Plansza sapera" className="board">
      <div className="board__header">
        <span>PLANSZA: <strong>{levelName}, {board.width}&times;{board.height}</strong></span>
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
