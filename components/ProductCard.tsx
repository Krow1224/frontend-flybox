

'use client'
import styles from './catalog.module.css'; // Importamos los estilos del catálogo
import Link from 'next/link';

// Define el tipo de dato Product, tocó ponerle tsx al archivo porque sino no dejaba crear el interface
interface Product {
  _id: string;
  nombre: string;
  precio: number;
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const detailUrl = `/productos/${product._id}`;
  return (
    <div className={styles.productCard}>
      <h3 className={styles.productName}>{product.nombre}</h3>
      <p className={styles.productPrice}>
        ${product.precio.toFixed(2)}
      </p>
      <p style={{ fontSize: '0.85em', color: '#888' }}>
        ID: {product._id.substring(0, 8)}...
      </p>
      
      <Link href={detailUrl}>
      <button className={styles.addButton}>
        Ver producto
      </button>
      </Link>
      
    </div>
  );
}