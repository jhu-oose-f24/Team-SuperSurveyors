import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PrivateRoute from "./routes/PrivateRoutes";

// Imports of developed components
import Login from "./components/Login";
import NavBar from "./components/NavBar";
import Signup from "./components/Signup";
import SurveyForm from "./components/Survey";
import SurveyView from "./components/SurveyView";
import UserView from "./components/UserView";

const App = () => {
    return (
        <Router>
            <NavBar />
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />

                <Route element={<PrivateRoute />}>
                    <Route path="/" element={<SurveyView />} />
                    <Route path="/create" element={<SurveyForm />} />
                    <Route path="/view" element={<SurveyView />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/profile" element={<UserView />} />
                </Route>

            </Routes>
        </Router>
    );
};

export default App;
