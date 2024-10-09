import React from "react";
import SurveyForm from "./components/Survey";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SurveyView from "./components/SurveyView";
import Signup from "./components/Signup";
import NavBar from "./components/NavBar";
import Login from "./components/Login";
import UserView from "./components/UserView"; // Import UserView component

const App = () => {
  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path="/" element={<Signup />} />
        <Route path="/view" element={<SurveyView />} />
        <Route path="/create" element={<SurveyForm />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<UserView />} />
      </Routes>
    </Router>
  );
};

export default App;
