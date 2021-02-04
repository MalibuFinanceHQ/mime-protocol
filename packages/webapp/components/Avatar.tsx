import React from 'react';
import { Blockie, Box } from 'rimble-ui';
import PropTypes, { InferProps } from 'prop-types';

const Avatar = ({ address }: InferProps<typeof props>): JSX.Element => (
    <Box mx="auto" key={`avatar-${address}`}>
        <Blockie
            opts={{
                seed: address,
                bgcolor: '#a71',
                size: 15,
                scale: 3,
                spotcolor: '#000',
            }}
        />
    </Box>
);

const props = {
    address: PropTypes.string.isRequired,
};

export default Avatar;
