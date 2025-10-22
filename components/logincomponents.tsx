'use client';
import { useState } from 'react';
import { useAuth } from './AuthContext';

// ajusta la ruta si es diferente a /users/:id
const USER_API_BASE_URL = 'http://localhost:4000/users'; 

// función para verificar el ID en el backend
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
        // manejo de errores 
        console.error("Error de red al verificar el ID:", error);
        return false; 
    }
};


export default function LoginComponent() {
    const { isAuthenticated, login, logout, userId: currentUserId } = useAuth();
    
    const [inputUserId, setInputUserId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        if (!inputUserId.trim()) {
            setError("Por favor, ingresa un ID de usuario.");
            setIsLoading(false);
            return;
        }

        // Si la verificación del get es exitosa, el contexto guarda el ID.
        const success = await login(inputUserId.trim(), checkUserIdExistence);

        if (success) {
            setInputUserId('');
        } else {
            setError("ID de usuario no válido. Verifica que el ID exista en tu sistema.");
        }
        
        setIsLoading(false);
    };
    
    if (isAuthenticated) {
        return (
            <div style={{ padding: '10px', background: '#e6ffe6', borderRadius: '5px' }}>
                <p style={{ margin: 0, color: '#008000', fontWeight: 'bold' }}>
                    ✅ Sesión iniciada: **{currentUserId?.substring(0, 8)}...**
                </p>
                <button 
                    onClick={logout} 
                    style={{ marginTop: '5px', padding: '5px 10px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                    Cerrar Sesión
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '15px', background: '#f8f9fa', border: '1px solid #ccc', borderRadius: '5px', maxWidth: '300px' }}>
            <h3 style={{ margin: 0 }}>Iniciar Sesión (Solo ID)</h3>
            {error && (
                <div style={{ padding: '8px', background: '#fcebeb', color: '#cc0000', border: '1px solid #f5c6cb', borderRadius: '4px' }}>
                    {error}
                </div>
            )}
            <input
                type="text"
                value={inputUserId}
                onChange={(e) => setInputUserId(e.target.value)}
                placeholder="Ingresa tu ID de Usuario (Ej: 68f586a5...)"
                required
                disabled={isLoading}
                style={{ padding: '8px', border: '1px solid #ced4da', borderRadius: '4px' }}
            />
            <button 
                type="submit"
                disabled={isLoading || !inputUserId.trim()}
                style={{ padding: '10px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', opacity: (isLoading || !inputUserId.trim()) ? 0.6 : 1 }}
                //profe que pena con el css ahí puesto, no nos dio tiempo a poner un modulo para este.
            >
                {isLoading ? 'Verificando ID...' : 'Iniciar Sesión'}
            </button>
        </form>
    );
}