// frontend/src/App.js
import React from "react";
import SurveyForm from "./components/Survey";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SurveyView from "./components/SurveyView";
import Signup from "./components/Signup";
import NavBar from "./components/NavBar";
const App = () => {


  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path="/" element={<Signup />} />
        <Route path="/view" element={<SurveyView />} />
        <Route path="/create" element={<SurveyForm />} />
      </Routes>
    </Router>
  );
};



export default App;
