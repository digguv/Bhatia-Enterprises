import React, { createContext, useContext, useState, useEffect } from 'react';
import { LS, createUserAccount } from '../utils/LSHelpers';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    // If admin verifies/deactivates this account from another tab (or this one), reflect it live.
    useEffect(() => {
        const syncSession = () => {
            const storedUser = localStorage.getItem('currentUser');
            setUser(storedUser ? JSON.parse(storedUser) : null);
        };
        window.addEventListener('ri_data_changed', syncSession);
        return () => window.removeEventListener('ri_data_changed', syncSession);
    }, []);

    const login = (username, password) => {
        const users = LS.get('ri_users');
        // Check against id (username) and password
        const foundUser = users.find(u => u.id === username && u.password === password);

        if (foundUser) {
            // Don't store password in local session
            const { password, ...userWithoutPass } = foundUser;
            setUser(userWithoutPass);
            localStorage.setItem('currentUser', JSON.stringify(userWithoutPass));
            return true;
        }
        return false;
    };

    const signup = ({ id, name, mobile, email, password }) => {
        const result = createUserAccount({ id, name, mobile, email, password });
        if (result.success) {
            const { password: _pw, ...userWithoutPass } = result.user;
            setUser(userWithoutPass);
            localStorage.setItem('currentUser', JSON.stringify(userWithoutPass));
        }
        return result;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('currentUser');
    };

    return (
        <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
