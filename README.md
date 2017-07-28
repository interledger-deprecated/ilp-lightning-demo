# BTC -> LTC Lightning Demo
> Send payments between Lightning Networks using Interledger

Interledger is a protocol for sending payments across different types of payment networks.

This demo uses an Interledger Connector and the Lightning Network Ledger Plugin to send payments between instances of the Lightning Network on Bitcoin and Litecoin.

## Prerequisites

- Node.js >= v7.10.0
- Docker (only to run local Lightning nodes)

## Running the Demo

### 1. Set Up Lightning Networks

_You can skip this step if you already have 2 `lnd`s setup on the Bitcoin Lightning Network and 2 on the Litecoin Lightning Network._


```sh
git clone https://github.com/BitfuryLightning/simple-simnet
cd simple-simnet
./bitcoin/build.sh
./litcoin/build.sh
./bitcoin/start.sh &
./litecoin/start.sh &
```

### 2. Run an Interledger Connector

From this directory:

```sh
node run-connector.js
```

The connector will automatically connect to the simnet `lnd`s started in the instructions above. To configure it to connect to other `lnd`s, set the environment variables `BITCOIN_LND_1`, `BITCOIN_LND_2`, `LITECOIN_LND_1`, `LITECOIN_LND_2`.

### 3. Send a Payment

```sh
node send.js
```

(Run with the environment variable `DEBUG=ilp*` to see additional details of what is happening.)

## How it Works

Connectors [ledger plugins](https://github.com/interledger/rfcs/blob/master/0004-ledger-plugin-interface/0004-ledger-plugin-interface.md) to connect to different types of ledgers. A simple packet format instructs connectors where to forward payments. [Hashed-Timelock _Agreements_ (HTLAs)](https://github.com/interledger/rfcs/blob/master/0022-hashed-timelock-agreements/0022-hashed-timelock-agreements.md), a generalization of HTLCs, are used to secure Interledger payments.

For more information on Interledger, see [interledger.org](https://interledger.org) or the [Interledger RFCs](https://github.com/interledger/rfcs/0001-interledger-architecture/0001-interledger-architecture.md) for the protocol specs.
