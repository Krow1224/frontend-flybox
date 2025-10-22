//ruta inicial

import ProductCard from '../components/ProductCard'; // Importa el componente de la tarjeta
import styles from '../components/catalog.module.css'; // Importa los estilos del catálogo

// Define el tipo de dato Product
interface Product {
  _id: string;
  nombre: string;
  precio: number;
}

// 1. Lógica de Obtención de Datos
const getProducts = async (): Promise<Product[]> => {
  const API_URL = 'http://localhost:4000/Products/all'; 
  
  try {
    const res = await fetch(API_URL, { 
      // Opción de Next.js para revalidar la data (ej. cada hora)
      cache: 'no-store' 
    });

    if (!res.ok) {
      console.error(`Error HTTP: ${res.status} al cargar productos.`);
      throw new Error(`Fallo al cargar productos: ${res.status}`);
    }

    return res.json();
  } catch (error) {
    // Manejo de errores
    console.error('Error en el fetch de productos:', error);
    return []; 
  }
};

// 2. Componente de Página Principal
export default async function HomePage() {
  const products = await getProducts();

  if (products.length === 0) {
    return (
      
      <main className={styles.mainContainer} style={{ textAlign: 'center' }}>
        <h2>⚠️ Catálogo Vacío</h2>
        <p>No se pudieron cargar los productos. Verifique que su backend NestJS esté corriendo en el puerto 4000 y la ruta /products sea correcta.</p>
      </main>
    );
  }

  return (
    <main className={styles.mainContainer}>
      <h1 className={styles.title}>Catálogo de Productos</h1>
      <p className={styles.subtitle}>Explora todos nuestros artículos disponibles.</p>
      
      {/* Muestra la cuadrícula de productos */}
      <div className={styles.productGrid}>
        {products.map((product) => (
          // Pasa los datos al componente de presentación
          <ProductCard key={product._id} product={product} /> 
        ))}
      </div>
    </main>
  );
}