import './App.css';
import {Routes,Route} from 'react-router-dom'
import Home from './components/home';
import WebRtc from './components/WebRtc'

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/room/:roomId' element={<WebRtc/>}/>
      </Routes>
    </div>
  );
}

export default App;
