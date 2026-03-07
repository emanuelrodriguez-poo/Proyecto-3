from flask import Flask
import geopandas as gpd

app = Flask(__name__)

sitp = gpd.read_file("../data/sitp.geojson")

@app.route("/sitp")
def get_sitp():

    return sitp.to_json()


@app.route("/buffer")
def buffer():

    buffer = sitp.buffer(0.001)

    return buffer.to_json()


if __name__ == "__main__":
    app.run(port=5000)