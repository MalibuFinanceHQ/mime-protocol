import React, { useState, useEffect, useContext } from 'react';
import { Button, Box, Form, Input, Field, ToastMessage } from 'rimble-ui';
import { utils } from 'ethers';
import Context from '../../../utils/context';
import PropTypes, { InferProps } from 'prop-types';
import { getTraderContract } from '../../../utils/follow';
import { CopyTrader } from '../../../typechain';

const ContractEditForm = ({
    address,
}: InferProps<typeof props>): JSX.Element => {
    const [validated, setValidated] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const ctxt = useContext(Context);
    const [contract, setContract] = useState(null);
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
            console.log('handleSubmit()', {
                newFollowedAddr: inputValue,
            });
            setTxState('pending');
            console.log(ctxt, address, inputValue);
            const receipt = await (contract as CopyTrader).follow(inputValue);
            await receipt.wait();
            console.log('follow receipt', receipt);
            setTxState('complete');
            setTimeout(() => setTxState('none'), 3000);
        } catch (err) {
            if (err) console.error(err);
            setTxState('fail');
        }
    };

    const initContract = async () => {
        if (!ctxt.provider || !address) return null;
        const trader = await getTraderContract(ctxt, address);
        console.log('Contract', trader);
        setContract(trader);
        const followedAddress = await trader.followedTrader();
        setInputValue(followedAddress);
    };

    useEffect(() => {
        if (!contract) initContract();
        validateForm();
    }, [inputValue, ctxt]);

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
                <Button
                    width={[1, 'auto', 'auto']}
                    mr={3}
                    disabled={txState !== 'none'}
                >
                    Save
                </Button>
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
    address: PropTypes.string.isRequired,
};

export default ContractEditForm;
