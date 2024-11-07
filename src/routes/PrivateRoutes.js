// src/routes/PrivateRoute.js
import React from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { Navigate, Outlet } from 'react-router-dom'
import { getAuth } from 'firebase/auth'
import { Audio } from 'react-loader-spinner'

const PrivateRoute = ({ children }) => {
    const [user, loading, error] = useAuthState(getAuth())

    if (loading) {
        return <Audio type="Audio" color="#00BFFF" height={80} width={80} />
    }

    if (error) {
        return <div>Error: {error}</div>
    }

    if (!user) {
        return <Navigate to='/login' />
    }
    return <Outlet />
}

export default PrivateRoute
