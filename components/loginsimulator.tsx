'use client';

import { useState } from 'react';
import { useAuth } from './AuthContext'; // Asumo que usas el AuthContext que definimos
import styles from './LoginSimulator.module.css'; 

// Para obtener el usuario por Id
const USER_API_BASE_URL = 'http://localhost:4000/users'; 
const TEST_USER_ID = '68f586a57de06319a5ef9d2b'; 

// Función auxiliar para verificar el ID en el backend (se usa dentro de handleLogin)
const checkUserIdExistence = async (userId: string): Promise<boolean> => {
    try {
        const response = await fetch(`${USER_API_BASE_URL}/${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        
        return response.ok; 
    } catch (error) {
        // Control de errores
        console.error("Error de red al verificar el ID:", error);
        return false; 
    }
};


export default function LoginSimulator() {
    const { userId, login, logout } = useAuth();
    
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        // Si el campo está vacío, usamos el ID de prueba, si no, usamos el input
        const idToLogin = input.trim() || TEST_USER_ID; 

        if (!idToLogin) {
            setError("Por favor, ingresa un ID válido.");
            setIsLoading(false);
            return;
        }

        // El contexto se encargará de llamar a checkUserIdExistence para verificar el ID
        const success = await login(idToLogin, checkUserIdExistence);

        if (success) {
            setInput(''); // Limpia el input si el login fue exitoso
        } else {
            setError("ID de usuario no encontrado o inválido. Verifica tu ID.");
        }
        
        setIsLoading(false);
    };

    //Renderizado del componente
    
    if (userId) {
        return (
            <div className={`${styles.loginContainer} ${styles.loggedIn}`}>
                <p>✅ Sesión: **{userId.substring(0, 8)}...**</p>
                <button 
                    onClick={logout}
                    className={`${styles.loginButton} ${styles.logoutButton}`}
                >
                    Cerrar Sesión
                </button>
            </div>
        );
    }

    return (
        <form 
            onSubmit={handleLogin} 
            className={`${styles.loginContainer} ${styles.loggedOut}`}
        >
            <p>Iniciar Sesión (Solo ID)</p>
            {error && (
                <div className={styles.errorMessage}>
                    {error}
                </div>
            )}
            <input
                type="text"
                placeholder={`ID (Ej: ${TEST_USER_ID.substring(0, 8)}...)`}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className={styles.loginInput}
                disabled={isLoading}
            />
            <button 
                type="submit"
                className={`${styles.loginButton} ${styles.submitButton}`}
                disabled={isLoading}
            >
                {isLoading ? 'Verificando...' : 'Iniciar Sesión'}
            </button>
        </form>
    );
}