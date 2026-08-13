import type { MouseEvent } from 'react'
import type { Board, Cell as CellModel } from '../../logic/board'
import './Cell.scss'

type CellProps = {
  cell: CellModel
  gameState: Board['state']
  index: number
  onReveal: (index: number) => void
  onToggleFlag: (index: number) => void
}

function getCellLabel(cell: CellModel, gameState: Board['state']): string {
  if (cell.flagged) {
    return 'Flagged cell'
  }

  if (cell.mine && (cell.revealed || gameState === 'lost')) {
    return 'Mine'
  }

  if (!cell.revealed) {
    return 'Hidden cell'
  }

  return cell.adjacent > 0 ? `Revealed cell with ${cell.adjacent} adjacent mines` : 'Empty revealed cell'
}

function getCellContent(cell: CellModel, gameState: Board['state']): string {
  if (cell.flagged) {
    return '⚑'
  }

  if (cell.mine && (cell.revealed || gameState === 'lost')) {
    return '✹'
  }

  return cell.revealed && cell.adjacent > 0 ? String(cell.adjacent) : ''
}

export function Cell({ cell, gameState, index, onReveal, onToggleFlag }: CellProps) {
  const classNames = ['board__cell']

  if (cell.revealed) {
    classNames.push('board__cell--revealed')
  }

  if (cell.flagged) {
    classNames.push('board__cell--flagged')
  }

  if (cell.mine && (cell.revealed || gameState === 'lost')) {
    classNames.push('board__cell--mine')
  }

  if (cell.revealed && !cell.mine && cell.adjacent > 0) {
    classNames.push(`board__cell--number-${cell.adjacent}`)
  }

  const handleContextMenu = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    onToggleFlag(index)
  }

  return (
    <button
      aria-label={getCellLabel(cell, gameState)}
      className={classNames.join(' ')}
      type="button"
      onClick={() => onReveal(index)}
      onContextMenu={handleContextMenu}
    >
      {getCellContent(cell, gameState)}
    </button>
  )
}
