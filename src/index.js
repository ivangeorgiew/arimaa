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
  const [selectedPosition, setSelectedPosition] = useState([])
  const [currentMove, setCurrentMove] = useState(0)
  const [partOfMove, setPartOfMove] = useState(0)
  const [history, setHistory] = useState(DEFAULT_HISTORY)

  const { playerOnTurn, hasWinner, board } = history[currentMove][partOfMove]

  const getNeighbours = ([rowIdx, colIdx], nextBoard) => {
    return [
      rowIdx > 0 ?
        [[rowIdx - 1, colIdx], nextBoard[rowIdx - 1][colIdx], 'top'] :
        undefined,
      rowIdx < 7 ?
        [[rowIdx + 1, colIdx], nextBoard[rowIdx + 1][colIdx], 'bottom'] :
        undefined,
      colIdx > 0 ?
        [[rowIdx, colIdx - 1], nextBoard[rowIdx][colIdx - 1], 'left'] :
        undefined,
      colIdx < 7 ?
        [[rowIdx, colIdx + 1], nextBoard[rowIdx][colIdx + 1], 'right'] :
        undefined
    ].filter(el => el !== undefined)
  }

  const isFrozen = () => {
    const otherPlayer = playerOnTurn === GOLD ? SILVER : GOLD
    const [selRow, selCol] = selectedPosition
    const [selPower] = board[selRow][selCol]
    const neighbours = getNeighbours([selRow, selCol], board)
      .map(neighbour => neighbour[1])

    return (
      neighbours.every(([_, neighOwner]) => neighOwner !== playerOnTurn) &&
      neighbours.some(([neighPower, neighOwner]) =>
        neighPower > selPower && neighOwner === otherPlayer
      )
    )
  }

  const isValidEmptyCell = ([rowIdx, cellIdx]) => {
    const [selRow, selCol] = selectedPosition
    const [selPower, selOwner] = board[selRow][selCol]
    const neighbourPositions = getNeighbours([selRow, selCol], board)
      .filter(neighbour => (
        !(neighbour[2] === 'top' && selPower === 1 && selOwner === SILVER) &&
        !(neighbour[2] === 'bottom' && selPower === 1 && selOwner === GOLD)
      ))
      .map(neighbour => neighbour[0])

    return neighbourPositions.some(([neighRow, neighCol]) =>
      neighRow === rowIdx &&
      neighCol === cellIdx &&
      board[neighRow][neighCol][0] === null
    )
  }

  const removeFiguresOnBoard = nextBoard => {
    // position and owner
    const traps = [
      [[2, 2], nextBoard[2][2][1]],
      [[2, 5], nextBoard[2][5][1]],
      [[5, 2], nextBoard[5][2][1]],
      [[5, 5], nextBoard[5][5][1]]
    ]

    traps.forEach(([[rowIdx, colIdx], trapOwner]) => {
      if (trapOwner === undefined) {
        return false
      }

      const neighbourOwners = getNeighbours([rowIdx, colIdx], nextBoard)
        .map(neighbour => neighbour[1][1])

      if (neighbourOwners.every(neighOwner => neighOwner !== trapOwner)) {
        nextBoard[rowIdx][colIdx] = [null]
      }
    })
  }

  const calcIfHasWinner = () => {
    //TODO: check if remaining rabbits
    //TODO: check if has available turns
    //TODO: check if a rabbit has reached the end
    return false
  }

  const handleCellClick = ([rowIdx, cellIdx]) => () => {
    // Clicking on player's figure
    const [power, owner] = board[rowIdx][cellIdx]

    if (power !== null && owner === playerOnTurn) {
      setSelectedPosition([rowIdx, cellIdx])
      return
    }

    // Moving the selected figure
    const nextHistory = history.map(moves => moves.map(move => Object.assign({}, move)))
    const nextBoard = board.map(row => [...row])

    if (selectedPosition.length === 2 && partOfMove < 4 && !isFrozen()) {
      // Simple move on empty valid cell
      if (isValidEmptyCell([rowIdx, cellIdx])) {
        const [selRow, selCol] = selectedPosition

        nextBoard[rowIdx][cellIdx] = nextBoard[selRow][selCol]
        nextBoard[selRow][selCol] = [null]

        // Remove figures in traps
        removeFiguresOnBoard(nextBoard)

        nextHistory[currentMove] = nextHistory[currentMove]
          .slice(0, partOfMove + 1)
          .concat({
            playerOnTurn,
            hasWinner: calcIfHasWinner(),
            board: nextBoard
          })

        if (nextBoard[rowIdx][cellIdx][0] === null) {
          setSelectedPosition([])
        } else {
          setSelectedPosition([rowIdx, cellIdx])
        }

        setPartOfMove(partOfMove + 1)
        setHistory(nextHistory)
      }

      //TODO: implement pull, push
      // Pull a figure
      // Push a figure
    }
  }

  const handleEndTurnClick = () => {
    const nextHistory = history.map(moves => moves.map(move => Object.assign({}, move)))
    const nextPlayerOnTurn = playerOnTurn === GOLD ? SILVER : GOLD

    setCurrentMove(currentMove + 1)
    setPartOfMove(0)
    setSelectedPosition([])
    setHistory(nextHistory.slice(0, currentMove + 1).concat([[{
      playerOnTurn: nextPlayerOnTurn,
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
    setSelectedPosition([])
  }

  const changeToPartOfMove = wantedPartOfMove => () => {
    setPartOfMove(wantedPartOfMove)
    setSelectedPosition([])
  }

  const startNewGame = () => {
    setSelectedPosition([])
    setCurrentMove(0)
    setPartOfMove(0)
    setHistory(DEFAULT_HISTORY)
  }

  //TODO: implement deciding board placement
  const BoardInfo = () => (
    <div className='board-info'>
      <div className='status'>{`Moves left for ${playerOnTurn}: ${4 - partOfMove}`}</div>
      <button
        className='end-turn'
        onClick={handleEndTurnClick}
        disabled={partOfMove === 0}
      >
        End Turn
      </button>
    </div>
  )

  const Board = () => (
    <div className='board'>
      {board.map((row, rowIdx)=> (
        <div className='row' key={rowIdx}>
          {row.map((cell, cellIdx) => {
            let classes = 'cell'

            if (typeof cell[1] === 'string') {
              classes = classes + ` ${cell[1]}`
            }

            if ([2, 5].includes(rowIdx) && [2, 5].includes(cellIdx)) {
              classes = classes + ' trap'
            }

            if (rowIdx === selectedPosition[0] && cellIdx === selectedPosition[1]) {
              classes = classes + ' selected'
            }

            return (
              <button
                className={classes}
                key={cellIdx}
                onClick={handleCellClick([rowIdx, cellIdx])}
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
