'use strict'

const util = require('./util')

const bitcoin1 = process.env.BITCOIN_LND_1 || 'localhost:11009'
const bitcoin2 = process.env.BITCOIN_LND_2 || 'localhost:12009'
const litecoin1 = process.env.LITECOIN_LND_1 || 'localhost:11010'
const litecoin2 = process.env.LITECOIN_LND_2 || 'localhost:12010'

async function main () {
  const pubkeys = await util.getPubkeys([bitcoin1, litecoin1])

  // Set up environment variables
  process.env.CONNECTOR_PORT='9000'
  process.env.CONNECTOR_MAX_HOLD_TIME='1000'
  process.env.CONNECTOR_BACKEND='fixerio-plus-coinmarketcap'
  process.env.CONNECTOR_FX_SPREAD='0'
  process.env.DB_URI='sqlite://:memory:'

  // Plugin configuration
  process.env.CONNECTOR_LEDGERS=`
  {
    "g.bitcoin.lightning.": {
      "currency": "BTC",
      "plugin": "ilp-plugin-lightning",
      "store": true,
      "options": {
        "peerPublicKey": "${pubkeys[0]}",
        "lndUri": "${bitcoin2}",
        "rpcUri": "http://localhost:9001/rpc",
        "maxUnsecured": "1000",
        "maxBalance": "10000000",
        "authToken": "token"
      }
    },
    "test.litecoin.lightning.": {
      "currency": "LTC",
      "plugin": "ilp-plugin-lightning",
      "store": true,
      "options": {
        "peerPublicKey": "${pubkeys[1]}",
        "lndUri": "${litecoin2}",
        "rpcUri": "http://localhost:9002/rpc",
        "maxUnsecured": "1000",
        "maxBalance": "10000000",
        "authToken": "token"
      }
    }
  }`

  // Runs the connector using the lightning plugins
  require('connector-rpc')
}

main().catch(err => console.log(err))
