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
        balance: 4.25,
        poolType: PoolType.OPERATIONS,
    } as AssetRow,
    {
        asset: 'Dai',
        assetAddress: '0x6354B18b6ED52FBdC8abcD3fFbc65565cbfa8364',
        balance: 5,
        poolType: PoolType.OPERATIONS,
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
