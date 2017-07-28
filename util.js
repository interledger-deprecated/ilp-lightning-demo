'use strict'

const grpc = require('grpc')
const path = require('path')
const App = require('koa')
const Router = require('koa-router')
const BodyParser = require('koa-bodyparser')

const protoPath = path.join(__dirname, 'node_modules', 'ilp-plugin-lightning', 'src', 'rpc.proto')
const lnrpcDescriptor = grpc.load(protoPath)
const lnrpc = lnrpcDescriptor.lnrpc

exports.getPubkeys = function getPubkeys (lndUris) {
  const pubkeyPromises = lndUris.map((lndUri) =>
    new Promise((resolve, reject) => {
      const lnd = new lnrpc.Lightning(lndUri, grpc.credentials.createInsecure())
      lnd.getInfo({}, (err, info) => {
        if (err) {
          return reject(err)
        }
        resolve(info.identity_pubkey)
      })
    }))
  return Promise.all(pubkeyPromises)
}

exports.rpcify = function rpcify (plugin, port) {
  const rpc = Router()
  rpc.post('/rpc', async function (ctx) {
    ctx.body = await plugin.receive(
      ctx.query.method,
      ctx.request.body)
  })

  return new App()
    .use(BodyParser())
    .use(rpc.routes())
    .use(rpc.allowedMethods())
    .listen(port)
}
