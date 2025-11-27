"use client"
import React, { useState, useEffect } from 'react';
import { Send, Star } from 'lucide-react';
// Asegúrate de que lucide-react esté instalado: npm install lucide-react

// --- INTERFACES DE TIPADO ---

/**
 * Define la estructura de un objeto Comentario.
 * Utiliza esta interfaz para tipar los datos que recibes de la API.
 */
interface Comment {
  _id: string;
  content: string;
  rating: number; // Valor de 1 a 5
  user: string; // ID o nombre del usuario que comentó
  productId: string;
  createdAt: string; // Fecha en formato ISO string
}

/**
 * Define las props para el componente principal.
 */
interface CommentSectionProps {
  productId?: string; // El ID del producto al que pertenecen los comentarios
}

// --- CONFIGURACIÓN Y MOCKS ---
const API_BASE_URL = 'http://localhost:4000';

const PRODUCT_ID_MOCK = '68f3f3c037d3b2fa9fdae9aa';
const LOGGED_USER_ID = '68f655f32270785081e0180a';
const LOGGED_USER_NAME = 'Usuario Logueado';

// Datos Mock tipados
const mockComments: Comment[] = [
  {
    _id: '1',
    content: 'Excelente calidad y ajuste perfecto. Lo recomiendo 100%.',
    rating: 5,
    user: 'UsuarioDemo1',
    productId: PRODUCT_ID_MOCK,
    createdAt: new Date('2025-11-20T10:00:00Z').toISOString(),
  },
  {
    _id: '2',
    content: 'Tardó un poco en llegar, pero el producto es bueno y duradero.',
    rating: 3,
    user: 'UsuarioDemo2',
    productId: PRODUCT_ID_MOCK,
    createdAt: new Date('2025-11-21T15:30:00Z').toISOString(),
  },
  {
    _id: '3',
    content: 'Un poco caro, pero vale la pena la inversión. Muy cómodo.',
    rating: 4,
    user: LOGGED_USER_ID,
    productId: PRODUCT_ID_MOCK,
    createdAt: new Date('2025-11-22T08:10:00Z').toISOString(),
  },
];

// --- Componente para mostrar una estrella de calificación ---
interface StarRatingProps {
  rating: number;
  size?: number;
  color?: string;
}

