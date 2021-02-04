import React from 'react';
import Dashboard from './Dashboard';
import BasePage from '../components/BasePage';

export default function Home(): JSX.Element {
    return (
        <BasePage>
            <Dashboard />
        </BasePage>
    );
}
