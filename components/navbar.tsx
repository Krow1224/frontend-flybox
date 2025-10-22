// components/navbar.jsx (o .tsx)
'use client';

import Link from 'next/link';
import LoginSimulator from './loginsimulator'; 
import { useAuth } from './AuthContext';
import styles from './navbar.module.css'; // Importamos los estilos de la Navbar

export default function Navbar() {
  const { userId } = useAuth();

  return (
    <nav className={styles.nav}>
      <div className={styles.navLinks}>
        {/* Enlace Home */}
        <Link href="/" className={styles.link}>
          🏠Home
        </Link>
        
        {/* Enlace dinámico al carrito */}
        {userId ? (
          <Link href={`/carrito/${userId}`} className={styles.link}>
            🛒 Carrito ({userId.substring(0, 4)}...)
          </Link>
        ) : (
          <span className={styles.disabledLink}>🔒 Carrito (Inicia Sesión)</span>
        )}

        {/* Publicar Producto */}
        <Link href="/productos/nuevo" className={styles.link}>
          Publicar Producto
        </Link>
      </div>
      
      {/* Contenedor del componente de Login */}
      <div className={styles.authSection}>
        <LoginSimulator />
      </div>

      
    </nav>
  );
}


