import React, { Component } from 'react';
import ReactDOM from 'react-dom/client';
import Mv from '../components/sections/Mv';
import '../../assets/styles/style.scss';
import '../../assets/scripts/app';
import picturefill from 'picturefill';
picturefill();

export class Index extends Component {
    render(): React.ReactNode {
        return (
            <>
                <Mv />
            </>
        );
    }
}
const container = document.getElementById('app');
// Create a root.
const root = ReactDOM.createRoot(container);
// Initial render
root.render(<Index />);
