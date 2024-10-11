import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import { db } from '../firebase';

const UserSettings = () => {
  const [username, setUsername] = useState("");

  // Fetch surveys from Firestore
  useEffect(() => {
    const fetchUser = async () => {

    };

    fetchUser();
  }, []);

  const logoutUser = () => {
    alert("log out");
  };

  const deleteUser = () => {
    alert("delete");
  };

  return (
    <div className="container mt-4">
      <h2>User Settings</h2>
      <p>User: {username}</p>
      <Button className='mt-3' variant='secondary' onClick={logoutUser}>
        Logout
      </Button>
      <br />
      <Button className='mt-3' variant='danger' onClick={deleteUser}>
        Delete this account
      </Button>
    </div>
  );
};

export default UserSettings;