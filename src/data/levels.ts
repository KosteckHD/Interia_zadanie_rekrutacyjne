import type { Level } from '../logic/board'

export type LevelDataResult = {
  levels: Level[]
  issues: string[]
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value)
}

function getRawLevels(data: unknown): unknown[] {
  if (Array.isArray(data)) {
    return data
  }

  if (isRecord(data) && Array.isArray(data.levels)) {
    return data.levels
  }

  return []
}

function createUniqueId(rawId: unknown, index: number, usedIds: Set<string>, issues: string[]): string {
  const fallbackId = `level-${index + 1}`
  const baseId = typeof rawId === 'string' && rawId.trim() !== '' ? rawId.trim() : fallbackId

  if (baseId === fallbackId && rawId !== baseId) {
    issues.push(`Level ${index + 1} has no valid id; generated ${fallbackId}.`)
  }

  if (!usedIds.has(baseId)) {
    usedIds.add(baseId)
    return baseId
  }

  const uniqueId = `${baseId}-${index + 1}`
  usedIds.add(uniqueId)
  issues.push(`Level ${index + 1} has a duplicate id; renamed to ${uniqueId}.`)
  return uniqueId
}

function parseMines(
  rawMines: unknown,
  width: number,
  height: number,
  levelIndex: number,
  issues: string[],
): [number, number][] {
  if (!Array.isArray(rawMines)) {
    issues.push(`Level ${levelIndex + 1} has no valid mines array; using an empty list.`)
    return []
  }

  const mines: [number, number][] = []
  const mineKeys = new Set<string>()

  rawMines.forEach((rawMine, mineIndex) => {
    if (
      !Array.isArray(rawMine) ||
      rawMine.length < 2 ||
      !isInteger(rawMine[0]) ||
      !isInteger(rawMine[1])
    ) {
      issues.push(`Level ${levelIndex + 1} mine ${mineIndex + 1} is not a valid coordinate pair.`)
      return
    }

    const x = rawMine[0]
    const y = rawMine[1]

    if (x < 0 || x >= width || y < 0 || y >= height) {
      issues.push(`Level ${levelIndex + 1} mine ${mineIndex + 1} is outside the board and was ignored.`)
      return
    }

    const key = `${x}:${y}`

    if (mineKeys.has(key)) {
      issues.push(`Level ${levelIndex + 1} contains a duplicate mine at [${x}, ${y}].`)
      return
    }

    mineKeys.add(key)
    mines.push([x, y])
  })

  return mines
}

function parseLevel(
  rawLevel: unknown,
  index: number,
  usedIds: Set<string>,
  issues: string[],
): Level | null {
  if (!isRecord(rawLevel)) {
    issues.push(`Level ${index + 1} is not an object and was ignored.`)
    return null
  }

  const width = rawLevel.width
  const height = rawLevel.height

  if (!isInteger(width) || width <= 0 || !isInteger(height) || height <= 0) {
    issues.push(`Level ${index + 1} has invalid dimensions and was ignored.`)
    return null
  }

  const id = createUniqueId(rawLevel.id, index, usedIds, issues)
  const name = typeof rawLevel.name === 'string' && rawLevel.name.trim() !== ''
    ? rawLevel.name.trim()
    : id
  const mines = parseMines(rawLevel.mines, width, height, index, issues)

  if (name === id && rawLevel.name !== name) {
    issues.push(`Level ${index + 1} has no valid name; using its id.`)
  }

  if (isInteger(rawLevel.mineCount) && rawLevel.mineCount !== mines.length) {
    issues.push(
      `Level ${index + 1} declares ${rawLevel.mineCount} mines but contains ${mines.length} valid unique mines.`,
    )
  }

  if (mines.length === width * height) {
    issues.push(`Level ${index + 1} has no safe cells; the first mine click will lose.`)
  }

  return {
    id,
    name,
    width,
    height,
    mineCount: mines.length,
    mines,
  }
}

export function parseLevelData(data: unknown): LevelDataResult {
  const rawLevels = getRawLevels(data)
  const issues: string[] = []

  if (rawLevels.length === 0) {
    issues.push('The level data is empty or does not contain a levels array.')
  }

  const usedIds = new Set<string>()
  const levels = rawLevels.flatMap((rawLevel, index) => {
    const level = parseLevel(rawLevel, index, usedIds, issues)
    return level === null ? [] : [level]
  })

  return { levels, issues }
}
