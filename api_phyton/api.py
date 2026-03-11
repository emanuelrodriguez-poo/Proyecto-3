from flask import Flask, jsonify
from flask_cors import CORS
import geopandas as gpd
import pandas as pd

app = Flask(__name__)
CORS(app)

PATH_LOCALIDADES = "../data/localidades.json" 
PATH_PARADEROS = "../data/paraderos.json"

# Carga los datos una sola vez al arrancar el servidor
df_loc = gpd.read_file(PATH_LOCALIDADES)
df_pts = gpd.read_file(PATH_PARADEROS)

@app.route("/fontibon")
def get_fontibon():
    df_loc = gpd.read_file(PATH_LOCALIDADES)
    # Filtramos Fontibón por su código oficial '09'
    fontibon = df_loc[df_loc['LocCodigo'] == '09']
    return fontibon.to_json()

@app.route("/sitp")
def get_sitp():
    # Cargamos paraderos
    df_pts = gpd.read_file(PATH_PARADEROS)
    
    # FILTRO DIRECTO: Según tu JSON, el campo es 'localidad_'
    # Fontibón es la localidad 9.
    puntos_fontibon = df_pts[df_pts['localidad_'] == 9]
    
    return puntos_fontibon.to_json()

if __name__ == "__main__":
    app.run(port=5000, debug=True)