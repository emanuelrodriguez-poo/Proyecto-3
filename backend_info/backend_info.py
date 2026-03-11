from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app) # Importante para que el navegador no bloquee la petición

@app.route("/info")
def get_info():
    # Esta es la lógica que antes hacía Java
    return jsonify({
        "nombre": "Fontibón",
        "area": "33.3 km2",
        "codigo": "9",
        "wiki": "https://es.wikipedia.org/wiki/Fontibón"
    })

DB_NEGOCIO = {
    "Zonal": {"color": "#0072bc", "tarifa": "$3.350"},
    "Alimentador": {"color": "#00a650", "tarifa": "$0.00"},
}

# Fíjate en el <path:nombre>
@app.route("/detalle_estacion/<path:nombre>", strict_slashes=False)
def detalle_estacion(nombre):
    try:
        # LÓGICA DE NEGOCIO: Determinar tipo
        tipo = "Alimentador" if "ALM" in nombre.upper() else "Zonal"

        # Validación de seguridad
        info_tipo = DB_NEGOCIO.get(tipo, {"color": "#0072bc", "tarifa": "$3.100"})

        # ERROR CORREGIDO: Usamos 'nombre' que es lo que recibe la función
        # También agregamos .replace("#", "") por si el nombre trae numerales que rompen la URL
        busqueda = nombre.replace(" ", "+").replace("#", "") + "+SITP+Bogota"
        
        # URL de Google Maps corregida para que sea un link de búsqueda directo
        link_final = f"https://www.google.com/maps/search/{busqueda}"

        return jsonify({
            "nombre": nombre,
            "tipo": tipo,
            "color": info_tipo["color"],
            "tarifa": info_tipo["tarifa"],
            "horario": "04:00 AM - 11:00 PM",
            "link_externo": link_final,
            "fuente": "Capa de Negocio - Procesamiento RealTime"
        })
    except Exception as e:
        print(f"Error interno detectado: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(port=8080, debug=True)