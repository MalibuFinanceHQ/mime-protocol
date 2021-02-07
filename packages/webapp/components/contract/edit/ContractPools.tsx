import React from 'react';
import { Icon, Card, Heading, Flex, Tooltip } from 'rimble-ui';
import PropTypes, { InferProps } from 'prop-types';
import ContractPoolsTable from './ContractPoolsTable';
import { AssetRow, PoolType } from '../../../utils/types';
import { ethers } from 'ethers';

const ASSETS_LIST = [
    {
        asset: 'Eth',
        assetAddress: ethers.constants.AddressZero,
        balance: 0,
        poolType: PoolType.OPERATIONS,
    } as AssetRow,
    {
        asset: 'Eth',
        assetAddress: ethers.constants.AddressZero,
        balance: 0,
        poolType: PoolType.RELAY,
    } as AssetRow,
    {
        asset: 'Dai',
        assetAddress: '0xff795577d9ac8bd7d90ee22b6c1703490b6512fd',
        balance: 0,
        poolType: PoolType.OPERATIONS,
    } as AssetRow,
    {
        asset: 'Dai',
        assetAddress: '0xff795577d9ac8bd7d90ee22b6c1703490b6512fd',
        balance: 0,
        poolType: PoolType.RELAY,
    } as AssetRow,
] as AssetRow[];

const ContractPools = ({ contract }: InferProps<typeof props>): JSX.Element => {
    return (
        <Card width="auto" mt={25} mx="auto" px={[3, 3, 4]}>
            <Flex alignItems="center">
                <Heading>Pools</Heading>
                <Tooltip
                    message="Funds used to pay for the contract's transactions fees"
                    placement="right"
                    variant="light"
                >
                    <Icon color="primary" ml={2} name="Info" />
                </Tooltip>
            </Flex>
            <ContractPoolsTable assetsList={ASSETS_LIST} contract={contract} />
        </Card>
    );
};

const props = {
    contract: PropTypes.object.isRequired,
};

export default ContractPools;
