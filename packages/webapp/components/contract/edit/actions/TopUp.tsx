import React, { useState, useEffect } from 'react';
import PropTypes, { InferProps } from 'prop-types';
import { parseEther } from 'ethers/lib/utils';
import {
    Box,
    Heading,
    Input,
    Form,
    Field,
    Button,
    Select,
    ToastMessage,
} from 'rimble-ui';
import { CopyTrader } from '../../../../typechain';
import { AssetAction } from '../../../../utils/types';

const TopUp = ({
    curAction,
    contract,
    closeModal,
}: InferProps<typeof props>): JSX.Element => {
    const [formValidated, setFormValidated] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [selectValue, setSelectValue] = useState('');
    const [txState, setTxState] = useState('none');

    const [validated, setValidated] = useState(false);

    const validateInput = (e: React.ChangeEvent<HTMLElement>) => {
        const parent = e.target.parentNode as Element;
        parent.classList.add('was-validated');
    };

    const regex = new RegExp(/^\d+$/);
    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
        if (
            true
            // regex.test(e.target.value) &&
            // Number.isInteger(parseInt(e.target.value, 10))
        ) {
            validateInput(e);
        } else {
            const parent = e.target.parentNode as Element;
            parent.classList.remove('was-validated');
        }
    };

    const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectValue(e.target.value);
        validateInput(e);
    };

    const validateForm = () => {
        if (
            inputValue.length > 0 &&
            // regex.test(inputValue) &&
            // Number.isInteger(parseInt(inputValue, 10)) &&
            selectValue.length > 0
        ) {
            setValidated(true);
            setFormValidated(true);
        } else {
            setValidated(false);
            setFormValidated(false);
        }
    };

    const handleSubmit = async (e: React.SyntheticEvent) => {
        try {
            e.preventDefault();
            console.log('Proceeding deposit w/', inputValue, selectValue);
            // console.log('contract', contract);
            const action = curAction as AssetAction;
            const charges = [
                {
                    asset: action.ar.assetAddress,
                    value: parseEther(inputValue),
                },
            ];
            console.log('poolType', action.ar);
            const chargedPools = [selectValue === 'RELAY' ? 0 : 1];
            console.log('charges', charges);
            console.log('chargedPools', chargedPools);
            console.log('parsed amount in wei', parseEther(inputValue));
            setTxState('pending');
            const tx = await (contract as CopyTrader).chargePools(
                charges,
                chargedPools,
                {
                    value:
                        action.ar.asset === 'Eth' ? parseEther(inputValue) : 0,
                },
            );
            const receipt = await tx.wait();
            setTxState('complete');
            console.log('receipt', receipt);
            setTimeout(() => {
                setTxState('none');
                closeModal(e);
            }, 1000);
        } catch (err) {
            if (err) console.error(err);
            setTxState('fail');
            setTimeout(() => setTxState('none'), 3000);
        }
    };

    useEffect(() => {
        validateForm();
    });

    const action = curAction as AssetAction;

    return (
        <Box>
            <Form onSubmit={handleSubmit} validated={formValidated}>
                <Box p={4} mb={3}>
                    <Heading.h3>{`${action.actionName} ${action.ar.asset} balance`}</Heading.h3>

                    <Field
                        mt={25}
                        label="Amount to add"
                        validated={validated}
                        width={1}
                    >
                        <Input
                            type="text"
                            required
                            onChange={handleInput}
                            placeholder={`${action.ar.asset} amount`}
                            value={inputValue}
                            width={1}
                        />
                    </Field>

                    <Field label="Pool Type" validated={validated} width={1}>
                        <Select
                            options={[
                                { value: '', label: '' },
                                { value: 'OPERATIONS', label: 'Operations' },
                                { value: 'RELAY', label: 'Relay' },
                            ]}
                            value={selectValue}
                            onChange={handleSelect}
                            required
                            width={1}
                        />
                    </Field>
                    <Button
                        icon="AccountBalanceWallet"
                        width={[1, 'auto', 'auto']}
                        mr={3}
                        disabled={!formValidated}
                    >
                        Add funds
                    </Button>
                </Box>
            </Form>
            {txState === 'pending' ? (
                <ToastMessage.Processing
                    message={'Processing the deposit transaction'}
                    my={3}
                />
            ) : (
                ''
            )}
            {txState === 'complete' ? (
                <ToastMessage icon="Mood" message={'Deposit complete'} my={3} />
            ) : (
                ''
            )}
            {txState === 'fail' ? (
                <ToastMessage.Failure message={'Deposit failed'} my={3} />
            ) : (
                ''
            )}
        </Box>
    );
};

const props = {
    curAction: PropTypes.object.isRequired,
    contract: PropTypes.object.isRequired,
    closeModal: PropTypes.func.isRequired,
};

export default TopUp;
