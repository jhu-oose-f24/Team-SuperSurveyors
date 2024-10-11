// src/routes/PrivateRoute.js
import React from 'react'
import { useAuth } from '../context/AuthContext.js'
import { Navigate } from 'react-router-dom'

const PrivateRoute = ({ children }) => {
    const { user } = useAuth()

    if (!user) {
        return <Navigate to='/login' />
    }
    return children
}

export default PrivateRoute
