

import { notFound } from 'next/navigation';
import detailStyles from './productdetail.module.css'; 
import AddToCartClient from './AddToCartClient';


// Define el tipo de dato Product
interface Product {
  _id: string;
  nombre: string;
  precio: number;
  descripcion: string;
  imagenUrl: string;
  calificacion: number; 
  comentarios: string; 
}

// Lógica de obtención de datos
const getProductById = async (productId: string): Promise<Product | null> => {
  const API_URL = `http://localhost:4000/products/id/${productId}`; 
  try {
    const res = await fetch(API_URL, { cache: 'no-store' });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Fallo al cargar el producto: ${res.status}`);
    return res.json();
  } catch (error) {
    console.error(`Error fetching product ${productId}:`, error);
    return null;
  }
};

interface ProductDetailContainerProps {
  productId: string;
}

export default async function ProductDetailContainer({ 
  productId,
}: ProductDetailContainerProps) {
  
  const product = await getProductById(productId);

  if (!product) {
    notFound(); 
  }

  // función para generar las estrellas visuales
  const renderStars = (rating: number) => {
    // Asegura que la calificación esté entre 0 y 5
    const clampedRating = Math.max(0, Math.min(5, rating));
    return '⭐'.repeat(clampedRating);
  };


  // Estructura con las clases CSS Modules
  return (
    
    <main className={detailStyles.detailContainer}>
    
      <div className={detailStyles.flexLayout}>
        
        <div className={detailStyles.imageColumn}>
          <h2 className={detailStyles.productTitle}>{product.nombre}</h2>
          
          <div className={detailStyles.imageWrapper}>
            
            
                <img 
                    src={"https://static.vecteezy.com/system/resources/previews/002/801/319/non_2x/close-up-of-business-man-in-blue-suit-is-confident-on-gray-background-free-photo.jpg"} 
                    alt={product.nombre} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
            
          </div>
        </div>

        {/* Columna Derecha: Info y Botones */}
        <div className={detailStyles.infoColumn}>
          
          <p className={detailStyles.priceTag}>
            ${product.precio.toFixed(2)}
          </p>

          {/* CALIFICACIÓN*/}
          <div className={detailStyles.ratingSection}>
            <span style={{ fontWeight: 'bold' }}>Calificación: </span>
            <span className={detailStyles.ratingStars}>
              {renderStars(product.calificacion)}
            </span>
             ({product.calificacion} / 5)
          </div>

          <p className={detailStyles.description}>
            {product.descripcion || "Descripción detallada no disponible."}
          </p>
          
          
          <div className={detailStyles.commentSection}>
            <span style={{ fontWeight: 'bold', color: '#333' }}>Comentario Destacado:</span>
            <p className={detailStyles.commentText}>{product.comentarios || "Sin comentarios."}</p>
          </div>
          

          <p className={detailStyles.productId}>ID de Producto: {product._id}</p>

          {/* Botón de Agregar al Carrito */}
          <AddToCartClient 
            productId={product._id} 
            productName={product.nombre}
          />
        </div>
      </div>
    </main>
  );
}