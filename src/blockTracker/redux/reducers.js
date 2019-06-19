import { createSelector } from 'reselect'
import _ from 'lodash'

function blocks(state = {}, action) {
  switch (action.type) {
    case 'GOT_BLOCK':
      return {
        ...state,
        [action.block.number]: action.block,
      }
    case 'GOT_BLOCKS':
      const blockNumbers = _.map(action.blocks, 'number')
      return {
        ...state,
        ..._.zipObject(blockNumbers, action.blocks),
      }
    default:
      return state
  }
}

export default blocks
// combineReducers({
//   blocks,
// })

const getBlocks = state => state.blockTracker
const getBlockNumbers = createSelector(getBlocks, b => _.map(_.values(b), 'number'))
const getLatestBlock = createSelector(getBlocks, blocksObj => _.last(_.sortBy(_.values(blocksObj), 'number')))

export const selectors = {
  getBlocks,
  getBlockNumbers,
  getLatestBlock,
}