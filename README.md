# Mime Protocol.
Mime enables it's users to copy transactions made by an external ethereum address.

## How it works - overview.
1. Alice "follows" Bob's address by deploying a smart contract.
2. Bob makes transaction(ex. deposits DAI on AAVE).
3. Bob's tx is included in block.
4. Alice's contract deposits it's DAI on AAVE.

## How are transactions copied?
When deploying a smart contract a "strategy" must be set. The strategy is a contract containing a set of ABI encoded method calls manipulators.

## Step by step flow explainer.
1. A strategy with ABI manipulators set for certain methods identifiers is deployed.
2. Alice follows Bob and provides a valid strategy.
3. Alice deposits funds to she's contract.
4. Bob makes a transaction.
5. The transaction is catched by Mime.
6. Mime checks if the transaction fits any manipulator defined in strategy.
7. Mime gets Bob's transaction data and submits it Alice's smart contract.
8. Alice's smart contract verifies Bob's signature.
9. Alice's smart contract checks if Bob's tx fits in strategy.
10. Alice's contract manipulates the transaction.
11. Alice's contract makes a delegatecall.
12. Alice's contract refunds mime protocol for used gas.

## Supported protocols.
1. ERC20 approve.
2. AAVE deposits.

## Integrations roadmap.
1. Pods.finance.
2. Uniswap.
3. SushiSwap.
4. 1inch.
5. Yearn.

## Demo
mimeprotocol.com


![alt text](https://github.com/codyx/ethglobal-hackathon-project/blob/master/.github/eth-tx-copy-v1.png?raw=true)
