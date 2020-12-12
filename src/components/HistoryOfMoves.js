import React, { memo } from 'react'

export const HistoryOfMoves = memo((props = {}) => {
  const { setCurrentMove, setSelectedPositions, currentTurn } = props
  const { history } = props

  const changeToMove = wantedMove => () => {
    setCurrentMove(wantedMove)
    setSelectedPositions([[], []])
  }

  return (
    <>
      {
        currentTurn < 2 ?
          null :
          <div className="history-moves">
            <h3>Change to a move</h3>
            {history[currentTurn].map((_, wantedMove) => (
              <button
                key={wantedMove} 
                onClick={changeToMove(wantedMove)}
              >
                {`Go to move: ${wantedMove}`}
              </button>
            ))}
          </div>
      }
    </>
  )
})
