import React, { useState, memo } from 'react'
import { DEFAULT_HISTORY, GOLD, SILVER } from '../constants'
import { Board } from './Board'
import { BoardInfo } from './BoardInfo'
import { HistoryOfMoves } from './HistoryOfMoves'
import { HistoryOfTurns } from './HistoryOfTurns'
import { Options } from './Options'

export const Game = memo(() => {
  const [isHistoryEnabled, setIsHistoryEnabled] = useState(true)
  const [selectedPositions, setSelectedPositions] = useState([[], []])
  const [currentTurn, setCurrentTurn] = useState(0)
  const [currentMove, setCurrentMove] = useState(0)
  const [history, setHistory] = useState(DEFAULT_HISTORY)

  const getNeighbours = ({ rowIdx, colIdx, board }) => {
    // [[rowIdx, colIdx], [figure, owner], 'position']
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

  const getIsFrozen = ({ neighbours, ownSelFigure, playerOnTurn, enemy }) => (
    neighbours.every(([_pos, [_fig, neighOwner]]) => neighOwner !== playerOnTurn) &&
    neighbours.some(([_pos, [neighFigure, neighOwner]]) =>
      neighFigure > ownSelFigure && neighOwner === enemy
    )
  )

  const getValidClicks = ({
    neighbours,
    ownSelFigure,
    ownSelOwner,
    enemy,
    movesLeft
  }) => {
    // rabbit is clicked, which can't go back
    if (ownSelFigure === 1) {
      neighbours = neighbours.filter(neighbour => (
        !(neighbour[2] === 'top' && ownSelFigure === 1 && ownSelOwner === SILVER) &&
        !(neighbour[2] === 'bottom' && ownSelFigure === 1 && ownSelOwner === GOLD)
      ))
    }

    return neighbours.filter(([[neighRow, neighCol], [neighFigure, neighOwner]]) => (
      neighFigure === null ||
      (neighOwner === enemy && neighFigure < ownSelFigure && movesLeft > 1)
    ))
  }

  return (
    <div className="game">
      <div className="playfield">
        <BoardInfo
          history={history}
          currentTurn={currentTurn}
          currentMove={currentMove}
        />
        <Board
          getNeighbours={getNeighbours}
          getIsFrozen={getIsFrozen}
          getValidClicks={getValidClicks}
          selectedPositions={selectedPositions}
          setSelectedPositions={setSelectedPositions}
          history={history}
          currentTurn={currentTurn}
          currentMove={currentMove}
          setCurrentMove={setCurrentMove}
          setHistory={setHistory}
        />
      </div>
      <div className="game-info">
        <Options
          getNeighbours={getNeighbours}
          getIsFrozen={getIsFrozen}
          getValidClicks={getValidClicks}
          setIsHistoryEnabled={setIsHistoryEnabled}
          isHistoryEnabled={isHistoryEnabled}
          setSelectedPositions={setSelectedPositions}
          setCurrentTurn={setCurrentTurn}
          setCurrentMove={setCurrentMove}
          setHistory={setHistory}
          history={history}
          currentTurn={currentTurn}
          currentMove={currentMove}
        />
        <HistoryOfMoves
          setCurrentMove={setCurrentMove}
          setSelectedPositions={setSelectedPositions}
          currentTurn={currentTurn}
          history={history}
        />
        <HistoryOfTurns
          setCurrentTurn={setCurrentTurn}
          setCurrentMove={setCurrentMove}
          setSelectedPositions={setSelectedPositions}
          isHistoryEnabled={isHistoryEnabled}
          history={history}
        />
      </div>
    </div>
  )
})
