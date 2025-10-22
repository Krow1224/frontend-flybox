
import Navbar from "../components/navbar"
import { AuthProvider } from '../components/AuthContext';
import {Inter} from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        {/* Envolvemos toda la aplicación con el AuthProvider */}
        <AuthProvider> 
          <Navbar></Navbar>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
