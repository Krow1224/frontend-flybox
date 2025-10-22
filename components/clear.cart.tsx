

const CART_API_BASE_URL = 'http://localhost:4000/carrito'; 

/**
 * @param userId ID del usuario autenticado.
 */
export async function clearCart(userId: string): Promise<void> {
    // Endpoint para vaciar, delete
    const API_URL = `${CART_API_BASE_URL}/clear/${userId}`; 
    
    const response = await fetch(API_URL, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        // Manejo de errores
        const errorData = await response.json().catch(() => ({ message: 'Error desconocido al vaciar el carrito' }));
        throw new Error(`Fallo al finalizar compra (Status: ${response.status}). Mensaje: ${errorData.message}`);
    }
    // Si response.ok es true la compra es exitosa
}




