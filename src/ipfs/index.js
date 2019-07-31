const _ = require('lodash')
const { SLS_PGP_URL } = require('../constants')
const IPFS = require('ipfs-mini')
const axios = require('axios')

const ipfsInfura = new IPFS({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' })
const ipfsAirSwap = new IPFS({ host: 'ipfs.airswap.io', port: 443, protocol: 'https' })

const pinJSONToIPFSPinata = JSONBody => {
  const url = `${SLS_PGP_URL}/storePinata`
  return axios.post(url, JSONBody).then(resp => resp.data.IpfsHash)
}

async function ipfsStoreJSON(obj) {
  const storeString = _.isString(obj) ? JSON.stringify(JSON.parse(obj)) : JSON.stringify(obj)

  return new Promise((resolve, reject) => {
    // this "resolved" syntax is required since there isn't a Promise.none()
    let resolved = 0
    ipfsAirSwap
      .add(storeString)
      .then(resolve)
      .catch(e => {
        resolved++
        if (resolved === 2) {
          reject(e)
        }
      })
    ipfsInfura
      .add(storeString)
      .then(resolve)
      .catch(e => {
        resolved++
        if (resolved === 2) {
          reject(e)
        }
      })

    pinJSONToIPFSPinata(JSON.parse(storeString)) // pinata will always take the longest to resolve since they don't support reads
  })
}

const fetchIPFSContentFromCloudfare = cid =>
  axios.get(`https://cloudflare-ipfs.com/ipfs/${cid}`).then(resp => JSON.stringify(resp.data))

async function ipfsFetchJSONFromCID(cid) {
  const content = await new Promise((resolve, reject) => {
    if (!cid) {
      resolve(undefined)
      return
    }
    // this "resolved" syntax is required since there isn't a Promise.none()
    let resolved = 0
    ipfsAirSwap
      .cat(cid)
      .then(resolve)
      .catch(e => {
        resolved++
        if (resolved === 3) {
          reject(e)
        }
      })
    ipfsInfura
      .cat(cid)
      .then(resolve)
      .catch(e => {
        resolved++
        if (resolved === 3) {
          reject(e)
        }
      })

    fetchIPFSContentFromCloudfare(cid)
      .then(resolve)
      .catch(e => {
        resolved++
        if (resolved === 3) {
          reject(e)
        }
      })
  })
  return JSON.parse(content)
}

const j = `
[
  {
    "constant": true,
    "inputs": [
      {
        "name": "",
        "type": "address"
      }
    ],
    "name": "makerMinimumNonce",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "",
        "type": "address"
      },
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "makerOrderStatus",
    "outputs": [
      {
        "name": "",
        "type": "bytes1"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "",
        "type": "address"
      },
      {
        "name": "",
        "type": "address"
      }
    ],
    "name": "delegateApprovals",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "name": "nonce",
        "type": "uint256"
      },
      {
        "indexed": false,
        "name": "timestamp",
        "type": "uint256"
      },
      {
        "indexed": true,
        "name": "makerWallet",
        "type": "address"
      },
      {
        "indexed": false,
        "name": "makerParam",
        "type": "uint256"
      },
      {
        "indexed": false,
        "name": "makerToken",
        "type": "address"
      },
      {
        "indexed": true,
        "name": "takerWallet",
        "type": "address"
      },
      {
        "indexed": false,
        "name": "takerParam",
        "type": "uint256"
      },
      {
        "indexed": false,
        "name": "takerToken",
        "type": "address"
      },
      {
        "indexed": false,
        "name": "affiliateWallet",
        "type": "address"
      },
      {
        "indexed": false,
        "name": "affiliateParam",
        "type": "uint256"
      },
      {
        "indexed": false,
        "name": "affiliateToken",
        "type": "address"
      }
    ],
    "name": "Swap",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "name": "nonce",
        "type": "uint256"
      },
      {
        "indexed": true,
        "name": "makerWallet",
        "type": "address"
      }
    ],
    "name": "Cancel",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "name": "nonce",
        "type": "uint256"
      },
      {
        "indexed": true,
        "name": "makerWallet",
        "type": "address"
      }
    ],
    "name": "Invalidate",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "name": "approverAddress",
        "type": "address"
      },
      {
        "indexed": true,
        "name": "delegateAddress",
        "type": "address"
      },
      {
        "indexed": false,
        "name": "expiry",
        "type": "uint256"
      }
    ],
    "name": "Authorize",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "name": "approverAddress",
        "type": "address"
      },
      {
        "indexed": true,
        "name": "delegateAddress",
        "type": "address"
      }
    ],
    "name": "Revoke",
    "type": "event"
  },
  {
    "constant": false,
    "inputs": [
      {
        "components": [
          {
            "name": "nonce",
            "type": "uint256"
          },
          {
            "name": "expiry",
            "type": "uint256"
          },
          {
            "components": [
              {
                "name": "wallet",
                "type": "address"
              },
              {
                "name": "token",
                "type": "address"
              },
              {
                "name": "param",
                "type": "uint256"
              }
            ],
            "name": "maker",
            "type": "tuple"
          },
          {
            "components": [
              {
                "name": "wallet",
                "type": "address"
              },
              {
                "name": "token",
                "type": "address"
              },
              {
                "name": "param",
                "type": "uint256"
              }
            ],
            "name": "taker",
            "type": "tuple"
          },
          {
            "components": [
              {
                "name": "wallet",
                "type": "address"
              },
              {
                "name": "token",
                "type": "address"
              },
              {
                "name": "param",
                "type": "uint256"
              }
            ],
            "name": "affiliate",
            "type": "tuple"
          }
        ],
        "name": "_order",
        "type": "tuple"
      },
      {
        "components": [
          {
            "name": "signer",
            "type": "address"
          },
          {
            "name": "v",
            "type": "uint8"
          },
          {
            "name": "r",
            "type": "bytes32"
          },
          {
            "name": "s",
            "type": "bytes32"
          },
          {
            "name": "version",
            "type": "bytes1"
          }
        ],
        "name": "_signature",
        "type": "tuple"
      }
    ],
    "name": "swap",
    "outputs": [],
    "payable": true,
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_nonce",
        "type": "uint256"
      },
      {
        "name": "_expiry",
        "type": "uint256"
      },
      {
        "name": "_makerWallet",
        "type": "address"
      },
      {
        "name": "_makerParam",
        "type": "uint256"
      },
      {
        "name": "_makerToken",
        "type": "address"
      },
      {
        "name": "_takerWallet",
        "type": "address"
      },
      {
        "name": "_takerParam",
        "type": "uint256"
      },
      {
        "name": "_takerToken",
        "type": "address"
      },
      {
        "name": "_v",
        "type": "uint8"
      },
      {
        "name": "_r",
        "type": "bytes32"
      },
      {
        "name": "_s",
        "type": "bytes32"
      }
    ],
    "name": "swapSimple",
    "outputs": [],
    "payable": true,
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_nonces",
        "type": "uint256[]"
      }
    ],
    "name": "cancel",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_minimumNonce",
        "type": "uint256"
      }
    ],
    "name": "invalidate",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_delegate",
        "type": "address"
      },
      {
        "name": "_expiry",
        "type": "uint256"
      }
    ],
    "name": "authorize",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_delegate",
        "type": "address"
      }
    ],
    "name": "revoke",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  }
]
`

ipfsStoreJSON(j)
  .then(console.log)
  .catch(console.log)

module.exports = { ipfsStoreJSON, ipfsFetchJSONFromCID }
