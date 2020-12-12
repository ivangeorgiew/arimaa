import React, { memo } from 'react'
import { GOLD, POWER_TO_IMG, SILVER } from '../constants'

export const Board = memo((props = {}) => {
  const { getNeighbours, getIsFrozen, getValidClicks } = props
  const { selectedPositions, setSelectedPositions } = props
  const { history, currentMove, currentTurn } = props
  const { setCurrentMove, setHistory } = props

  const { playerOnTurn, movesLeft, winner, board } = history[currentTurn][currentMove]
  const [[ownSelRow, ownSelCol], [enemySelRow, enemySelCol]] = selectedPositions
  const enemy = playerOnTurn === GOLD ? SILVER : GOLD

  const removeFiguresInTraps = ({ board, rowIdx, colIdx }) => {
    // position and owner
    const traps = [
      [[2, 2], board[2][2][1]],
      [[2, 5], board[2][5][1]],
      [[5, 2], board[5][2][1]],
      [[5, 5], board[5][5][1]]
    ]

    for (let i = 0; i < traps.length; i++) {
      const [[rowIdx, colIdx], trapOwner] = traps[i]

      if (typeof trapOwner !== 'string') {
        continue
      }

      const isTrapProtected = getNeighbours({ rowIdx, colIdx, board })
        .every(([_pos, [_fig, neighOwner]]) => neighOwner !== trapOwner)

      if (isTrapProtected) {
        board[rowIdx][colIdx] = [null]
      }
    }

    const [figure] = board[rowIdx][colIdx]

    // remove selection if selected figure got removed from trap
    if (figure === null) {
      setSelectedPositions([[], []])
    }
  }

  const handleCellClick = ({ rowIdx, colIdx }) => () => {
    const [clickedCellFigure, clickedCellOwner] = board[rowIdx][colIdx]

    // Clicking on own figure
    if (
      clickedCellFigure !== null &&
      clickedCellOwner === playerOnTurn &&
      (currentTurn > 1 || selectedPositions[0].length === 0)
    ) {
      setSelectedPositions([[rowIdx, colIdx], []])
      return
    }

    // Moving the selected figures
    if (selectedPositions[0].length === 2) {
      const nextHistory = history.map(turns => turns.map(move => Object.assign({}, move)))
      const nextBoard = board.map(row => [...row])

      // rearranging figures in first 2 turns
      if (
        currentTurn < 2 &&
        clickedCellFigure !== null &&
        clickedCellOwner === playerOnTurn
      ) {
        nextBoard[rowIdx][colIdx] = board[ownSelRow][ownSelCol]
        nextBoard[ownSelRow][ownSelCol] = board[rowIdx][colIdx]

        // remove the selection on the second click
        setSelectedPositions([[], []])

        // save move to history
        nextHistory[currentTurn] = nextHistory[currentTurn]
          .slice(0, currentMove + 1)
          .concat({
            playerOnTurn,
            movesLeft,
            winner,
            board: nextBoard
          })

        setCurrentMove(currentMove + 1)
        setHistory(nextHistory)

        return
      }

      const [ownSelFigure, ownSelOwner] = board[ownSelRow][ownSelCol]
      const ownSelNeighbours = getNeighbours({ rowIdx: ownSelRow, colIdx: ownSelCol, board })
      const enemySelNeighbours = getNeighbours({ rowIdx: enemySelRow, colIdx: enemySelCol, board })


      const isFrozen = getIsFrozen({
        neighbours: ownSelNeighbours,
        playerOnTurn,
        enemy,
        ownSelFigure
      })
      const validClicks = getValidClicks({
        // enemy figure may be clicked, so add its neighbour cells
        neighbours: ownSelNeighbours.concat(enemySelNeighbours),
        ownSelFigure,
        ownSelOwner,
        enemy,
        movesLeft
      })
      const isValidClick = validClicks.some(([[neighRow, neighCol]]) =>
        neighRow === rowIdx && neighCol === colIdx
      )

      // checking if valid click
      if (currentTurn > 1 && movesLeft > 0 && !isFrozen && isValidClick) {
        // selecting on neighbour enemy figure
        if (clickedCellOwner === enemy) {
          setSelectedPositions([[ownSelRow, ownSelCol], [rowIdx, colIdx]])
          return
        }

        // enemy figure is selected and trying to push or pull
        if (selectedPositions[1].length === 2) {
          // pull
          if (ownSelNeighbours.some(
            ([[neighRow, neighCol]]) => neighRow === rowIdx && neighCol === colIdx)
          ) {
            nextBoard[rowIdx][colIdx] = board[ownSelRow][ownSelCol]
            nextBoard[ownSelRow][ownSelCol] = board[enemySelRow][enemySelCol]
            nextBoard[enemySelRow][enemySelCol] = [null]

            setSelectedPositions([[rowIdx, colIdx], []])
            // push
          } else {
            nextBoard[rowIdx][colIdx] = board[enemySelRow][enemySelCol]
            nextBoard[enemySelRow][enemySelCol] = board[ownSelRow][ownSelCol]
            nextBoard[ownSelRow][ownSelCol] = [null]

            setSelectedPositions([[enemySelRow, enemySelCol], []])
          }
          // moving own figure to empty cell
        } else {
          nextBoard[rowIdx][colIdx] = board[ownSelRow][ownSelCol]
          nextBoard[ownSelRow][ownSelCol] = [null]

          setSelectedPositions([[rowIdx, colIdx], []])
        }

        // remove figures on modified board
        removeFiguresInTraps({ board: nextBoard, rowIdx, colIdx })

        // save move to history
        nextHistory[currentTurn] = nextHistory[currentTurn]
          .slice(0, currentMove + 1)
          .concat({
            playerOnTurn,
            winner,
            board: nextBoard,
            movesLeft: selectedPositions[1].length === 2 ?
            movesLeft - 2 :
            movesLeft - 1
          })

        setCurrentMove(currentMove + 1)
        setHistory(nextHistory)
      }
    }
  }


  return (
    <div className='board'>
      {board.map((row, rowIdx)=> (
        <div className='row' key={rowIdx}>
          {row.map((cell, colIdx) => {
            let classes = 'cell'

            if (typeof cell[1] === 'string') {
              classes = classes + ` ${cell[1]}`
            }

            if ([2, 5].includes(rowIdx) && [2, 5].includes(colIdx)) {
              classes = classes + ' trap'
            }

            if (rowIdx === ownSelRow && colIdx === ownSelCol) {
              classes = classes + ' own-selected'
            }

            if (rowIdx === enemySelRow && colIdx === enemySelCol) {
              classes = classes + ' enemy-selected'
            }

            return (
              <button
                className={classes}
                key={`${rowIdx}${colIdx}`}
                onClick={handleCellClick({ rowIdx, colIdx })}
                disabled={typeof winner === 'string'}
              >
                {
                  cell[0] !== null ?
                    <img
                      src={POWER_TO_IMG[`${cell[0]} ${cell[1]}`]}
                      alt={cell[0]}
                    /> :
                    null
                }
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )
})
