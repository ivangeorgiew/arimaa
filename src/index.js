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

  const [selected, setSelected] = useState([])
  const [currentMove, setCurrentMove] = useState(0)
  const [partOfMove, setPartOfMove] = useState(0)
  const [history, setHistory] = useState([[{
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
  }]])

  const { playerOnTurn, hasWinner, board } = history[currentMove][partOfMove]

  const isFrozen = () => {
    const otherPlayer = playerOnTurn === GOLD ? SILVER : GOLD
    //top, bottom, left, right
    const neighbours = [
      selected[0] > 0 ?
        board[selected[0] - 1][selected[1]] :
        undefined,
      selected[0] < 7 ?
        board[selected[0] + 1][selected[1]] :
        undefined,
      selected[1] > 0 ?
        board[selected[0]][selected[1] - 1] :
        undefined,
      selected[1] < 7 ?
        board[selected[0]][selected[1] + 1] :
        undefined
    ].filter(el => el !== undefined)
    const figure = board[selected[0]][selected[1]]

    return (
      neighbours.some(neighbour => neighbour[0] > figure[0] && neighbour[1] === otherPlayer) &&
      neighbours.every(neighbour => neighbour[1] !== playerOnTurn)
    )
  }

  const isValidEmptyCell = ({ rowIdx, cellIdx }) => {
    // top, bottom, left, right
    const neighbourPositions = [
      selected[0] > 0 ?
        [selected[0] - 1, selected[1]] :
        undefined,
      // rabbits can't go down
      selected[0] < 7 && board[selected[0]][selected[1]][0] > 1 ?
        [selected[0] + 1, selected[1]] :
        undefined,
      selected[1] > 0 ?
        [selected[0], selected[1] - 1] :
        undefined,
      selected[1] < 7 ?
        [selected[0], selected[1] + 1] :
        undefined
    ].filter(el => el !== undefined)

    return neighbourPositions.filter(cell => board[cell[0]][cell[1]][0] === null)
      .some(cellPos => cellPos[0] === rowIdx && cellPos[1] === cellIdx)
  }

  const calcIfHasWinner = () => {
    //TODO
    return false
  }

  const handleCellClick = ({ rowIdx, cellIdx }) => () => {
    // Clicking on player's figure
    const clickedCell = board[rowIdx][cellIdx]

    if (clickedCell[0] !== null && clickedCell[1] === playerOnTurn) {
      setSelected([rowIdx, cellIdx])

      return
    }

    // Moving the selected figure
    const nextHistory = history.map(moves => moves.map(move => Object.assign({}, move)))
    const nextBoard = board.map(row => [...row])

    if (selected.length === 2 && partOfMove < 4 && !isFrozen()) {
      // Simple move on empty valid cell
      if (isValidEmptyCell({ rowIdx, cellIdx })) {
        nextBoard[rowIdx][cellIdx] = nextBoard[selected[0]][selected[1]]
        nextBoard[selected[0]][selected[1]] = [null]

        nextHistory[currentMove] = nextHistory[currentMove]
          .slice(0, partOfMove + 1)
          .concat({
            playerOnTurn,
            hasWinner: calcIfHasWinner(),
            board: nextBoard
          })

        setPartOfMove(partOfMove + 1)
        setSelected([rowIdx, cellIdx])
        setHistory(nextHistory)
      }

      //TODO: remove if in trap
      //TODO: prevent moving to the starting position
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
    setSelected([])
    setHistory(nextHistory.slice(0, currentMove + 1).concat([[{
      playerOnTurn: nextPlayerOnTurn,
      hasWinner,
      board
    }]]))
  }

  const changeToMove = wantedMove => () => {
    setCurrentMove(wantedMove)
    setPartOfMove(history[wantedMove].length - 1)
    setSelected([])
  }

  const changeToPartOfMove = wantedPartOfMove => () => {
    setPartOfMove(wantedPartOfMove)
    setSelected([])
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

            if (rowIdx === selected[0] && cellIdx === selected[1]) {
              classes = classes + ' selected'
            }

            return (
              <button
                className={classes}
                key={cellIdx}
                onClick={handleCellClick({ rowIdx, cellIdx })}
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
    <ul>
      {history.map((move, wantedMove) => {
        const nameOfPlayer = move[0]['playerOnTurn']
          .replace(/^./, m => m.toUpperCase())

        return (
          <li key={wantedMove}>
            <button onClick={changeToMove(wantedMove)}>
              {`${nameOfPlayer} move: ${wantedMove + 1}`}
            </button>
            {
              wantedMove !== currentMove ?
                null :
                <div className="current-moves">
                  {move.map((_, wantedPartOfMove) => (
                    <button 
                      key={wantedPartOfMove} 
                      onClick={changeToPartOfMove(wantedPartOfMove)}
                    >
                      {`Go to move: ${wantedPartOfMove}`}
                    </button>
                  ))}
                </div>
            }
          </li>
        )
      })}
    </ul>
  )

  return (
    <div className="game">
      <div className="playfield">
        <BoardInfo />
        <Board />
      </div>
      <div className="game-info">
        <HistoryOfMoves />
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
