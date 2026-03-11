var map = L.map('map').setView([4.673, -74.144], 13); 

//L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

var capaSitp;
var capaLocalidad; 

function cargarLocalidad() {
    fetch("http://localhost:5000/fontibon")
        .then(r => r.json())
        .then(data => {
            capaLocalidad = L.geoJSON(data, {
                style: { 
                    color: "#2c3e50",    // Borde oscuro elegante
                    weight: 2, 
                    fillColor: "#ecf0f1", // Color gris suave o azul claro para Fontibón
                    fillOpacity: 1       // Opacidad total para que sea un color sólido
                }
            }).addTo(map);
        });
}
// Llamada inmediata para ver el borde rojo al abrir
cargarLocalidad();

function mostrarMapa() {
    // Si la capa existe, la quitamos/ponemos (Toggle)
    if (capaLocalidad) {
        if (map.hasLayer(capaLocalidad)) {
            map.removeLayer(capaLocalidad);
        } else {
            capaLocalidad.addTo(map);
        }
    }
}

function mostrarSitp() {
    if (capaSitp && map.hasLayer(capaSitp)) {
        map.removeLayer(capaSitp);
    } else {
        fetch("http://localhost:5000/sitp")
            .then(r => r.json())
            .then(data => {
                capaSitp = L.geoJSON(data, {
                    pointToLayer: (f, latlng) => L.circleMarker(latlng, { 
                        radius: 6, 
                        fillColor: "#2ecc71", 
                        color: "#000", 
                        weight: 1, 
                        fillOpacity: 0.8 
                    }),
                    onEachFeature: (f, layer) => {
                        let nombre = f.properties.nombre_par || "Estación";
                        // Cambiamos Popup por Tooltip para que sea más fácil validar
                        layer.bindTooltip(nombre, { sticky: true }); 
                    }
                }).addTo(map);
            });
    }
}

function mostrarInfo() {
    var menu = document.getElementById("menu").value;
    var panel = document.getElementById("panel");
    panel.innerHTML = "Cargando..."; 

    if (menu == "Información general") {
        fetch("http://localhost:8080/info")
            .then(r => r.json())
            .then(data => {
                panel.innerHTML =
                    "<b>Nombre:</b> " + data.nombre + "<br>" +
                    "<b>Área:</b> " + data.area + "<br>" +
                    "<b>Código:</b> " + data.codigo + "<br>" +
                    "<a href='" + data.wiki + "' target='_blank'>Wikipedia</a>";
            });
    }

    if (menu == "Estaciones SITP") {
        fetch("http://localhost:5000/sitp")
            .then(r => r.json())
            .then(data => {
                // AJUSTE: Estilo para que el listado sea legible
                var html = "<b>Paraderos en Fontibón:</b><br><div style='max-height:300px; overflow-y:auto; border: 1px solid #ccc; padding: 5px;'>";
                
                data.features.forEach(f => {
                    // AJUSTE: Usamos 'nombre_par' y 'direccion_'
                    let nombre = f.properties.nombre_par || "Sin nombre";
                    let dir = f.properties.direccion_ || "";
                    
                    html += `<p style='font-size:11px; margin-bottom:5px; border-bottom:1px solid #eee;'>
                                <b>• ${nombre}</b><br>
                                ${dir}
                                <a href="#" onclick="consultarNegocio('${nombre.replace(/'/g, "\\'")}'); return false;" style="text-decoration: none; margin-left:10px; color: blue;">[Abrir]</a>
                             </p>`;
                });
                
                html += "</div>";
                panel.innerHTML = html;
            });
    }

    if (menu == "Análisis") {
        fetch("http://localhost:5000/sitp")
            .then(r => r.json())
            .then(data => {
                var html = "<b>Filtro de Análisis:</b><br><div style='max-height:300px; overflow-y:auto; border: 1px solid #ccc; padding: 5px;'>";
                
                data.features.forEach((f, index) => {
                    let nombre = f.properties.nombre_par || "Sin nombre";
                    let dir = f.properties.direccion_ || "";
                    // Creamos un checkbox único para cada estación usando su ID o índice
                    html += `
                        <div style='font-size:11px; margin-bottom:5px; border-bottom:1px solid #eee;'>
                            <input type="checkbox" checked id="check-${index}" onchange="toggleEstacion(${index})">
                            <label for="check-${index}"><b>${nombre}</b></label>
                        </div>`;
                });
                
                html += "</div>";
                panel.innerHTML = html;

                // IMPORTANTE: Si las estaciones no están en el mapa, las cargamos de una vez
                if (!capaSitp || !map.hasLayer(capaSitp)) {
                    mostrarSitp(); 
                }
            });
    }
}

function consultarNegocio(nombreEstacion) {
    var panel = document.getElementById("panel");
    panel.innerHTML = "Consultando lógica de negocio...";

    fetch(`http://localhost:8080/detalle_estacion/${encodeURIComponent(nombreEstacion)}`)
        .then(r => r.json())
        .then(data => {
            panel.innerHTML = `
                <button onclick="mostrarInfo()" style="margin-bottom:10px;">⬅ Volver</button>
                <div style="border-left: 5px solid ${data.color}; padding-left: 15px; background: #fdfdfd; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <h3 style="color: ${data.color};">${data.nombre}</h3>
                    <p><b>Categoría:</b> ${data.tipo}</p>
                    <p><b>Tarifa:</b> ${data.tarifa}</p>
                    <p><b>Horario:</b> ${data.horario}</p>
                    <hr>
                    <a href="${data.link_externo}" target="_blank" 
                       style="display: inline-block; padding: 8px 12px; background: #e30613; color: white; text-decoration: none; border-radius: 4px;">
                       Consultar más información
                    </a>
                    <p style="font-size: 10px; margin-top: 15px; color: gray;">${data.fuente}</p>
                </div>
            `;
        });
}

function toggleEstacion(index) {
    if (!capaSitp) return;

    var capas = capaSitp.getLayers();
    var marcador = capas[index];

    if (marcador) {
        if (document.getElementById(`check-${index}`).checked) {
            // Si el checkbox está marcado y no está en el mapa, lo añadimos
            if (!map.hasLayer(marcador)) {
                marcador.addTo(map);
            }
        } else {
            // Si no está marcado, lo quitamos
            map.removeLayer(marcador);
        }
    }
}