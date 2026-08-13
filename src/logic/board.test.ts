import { describe, expect, it } from 'vitest'
import { createBoard, revealCell, toggleFlag, type Level } from './board'

const level: Level = {
  id: 'test-level',
  name: 'Test level',
  width: 3,
  height: 3,
  mineCount: 1,
  mines: [[1, 1]],
}

describe('createBoard', () => {
  it('creates a row-major board with the expected mine and adjacent counts', () => {
    const board = createBoard(level)

    expect(board.width).toBe(3)
    expect(board.height).toBe(3)
    expect(board.state).toBe('idle')
    expect(board.cells).toHaveLength(9)
    expect(board.cells[4]).toMatchObject({ mine: true, adjacent: 0 })
    expect(board.cells[0].adjacent).toBe(1)
    expect(board.cells[1].adjacent).toBe(1)
    expect(board.cells[8].adjacent).toBe(1)
    expect(board.cells[0].revealed).toBe(false)
    expect(board.cells[0].flagged).toBe(false)
  })

  it('ignores invalid mine coordinates without changing the board shape', () => {
    const board = createBoard({
      ...level,
      mines: [[1, 1], [-1, 0], [3, 3], [1.5, 0]],
    })

    expect(board.cells.filter((cell) => cell.mine)).toHaveLength(1)
    expect(board.cells[0].adjacent).toBe(1)
  })
})

describe('toggleFlag', () => {
  it('toggles a flag without changing the game state or the input board', () => {
    const board = createBoard({
      ...level,
      width: 2,
      height: 1,
      mines: [[0, 0]],
    })

    const flaggedBoard = toggleFlag(board, 1)

    expect(flaggedBoard.cells[1].flagged).toBe(true)
    expect(flaggedBoard.state).toBe('idle')
    expect(board.cells[1].flagged).toBe(false)
    expect(toggleFlag(flaggedBoard, 1).cells[1].flagged).toBe(false)
  })

  it('does not flag revealed cells, terminal boards, or invalid indexes', () => {
    const board = createBoard({
      ...level,
      width: 2,
      height: 1,
      mines: [[1, 0]],
    })
    const wonBoard = revealCell(board, 0)

    expect(wonBoard.state).toBe('won')
    expect(toggleFlag(wonBoard, 0)).toBe(wonBoard)
    expect(toggleFlag(wonBoard, 2)).toBe(wonBoard)
    expect(toggleFlag(wonBoard, -1)).toBe(wonBoard)
  })
})

describe('revealCell', () => {
  it('relocates a mine from the first clicked cell to the lowest safe index', () => {
    const board = createBoard({
      ...level,
      width: 3,
      height: 1,
      mines: [[0, 0], [2, 0]],
    })

    const nextBoard = revealCell(board, 0)

    expect(nextBoard.cells[0].mine).toBe(false)
    expect(nextBoard.cells[0].revealed).toBe(true)
    expect(nextBoard.cells[1].mine).toBe(true)
    expect(nextBoard.cells[2].mine).toBe(true)
    expect(nextBoard.state).toBe('won')
    expect(board.cells[0].mine).toBe(true)
  })

  it('loses when the first board has no safe relocation target', () => {
    const board = createBoard({
      ...level,
      width: 2,
      height: 1,
      mines: [[0, 0], [1, 0]],
    })

    const nextBoard = revealCell(board, 0)

    expect(nextBoard.state).toBe('lost')
    expect(nextBoard.cells[0].revealed).toBe(true)
    expect(nextBoard.cells[0].mine).toBe(true)
  })

  it('cascades through empty cells and reveals adjacent numbered cells', () => {
    const board = createBoard({
      ...level,
      width: 4,
      height: 4,
      mines: [[3, 3]],
    })

    const nextBoard = revealCell(board, 0)

    expect(nextBoard.cells[0].revealed).toBe(true)
    expect(nextBoard.cells[1].revealed).toBe(true)
    expect(nextBoard.cells[4].revealed).toBe(true)
    expect(nextBoard.cells[14].revealed).toBe(true)
    expect(nextBoard.cells[15].revealed).toBe(false)
    expect(nextBoard.state).toBe('won')
  })

  it('does not reveal flagged cells during a cascade', () => {
    const board = createBoard({
      ...level,
      width: 4,
      height: 4,
      mines: [[3, 3]],
    })
    const flaggedBoard = toggleFlag(board, 1)
    const nextBoard = revealCell(flaggedBoard, 0)

    expect(nextBoard.cells[1].flagged).toBe(true)
    expect(nextBoard.cells[1].revealed).toBe(false)
    expect(nextBoard.state).toBe('playing')
  })

  it('marks the board as won after all safe cells are revealed', () => {
    const board = createBoard({
      ...level,
      width: 2,
      height: 1,
      mines: [[1, 0]],
    })

    const nextBoard = revealCell(board, 0)

    expect(nextBoard.state).toBe('won')
    expect(nextBoard.cells[0].revealed).toBe(true)
  })

  it('supports chording when the adjacent flag count matches the number', () => {
    const board = createBoard({
      ...level,
      width: 3,
      height: 2,
      mines: [[1, 0]],
    })
    const flaggedBoard = toggleFlag(board, 1)
    const playingBoard = revealCell(flaggedBoard, 3)
    const nextBoard = revealCell(playingBoard, 3)

    expect(playingBoard.state).toBe('playing')
    expect(nextBoard.cells[0].revealed).toBe(true)
    expect(nextBoard.cells[4].revealed).toBe(true)
    expect(nextBoard.state).toBe('playing')
  })

  it('loses when chording exposes a mine behind an incorrect flag', () => {
    const board = createBoard({
      ...level,
      width: 3,
      height: 2,
      mines: [[1, 0]],
    })
    const incorrectlyFlaggedBoard = toggleFlag(board, 0)
    const playingBoard = revealCell(incorrectlyFlaggedBoard, 3)
    const nextBoard = revealCell(playingBoard, 3)

    expect(nextBoard.state).toBe('lost')
    expect(nextBoard.cells[1].revealed).toBe(true)
  })

  it('ignores actions on flagged, invalid, or terminal cells', () => {
    const board = createBoard({
      ...level,
      width: 3,
      height: 1,
      mines: [[2, 0]],
    })
    const flaggedBoard = toggleFlag(board, 0)

    expect(revealCell(flaggedBoard, 0)).toBe(flaggedBoard)
    expect(revealCell(board, -1)).toBe(board)
    expect(revealCell(board, 3)).toBe(board)

    const lostBoard = revealCell(
      createBoard({
        ...level,
        width: 2,
        height: 1,
        mines: [[0, 0], [1, 0]],
      }),
      0,
    )
    expect(lostBoard.state).toBe('lost')
    expect(revealCell(lostBoard, 1)).toBe(lostBoard)
  })
})
