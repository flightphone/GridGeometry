import './app.css'
import 'material-icons/iconfont/material-icons.css';
import 'material-design-lite/material.min.css';
import 'material-design-lite/material.min.js';
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-balham.css";
import "./css/lil-gui.css"
import App from './App.svelte'
import { mount } from 'svelte'

const app = mount(App, {
  target: document.getElementById('app'),
})

export default app
