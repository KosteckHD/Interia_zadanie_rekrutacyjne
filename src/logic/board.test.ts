import { describe, expect, it } from 'vitest'
import { createBoard, type Level } from './board'

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
