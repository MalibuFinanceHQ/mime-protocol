import React, { useState, useEffect } from 'react';
import { Button, Box, Form, Input, Select, Field, Flex } from 'rimble-ui';
import PropTypes, { InferProps } from 'prop-types';
import { utils } from 'ethers';
import { NewContractForm, StrategyEntity } from '../utils/types';

const NewUserContractForm = ({
    handleFormSubmit,
    handleClose,
}: InferProps<typeof props>): JSX.Element => {
    const [validated, setValidated] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [selectValue, setSelectValue] = useState('');
    const [strategies, setStrategies] = useState([]);
    const [inputStrategy, setInputStrategy] = useState('');

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

    const handleInputStrategy = (e: React.ChangeEvent<HTMLInputElement>) => {
        const target = e.target as HTMLInputElement;
        setInputStrategy(target.value);
        if (utils.isAddress(target.value)) {
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

    const validateInput = (e: React.ChangeEvent<HTMLElement>) => {
        const parent = e.target.parentNode as Element;
        parent.classList.add('was-validated');
    };

    const validateForm = () => {
        setValidated(
            utils.isAddress(inputValue) && utils.isAddress(inputStrategy),
        );
    };

    useEffect(() => {
        validateForm();
    }, [inputValue, selectValue, inputStrategy]);

    const handleSubmit = (e: React.SyntheticEvent) => {
        e.preventDefault();
        // Call parent prop
        handleFormSubmit({
            followedAddr: inputValue,
            strategyName: inputStrategy,
        } as NewContractForm);
    };

    const fetchStrategies = async () => {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/strategies`,
        );
        // TODO: handle errors
        if (!response.ok) return;
        const strategies: StrategyEntity[] = await response.json();
        console.log(`Fetched strategies`, strategies);
        setStrategies(strategies);
    };

    useEffect(() => {
        fetchStrategies();
    }, []);

    return (
        <Box p={4} width="auto">
            <Box>
                <Form onSubmit={handleSubmit} validated={validated}>
                    <Flex mx={-3} flexWrap="wrap">
                        <Box width={1} px={3}>
                            <Field
                                label="Follow an Eth address (Externally Owned Account only)"
                                validated={validated}
                                width={1}
                            >
                                <Input
                                    type="text"
                                    required={true}
                                    placeholder="e.g. 0xAc03BB73b6a9e108530AFf4Df5077c2B3D481e5A"
                                    onChange={handleInput}
                                    value={inputValue}
                                    width={1}
                                />
                            </Field>
                        </Box>
                    </Flex>
                    <Flex mx={-3} flexWrap="wrap">
                        <Box width={'230px'} px={3}>
                            <Field
                                label="Choose a strategy"
                                validated={validated}
                                width={1}
                            >
                                <Input
                                    type="text"
                                    required={true}
                                    placeholder="i.e. the strategy address"
                                    onChange={handleInputStrategy}
                                    value={inputStrategy}
                                    width={1}
                                />
                                {/* <Select
                                    options={[
                                        { value: '', label: '' },
                                        ...strategies.map(
                                            (strategy: StrategyEntity) => ({
                                                value: strategy.address
                                                    ? strategy.address
                                                    : strategy.address,
                                                label: strategy.name
                                                    ? strategy.name
                                                    : strategy.address,
                                            }),
                                        ),
                                    ]}
                                    value={selectValue}
                                    onChange={handleSelect}
                                    required
                                    width={1}
                                    selected={'aave'}
                                /> */}
                            </Field>
                        </Box>
                    </Flex>
                </Form>
            </Box>
            <Flex
                px={4}
                py={3}
                borderTop={1}
                borderColor="#E8E8E8"
                justifyContent="flex-end"
            >
                <Button.Outline onClick={handleClose}>Cancel</Button.Outline>
                <Button ml={3} onClick={handleSubmit} disabled={!validated}>
                    Create
                </Button>
            </Flex>
        </Box>
    );
};

const props = {
    handleFormSubmit: PropTypes.func.isRequired,
    handleClose: PropTypes.func.isRequired,
};

export default NewUserContractForm;
