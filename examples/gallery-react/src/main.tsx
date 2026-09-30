import '../ui/tokens.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HomeScreen } from './screens/HomeScreen';
import { ModeSwitch } from './ModeSwitch';
createRoot(document.getElementById('root')!).render(<StrictMode><HomeScreen /><ModeSwitch /></StrictMode>);