const checkUserIdExistence = async (userId: string): Promise<boolean> => {
    try {
        const response = await fetch(`${API_BASE_URL}/${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        
        
        return response.ok; 
    } catch (error) {
        // manejo de errores 
        console.error("Error de red al verificar el ID:", error);
        return false; 
    }
};

const StarRating: React.FC<StarRatingProps> = ({ rating, size = 18, color = '#ffc107' }) => {
  const stars = [];
  const maxRating = 5;
  for (let i = 1; i <= maxRating; i++) {
    const isFilled = i <= Math.floor(rating);

    stars.push(
      <Star
        key={i}
        size={size}
        fill={isFilled ? color : 'transparent'}
        color={color}
        style={{ transition: 'fill 0.2s' }}
      />
    );
  }
  return <div className="static-stars">{stars}</div>;
};

// --- Componente de Formulario de Comentarios ---
interface CommentFormProps {
  productId: string;
  onCommentSubmitted: (comment: Comment) => void;
}

const CommentForm: React.FC<CommentFormProps> = ({ productId, onCommentSubmitted }) => {
  const [rating, setRating] = useState<number>(0);
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0 || !content.trim()) {
      setError('Por favor, selecciona una calificación y escribe un comentario.');
      return;
    }

    setIsLoading(true);
    setError(null);

    const dataToSend = {
      text: content.trim(),
      rating: rating,
      productId: PRODUCT_ID_MOCK,
      userId: LOGGED_USER_ID
    };

    try {
      const url = `${API_BASE_URL}/comments/${productId}`;
      const MAX_RETRIES = 3;

      for (let i = 0; i < MAX_RETRIES; i++) {
        try {
          const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dataToSend),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Error al enviar: ${response.status}`);
          }

          const newComment: Comment = await response.json();
          onCommentSubmitted(newComment);
          
          setRating(0);
          setContent('');
          return;

        } catch (fetchError: any) {
          if (i === MAX_RETRIES - 1) {
            throw fetchError;
          }
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
        }
      }

    } catch (err: any) {
      console.error('Error al guardar comentario:', err);
      setError(err.message || 'Error desconocido al enviar el comentario. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  // Función para manejar el hover en las estrellas (para mejor UX)
  const handleStarHover = (hoveredValue: number) => {
    const stars = document.querySelectorAll<SVGElement>('.stars-interactive .star-icon');
    stars.forEach((star, index) => {
      // Si el índice es menor que el valor sobre el que se hace hover
      if (index < hoveredValue) {
        star.style.fill = '#ffa000';
      } else if (index >= rating) {
        // Si el índice es mayor o igual al rating seleccionado, se queda transparente
        star.style.fill = 'transparent';
      }
    });
  };

  // Función para restablecer el hover al salir del contenedor
  const handleStarLeave = () => {
    const stars = document.querySelectorAll<SVGElement>('.stars-interactive .star-icon');
    stars.forEach((star, index) => {
      if (index >= rating) {
        star.style.fill = 'transparent';
      }
    });
  };

  return (
    <div className="comment-form-container">
      <h3>Escribe tu opinión</h3>
      <form onSubmit={handleSubmit} className="comment-form">
        {/* Calificación de Estrellas Interactiva */}
        <div className="rating-input">
          <label>Tu Calificación:</label>
          <div 
            className="stars-interactive"
            onMouseLeave={handleStarLeave}
          >
            {[1, 2, 3, 4, 5].map((starValue) => (
              <Star
                key={starValue}
                size={24}
                onClick={() => setRating(starValue)}
                onMouseEnter={() => handleStarHover(starValue)}
                fill={starValue <= rating ? '#ffc107' : 'transparent'}
                color="#ffc107"
                className="star-icon clickable"
              />
            ))}
          </div>
        </div>

        {/* Área de Comentario */}
        <textarea
          placeholder="¿Qué te pareció el producto? Sé detallado..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          required
          disabled={isLoading}
        />

        {/* Mensaje de Error */}
        {error && <p className="error-message">{error}</p>}
        
        {/* Botón de Enviar */}
        <button type="submit" className="submit-button" disabled={isLoading}>
          {isLoading ? 'Enviando...' : 'Enviar Opinión'}
          <Send size={16} style={{ marginLeft: '8px' }} />
        </button>
      </form>
    </div>
  );
};

// --- Componente de Comentario Individual ---
interface CommentItemProps {
  comment: Comment;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment }) => {
  const formattedDate: string = new Date(comment.createdAt).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  
  // Asignar el nombre de usuario de mock si coincide con el ID del usuario logueado
  const userName: string = comment.user === LOGGED_USER_ID ? LOGGED_USER_NAME + ' (Tú)' : comment.user;

  return (
    <div className="comment-item">
      <div className="comment-header">
        <span className="username">{userName}</span>
        <StarRating rating={comment.rating} size={14} />
      </div>
      <span className="comment-date">{formattedDate}</span>
      <p className="comment-content">{comment.content}</p>
    </div>
  );
};

