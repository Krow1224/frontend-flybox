'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define el tipo de la función de verificación de la API
type ApiCheckFn = (id: string) => Promise<boolean>;

// Define el tipo de contexto
interface AuthContextType {
    userId: string | null;
    isAuthenticated: boolean;
    // Login recibe el ID del usuario y la función para verificarlo en la API
    login: (id: string, apiCheckFn: ApiCheckFn) => Promise<boolean>; 
    logout: () => void;         
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    
    const [userId, setUserId] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    // 1. Lógica de Login
    const login = async (id: string, apiCheckFn: ApiCheckFn): Promise<boolean> => {
        try {
            // Llama a la función dada por el LoginComponent para verificar el ID
            const isValid = await apiCheckFn(id); 

            if (isValid) {
                setUserId(id);
                setIsAuthenticated(true);
                localStorage.setItem('user_session_id', id); 
                return true; // Éxito
            } else {
                // Si la API devuelve 404, la función apiCheckFn devuelve false
                //mapeo de errores
                throw new Error("ID de usuario no encontrado o inválido.");
            }
        } catch (error) {
            console.error("Error en el proceso de login:", error);
            logout(); 
            return false; // Fallo
        }
    };


    // 2. Cierra sesión
    const logout = () => {
        setUserId(null);
        setIsAuthenticated(false);
        localStorage.removeItem('user_session_id');
    };

    // 3. Verificación de sesión al cargar
    useEffect(() => {
        const storedId = localStorage.getItem('user_session_id');
        
        if (storedId) {
            setUserId(storedId);
            setIsAuthenticated(true);
        }
        
        setLoading(false);
    }, []);

    if (loading) {
        return <div style={{ padding: '20px', textAlign: 'center' }}>Verificando sesión...</div>; 
    }

    return (
        <AuthContext.Provider value={{ userId, isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

//para usar auth mas facilmente para usarlo luego, esto es un hook
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
}