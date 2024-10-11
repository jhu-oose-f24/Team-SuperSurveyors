import React from "react";
import SurveyForm from "./components/Survey";
import UserSettings from "./components/UserSettings";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SurveyView from "./components/SurveyView";
import Signup from "./components/Signup";
import Login from "./components/Login";
import NavBar from "./components/NavBar";
import UserView from "./components/UserView"; // Import UserView component

const App = () => {
  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={<Login />} />
        <Route path="/view" element={<SurveyView />} />
        <Route path="/create" element={<SurveyForm />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<UserView />} />
        <Route path="/user" element={<UserSettings />} />
      </Routes>
    </Router>
  );
};

export default App;
