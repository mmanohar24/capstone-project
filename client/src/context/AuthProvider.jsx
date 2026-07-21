import { useState } from "react";
import AuthContext from "./AuthContext";

function AuthProvider({ children }) {

    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);

    const login = (userData, token) => {
        setUser(userData);
        setToken(token);
        localStorage.setItem('token', token);

    }

    const logOut = () => {
        setUser(null);
        setToken(null)
        localStorage.removeItem('token');
    }

    return (
        <AuthContext.Provider value={{ user, token, login, logOut }}>
            {
                children
            }

        </AuthContext.Provider>
    )
}

export default AuthProvider;