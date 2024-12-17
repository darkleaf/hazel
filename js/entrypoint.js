import { createRoot } from 'react-dom/client';
import { StrictMode } from 'react';

import Main from './Main'

const root = createRoot(document.getElementById('app'))
root.render(
    //<StrictMode>
    <Main />
    //</StrictMode>
)
