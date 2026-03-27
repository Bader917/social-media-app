import { Navigate } from 'react-router-dom';

export default function AuthProtoctedRoute({children}) {
    if(!localStorage.getItem('userToken')) {
        return <>{children}</>
    }

    return (
        <Navigate to={'/'} />
    )
}