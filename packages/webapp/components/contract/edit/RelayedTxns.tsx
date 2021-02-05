import React from 'react';
import PropTypes, { InferProps } from 'prop-types';
import { Box, Table, Heading, Link } from 'rimble-ui';
import { TransactionRow } from '../../../utils/types';

const RelayedTxns = ({
    txnsList = [],
}: InferProps<typeof props>): JSX.Element => {
    return (
        <Box>
            <Heading mt={25}>Relayed Transactions</Heading>
            <Table mt={25}>
                <thead>
                    <tr>
                        <th>Transaction hash</th>
                        <th>To</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    {txnsList.map(({ hash, to, created }: TransactionRow) => (
                        <tr key={hash}>
                            <td>
                                <Link
                                    href={`https://kovan.etherscan.io/tx/${hash}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    title="View on Etherscan"
                                    style={{ textDecoration: 'underline' }}
                                >
                                    {hash}
                                </Link>
                            </td>
                            <td>
                                <Link
                                    href={`https://kovan.etherscan.io/address/${to}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    title="View on Etherscan"
                                    style={{ textDecoration: 'underline' }}
                                >
                                    {to}
                                </Link>
                            </td>
                            <td>{created}</td>
                            <td></td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </Box>
    );
};

const props = {
    txnsList: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default RelayedTxns;
