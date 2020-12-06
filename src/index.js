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
  const rabbitsRow = [...Array(8).keys()].map(() => [1])
  const otherAnimalsRow = [[2], [4], [3], [6], [5], [3], [4], [2]]
  const powerToImg = {
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
          return rabbitsRow.map(rabbit => rabbit.concat(SILVER))
        case 7:
          return rabbitsRow.map(rabbit => rabbit.concat(GOLD))
        case 1:
          return otherAnimalsRow.map(animal => animal.concat(SILVER))
        case 6:
          return otherAnimalsRow.map(animal => animal.concat(GOLD))
        default:
          return [...Array(8).keys()].map(() => [null])
      }
    })
  }]])
  const { playerOnTurn, hasWinner, board } = history[currentMove][partOfMove]

  const isFrozen = () => {
    const otherPlayer = playerOnTurn === GOLD ? SILVER : GOLD
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

    return
      neighbours.some(neighbour => neighbour[1] === otherPlayer && neighbour[0] > selected[0]) &&
      neighbours.every(neighbour => neighbour[1] !== playerOnTurn)
  }

  const isValidEmptyCell = ({ rowIdx, cellIdx }) => {
    // top, bottom, left, right
    const neighbourPositions = [
      selected[0] > 0 ?
        [selected[0] - 1, selected[1]] :
        undefined,
      // rabbits can't go down
      selected[0] < 7 && board[selected[0], selected[1]][0] > 1 ?
        [selected[0] + 1, selected[1]] :
        undefined,
      selected[1] > 0 ?
        [selected[0], selected[1] - 1] :
        undefined,
      selected[1] < 7 ?
        [selected[0], selected[1] + 1] :
        undefined
    ].filter(el => el !== undefined)

    return neighbourPositions.filter(cell => board[cell[0], cell[1]])
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
        console.log('here', rowIdx, cellIdx)
        nextBoard[rowIdx][cellIdx] = nextBoard[selected[0]][selected[1]]
        nextBoard[selected[0]][selected[1]] = [null]

        nextHistory[currentMove] = nextHistory[currentMove].concat({
          playerOnTurn,
          hasWinner: calcIfHasWinner(),
          board: nextBoard
        })

        setPartOfMove(partOfMove + 1)
        setHistory(nextHistory)
        setSelected([rowIdx, cellIdx])
      }

      //TODO: prevent moving to the starting position
      //TODO: implement pull, push
      // Pull a figure
      // Push a figure

    }
  }

  //TODO: implement history of moves and part of moves
  //TODO: end of turn button
  //TODO: implement deciding board placement

  return (
    <div className="game">
      <div className="playField">
        <div className='status'>{`Moves left for ${playerOnTurn}: ${4 - partOfMove}`}</div>
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
                          src={powerToImg[`${cell[0]} ${cell[1]}`]}
                          alt={`animal with power ${cell[0]}`}
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
