'use strict'

const ILP = require('ilp')
const LightningPlugin = require('ilp-plugin-lightning')
const shared = require('ilp-plugin-shared')
const uuid = require('uuid')
const util = require('./util')

const bitcoin1 = process.env.BITCOIN_LND_1 || 'localhost:11009'
const bitcoin2 = process.env.BITCOIN_LND_2 || 'localhost:12009'
const litecoin1 = process.env.LITECOIN_LND_1 || 'localhost:11010'
const litecoin2 = process.env.LITECOIN_LND_2 || 'localhost:12010'

async function main () {
  const connectorPubkeys = await util.getPubkeys([bitcoin2, litecoin2])

  const sender = new LightningPlugin({
    peerPublicKey: connectorPubkeys[0],
    lndUri: bitcoin1,
    rpcUri: 'http://localhost:9000/rpc',
    maxUnsecured: '1000',
    maxBalance: '10000000',
    _store: new shared.ObjStore(),
    authToken: 'token'
  })
  const receiver = new LightningPlugin({
    peerPublicKey: connectorPubkeys[1],
    lndUri: litecoin1,
    rpcUri: 'http://localhost:9000/rpc',
    maxUnsecured: '1000',
    maxBalance: '10000000',
    _store: new shared.ObjStore(),
    authToken: 'token'
  })

  util.rpcify(sender, 9001)
  util.rpcify(receiver, 9002)

  const stopListening = await ILP.IPR.listen(receiver, {
    receiverSecret: Buffer.from('secret', 'utf8')
  }, async function ({ transfer, fulfill }) {
    console.log('got transfer:', transfer)

    console.log('claiming incoming funds...')
    await fulfill()
    console.log('funds received!')
  })

  // `ipr` is a buffer with the encoded IPR
  const ipr = ILP.IPR.createIPR({
    receiverSecret: Buffer.from('secret', 'utf8'),
    destinationAccount: receiver.getAccount(),
    // denominated in the ledger's base unit
    destinationAmount: '10',
  })

  // Note the user of this module must implement the method for communicating
  // packet and condition from the recipient to the sender.

  // In practice, The rest of this example would happen on the sender's side.

  const { packet, condition } = ILP.IPR.decodeIPR(ipr)
  const quote = await ILP.ILQP.quoteByPacket(sender, packet)
  console.log('got quote:', quote)

  await sender.sendTransfer({
    id: uuid(),
    to: quote.connectorAccount,
    amount: quote.sourceAmount,
    expiresAt: quote.expiresAt,
    executionCondition: condition,
    ilp: packet
  })

  sender.on('outgoing_fulfill', (transfer, fulfillment) => {
    console.log(transfer.id, 'was fulfilled with', fulfillment)
  })
}

main().catch(err => console.log(err))

