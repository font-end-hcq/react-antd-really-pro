import React from 'react'
import ReactDOM from 'react-dom'
window.prefix = __PRO__ ? 'https://jiameng-cdn.schoolpal.cn/':'https://jiameng-test-cdn.schoolpal.cn/';
import { AppContainer } from 'react-hot-loader'
import Home from '@pages/Home'
import { EventEmitter } from 'fbemitter';

window.emitter = new EventEmitter();


const render = Component => {
  ReactDOM.render(
    <AppContainer>
      <Component />
    </AppContainer>,
    document.getElementById('app'),
  )
}

render(Home)

// Webpack Hot Module Replacement API
if (module.hot) {
  module.hot.accept('@pages/Home', () => {
    // if you are using harmony modules ({modules:false})
    render(Home)
    // in all other cases - re-require App manually
    render(require('@pages/Home'))
  })
}
