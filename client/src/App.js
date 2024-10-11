import React from "react";
import SurveyForm from "./components/Survey";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PrivateRoute from "./routes/PrivateRoutes";
import SurveyView from "./components/SurveyView";
import Signup from "./components/Signup";
import Login from "./components/Login";
import NavBar from "./components/NavBar";
import UserView from "./components/UserView"; // Import UserView component
import Survey from "./components/answerSurvey"; // Import AnswerSurvey component

const App = () => {
  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route element={<PrivateRoute />}>
          <Route path="/create" element={<SurveyForm />} />
          <Route path="/view" element={<SurveyView />} />
          <Route path="/profile" element={<UserView />} />
          <Route path="/" element={<SurveyView />} />
          <Route path="/answer" element={<Survey />} />

        </Route>


      </Routes>
    </Router>
  );
};

export default App;
