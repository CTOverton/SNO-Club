###1. Bootstrap React App
Run `yarn create react-app <Name of your app>`
###2. Add Firebase
Run `firebase init`
###3. Add dependencies
Run `yarn add firebase redux react-redux react-redux-firebase redux-firestore redux-thunk react-router-dom`
###4. Folder Structure
```
├─ redux
|   ├─  actions
|   ├─  reducers
├─ config
```
###5. Create Firebase Config
Create `fbConfig.js` in `/config`
```javascript
const firebaseConfig = {
// INSERT CONFIG FROM FIREBASE CONSOLE
}

export default firebaseConfig
```
###6. Create React Redux Firebase Config
Create `rrfCoifig.js` in `/config`
```javascript
const rrfConfig = {
    userProfile: 'users',
    useFirestoreForProfile: true, // Store in Firestore instead of Real Time DB
    enableLogging: false
}

export default rrfConfig
```
###7. Create Root Reducer
Create `rootReducer.js` in `/redux`
```javascript
import {combineReducers} from "redux";
import {firebaseReducer} from "react-redux-firebase";
import {firestoreReducer} from "redux-firestore";

const rootReducer = combineReducers({
    firebase: firebaseReducer,
    firestore: firestoreReducer
})

export default rootReducer
```
###8. Create Store
Create `store.js` in `/redux`
```javascript
import thunk from 'redux-thunk'
import {applyMiddleware, compose, createStore} from "redux";
import {getFirebase} from "react-redux-firebase";
import rootReducer from "./rootReducer";

export default function configureStore(initialState, history) {
    const middleware = [thunk.withExtraArgument({ getFirebase })]
    const createStoreWithMiddleware = compose(
        applyMiddleware(...middleware)
    )(createStore)

    const store = createStoreWithMiddleware(rootReducer)

    return store
}
```
###8. Edit App.js
```javascript
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

```
###9. Create template components
1. TemplateFirestoreDisplay
2. TemplateFirestoreItem
3. TemplateFirestoreAddItem

TODO: add more...