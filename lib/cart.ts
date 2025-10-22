import { traerdeAPI } from "./api";

export async function getCart(userId: string) {
  return traerdeAPI(`/carrito?userId=${userId}`);
}

//experimental