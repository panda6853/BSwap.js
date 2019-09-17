import { fetchSwapDelegateApprovals } from '../../swap/redux/contractFunctionActions'
import { fetchERC20Allowance } from '../../erc20/redux/contractFunctionActions'
import { fetchERC721GetApproved } from '../../erc721/redux/contractFunctionActions'

export default function callData(store) {
  return next => action => {
    switch (action.type) {
      case 'TRANSACTION_LOG_EVENT':
        const { event, parameters } = action
        const eventName = event.name.toLowerCase()
        if (eventName === 'authorize') {
          store.dispatch(
            fetchSwapDelegateApprovals({
              // addresses need to be lowercased, since their responses are matched using the input parameters in lookups
              approver: event.values.approver.toLowerCase(),
              delegate: event.values.delegate.toLowerCase(),
            }),
          )
        }

        if (eventName === 'approval') {
          if (action.namespace === 'ERC721') {
            store.dispatch(
              fetchERC721GetApproved({
                contractAddress: parameters.contractAddress.toLowerCase(),
                tokenId: parameters.tokenId.toLowerCase(),
              }),
            )
          } else {
            store.dispatch(
              fetchERC20Allowance({
                // addresses need to be lowercased, since their responses are matched using the input parameters in lookups
                contractAddress: event.address.toLowerCase(),
                owner: event.values.owner.toLowerCase(),
                spender: event.values.spender.toLowerCase(),
              }),
            )
          }
        }
        break
      default:
    }
    return next(action)
  }
}