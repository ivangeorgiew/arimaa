import React, { useState } from 'react'
import { render } from 'react-dom'
import './index.css'
import rabbitG from "./img/rabbit-g.png"
import catG from "./img/cat-g.png"
import wolfG from "./img/wolf-g.png"
import horseG from "./img/horse-g.png"
import camelG from "./img/camel-g.png"
import elephantG from "./img/elephant-g.png"
import rabbitS from "./img/rabbit-s.png"
import catS from "./img/cat-s.png"
import wolfS from "./img/wolf-s.png"
import horseS from "./img/horse-s.png"
import camelS from "./img/camel-s.png"
import elephantS from "./img/elephant-s.png"

const Game = () => {
  const GOLD = 'gold'
  const SILVER = 'silver'
  const RABBITS_ROW = [...Array(8).keys()].map(() => [1])
  const OTHER_ANIMALS_ROW = [[2], [4], [3], [6], [5], [3], [4], [2]]
  const POWER_TO_IMG = {
    [`1 ${GOLD}`]: rabbitG,
    [`2 ${GOLD}`]: catG,
    [`3 ${GOLD}`]: wolfG,
    [`4 ${GOLD}`]: horseG,
    [`5 ${GOLD}`]: camelG,
    [`6 ${GOLD}`]: elephantG,
    [`1 ${SILVER}`]: rabbitS,
    [`2 ${SILVER}`]: catS,
    [`3 ${SILVER}`]: wolfS,
    [`4 ${SILVER}`]: horseS,
    [`5 ${SILVER}`]: camelS,
    [`6 ${SILVER}`]: elephantS
  }
  const DEFAULT_HISTORY = [[{
    playerOnTurn: GOLD,
    movesLeft: 4,
    hasWinner: false,
    board: [...Array(8).keys()].map(idx => {
      switch (idx) {
        case 0:
          return RABBITS_ROW.map(rabbit => rabbit.concat(SILVER))
        case 7:
          return RABBITS_ROW.map(rabbit => rabbit.concat(GOLD))
        case 1:
          return OTHER_ANIMALS_ROW.map(animal => animal.concat(SILVER))
        case 6:
          return OTHER_ANIMALS_ROW.map(animal => animal.concat(GOLD))
        default:
          return [...Array(8).keys()].map(() => [null])
      }
    })
  }]]

  const [isHistoryEnabled, setIsHistoryEnabled] = useState(false)
  const [selectedPositions, setSelectedPositions] = useState([[], []])
  const [currentMove, setCurrentMove] = useState(0)
  const [partOfMove, setPartOfMove] = useState(0)
  const [history, setHistory] = useState(DEFAULT_HISTORY)

  const { playerOnTurn, movesLeft, hasWinner, board } = history[currentMove][partOfMove]
  const [[ownSelRow, ownSelCol], [enemySelRow, enemySelCol]] = selectedPositions
  const enemy = playerOnTurn === GOLD ? SILVER : GOLD

  const getNeighbours = ({ rowIdx, colIdx, board }) => {
    return [
      rowIdx > 0 ?
        [[rowIdx - 1, colIdx], board[rowIdx - 1][colIdx], 'top'] :
        undefined,
      rowIdx < 7 ?
        [[rowIdx + 1, colIdx], board[rowIdx + 1][colIdx], 'bottom'] :
        undefined,
      colIdx > 0 ?
        [[rowIdx, colIdx - 1], board[rowIdx][colIdx - 1], 'left'] :
        undefined,
      colIdx < 7 ?
        [[rowIdx, colIdx + 1], board[rowIdx][colIdx + 1], 'right'] :
        undefined
    ].filter(el => el !== undefined)
  }

  const getIsFrozen = ({ neighbours, ownSelFigure }) => (
    neighbours.every(([_pos, [_fig, neighOwner]]) => neighOwner !== playerOnTurn) &&
    neighbours.some(([_pos, [neighFigure, neighOwner]]) =>
      neighFigure > ownSelFigure && neighOwner === enemy
    )
  )

  const getIsValidCellClick = ({
    neighbours,
    rowIdx,
    colIdx,
    ownSelFigure,
    ownSelOwner,
    clickedCellFigure
  }) => {
    // rabbit is clicked, which can't go back
    if (clickedCellFigure === null && ownSelFigure === 1) {
      neighbours = neighbours.filter(neighbour => (
        !(neighbour[2] === 'top' && ownSelFigure === 1 && ownSelOwner === SILVER) &&
        !(neighbour[2] === 'bottom' && ownSelFigure === 1 && ownSelOwner === GOLD)
      ))
    // enemy figure is clicked, so add its neighbour cells
    } else if (typeof enemySelRow === 'number' && typeof enemySelCol === 'number') {
      neighbours = neighbours.concat(getNeighbours({
        rowIdx: enemySelRow,
        colIdx: enemySelCol,
        board
      }))
    }

    return neighbours.some(([[neighRow, neighCol], [neighFigure, neighOwner]]) => (
      neighRow === rowIdx &&
      neighCol === colIdx &&
      (
        neighFigure === null ||
        (neighOwner === enemy && neighFigure < ownSelFigure && movesLeft > 1)
      )
    ))
  }

  const removeFiguresInTraps = ({ board, rowIdx, colIdx }) => {
    // position and owner
    const traps = [
      [[2, 2], board[2][2][1]],
      [[2, 5], board[2][5][1]],
      [[5, 2], board[5][2][1]],
      [[5, 5], board[5][5][1]]
    ]

    traps.forEach(([[rowIdx, colIdx], trapOwner]) => {
      if (trapOwner === undefined) {
        return false
      }

      const neighbourOwners = getNeighbours({ rowIdx, colIdx, board })
        .map(neighbour => neighbour[1][1])

      if (neighbourOwners.every(neighOwner => neighOwner !== trapOwner)) {
        board[rowIdx][colIdx] = [null]
      }
    })

    // remove selection if selected figure got removed from trap
    if (board[rowIdx][colIdx][0] === null) {
      setSelectedPositions([[], []])
    }
  }

  const calcIfHasWinner = () => {
    //TODO: check if remaining rabbits
    //TODO: check if has available turns
    //TODO: check if a rabbit has reached the end
    return false
  }

  const handleCellClick = ({ rowIdx, colIdx }) => () => {
    const [clickedCellFigure, clickedCellOwner] = board[rowIdx][colIdx]

    // Clicking on own figure
    if (clickedCellFigure !== null && clickedCellOwner === playerOnTurn) {
      setSelectedPositions([[rowIdx, colIdx], []])
      return
    }

    // Moving the selected figures
    if (typeof ownSelRow === 'number' && typeof ownSelCol === 'number') {
      const nextHistory = history.map(moves => moves.map(move => Object.assign({}, move)))
      const nextBoard = board.map(row => [...row])

      const [ownSelFigure, ownSelOwner] = board[ownSelRow][ownSelCol]
      const ownSelNeighbours = getNeighbours({ rowIdx: ownSelRow, colIdx: ownSelCol, board })
      const enemySelNeighbours = getNeighbours({ rowIdx: enemySelRow, colIdx: enemySelCol, board })

      const isFrozen = getIsFrozen({ neighbours: ownSelNeighbours, ownSelFigure })
      const isValidCellClick = getIsValidCellClick({
        neighbours: ownSelNeighbours.concat(enemySelNeighbours),
        rowIdx,
        colIdx,
        ownSelFigure,
        ownSelOwner,
        clickedCellFigure
      })

      if (movesLeft > 0 && !isFrozen && isValidCellClick) {
        if (clickedCellOwner === enemy) {
          setSelectedPositions([[ownSelRow, ownSelCol], [rowIdx, colIdx]])
          return
        }

        const isPushOrPull = typeof enemySelRow === 'number' &&
          typeof enemySelCol === 'number'

        // enemy figure is selected and trying to push or pull
        if (isPushOrPull) {
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

        removeFiguresInTraps({ board: nextBoard, rowIdx, colIdx })

        nextHistory[currentMove] = nextHistory[currentMove]
          .slice(0, partOfMove + 1)
          .concat({
            playerOnTurn,
            movesLeft: isPushOrPull ? movesLeft - 2 : movesLeft - 1,
            hasWinner: calcIfHasWinner(),
            board: nextBoard
          })

        setPartOfMove(partOfMove + 1)
        setHistory(nextHistory)
      }
    }

  }

  const handleEndTurnClick = () => {
    const nextHistory = history.map(moves => moves.map(move => Object.assign({}, move)))
    const nextPlayerOnTurn = playerOnTurn === GOLD ? SILVER : GOLD

    setCurrentMove(currentMove + 1)
    setPartOfMove(0)
    setSelectedPositions([[], []])
    setHistory(nextHistory.slice(0, currentMove + 1).concat([[{
      playerOnTurn: nextPlayerOnTurn,
      movesLeft: 4,
      hasWinner,
      board
    }]]))
  }

  const toggleHistory = () => {
    setIsHistoryEnabled(!isHistoryEnabled)
  }

  const changeToMove = wantedMove => () => {
    setCurrentMove(wantedMove)
    setPartOfMove(history[wantedMove].length - 1)
    setSelectedPositions([[], []])
  }

  const changeToPartOfMove = wantedPartOfMove => () => {
    setPartOfMove(wantedPartOfMove)
    setSelectedPositions([[], []])
  }

  const startNewGame = () => {
    setSelectedPositions([[], []])
    setCurrentMove(0)
    setPartOfMove(0)
    setHistory(DEFAULT_HISTORY)
  }

  //TODO: implement deciding board placement
  const BoardInfo = () => (
    <div className='board-info'>
      <div className='status'>{`Moves left for ${playerOnTurn}: ${movesLeft}`}</div>
      <button
        className='end-turn'
        onClick={handleEndTurnClick}
        disabled={movesLeft === 4}
      >
        End Turn
      </button>
    </div>
  )

  const Board = () => (
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
                key={colIdx}
                onClick={handleCellClick({ rowIdx, colIdx })}
              >
                {
                  cell[0] !== null ?
                    <img
                      src={POWER_TO_IMG[`${cell[0]} ${cell[1]}`]}
                      alt={cell[0]}
                      width="80px"
                      height="80px"
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

  const HistoryOfMoves = () => (
    <div className="current-moves">
      <h3>Change to part of your move</h3>
      {history[currentMove].map((_, wantedPartOfMove) => (
        <button 
          key={wantedPartOfMove} 
          onClick={changeToPartOfMove(wantedPartOfMove)}
        >
          {`Go to move: ${wantedPartOfMove}`}
        </button>
      ))}
    </div>
  )

  const Options = () => (
    <div className='options'>
      <button onClick={startNewGame}>New Game</button>
      <button className='toggle-history' onClick={toggleHistory}>
        { isHistoryEnabled ? 'Hide history' : 'Show history' }
      </button>
      { 
        !isHistoryEnabled ?
          null :
          <ul>
            {history.map((move, wantedMove) => {
              const nameOfPlayer = move[0]['playerOnTurn']
                .replace(/^./, m => m.toUpperCase())

              return (
                <li key={wantedMove}>
                  <button onClick={changeToMove(wantedMove)}>
                    {`${nameOfPlayer} move: ${wantedMove + 1}`}
                  </button>
                </li>
              )
            })}
          </ul>
      }
    </div>
  )

  return (
    <div className="game">
      <div className="playfield">
        <BoardInfo />
        <Board />
      </div>
      <div className="game-info">
        <HistoryOfMoves />
        <Options />
      </div>
    </div>
  )
}

render(
  <React.StrictMode>
    <Game />
  </React.StrictMode>,
  document.getElementById('root')
)
