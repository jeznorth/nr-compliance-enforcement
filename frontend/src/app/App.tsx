import { Counter } from './features/counter/Counter';
import './App.css';
import React from 'react';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { BrowserRouter } from "react-router-dom";
import RenderOnRole from '../components/RenderOnRole';
import Roles from './constants/roles';

function App() {
  return (
      <React.StrictMode>
        <Provider store={store}>
          <BrowserRouter>
            <div className="container">
              <RenderOnRole roles={[Roles.COS_OFFICER]}>
                <Counter/>
              </RenderOnRole>
            </div>
          </BrowserRouter>        
        </Provider>
      </React.StrictMode>
  );
}

export default App;
