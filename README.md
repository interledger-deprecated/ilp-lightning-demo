# BTC -> LTC Lightning Demo
> Send payments between Lightning Networks using Interledger

This demo sends payments between instances of the [Lightning Network](https://lightning.network) on Bitcoin and Litecoin using an [Interledger Connector](https://github.com/interledgerjs/ilp-connector) and the [Lightning Ledger Plugin](https://github.com/interledgerjs/ilp-plugin-lightning).

## Prerequisites

- Node.js >= v7.10.0
- Docker (only to run local Lightning nodes)

## Running the Demo

### 0. Set Up Lightning Networks

_You can skip this step if you already have 2 lightning nodes setup on the Bitcoin Lightning Network and 2 on the Litecoin Lightning Network._

The following uses BitFury's [`simple-simnet`](https://github.com/BitfuryLightning/simple-simnet) to run local testnets and Lightning daemons for both Bitcoin and Litecoin.

Let's begin with starting the Bitcoin testnet.

```sh
git clone https://github.com/BitfuryLightning/simple-simnet
cd simple-simnet/bitcoin
build.sh && start.sh
```

Now let's start the Litecoin testnet. Open a new terminal window and switch into folder `simple-simnet` created in the previous step. Then, run the following commands:

```sh
cd <your-simple-simnet-folder>/litecoin
build.sh && start.sh
```

### 1. Run an Interledger Connector

This will run a connector and automatically configure it to connect to the `lnd` nodes started in the previous step.

```sh
git clone https://github.com/interledgerjs/ilp-lightning-demo
cd ilp-lightning-demo
npm install
node run-connector.js
```

To configure the connector to use different `lnd` nodes, set the environment variables `BITCOIN_LND_1`, `BITCOIN_LND_2`, `LITECOIN_LND_1`, `LITECOIN_LND_2` to those `lnd` nodes' RPC endpoints.

### 2. Send a Payment

From another terminal run the following to send a payment from one of the Bitcoin `lnd` nodes to a Litecoin `lnd` node.

```sh
node send.js
```

(Run with the environment variable `DEBUG=ilp*` to see additional details of what is happening.)

## How it Works

Interledger is a protocol for connecting payment networks or _ledgers_.

_Connectors_ use [ledger plugins](https://interledger.org/rfcs/0004-ledger-plugin-interface/) to connect to different types of ledgers. This demo uses [`ilp-plugin-lightning`](https://github.com/interledgerjs/ilp-plugin-lightning) to send payments through instances of the Lightning Network.

The [Interledger packet](https://interledger.org/rfcs/0003-interledger-protocol/) is attached to transfers across individual ledgers and instructs connectors where to forward payments. [Hashed-Timelock _Agreements_ (HTLAs)](https://github.com/interledger/rfcs/blob/master/0022-hashed-timelock-agreements/0022-hashed-timelock-agreements.md), a generalization of HTLCs, are used to secure Interledger payments.

For more information on Interledger, see [interledger.org](https://interledger.org) or the [Interledger RFCs](https://github.com/interledger/rfcs) for the protocol specs.
