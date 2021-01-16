pragma solidity 0.7.5;
pragma abicoder v2;

import "./RLPReader.sol";

library EIP155Utils {
    struct EIP155Transaction {
        uint256 nonce;
        uint256 gasPrice;
        uint256 gasLimit;
        address to;
        uint256 value;
        bytes data;
        uint256 chainId;
    }

    function decodeEIP155Transaction(bytes memory _transaction)
        internal
        pure
        returns (EIP155Transaction memory _decoded)
    {
        Lib_RLPReader.RLPItem[] memory decoded =
            Lib_RLPReader.readList(_transaction);

        return
            EIP155Transaction({
                nonce: Lib_RLPReader.readUint256(decoded[0]),
                gasPrice: Lib_RLPReader.readUint256(decoded[1]),
                gasLimit: Lib_RLPReader.readUint256(decoded[2]),
                to: Lib_RLPReader.readAddress(decoded[3]),
                value: Lib_RLPReader.readUint256(decoded[4]),
                data: Lib_RLPReader.readBytes(decoded[5]),
                chainId: Lib_RLPReader.readUint256(decoded[6])
            });
    }
}
