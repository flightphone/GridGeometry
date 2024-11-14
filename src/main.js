import { mount } from 'svelte'
import './app.css'
import 'material-icons/iconfont/material-icons.css';
import 'material-design-lite/material.min.css';
import 'material-design-lite/material.min.js';
import App from './App.svelte'

const app = mount(App, {
  target: document.getElementById('app'),
})

export default app
