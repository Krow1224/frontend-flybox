

import ProductDetailContainer from '../../../components/productinfo';
import App from '@/components/Productcomments';

// definimos los tipos de los parámetros de la ruta
interface ProductPageProps {
  params: {
    productId: string;
  };
}

// este componente es el Server Component principal para la ruta
const ProductDetailPage = async ({ params }: ProductPageProps) => {
  
  // pasamos el id del parámetro de la URL al componente contenedor
  return (
    <>
    <ProductDetailContainer productId={params.productId} />
    <App></App>
    </>
  
  ) ;
};

export default ProductDetailPage;