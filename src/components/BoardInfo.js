import React, { memo } from 'react'

export const BoardInfo = memo((props = {}) => {
  const { history, currentTurn, currentMove } = props

  const { playerOnTurn, movesLeft, winner } = history[currentTurn][currentMove]

  return (
    <div className='board-info'>
      {
        currentTurn < 2 ?
          `Rearrange figures for ${playerOnTurn}` :
          typeof winner === 'string' ?
          `Winner is ${winner.toUpperCase()}!` :
          `Moves left for ${playerOnTurn}: ${movesLeft}`
      }
    </div>
  )
})
