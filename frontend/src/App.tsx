
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import Receiver from './components/receiver'
import Sender from './components/sender'
import { SocketProvider } from './lib/global-socket-context'

function App() {


  return (
    <SocketProvider>
      <BrowserRouter>
        <Routes>
          <Route path='/sender' element={<Sender />} />
          <Route path='/receiver' element={<Receiver />} />
        </Routes>
      </BrowserRouter>
    </SocketProvider>
  )
}

export default App
