import React, { useState, useEffect } from 'react';
import { db } from '../firebase';

const UserSettings = () => {
  const [username, setUsername] = useState("");

  // Fetch surveys from Firestore
  useEffect(() => {
    const fetchUser = async () => {

    };

    fetchUser();
  }, []);

  return (
    <>
      <p>User Settings</p>
      <p>User: {username}</p>
    </>
  );
};