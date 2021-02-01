import React from 'react';
import { Blockie, EthAddress } from 'rimble-ui';
import PropTypes, { InferProps } from 'prop-types';

const Avatar = ({ address }: InferProps<typeof props>) => (
  <>
    <Blockie
      seed={address}
      bgcolor="#a71"
      size={15}
      scale={3}
      spotcolor="#000"
    />
    <EthAddress address={address} />
  </>
);

const props = {
  address: PropTypes.string.isRequired,
};

export default Avatar;
