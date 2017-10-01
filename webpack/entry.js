import ReactDOM from 'react-dom';
// import Inferno from 'inferno';
const App = require(process.env.MAIN_FILE).default;

ReactDOM.render(<App/>, document.getElementById('root'));
// Inferno.render(<app/>, document.getElementById("root"));

