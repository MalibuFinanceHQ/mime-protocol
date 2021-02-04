import React from 'react';
import PropTypes, { InferProps } from 'prop-types';
import Link from 'next/link';
import { Table, Button } from 'rimble-ui';
import { CopyTradingContract } from '../utils/types';

const UserContractsTable = ({
    contractsList = [],
}: InferProps<typeof props>): JSX.Element => {
    return (
        <Table>
            <thead>
                <tr>
                    <th>Contract address</th>
                    <th>Followed address</th>
                    <th>Date</th>
                    <th>Contract</th>
                </tr>
            </thead>
            <tbody>
                {contractsList.map(
                    ({
                        address,
                        observedAddress,
                        created,
                    }: CopyTradingContract) => (
                        <tr key={address}>
                            <td>{address}</td>
                            <td>{observedAddress}</td>
                            <td>{created}</td>
                            <td>
                                <Link href={`contracts/${address}`}>
                                    <Button>View</Button>
                                </Link>
                            </td>
                        </tr>
                    ),
                )}
            </tbody>
        </Table>
    );
};

const props = {
    contractsList: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default UserContractsTable;
