import { registerRootComponent } from 'expo';
import App from './App';

// This must be the very first thing called to set up the native bridge
registerRootComponent(App);