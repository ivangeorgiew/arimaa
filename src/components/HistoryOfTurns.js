import React, { memo } from 'react'

export const HistoryOfTurns = memo((props = {}) => {
  const { setCurrentTurn, setCurrentMove, setSelectedPositions } = props
  const { isHistoryEnabled, history } = props

  const changeToTurn = wantedTurn => () => {
    setCurrentTurn(wantedTurn)
    setCurrentMove(history[wantedTurn].length - 1)
    setSelectedPositions([[], []])
  }

  return (
    <>
      {
        !isHistoryEnabled ?
          null :
          <div className="history-turns">
            <h3>Change to a turn</h3>
            <ul>
              {history.map((turn, wantedTurn) => {
                const nameOfPlayer = turn[0]['playerOnTurn']
                  .replace(/^./, m => m.toUpperCase())

                return (
                  <li key={wantedTurn}>
                    <button onClick={changeToTurn(wantedTurn)}>
                      {`${nameOfPlayer} turn: ${wantedTurn + 1}`}
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
      }
    </>
  )
})
