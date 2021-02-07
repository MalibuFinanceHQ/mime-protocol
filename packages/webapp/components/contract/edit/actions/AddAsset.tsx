import React, { useState, useEffect } from 'react';
import PropTypes, { InferProps } from 'prop-types';
import { Box, Heading, Input, Form, Field, Button, Select } from 'rimble-ui';
// import { CopyTrader } from '../../../../typechain';
// import { BigNumber } from 'ethers';
// import { PoolType, AssetAction } from '../../../../utils/types';

// TODo: validate address using utils.isAddress from ethers.js

const AddAsset = ({
    curAction,
    contract,
}: InferProps<typeof props>): JSX.Element => {
    const [formValidated, setFormValidated] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [inputAddress, setInputAddress] = useState('');

    const [selectValue, setSelectValue] = useState('');

    const [validated, setValidated] = useState(false);

    const validateInput = (e) => {
        e.target.parentNode.classList.add('was-validated');
    };

    const handleInput = (e) => {
        setInputValue(e.target.value);
        if (e.target.value) {
            validateInput(e);
        } else {
            const parent = e.target.parentNode as Element;
            parent.classList.remove('was-validated');
        }
    };

    const handleInputAddress = (e) => {
        setInputAddress(e.target.value);
        if (e.target.value) {
            validateInput(e);
        } else {
            const parent = e.target.parentNode as Element;
            parent.classList.remove('was-validated');
        }
    };

    const handleSelect = (e) => {
        setSelectValue(e.target.value);
        validateInput(e);
    };

    const validateForm = () => {
        if (
            inputValue.length > 0 &&
            inputAddress.length > 0 &&
            selectValue.length > 0
        ) {
            setValidated(true);
            setFormValidated(true);
        } else {
            setValidated(false);
            setFormValidated(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(
            'Proceeding add asset w/',
            inputValue,
            inputAddress,
            selectValue,
        );
        // console.log('contract', contract);
        // const action = curAction as AssetAction;
        // await (contract as CopyTrader).chargePools(charges, chargedPools);
    };

    useEffect(() => {
        validateForm();
    });
    // const action = curAction as AssetAction;
    return (
        <Form onSubmit={handleSubmit} validated={formValidated}>
            <Box p={4} mb={3}>
                <Heading.h3>Add asset</Heading.h3>

                <Field mt={25} label="Name" validated={validated} width={1}>
                    <Input
                        type="text"
                        required
                        onChange={handleInput}
                        placeholder={`e.g. Btc`}
                        value={inputValue}
                        width={1}
                    />
                </Field>

                <Field mt={25} label="Address" validated={validated} width={1}>
                    <Input
                        type="text"
                        required
                        onChange={handleInputAddress}
                        placeholder={`e.g. 0x00`}
                        value={inputAddress}
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
                    Add asset
                </Button>
            </Box>
        </Form>
    );
};

const props = {
    curAction: PropTypes.object.isRequired,
    contract: PropTypes.object.isRequired,
};

export default AddAsset;
