# Integración de vista previa web real

Para que tu web muestre los datos del panel en tiempo real cuando se carga en el iframe de "Vista Web", añade este script a tu página.

## Mensajes que envía el panel

El panel envía mensajes con esta estructura:

```javascript
{
  type: "BESTCARS_WEB_PREVIEW_VEHICLES",
  payload: {
    vehicles: [...],  // Array de vehículos filtrados y ordenados
    filterType: "all" | "disponible" | "premium",
    sortBy: "recent" | "price-low" | "price-high"
  }
}
```

## Script de ejemplo para tu web

Añade este código en tu web (por ejemplo en un `<script>` antes de `</body>`):

```html
<script>
(function() {
  function handlePreviewData(event) {
    if (event.data?.type !== "BESTCARS_WEB_PREVIEW_VEHICLES") return;

    const { vehicles, filterType, sortBy } = event.data.payload;

    // Aquí actualizas tu DOM con los vehículos.
    // Ejemplo: si tienes un contenedor con id="stock-grid":
    const grid = document.getElementById("stock-grid");
    if (grid) {
      grid.innerHTML = vehicles.map(v => `
        <div class="vehicle-card">
          <img src="${v.image}" alt="${v.name}" />
          <h3>${v.name}</h3>
          <p>${v.price.toLocaleString()}€</p>
        </div>
      `).join("");
    }
  }

  window.addEventListener("message", handlePreviewData);

  // Pedir el estado al cargar (por si el panel ya lo envió antes)
  if (window.parent !== window) {
    window.parent.postMessage({ type: "BESTCARS_WEB_PREVIEW_REQUEST_STATE" }, "*");
  }
})();
</script>
```

## Consideraciones

1. **CORS**: Si tu web está en otro dominio, el iframe puede bloquear la comunicación. Usa la misma organización de dominios o configura CORS adecuadamente.

2. **localhost**: Para desarrollo local, pon la URL de tu servidor (ej: `http://localhost:3000`) en el panel. El panel puede estar en otro puerto (ej: 5173).

3. **HTTPS**: En producción, si el panel está en HTTPS, la URL del iframe también debe ser HTTPS (o el navegador puede bloquear contenido mixto).
