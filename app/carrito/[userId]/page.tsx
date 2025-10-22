'use client'; 

import { useState, useEffect } from 'react';
import { useAuth } from '../../../components/AuthContext';
import { clearCart } from '@/components/clear.cart'; 
import styles from '../../../components/carrito.module.css'; 


interface Product {
  _id: string;
  nombre: string;
  precio: number;
}

interface CartItem {
  product: Product;
  cantidad: number;
  subtotal: number;
  _id: string; // id del item 
}

interface Cart {
  _id: string;
  user: string;
  items: CartItem[];
  total: number;
}


// 1. interaccion con el backend (Funciones de API)


// Función para obtener el carrito (fetchCart)
const fetchCart = async (userId: string): Promise<Cart> => {
  if (!userId) {
    throw new Error('ID de usuario no disponible.');
  }
  
  const API_URL = `http://localhost:4000/carrito/${userId}`; 
  
  const res = await fetch(API_URL, { cache: 'no-store' });

  if (!res.ok) {
   
    if (res.status === 404) {
      return { _id: '', user: userId, items: [], total: 0 } as Cart;
    }
    throw new Error(`Error HTTP: ${res.status} - ${res.statusText}`);
  }
  
  return res.json(); 
};

// función Eeliminar articulo
const removeItemFromCart = async (userId: string, itemId: string) => {
    if (!itemId) {
      throw new Error("ID del artículo no puede ser nulo.");
    }
    
    const API_URL = `http://localhost:4000/carrito/${itemId}`; 
    
    const res = await fetch(API_URL, {
        method: 'DELETE', 
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: userId }), 
    });

    if (!res.ok) {
        let errorBody = await res.text();
        try {
          errorBody = JSON.parse(errorBody).message;
        } catch (e) { /* ignore */ }
        throw new Error(`Fallo al eliminar (Status: ${res.status}). Mensaje: ${errorBody}`);
    }
};



// 2. componente principal


export default function CarritoPage() {
  // Usamos el ID del contexto
  const { userId: authUserId } = useAuth(); 
  
  // ESTADOS DEL CARRITO (Datos y UI)
  const [cart, setCart] = useState<Cart | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // ESTADOS DE ACCIÓN Y COMPRA
  const [isLoading, setIsLoading] = useState(false);
  const [purchaseCompleted, setPurchaseCompleted] = useState(false); 
  const [isDeleting, setIsDeleting] = useState<boolean>(false); 
  
  
  // Función para cargar los datos del carrito
  const loadCart = () => {
    const currentUserId = authUserId;
    if (!currentUserId) {
      setError("ID de usuario no disponible. Por favor inicie sesión.");
      return;
    }
    
    setError(null);
    fetchCart(currentUserId)
      .then(data => setCart(data))
      .catch(err => {
        console.error('Error al cargar el carrito:', err);
        const errorMessage = (err instanceof Error) ? err.message : 'Error desconocido al conectar con el backend.';
        setCart(null); 
        setError(errorMessage);
      });
  };

  // Cargar el carrito al inicio o cuando cambie el ID de usuario
  useEffect(() => {
    loadCart();
  }, [authUserId]); 


  //  HANDLER: Logia de finalizar compra, los handlers son para manejar solicitudes 
  const handleFinalizePurchase = async () => {
      if (!authUserId) { 
          setError("Error: No hay sesión de usuario activa.");
          return;
      }

      if (!cart || cart.items.length === 0) { 
          setError("El carrito ya está vacío.");
          return;
      }

      setIsLoading(true);
      setError(null);

      try {
          // 1. llama a la API para vaciar el carrito
          await clearCart(authUserId); 
          
          // 2. muestra la pantalla de éxito
          setPurchaseCompleted(true);
          
          // 3. recarga el carrito para que se vacíe en el estado local
          loadCart(); 

      } catch (err) {
          console.error("Error al finalizar la compra:", err);
          setError(err instanceof Error ? err.message : "Error desconocido al procesar la compra.");
      } finally {
          setIsLoading(false);
      }
  };
    
  // hanlder que elimina el ítem
  const handleRemoveItem = async (itemId: string) => {
    if (isDeleting || !authUserId) return;

    setIsDeleting(true);
    setError(null);
    
    try {
        await removeItemFromCart(authUserId, itemId);
        loadCart(); 
    } catch (err) {
        console.error('Error al eliminar:', err);
        const errorMessage = (err instanceof Error) ? err.message : 'No se pudo eliminar el artículo.';
        setError(errorMessage);
    } finally {
        setIsDeleting(false);
    }
  };

  // Cálculo de totales
  const totalItemsCount = cart ? cart.items.reduce((sum, item) => sum + item.cantidad, 0) : 0;
  const totalPagar = cart ? cart.total.toFixed(2) : '0.00';


  // Renderizado condicional

  // 1. Pantalla de felicitaciones
  if (purchaseCompleted) {
      return (
          <div className={styles.successContainer}>
              <h1 className={styles.successTitle}>🎉 ¡FELICITACIONES, COMPRA FINALIZADA! 🎉</h1>
              <p className={styles.successMessage}>
                  Tu pedido ha sido procesado con éxito y el carrito ha sido vaciado.
              </p>
              <button
                  onClick={() => setPurchaseCompleted(false)} 
                  className={styles.successButton}
              >
                  Volver a la Tienda
              </button>
          </div>
      );
  }

  // 2. Estados de carga, error y carrito vacío
  if (error) return <p className={styles.carritoContainer}>❌ Error: {error}</p>;
  if (!cart) return <p className={styles.carritoContainer}>⏳ Cargando carrito...</p>;
  
  if (cart.items.length === 0) {
    return (
        <div className={styles.carritoContainer}>
            <h1 className={styles.title}>🛒 Carrito de Compras (Vacío)</h1>
            <p>Aún no has agregado productos. ¡Visita la página principal!</p>
        </div>
    );
  }
  
  // 3. Renderizado del carrito normal
  const isCheckoutDisabled = isLoading || totalItemsCount === 0;

  return (
    <div className={styles.carritoContainer}>
      <h1 className={styles.title}>🛒 Carrito de Compras</h1>
      <p>Artículos totales: **{totalItemsCount}**</p>

      {/* LISTA DE PRODUCTOS */}
      <div style={{ margin: '20px 0' }}>
        {cart.items.map(item => (
          <div key={item._id || item.product._id} className={styles.productItem}> 
            <span className={styles.productName}>{item.product.nombre}</span>
            <div className={styles.itemDetails}>
              <span>{item.cantidad} x ${item.product.precio.toFixed(2)}</span>
              <span className={styles.totalAmount} style={{ fontSize: '1em' }}>${item.subtotal.toFixed(2)}</span>
              
              <button 
                onClick={() => handleRemoveItem(item._id)} 
                disabled={isDeleting}
                className={styles.removeButton} 
              >
                {isDeleting ? 'Quitando...' : '❌ Quitar'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* resumen y total */}
      <div className={styles.summarySection}>
        <div className={styles.summaryRow}>
          <span>Recuento de Productos ({totalItemsCount} unid.)</span>
          <span></span>
        </div>
        <div className={styles.summaryRow}>
          <span>TOTAL A PAGAR:</span>
          <span className={styles.totalAmount}>${totalPagar}</span>
        </div>

        {/* finalizar compra */}
        <button 
          onClick={handleFinalizePurchase} 
          disabled={isCheckoutDisabled}
          className={styles.checkoutButton}
        >
          {isLoading ? 'PROCESANDO COMPRA...' : 'FINALIZAR COMPRA'}
        </button>
      </div>
    </div>
  );
}