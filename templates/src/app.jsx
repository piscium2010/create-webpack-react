import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter as Router, Route } from 'react-router-dom'
import './app.less'

class App extends React.Component {
    render() {
        return (
            <Router>
                <React.Fragment>
                    <Route path='/' exact component={() => (<div>Hello React</div>)} />
                </React.Fragment>
            </Router >
        )
    }
}

ReactDOM.render(<App />, document.getElementById('app'))