'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../../../components/product_form.module.css'; // 


// 1. Crear las interfaces para la interacción


interface NewProductData {
  nombre: string;
  precio: number;
  stock: number;
  ventas: number;
  id: string; //este id es opcional, de referencia, el real se lo pone mongo
  calificacion: number;
  comentarios: string;
}


// 2. Funcion de interacción 2 con el backend


const createProduct = async (data: NewProductData) => {
 
  const API_URL = 'http://localhost:4000/products/add'; 

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  // Manejo de errores
  if (!res.ok) {
    let errorBody = await res.text();
    try {
      errorBody = JSON.parse(errorBody).message;
    } catch (e) {
      // Si no es JSON, usa el texto plano
    }
    throw new Error(`Fallo al crear el producto (Status: ${res.status}). Mensaje: ${errorBody}`);
  }

  return res.json(); // Devuelve el producto creado (o un mensaje de éxito)
};


// -----------------------------------------------------------
// 3. COMPONENTE PRINCIPAL
// -----------------------------------------------------------

export default function NewProductPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<NewProductData>({
    nombre: '',
    precio: 0,
    stock: 0,
    ventas: 0, 
    id: '',
    calificacion: 5, 
    comentarios: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: (name === 'precio' || name === 'stock' || name === 'calificacion' || name === 'ventas') 
                ? Number(value) 
                : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Validación antes de enviar
    if (formData.precio <= 0 || formData.stock < 0 || formData.nombre.trim() === '' || formData.ventas < 0) {
        setError("Por favor, introduce un nombre válido, un precio mayor a cero, y un stock/ventas no negativos.");
        setLoading(false);
        return;
    }

    try {
      const product = await createProduct(formData);
      setSuccess(`✅ ¡Producto "${product.nombre}" creado con éxito! ID: ${product._id || 'N/A'}`);
      
      //Para limpiar el formato después del extito
      setFormData({
        nombre: '',
        precio: 0,
        stock: 0,
        ventas: 0,
        id: '',
        calificacion: 5,
        comentarios: '',
      });
      
    } catch (err) {
      const errorMessage = (err instanceof Error) ? err.message : 'Error desconocido al crear el producto.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    //aplicar los estilos del modulo css
    <div className={styles.container}>
      <h1 className={styles.title}>Publicar Nuevo Producto</h1>
      
      {error && <p className={styles.error}> {error}</p>}
      {success && <p className={styles.success}>{success}</p>}

      <form onSubmit={handleSubmit} className={styles.form}>
        
        {/* CAMPO: Nombre */}
        <label className={styles.label}>
          Nombre del Producto:
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
            disabled={loading}
            className={styles.input}
          />
        </label>
        
        {/* CAMPO: Precio */}
        <label className={styles.label}>
          Precio ($):
          <input
            type="number"
            name="precio"
            value={formData.precio}
            onChange={handleChange}
            min="0.0"
            step="1000"
            required
            disabled={loading}
            className={styles.input}
          />
        </label>
        
        {/* CAMPO: Stock */}
        <label className={styles.label}>
          Stock Inicial:
          <input
            type="number"
            name="stock"
            value={formData.stock}
            onChange={handleChange}
            min="0"
            required
            disabled={loading}
            className={styles.input}
          />
        </label>
        
        
        <label className={styles.label}>
          Número de Ventas Inicial:
          <input
            type="number"
            name="ventas"
            value={formData.ventas}
            onChange={handleChange}
            min="0"
            required
            disabled={loading}
            className={styles.input}
          />
        </label>
        
        {/* ID/Referencia */}
        <label className={styles.label}>
          ID/Referencia (Opcional):
          <input
            type="text"
            name="id"
            value={formData.id}
            onChange={handleChange}
            disabled={loading}
            className={styles.input}
          />
        </label>
        
        {/* CAMPO: Calificación (ej. 1 a 5) */}
        <label className={styles.label}>
          Calificación (1-5):
          <input
            type="number"
            name="calificacion"
            value={formData.calificacion}
            onChange={handleChange}
            min="1"
            max="5"
            required
            disabled={loading}
            className={styles.input}
          />
        </label>

        {/* CAMPO: Comentarios */}
        <label className={styles.label}>
          Comentarios (Descripción):
          <textarea
            name="comentarios"
            value={formData.comentarios}
            onChange={handleChange}
            rows={4}
            disabled={loading}
            className={styles.textarea}
          />
        </label>

        <button 
          type="submit" 
          disabled={loading}
          className={styles.submitButton}
        >
          {loading ? 'Publicando...' : '🛒 Publicar Producto'}
        </button>
      </form>
    </div>
  );
}
