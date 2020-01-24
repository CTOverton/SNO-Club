import React from 'react';
import logo from './logo.svg';
import './App.css';
import configureStore from "./redux/store";
import firebaseConfig from "./config/fbConfig";
import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/database'
import 'firebase/firestore' // make sure you add this for firestore
import {Provider} from "react-redux";
import {ReactReduxFirebaseProvider} from "react-redux-firebase";
import {createFirestoreInstance} from "redux-firestore";
import rrfConfig from "./config/rrfConfig";

// Templates
import TemplateFirestoreDisplay from "./components/FirestoreTemplates/TemplateFirestoreDisplay";
import TemplateFirestoreAddItem from "./components/FirestoreTemplates/TemplateFirestoreAddItem";

const initialState ={}
const store = configureStore(initialState)

firebase.initializeApp(firebaseConfig)

function App() {
  return (
      <Provider store={store}>
        <ReactReduxFirebaseProvider
            firebase={firebase}
            config={rrfConfig}
            dispatch={store.dispatch}
            createFirestoreInstance={createFirestoreInstance}>
          <div className="App">

            <header className="App-header">
              <img src={logo} className="App-logo" alt="logo" />
              <p>
                Edit <code>src/App.js</code> and save to reload.
              </p>
              <a
                  className="App-link"
                  href="https://reactjs.org"
                  target="_blank"
                  rel="noopener noreferrer"
              >
                Learn React
              </a>
            </header>

            {/* Templates */}
            <TemplateFirestoreDisplay/>
            <TemplateFirestoreAddItem/>

          </div>
        </ReactReduxFirebaseProvider>
      </Provider>
  );
}

export default App;
