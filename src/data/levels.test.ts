import { describe, expect, it } from 'vitest'
import { parseLevelData } from './levels'

describe('parseLevelData', () => {
  it('normalizes malformed coordinates, duplicate ids, and mine counts', () => {
    const result = parseLevelData([
      {
        id: 'first',
        name: 'First',
        width: 2,
        height: 2,
        mineCount: 4,
        mines: [[0, 0], [0, 0], [1, 1], [2, 1], ['1', 0]],
      },
      {
        id: 'first',
        name: 'Second',
        width: 1,
        height: 1,
        mineCount: 0,
        mines: [],
      },
      {
        id: 'invalid',
        name: 'Invalid',
        width: 0,
        height: 1,
        mineCount: 0,
        mines: [],
      },
    ])

    expect(result.levels).toHaveLength(2)
    expect(result.levels[0]).toMatchObject({
      id: 'first',
      mineCount: 2,
      mines: [[0, 0], [1, 1]],
    })
    expect(result.levels[1].id).toBe('first-2')
    expect(result.issues.length).toBeGreaterThan(0)
  })

  it('supports a top-level levels property and reports empty data', () => {
    const result = parseLevelData({ levels: [] })

    expect(result.levels).toEqual([])
    expect(result.issues).toContain('The level data is empty or does not contain a levels array.')
  })

  it('reports a board without any safe cells', () => {
    const result = parseLevelData({
      levels: [{
        id: 'full',
        name: 'Full',
        width: 2,
        height: 1,
        mineCount: 2,
        mines: [[0, 0], [1, 0]],
      }],
    })

    expect(result.issues).toContain('Level 1 has no safe cells; the first mine click will lose.')
  })
})
