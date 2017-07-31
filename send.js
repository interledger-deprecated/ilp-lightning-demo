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
  console.log('Getting info from lnd nodes')
  const connectorPubkeys = await util.getPubkeys([bitcoin2, litecoin2])
  console.log('Configuring plugins')

  // Configure the plugins
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

  // This test script uses the Interledger Payment Request
  // transport layer protocol. For details about this protocol see:
  // https://github.com/interledger/rfcs/blob/master/0011-interledger-payment-request/0011-interledger-payment-request.md

  // Set up the receiver to automatically fulfill incoming payments
  // corresponding to IPRs it generated
  const stopListening = await ILP.IPR.listen(receiver, {
    receiverSecret: Buffer.from('secret', 'utf8')
  }, async function ({ transfer, fulfill }) {
    console.log('Receiver got notification of prepared transfer:', transfer)
    await fulfill()
    console.log('Receiver executed incoming transfer')
  })

  // `ipr` is a buffer with the encoded IPR
  const ipr = ILP.IPR.createIPR({
    receiverSecret: Buffer.from('secret', 'utf8'),
    destinationAccount: receiver.getAccount(),
    // denominated in the ledger's base unit
    destinationAmount: '10',
  })
  console.log('Receiver created Interledger Payment Request')

  // Normally the developer using IPR would be responsible for
  // communicating the ipr from the receiver to the sender.
  // In this case we're just sending it in process
  const { packet, condition } = ILP.IPR.decodeIPR(ipr)

  // The sender gets a quote to determine the amount they need to pay
  const quote = await ILP.ILQP.quoteByPacket(sender, packet)
  console.log('Sender got quote for payment request:', quote)

  // (Should be obvious what this step does)
  await sender.sendTransfer({
    id: uuid(),
    to: quote.connectorAccount,
    amount: quote.sourceAmount,
    expiresAt: quote.expiresAt,
    executionCondition: condition,
    ilp: packet
  })
  console.log('Sender sent transfer')

  // This event tells the sender the transfer was executed
  // and gives them the fulfillment, or cryptographic proof
  sender.on('outgoing_fulfill', (transfer, fulfillment) => {
    console.log('Sender got notification that the transfer was exected')
  })
}

main().catch(err => console.log(err))

