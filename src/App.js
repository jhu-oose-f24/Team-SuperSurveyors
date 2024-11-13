import React from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import PrivateRoute from "./routes/PrivateRoutes";

// Imports of developed components
import Login from "./components/Login";
import NavBar from "./components/NavBar";
import Signup from "./components/Signup";
import SurveyForm from "./components/Survey";
import SurveyView from "./components/SurveyView";
import UserView from "./components/UserView";
import AnswerSurvey from "./components/answerSurvey";
import Onboarding from "./components/Onboarding"; // Import the Onboarding component
import 'bootstrap/dist/css/bootstrap.min.css';

import SurveyResults from './components/SurveyResults';

const App = () => {
  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Add the Onboarding route with user ID */}
        <Route path="/onboarding/:userId" element={<Onboarding />} />

        {/* Protected Routes */}
        <Route element={<PrivateRoute />}>
          <Route path="/" element={<SurveyView />} />
          <Route path="/create" element={<SurveyForm />} />
          <Route path="/view" element={<SurveyView />} />
          <Route path="/profile" element={<UserView />} />
          <Route path="/answer" element={<AnswerSurvey />} />

          <Route path="/survey-results/:surveyId" element={<SurveyResults />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
