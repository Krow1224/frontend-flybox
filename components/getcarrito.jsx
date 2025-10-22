export async function GETcarrito() {
  const res = await fetch("http://localhost:4000/api/carrito");
  const data = await res.json();

  return Response.json(data);
}
//no recuerdo muy bien para que era el componente pero está funcionando, no tocar, proximo a revisar