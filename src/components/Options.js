import React, { memo } from 'react'
import { DEFAULT_HISTORY, GOLD, SILVER } from '../constants'

export const Options = memo((props = {}) => {
  const { getNeighbours, getIsFrozen, getValidClicks } = props
  const { setIsHistoryEnabled, isHistoryEnabled } = props
  const { setSelectedPositions, setCurrentTurn, setCurrentMove } = props
  const { setHistory, history, currentTurn, currentMove } = props

  const { playerOnTurn, movesLeft, winner, board } = history[currentTurn][currentMove]
  const enemy = playerOnTurn === GOLD ? SILVER : GOLD

  const getNextWinner = ({ board }) => {
    // check if gold rabbit has reached the end
    if (board[0].some(([figure, owner]) => figure === 1 && owner === GOLD)) {
      return GOLD
    }

    // check if silver rabbit has reached the end
    if (board[7].some(([figure, owner]) => figure === 1 && owner === SILVER)) {
      return SILVER
    }

    let [goldHasRabbits, silverHasRabbits] = [false, false]
    let pieces = []

    // save every figure info
    // check if every player has rabbits left
    for (let rowIdx = 0; rowIdx < board.length; rowIdx++) {
      for (let colIdx = 0; colIdx < board[rowIdx].length; colIdx++) {
        const [figure, owner] = board[rowIdx][colIdx]

        if (figure !== null) {
          pieces.push([[rowIdx, colIdx], [figure, owner]])
        }

        if (figure === 1) {
          if (owner === GOLD) {
            goldHasRabbits = true
          } else {
            silverHasRabbits = true
          }
        }
      }
    }

    if (!silverHasRabbits) {
      return GOLD
    }

    if (!goldHasRabbits) {
      return SILVER
    }

    // check if some player has no available moves
    let [goldHasAvailableMoves, silverHasAvailableMoves] = [false, false]

    pieces.some(([[rowIdx, colIdx], [figure, owner]]) => {
      const ownNeighbours = getNeighbours({ rowIdx, colIdx, board })
      const combinedNeighbours = ownNeighbours.reduce((acc, neighbour) => {
        const [[neighRow, neighCol], [neighFigure, neighOwner]] = neighbour
        let neighboursToAdd = [neighbour]

        if (neighOwner !== owner && neighFigure < figure) {
          neighboursToAdd = neighboursToAdd.concat(
            getNeighbours({ rowIdx: neighRow, colIdx: neighCol, board })
          )
        }

        return acc.concat(neighboursToAdd)
      }, [])

      const isFrozen = getIsFrozen({
        neighbours: ownNeighbours,
        ownSelFigure: figure,
        playerOnTurn,
        enemy
      })
      const validClicks = getValidClicks({
        neighbours: combinedNeighbours,
        ownSelFigure: figure,
        ownSelOwner: owner,
        enemy,
        movesLeft
      })

      if (!isFrozen && validClicks.length > 0) {
        if (owner === GOLD) {
          goldHasAvailableMoves = true
        } else {
          silverHasAvailableMoves = true
        }
      }

      return goldHasAvailableMoves && silverHasAvailableMoves
    })

    if (!silverHasAvailableMoves) {
      return GOLD
    }

    if (!goldHasAvailableMoves) {
      return SILVER
    }

    return null
  }

  const toggleHistory = () => {
    setIsHistoryEnabled(!isHistoryEnabled)
  }

  const startNewGame = () => {
    if (window.confirm('Are you sure you want to start a new game?')) {
      setSelectedPositions([[], []])
      setCurrentTurn(0)
      setCurrentMove(0)
      setHistory(DEFAULT_HISTORY)
    }
  }

  const areBoardsEqual = ({ boardA, boardB }) => boardA.every((rowA, rowIdx) => (
    rowA.every(([figureA, ownerA], cellIdx) => {
      const [figureB, ownerB] = boardB[rowIdx][cellIdx]

      return figureA === figureB && ownerA === ownerB
    })
  ))

  const handleEndTurnClick = () => {
    const nextHistory = history.map(turns => turns.map(move => Object.assign({}, move)))
    const nextPlayerOnTurn = playerOnTurn === GOLD ? SILVER : GOLD
    const currentMoves = nextHistory[currentTurn]
    const previousMoves = nextHistory[currentTurn - 2]
    const hasTheBoardChanged = currentTurn > 1 ?
      !areBoardsEqual({
        boardA: currentMoves[0].board,
        boardB: currentMoves[currentMoves.length - 1].board
      }) :
      true

    if (!hasTheBoardChanged) {
      alert('Please make a difference to the board! The turn you made is invalid!')

      return
    }

    const hasZugzwangOccured = currentTurn > 3 ?
      areBoardsEqual({
        boardA: previousMoves[previousMoves.length - 1].board,
        boardB: currentMoves[currentMoves.length - 1].board
      }) :
      false

    if (hasZugzwangOccured) {
      alert('Please make a different turn, than returning to the previous board state!')

      return
    }

    setCurrentTurn(currentTurn + 1)
    setCurrentMove(0)
    setSelectedPositions([[], []])

    // remove unwanted moves
    nextHistory[currentTurn] = nextHistory[currentTurn]
      .slice(0, currentMove + 1)

    setHistory(nextHistory.slice(0, currentTurn + 1)
      .concat([[{
        playerOnTurn: nextPlayerOnTurn,
        movesLeft: 4,
        winner: getNextWinner({ board }),
        board
      }]])
    )
  }

  return (
    <div className='options'>
      <button
        className='options-button'
        onClick={handleEndTurnClick}
        disabled={
          (currentTurn > 1 && movesLeft === 4) ||
            typeof winner === 'string'
        }
      >
        End Turn
      </button>
      <button className='options-button' onClick={toggleHistory}>
        { isHistoryEnabled ? 'Hide history' : 'Show history' }
      </button>
      <button className='options-button' onClick={startNewGame}>
        New Game
      </button>
    </div>
  )
})
