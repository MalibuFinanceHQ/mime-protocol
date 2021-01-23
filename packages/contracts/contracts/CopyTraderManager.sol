// SPDX-License-Identifier: MIT
pragma solidity 0.7.5;

abstract contract CopyTraderManager {
    /**
     * @dev emitted when the manager is changed.
     */
    event ManagerSet(address previous, address current);

    /**
     * @dev address allowed to manage the contract.
     */
    address public manager;

    /**
     * @dev Allows to set the contract manager.
     * @notice Change is allowed when contract is still not initialized or msg.sender is the current manager.
     * @param manager_ - manager to be set.
     */
    function setManager(address manager_) external {
        require(
            manager == address(0) || msg.sender == manager,
            "CopyTraderManager:setManager, permission denied"
        );
        emit ManagerSet(manager, manager_);
        manager = manager_;
    }

    /**
     * @dev checks if msg.sender is manager, if not reverts.
     */
    modifier onlyManager() {
        require(msg.sender == manager, "CopyTraderManager, permission denied");
        _;
    }
}
