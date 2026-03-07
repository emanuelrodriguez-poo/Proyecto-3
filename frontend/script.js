var map = L.map('map').setView([4.667,-74.14],13);

L.tileLayer(
'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
).addTo(map);

var capaSitp;

function mostrarMapa(){

if(capaSitp){
map.removeLayer(capaSitp)
}

}

function mostrarSitp(){

fetch("http://localhost:5000/sitp")

.then(r=>r.json())

.then(data=>{

capaSitp=L.geoJSON(data,{
pointToLayer:function(feature,latlng){
return L.circleMarker(latlng,{radius:6});
}
}).addTo(map)

})

}

function mostrarInfo(){

var menu=document.getElementById("menu").value

var panel=document.getElementById("panel")

if(menu=="Información general"){

fetch("http://localhost:8080/info")

.then(r=>r.json())

.then(data=>{

panel.innerHTML=

"<b>Nombre:</b>"+data.nombre+"<br>"+
"<b>Área:</b>"+data.area+"<br>"+
"<b>Código:</b>"+data.codigo+"<br>"+
"<a href='"+data.wiki+"'>Wikipedia</a>"

})

}

if(menu=="Estaciones SITP"){

fetch("http://localhost:5000/sitp")

.then(r=>r.json())

.then(data=>{

var html=""

data.features.forEach(f=>{

html+="<p>"+f.properties.nombre+"</p>"

})

panel.innerHTML=html

})

}

}