import { useEffect, useState } from 'react'
import type { Level } from './logic/board'
import { parseLevelData } from './data/levels'
import { Game } from './components/Game/Game'

function App() {
  const [levels, setLevels] = useState<Level[]>([])
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isActive = true

    const loadLevels = async () => {
      try {
        const response = await fetch('/saper-plansze.json')

        if (!response.ok) {
          throw new Error(`Unable to load board data (${response.status}).`)
        }

        const data: unknown = await response.json()
        const result = parseLevelData(data)

        if (isActive) {
          setLevels(result.levels)
          setIsLoading(false)
        }
      } catch (error: unknown) {
        if (isActive) {
          setLoadError(error instanceof Error ? error.message : 'Unable to load board data.')
          setIsLoading(false)
        }
      }
    }

    void loadLevels()

    return () => {
      isActive = false
    }
  }, [])

  return <Game isLoading={isLoading} levels={levels} loadError={loadError} />
}

export default App
