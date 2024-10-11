// frontend/src/App.js
import React from "react";
import SurveyForm from "./components/Survey";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PrivateRoute from "./routes/PrivateRoutes";
import { AuthProvider } from "./context/AuthContext";
import SurveyView from "./components/SurveyView";
import Signup from "./components/Signup";
import NavBar from "./components/NavBar";
import Login from "./components/Login";
const App = () => {



  return (
    <AuthProvider >
      <Router>
        <NavBar />
        <Routes>
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute component={SurveyView} />} />
          <Route path="/create" element={<PrivateRoute component={SurveyForm} />} />

        </Routes>
      </Router>
    </AuthProvider>
  );
};



export default App;
