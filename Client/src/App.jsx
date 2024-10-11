import { BrowserRouter, Routes, Route } from "react-router-dom";
import Interview from "./Pages/Interview";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Interview />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App