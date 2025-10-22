'use client'; 

import { useState } from 'react';
import { useAuth } from './AuthContext'; 
import detailStyles from './productdetail.module.css'; 


// Interaccion con el backend, post al carrito


interface AddToCartData {
    userId: string;
    productId: string;
    cantidad: number;
}

const API_URL_BASE = 'http://localhost:4000/carrito/post'; 

const addProductToCart = async ({ userId, productId, cantidad }: AddToCartData) => {
  const res = await fetch(API_URL_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      
    },
    body: JSON.stringify({ userId, productId, cantidad }),
  });

  if (!res.ok) {
    let errorBody = await res.text();
    try {
        errorBody = JSON.parse(errorBody).message;
    } catch (e) { }
    throw new Error(errorBody || `Fallo al añadir producto (Status: ${res.status})`);
  }

  return res.json();
};

// COMPONENTE CLIENTE


export default function AddToCartClient({ productId, productName }: { productId: string, productName: string }) {
    
    const { userId, isAuthenticated } = useAuth(); 
    
    const [cantidad, setCantidad] = useState(1);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleAddToCart = async () => {
        
        if (!isAuthenticated || !userId) {
            setMessage({ type: 'error', text: 'Error: Debes iniciar sesión para añadir productos al carrito.' });
            return;
        }

        if (!productId) {
            setMessage({ type: 'error', text: 'Error: Falta el ID del producto.' });
            return;
        }

        setLoading(true);
        setMessage(null);
        
        if (cantidad < 1) {
            setMessage({ type: 'error', text: 'La cantidad debe ser al menos 1.' });
            setLoading(false);
            return;
        }

        try {
            await addProductToCart({
                userId: userId, // ID de usuario dinámico del Contexto
                productId: productId,
                cantidad: cantidad,
            });

            setMessage({ type: 'success', text: `✅ ${cantidad} unidad(es) de "${productName}" añadida(s) al carrito!` });
            
        } catch (error) {
            console.error('Error al añadir al carrito:', error);
            const errorMessage = (error instanceof Error) ? error.message : 'Error desconocido al añadir al carrito.';
            setMessage({ type: 'error', text: ` ${errorMessage}` });
        } finally {
            setLoading(false);
        }
    };
    
    // Manejo de cambio de cantidad
    const handleCantidadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number(e.target.value);
        setCantidad(Math.max(1, value));
    };
    
    // El botón se deshabilita si no está autenticado
    const isButtonDisabled = loading || cantidad < 1 || !isAuthenticated;

    return (
        <>
            {/* Mensajes de estado */}
            {message && (
                <div 
                    className={message.type === 'success' ? detailStyles.successMessage : detailStyles.errorMessage}
                >
                    {message.text}
                </div>
            )}
            
            {!isAuthenticated && (
                <div className={detailStyles.errorMessage}>
                    Por favor, inicia sesión para poder agregar productos.
                </div>
            )}


            {/* Control de Cantidad */}
            <div className={detailStyles.quantityControl}>
                <label htmlFor="cantidad">Cantidad:</label>
                <input
                    type="number"
                    id="cantidad"
                    value={cantidad}
                    onChange={handleCantidadChange}
                    min="1"
                    disabled={isButtonDisabled}
                    className={detailStyles.quantityInput}
                />
            </div>

            {/* Botón Añadir al Carrito */}
            <button 
                onClick={handleAddToCart}
                disabled={isButtonDisabled}
                className={detailStyles.addToCartButton}
            >
                {loading ? 'Añadiendo...' : 'AÑADIR AL CARRITO'}
            </button>
        </>
    );
}