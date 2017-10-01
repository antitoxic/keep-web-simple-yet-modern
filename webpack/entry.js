import ReactDOM from 'react-dom';
const App = require(process.env.MAIN_FILE).default;

function rerender() {
  ReactDOM.render(<App/>, document.getElementById('root'));
}
rerender();

if ( module.hot ) {
  module.hot.accept(function () {
    rerender();
  });
}
