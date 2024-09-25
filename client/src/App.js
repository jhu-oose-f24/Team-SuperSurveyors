// frontend/src/App.js
import React, { useState, useEffect } from "react";
import axios from "axios";

const App = () => {
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Fetch message from backend
    axios.get("http://localhost:10000/")
      .then(response => {
        setMessage(response.data);
      })
      .catch(error => console.error(error));
  }, []);

  return (
    <div>
      <h1>Survey Application</h1>
      <p>{message}</p>
    </div>
  );
};

export default App;
