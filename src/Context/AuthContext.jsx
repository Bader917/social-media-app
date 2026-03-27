import { createContext, useEffect } from "react";
import { jwtDecode } from "jwt-decode"
import { useState } from "react";

export const AuthContext = createContext();

export default function AuthContextProvider({ children }) {

    const [userToken, setUserToken] = useState(null);
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        if (localStorage.getItem('userToken')) {
            setUserToken(localStorage.getItem('userToken'));
        }
    }, []);

    useEffect(() => {
        if (localStorage.getItem('userToken')) {
            const { user } = jwtDecode(localStorage.getItem('userToken'));            
            setUserId(user);
        }
    }, [userId])

    return <AuthContext.Provider value={{ userToken, setUserToken, userId }}>
        {children}
    </AuthContext.Provider>
}