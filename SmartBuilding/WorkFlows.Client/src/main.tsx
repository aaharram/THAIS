import { ThemeProvider } from '@/components/navbar/theme-provider';
import { store } from '@/store';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import { Provider } from 'react-redux';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
    <Provider store={store}>
        <ThemeProvider defaultTheme='light' storageKey='vite-ui-theme'>
            <App />
            <Toaster />
        </ThemeProvider>
    </Provider>,
);