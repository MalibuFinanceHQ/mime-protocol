import React, { useContext, useState } from 'react';
import PropTypes, { InferProps } from 'prop-types';
import { BigNumber } from 'ethers';
import { Table, Icon, Flex, Button, Link, Tooltip } from 'rimble-ui';
import ContractPoolsTableModal from './ContractPoolsTableModal';
import { AssetRow, AssetAction, PoolType } from '../../../utils/types';
import Context from '../../../utils/context';

const ContractPoolsTable = ({
    assetsList = [],
    contract,
}: InferProps<typeof props>): JSX.Element => {
    const dispatchActionModal = (
        actionName: string,
        ar: AssetRow | AssetRow[],
    ) => {
        setCurAction({
            actionName,
            ar,
        } as AssetAction);
        setIsOpen(true);
    };

    const [isOpen, setIsOpen] = useState(false);
    const [curAction, setCurAction] = useState(null);
    console.log('contract', contract?.address);
    const ctxt = useContext(Context);
    console.log(ctxt.contracts);
    let assets = assetsList;
    if (contract?.address) {
        assets = assetsList.map((asset: AssetRow) => {
            let balance = 0;
            const c = ctxt.contracts.find(
                (c) => c.address === contract.address,
            );
            if (!c) {
                return {
                    ...asset,
                    balance,
                };
            }
            let hexBalance: string | undefined;
            if (asset.poolType === PoolType.OPERATIONS) {
                // @ts-ignore
                hexBalance = c.operationsPoolsBalances[asset.assetAddress];
                balance = hexBalance
                    ? BigNumber.from(hexBalance).toNumber()
                    : 0;
            } else if (asset.poolType === PoolType.RELAY) {
                // @ts-ignore
                hexBalance = c.relayPoolsBalances[asset.assetAddress];
                balance = hexBalance
                    ? BigNumber.from(hexBalance).toNumber()
                    : 0;
            }
            return {
                ...asset,
                balance,
            };
        });
    }

    return (
        <>
            <Table mt={25}>
                <thead>
                    <tr>
                        <th>Ticker</th>
                        <th>Asset address</th>
                        <th>Balance</th>
                        <th>Pool type</th>
                        <th>Deposit/Withdraw</th>
                    </tr>
                </thead>
                <tbody>
                    {(assets as AssetRow[]).map((ar: AssetRow) => (
                        <tr key={ar.assetAddress}>
                            <td>
                                <Tooltip
                                    message={ar.asset}
                                    variant="light"
                                    placement="right"
                                >
                                    <Icon name={ar.asset} />
                                </Tooltip>
                            </td>
                            <td>
                                <Link
                                    href={`https://kovan.etherscan.io/address/${ar.assetAddress}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    title="View on Etherscan"
                                    style={{ textDecoration: 'underline' }}
                                >
                                    {ar.assetAddress}
                                </Link>
                            </td>
                            <td>{ar.balance}</td>
                            <td>
                                {ar.poolType === PoolType.OPERATIONS
                                    ? 'OPERATIONS'
                                    : 'RELAY'}
                            </td>
                            <td>
                                <Flex alignItems="center">
                                    <Button
                                        size="small"
                                        icon="Add"
                                        width={[1, 'auto', 'auto']}
                                        mr={3}
                                        onClick={() =>
                                            dispatchActionModal('Top up', ar)
                                        }
                                    >
                                        Add
                                    </Button>

                                    <Button.Outline
                                        size="small"
                                        icon="Remove"
                                        mr={3}
                                        onClick={() =>
                                            dispatchActionModal('Withdraw', ar)
                                        }
                                    >
                                        Remove
                                    </Button.Outline>
                                </Flex>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
            {/* <Button
                mt={25}
                icon="AddCircle"
                width={[1, 'auto', 'auto']}
                mr={3}
                onClick={() =>
                    dispatchActionModal('Add asset', assetsList as AssetRow[])
                }
            >
                Add asset
            </Button> */}
            <ContractPoolsTableModal
                isOpen={isOpen}
                curAction={curAction}
                closeModal={() => {
                    setCurAction(null);
                    setIsOpen(false);
                }}
                contract={contract}
            />
        </>
    );
};

const props = {
    assetsList: PropTypes.arrayOf(PropTypes.object).isRequired,
    contract: PropTypes.any.isRequired,
};

export default ContractPoolsTable;
