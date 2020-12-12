import camelG from "./img/camel-g.png"
import camelS from "./img/camel-s.png"
import catG from "./img/cat-g.png"
import catS from "./img/cat-s.png"
import elephantG from "./img/elephant-g.png"
import elephantS from "./img/elephant-s.png"
import horseG from "./img/horse-g.png"
import horseS from "./img/horse-s.png"
import rabbitG from "./img/rabbit-g.png"
import rabbitS from "./img/rabbit-s.png"
import wolfG from "./img/wolf-g.png"
import wolfS from "./img/wolf-s.png"

export const GOLD = 'gold'
export const SILVER = 'silver'
export const RABBITS_ROW = [...Array(8).keys()].map(() => [1])
export const OTHER_ANIMALS_ROW = [[2], [4], [3], [6], [5], [3], [4], [2]]
export const POWER_TO_IMG = {
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
export const DEFAULT_HISTORY = [[{
  playerOnTurn: GOLD,
  movesLeft: 4,
  winner: null,
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

