import React from "react";
import SurveyForm from "./components/Survey";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PrivateRoute from "./routes/PrivateRoutes";
import { AuthProvider } from "./context/AuthContext";
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
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<PrivateRoute component={SurveyView} />} />
        <Route path="/create" element={<PrivateRoute component={SurveyForm} />} />
        <Route path="/view" element={<PrivateRoute component={SurveyView} />} />
        <Route path="/profile" element={<PrivateRoute component={UserView} />} /> {/* Add route for UserView component */}

      </Routes>
    </Router>
  );
};

export default App;
