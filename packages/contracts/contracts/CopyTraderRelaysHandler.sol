// SPDX-License-Identifier: MIT

pragma solidity 0.7.5;

import "@openzeppelin/contracts/math/SafeMath.sol";

import "./utils/ECDSA.sol";
import "./utils/EIP155Utils.sol";
import "./utils/AbiUtils.sol";

import "./interfaces/ITradingStrategy.sol";
import "./interfaces/IABIManipulator.sol";

import "hardhat/console.sol";

abstract contract CopyTraderRelaysHandler {
    using SafeMath for uint256;

    uint256 public constant AFTER_RELAY_ERC20_TRANSFER_GAS_USAGE_APPROXIMATION =
        60000;
    uint256 public constant AFTER_RELAY_ETH_TRANSFER_GAS_USAGE_APPROXIMATION =
        21000;
    uint256 public constant AFTER_RELAY_FETCH_GAS_USAGE_APPROXIMATION = 30000;

    /**
     * @dev division base when calculating relayer reward.
     * @notice relayer fee is the gas used by the tx converted to eth,
     * and then to the requested token + a % fee, the base of that percentage is 100000.
     */
    uint256 public constant RELAYER_FEE_BASE = 100000;

    /**
     * @dev relayer fee.
     */
    uint256 public relayerFee;

    /**
     * @dev stores the hashes of relayed txns to avoid replay protection.
     */
    mapping(bytes32 => bool) public relayedTxns;

    /**
     * @dev protection against relaying multiple different transactions within the same block.
     */
    uint256 public lastRelayBlockNumber;

    /**
     * @dev allows to set the followed address nonce since txns can be relayed.
     */
    uint256 public relaySinceNonce;

    /**
     * @dev sets relayer fee.
     * @notice consider if emitting an event would make sense.
     */
    function _setRelayerFee(uint256 fee_) internal {
        relayerFee = fee_;
    }

    function _setRelaySinceNonce(uint256 nonce_) internal {
        relaySinceNonce = nonce_;
    }

    function _isRLPSignatureCorrect(
        bytes calldata transaction_,
        uint8 v_,
        bytes32 r_,
        bytes32 s_,
        address signer_
    ) internal view returns (bool, bytes32) {
        bytes32 txHash = keccak256(transaction_);
        address signer = ECDSA.recover(txHash, v_, r_, s_);
        console.log("Onchain recovered address: %s", signer);
        return (signer_ == signer, txHash);
    }

    function _relay(
        bytes calldata transaction_,
        address correctSigner_,
        ITradingStrategy followedStrategy_,
        uint8 txSigV_,
        bytes32 txSigR_,
        bytes32 txSigS_
    ) internal returns (uint256 gasUsed) {
        uint256 beforeRelayAvailableGas = gasleft();
        require(
            lastRelayBlockNumber != block.number,
            "CopyTrader:_relay, a transaction has been relayed during current block"
        );

        console.log("Onchain expected address: %s", correctSigner_);

        (bool signatureOk, bytes32 txHash) =
            _isRLPSignatureCorrect(
                transaction_,
                txSigV_,
                txSigR_,
                txSigS_,
                correctSigner_
            );

        console.logBytes32(txHash);

        require(
            signatureOk && !relayedTxns[txHash],
            "CopyTrader:_relay, invalid signature"
        );

        EIP155Utils.EIP155Transaction memory eip155tx =
            EIP155Utils.decodeEIP155Transaction(transaction_);

        require(
            eip155tx.nonce >= relaySinceNonce,
            "CopyTrader:_relay, invalid nonce"
        );

        bytes4 methodSignature = AbiUtils.extractMethodSignature(eip155tx.data);

        require(
            followedStrategy_.manipulators(eip155tx.to, methodSignature) !=
                address(0),
            "CopyTrader:_relay, relayed tx.data format is not supported by strategy"
        );

        bytes memory abiManipulated =
            IABIManipulator(
                followedStrategy_.manipulators(eip155tx.to, methodSignature)
            )
                .manipulate(eip155tx.data, address(this));

        uint256 dataLength = abiManipulated.length;
        uint256 gasLimit = eip155tx.gasLimit;
        uint256 value = eip155tx.value;
        address to = eip155tx.to;

        bool result;

        assembly {
            let x := mload(0x40)
            let d := add(abiManipulated, 32)
            result := call(gasLimit, to, value, d, dataLength, x, 0)
        }

        require(result, "CopyTrader:_relay, execution failed");
        relayedTxns[txHash] = true;
        lastRelayBlockNumber = block.number;

        return beforeRelayAvailableGas.sub(gasleft());
    }
}
