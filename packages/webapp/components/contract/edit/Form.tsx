import React, { useState, useEffect } from 'react';
import { Button, Box, Flex, Form, Input, Field, ToastMessage } from 'rimble-ui';
import { utils } from 'ethers';
import PropTypes, { InferProps } from 'prop-types';
import { CopyTrader } from '../../../typechain';

const ContractEditForm = ({
    contract,
    observedAddres,
    updateObservedAddress,
}: InferProps<typeof props>): JSX.Element => {
    const [validated, setValidated] = useState(false);
    const [inputValue, setInputValue] = useState(observedAddres);
    const [txState, setTxState] = useState('none');

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const target = e.target as HTMLInputElement;
        setInputValue(target.value);
        if (utils.isAddress(target.value)) {
            validateInput(e);
        } else {
            const parent = e.target.parentNode as Element;
            parent.classList.remove('was-validated');
        }
    };

    const validateInput = (e: React.ChangeEvent<HTMLElement>) => {
        const parent = e.target.parentNode as Element;
        parent.classList.add('was-validated');
    };

    const validateForm = () =>
        setValidated(utils.isAddress(inputValue as string));

    const handleSubmit = async (e: React.SyntheticEvent) => {
        try {
            e.preventDefault();
            setTxState('pending');
            const receipt = await (contract as CopyTrader).follow(inputValue);
            await receipt.wait();
            console.log('follow receipt', receipt);
            setTxState('complete');
            updateObservedAddress(inputValue);
            setTimeout(() => setTxState('none'), 3000);
        } catch (err) {
            if (err) console.error(err);
            setTxState('fail');
            setTimeout(() => setTxState('none'), 3000);
        }
    };

    const handleLock = (e: React.SyntheticEvent) => {
        e.preventDefault();
        console.log('handleLock');
    };

    useEffect(() => {
        validateForm();
    }, [inputValue, contract]);

    return (
        <Box mt={25}>
            <Form onSubmit={handleSubmit} validated={validated}>
                <Field label="Followed address" validated={validated} width={1}>
                    <Input
                        type="text"
                        required
                        onChange={handleInput}
                        value={inputValue}
                        width={1}
                    />
                </Field>
                <Flex alignItems="center">
                    <Button
                        icon="Save"
                        width={[1, 'auto', 'auto']}
                        mr={3}
                        disabled={
                            txState !== 'none' || inputValue === observedAddres
                        }
                    >
                        Update contract
                    </Button>

                    <Button.Outline
                        icon="Lock"
                        mr={3}
                        variant="danger"
                        onClick={handleLock}
                    >
                        Lock contract
                    </Button.Outline>
                </Flex>
            </Form>
            {txState === 'pending' ? (
                <ToastMessage.Processing
                    message={'Processing the update transaction'}
                    my={3}
                />
            ) : (
                ''
            )}
            {txState === 'complete' ? (
                <ToastMessage
                    icon="Mood"
                    message={'Transaction complete'}
                    my={3}
                />
            ) : (
                ''
            )}
            {txState === 'fail' ? (
                <ToastMessage.Failure message={'Transaction failed'} my={3} />
            ) : (
                ''
            )}
        </Box>
    );
};

const props = {
    contract: PropTypes.object.isRequired,
    observedAddres: PropTypes.string.isRequired,
    updateObservedAddress: PropTypes.func.isRequired,
};

export default ContractEditForm;
