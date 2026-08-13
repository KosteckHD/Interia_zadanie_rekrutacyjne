export type Level = {
  id: string
  name: string
  width: number
  height: number
  mineCount: number
  mines: [number, number][]
}

export type Cell = {
  mine: boolean
  revealed: boolean
  flagged: boolean
  adjacent: number
}

export type Board = {
  name: string
  width: number
  height: number
  cells: Cell[]
  state: 'idle' | 'playing' | 'won' | 'lost'
}

type RevealResult = {
  cells: Cell[]
  hitMine: boolean
}

function isValidIndex(board: Board, index: number): boolean {
  return Number.isInteger(index) && index >= 0 && index < board.cells.length
}

function getNeighborIndices(width: number, height: number, index: number): number[] {
  if (!Number.isInteger(index) || width <= 0 || height <= 0) {
    return []
  }

  const x = index % width
  const y = Math.floor(index / width)
  const neighbors: number[] = []

  for (let offsetY = -1; offsetY <= 1; offsetY += 1) {
    for (let offsetX = -1; offsetX <= 1; offsetX += 1) {
      if (offsetX === 0 && offsetY === 0) {
        continue
      }

      const neighborX = x + offsetX
      const neighborY = y + offsetY

      if (
        neighborX >= 0 &&
        neighborX < width &&
        neighborY >= 0 &&
        neighborY < height
      ) {
        neighbors.push(neighborY * width + neighborX)
      }
    }
  }

  return neighbors
}

function countAdjacentMines(cells: Cell[], width: number, height: number, index: number): number {
  return getNeighborIndices(width, height, index).reduce(
    (count, neighborIndex) => count + (cells[neighborIndex]?.mine ? 1 : 0),
    0,
  )
}

function recalculateAdjacencies(cells: Cell[], width: number, height: number): Cell[] {
  return cells.map((cell, index) => ({
    ...cell,
    adjacent: countAdjacentMines(cells, width, height, index),
  }))
}

function cloneCells(cells: Cell[]): Cell[] {
  return cells.map((cell) => ({ ...cell }))
}

function hasWon(cells: Cell[]): boolean {
  return cells.every((cell) => cell.mine || cell.revealed)
}

function revealCells(
  cells: Cell[],
  width: number,
  height: number,
  startingIndices: number[],
): RevealResult {
  const nextCells = cloneCells(cells)
  const queue = [...startingIndices]
  let queuePosition = 0
  let hitMine = false

  while (queuePosition < queue.length) {
    const index = queue[queuePosition]
    queuePosition += 1
    const cell = nextCells[index]

    if (!cell || cell.revealed || cell.flagged) {
      continue
    }

    cell.revealed = true

    if (cell.mine) {
      hitMine = true
      continue
    }

    if (cell.adjacent === 0) {
      queue.push(...getNeighborIndices(width, height, index))
    }
  }

  return { cells: nextCells, hitMine }
}

function createBoardFromCells(board: Board, cells: Cell[], state: Board['state']): Board {
  return {
    ...board,
    cells,
    state,
  }
}

export function createBoard(level: Level): Board {
  const width = Number.isInteger(level.width) && level.width > 0 ? level.width : 0
  const height = Number.isInteger(level.height) && level.height > 0 ? level.height : 0
  const cellCount = width * height
  const cells: Cell[] = Array.from({ length: cellCount }, () => ({
    mine: false,
    revealed: false,
    flagged: false,
    adjacent: 0,
  }))

  for (const [x, y] of level.mines) {
    if (
      Number.isInteger(x) &&
      Number.isInteger(y) &&
      x >= 0 &&
      x < width &&
      y >= 0 &&
      y < height
    ) {
      cells[y * width + x].mine = true
    }
  }

  return {
    name: level.name,
    width,
    height,
    cells: recalculateAdjacencies(cells, width, height),
    state: 'idle',
  }
}

export function revealCell(board: Board, index: number): Board {
  if (!isValidIndex(board, index) || board.state === 'won' || board.state === 'lost') {
    return board
  }

  const target = board.cells[index]

  if (target.flagged) {
    return board
  }

  if (target.revealed) {
    if (target.adjacent === 0) {
      return board
    }

    const neighbors = getNeighborIndices(board.width, board.height, index)
    const flaggedCount = neighbors.filter((neighborIndex) => board.cells[neighborIndex].flagged).length

    if (flaggedCount !== target.adjacent) {
      return board
    }

    const candidates = neighbors.filter(
      (neighborIndex) => !board.cells[neighborIndex].revealed && !board.cells[neighborIndex].flagged,
    )
    const result = revealCells(board.cells, board.width, board.height, candidates)
    const state = result.hitMine ? 'lost' : hasWon(result.cells) ? 'won' : 'playing'

    return createBoardFromCells(board, result.cells, state)
  }

  let cells = board.cells

  if (board.state === 'idle' && target.mine) {
    const relocationIndex = board.cells.findIndex(
      (cell, cellIndex) => !cell.mine && cellIndex !== index,
    )

    if (relocationIndex === -1) {
      const lostCells = cloneCells(board.cells)
      lostCells[index].revealed = true
      return createBoardFromCells(board, lostCells, 'lost')
    }

    cells = cloneCells(board.cells)
    cells[index].mine = false
    cells[relocationIndex].mine = true
    cells = recalculateAdjacencies(cells, board.width, board.height)
  }

  const result = revealCells(cells, board.width, board.height, [index])
  const state = result.hitMine ? 'lost' : hasWon(result.cells) ? 'won' : 'playing'

  return createBoardFromCells(board, result.cells, state)
}

export function toggleFlag(board: Board, index: number): Board {
  if (!isValidIndex(board, index) || board.state === 'won' || board.state === 'lost') {
    return board
  }

  const target = board.cells[index]

  if (target.revealed) {
    return board
  }

  const cells = cloneCells(board.cells)
  cells[index].flagged = !cells[index].flagged

  return createBoardFromCells(board, cells, board.state)
}
