import React, { useState, useContext } from 'react';
import { Box, Modal, Button, Card, Heading } from 'rimble-ui';
import { NewContractForm } from '../utils/types';
import NewUserContractForm from './NewUserContractForm';
import { createCopyTradingContract } from '../utils/contract-creation';
import Context from '../utils/context';

const UserContractsDashboard = (): JSX.Element => {
    const ctxt = useContext(Context);

    const [isOpen, setIsOpen] = useState(false);

    const closeModal = (e: React.SyntheticEvent) => {
        e.preventDefault();
        setIsOpen(false);
    };

    const openModal = (e: React.SyntheticEvent) => {
        e.preventDefault();
        setIsOpen(true);
    };

    const handleSubmit = async (form: NewContractForm) => {
        await createCopyTradingContract(form, ctxt);
        setIsOpen(false);
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
                            <Heading.h3>Contract Creation</Heading.h3>
                            <NewUserContractForm
                                handleFormSubmit={handleSubmit}
                                handleClose={closeModal}
                            />
                        </Box>
                    </Card>
                </Modal>
            </Box>
        </Box>
    );
};

export default UserContractsDashboard;
