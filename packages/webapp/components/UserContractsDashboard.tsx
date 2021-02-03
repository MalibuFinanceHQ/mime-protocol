import React, { useState, useContext } from 'react';
import { Box, Modal, Button, Card, Heading, Loader } from 'rimble-ui';
import { NewContractForm } from '../utils/types';
import NewUserContractForm from './NewUserContractForm';
import { createCopyTradingContract } from '../utils/contract-creation';
import Context from '../utils/context';

const UserContractsDashboard = (): JSX.Element => {
    const ctxt = useContext(Context);

    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const closeModal = (e: React.SyntheticEvent) => {
        e.preventDefault();
        setIsOpen(false);
    };

    const openModal = (e: React.SyntheticEvent) => {
        e.preventDefault();
        setIsOpen(true);
    };

    const handleSubmit = async (form: NewContractForm) => {
        const tx = await createCopyTradingContract(form, ctxt);
        console.log('new CopyTradingContract tx', tx);
        setIsLoading(true);
        const receipt = await tx.wait();
        console.log('new CopyTradingContract tx receipt', receipt);
        setIsOpen(false);
        setIsLoading(false);
    };

    return (
        <Box className="App" p={4}>
            <Box>
                <Button onClick={openModal}>Create a new contract</Button>
                <Modal isOpen={isOpen}>
                    <Card width="420px" p={0}>
                        <Button.Text
                            icononly
                            icon="Close"
                            color="moon-gray"
                            position="absolute"
                            top={0}
                            right={0}
                            mt={3}
                            mr={3}
                            onClick={closeModal}
                        />

                        <Box p={4} mb={3}>
                            <Heading.h3>{`${
                                !isLoading
                                    ? 'Contract Creation'
                                    : 'Waiting for confirmation...'
                            }`}</Heading.h3>
                            {!isLoading ? (
                                <NewUserContractForm
                                    handleFormSubmit={handleSubmit}
                                    handleClose={closeModal}
                                />
                            ) : (
                                <Loader mx="auto" mt={25} size={80} />
                            )}
                        </Box>
                    </Card>
                </Modal>
            </Box>
        </Box>
    );
};

export default UserContractsDashboard;
