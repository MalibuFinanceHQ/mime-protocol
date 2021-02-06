import React, { useState, useEffect } from 'react';
import {
    Button,
    Box,
    Flex,
    Form,
    Input,
    Field,
    ToastMessage,
    Select,
} from 'rimble-ui';
import { ethers, utils } from 'ethers';
import PropTypes, { InferProps } from 'prop-types';
import { CopyTrader } from '../../../typechain';

const ContractEditForm = ({
    contract,
    observedAddres,
    updateObservedAddress,
}: InferProps<typeof props>): JSX.Element => {
    const [validated, setValidated] = useState(false);
    const [inputValue, setInputValue] = useState(observedAddres);
    const [selectValue, setSelectValue] = useState('Eth');
    const [txState, setTxState] = useState('none');
    const [feesPaymentAsset, setFeesPaymentAsset] = useState(null);

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

            // Update fees asset if needed
            if (selectValue !== feesPaymentAsset) {
                setTxState('pending');

                const receipt = await (contract as CopyTrader).setFeesPaymentsAsset(
                    selectValue,
                );
                await receipt.wait();
                console.log('setFeesPaymentsAsset receipt', receipt);
                setFeesPaymentAsset(selectValue);

                setTxState('complete');
            }

            // Follow if needed
            if (inputValue !== observedAddres) {
                setTxState('pending');

                const receipt = await (contract as CopyTrader).follow(
                    inputValue,
                );
                await receipt.wait();
                console.log('follow receipt', receipt);

                updateObservedAddress(inputValue);

                setTxState('complete');
            }

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

    const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectValue(e.target.value);
        validateInput(e);
    };

    const initFeesPaymentAsset = async () => {
        const contractFeesPaymentAsset = await (contract as CopyTrader).feesPaymentsAsset();
        console.log('contractFeesPaymentAsset ->', contractFeesPaymentAsset);
        setSelectValue(contractFeesPaymentAsset);
        setFeesPaymentAsset(contractFeesPaymentAsset);
    };

    useEffect(() => {
        validateForm();
        if (!feesPaymentAsset) initFeesPaymentAsset();
    }, [inputValue, contract, feesPaymentAsset]);

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

                <Field
                    label="Asset used to pay transaction fees"
                    validated={validated}
                    width={1}
                >
                    <Select
                        options={[
                            {
                                value: ethers.constants.AddressZero,
                                label: 'Eth',
                            },
                            {
                                value:
                                    '0x6354B18b6ED52FBdC8abcD3fFbc65565cbfa8364',
                                label: 'Dai',
                            },
                        ]}
                        value={selectValue}
                        onChange={handleSelect}
                        required
                        width={1}
                        selected={'aave'}
                    />
                </Field>
                <Flex alignItems="center">
                    <Button
                        icon="Save"
                        width={[1, 'auto', 'auto']}
                        mr={3}
                        disabled={
                            (txState !== 'none' &&
                                selectValue === feesPaymentAsset) ||
                            (inputValue === observedAddres &&
                                selectValue === feesPaymentAsset)
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