// --- Componente Principal de la Sección de Comentarios ---
const CommentSection: React.FC<CommentSectionProps> = ({ productId = PRODUCT_ID_MOCK }) => {
  const [comments, setComments] = useState<Comment[]>(mockComments);
  
  // Función para actualizar el estado con el nuevo comentario enviado
  const handleCommentSubmitted = (newComment: Comment) => {
    // Agrega el nuevo comentario al inicio de la lista
    setComments(prev => [newComment, ...prev]);
  };
  
  // Nota: Aquí iría tu useEffect para cargar los comentarios reales de la API
  /*
  useEffect(() => {
    const fetchComments = async () => {
      // Tu lógica de fetch tipada
      // const response = await fetch(`${API_BASE_URL}/comments?productId=${productId}`);
      // const data: Comment[] = await response.json();
      // setComments(data);
    };
    fetchComments();
  }, [productId]);
  */

  return (
    <div className="comments-section-container">
      <h1>Opiniones del Producto</h1>
      
      {/* ------------------- Formulario para agregar nuevo comentario ------------------- */}
      <CommentForm 
        productId={productId} 
        onCommentSubmitted={handleCommentSubmitted} 
      />

      {/* ------------------- Lista de comentarios existentes ------------------- */}
      <h2 className="comments-list-title">Comentarios de Usuarios ({comments.length})</h2>
      <div className="comments-list">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <CommentItem key={comment._id} comment={comment} />
          ))
        ) : (
          <p className="no-comments">Sé el primero en dejar una opinión.</p>
        )}
      </div>

      <style jsx>{`
        /* --- ESTILOS GENERALES DEL CONTENEDOR DE LA SECCIÓN --- */
        .comments-section-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 30px 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          color: #333;
        }

        .comments-section-container h1 {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 30px;
          color: #007bff;
        }

        /* --- FORMULARIO DE COMENTARIOS --- */
        .comment-form-container {
          padding: 25px;
          border: 1px solid #ccc;
          border-radius: 10px;
          margin-bottom: 30px;
          background-color: #f9f9f9;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
        }
        
        .comment-form-container h3 {
          font-size: 1.5rem;
          margin-bottom: 20px;
          color: #007bff;
          border-bottom: 2px solid #e0e0e0;
          padding-bottom: 10px;
        }

        .comment-form {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .rating-input {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .rating-input label {
          font-weight: 600;
          font-size: 1.1rem;
        }

        .stars-interactive {
          display: flex;
          gap: 3px;
        }

        .stars-interactive .star-icon {
          cursor: pointer;
          transition: fill 0.2s, transform 0.1s;
        }

        .stars-interactive .star-icon:active {
          transform: scale(0.9);
        }
        
        textarea {
          width: 100%;
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 6px;
          resize: vertical;
          font-size: 1rem;
          box-sizing: border-box;
          min-height: 100px;
          transition: border-color 0.3s;
        }

        textarea:focus {
          border-color: #007bff;
          outline: none;
        }

        .error-message {
          color: #dc3545;
          font-weight: 500;
          margin-top: -10px;
        }

        .submit-button {
          align-self: flex-end;
          display: flex;
          align-items: center;
          padding: 12px 20px;
          background-color: #28a745; /* Verde para acción de guardar */
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.3s, transform 0.1s, box-shadow 0.3s;
          box-shadow: 0 2px 4px rgba(40, 167, 69, 0.3);
        }

        .submit-button:hover:not(:disabled) {
          background-color: #1e7e34;
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(40, 167, 69, 0.4);
        }

        .submit-button:disabled {
          background-color: #adb5bd;
          cursor: not-allowed;
          box-shadow: none;
        }

        /* --- LISTA DE COMENTARIOS --- */
        .comments-list-title {
            font-size: 1.6rem;
            font-weight: 600;
            margin-top: 40px;
            margin-bottom: 25px;
            border-bottom: 2px solid #007bff;
            padding-bottom: 5px;
            color: #333;
        }

        .comments-list {
            display: flex;
            flex-direction: column;
            gap: 15px;
        }

        .comment-item {
          padding: 15px;
          border: 1px solid #eee;
          border-radius: 8px;
          background-color: white;
          box-shadow: 0 1px 5px rgba(0, 0, 0, 0.08);
        }
        
        .comment-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 5px;
          border-bottom: 1px dashed #f0f0f0;
          padding-bottom: 5px;
        }
        
        .username {
          font-weight: 700;
          color: #007bff;
          font-size: 1.1rem;
        }
        
        .static-stars {
            display: flex;
            align-items: center;
            gap: 2px;
        }

        .comment-date {
          font-size: 0.85rem;
          color: #999;
          margin-bottom: 10px;
          display: block;
        }
        
        .comment-content {
          font-size: 1rem;
          line-height: 1.6;
        }

        .no-comments {
          font-style: italic;
          color: #666;
          text-align: center;
          padding: 30px;
          border: 2px dashed #ccc;
          border-radius: 8px;
        }
      `}</style>
    </div>
  );
}

export default CommentSection;