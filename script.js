// Cambiar modo azul/oscuro

let modo = "oscuro";
let modoBoton = document.querySelector("#btn-modo");

if (document.querySelector("#btn-modo")) {
  if (localStorage.getItem("modo")) {
    localStorage.getItem("modo") == "oscuro"
    ? (document.querySelector("body").classList.remove("bg-azul"), modo = "oscuro", document.querySelector("#btn-modo").innerText = "Modo noche")
    : (document.querySelector("body").classList.add("bg-azul"), modo = "azul", document.querySelector("#btn-modo").innerText = "Modo oscuro")
  }
  modoBoton.addEventListener("click", () => {
    document.querySelector("body").classList.toggle("bg-azul");
    if (modo == "azul") {
      modo = "oscuro";
      document.querySelector("#btn-modo").innerText = "Modo noche";
    } else {
      modo = "azul";
      document.querySelector("#btn-modo").innerText = "Modo oscuro";
    }
    localStorage.setItem("modo", modo);
  });

}

// Funcion almacenamiento

function Almacenamiento() {
  let storage = [];

  function resetear() {
    storage = [];
    document.querySelector(
      "#historialBusqueda > ul"
    ).innerHTML = `<li class="list-group-item border-0 bg-transparent text-secondary border border-bottom-1 m-auto w-100 text-center">Sin búsquedas aún</li>`;
  }

  function agregar(palabra) {
    if (!storage.includes(palabra)) {
      storage.push(palabra);
    }
    console.log(storage);
  }

  function leer() {
    if (storage.length >= 1) {
      document.querySelector("#historialBusqueda > ul").innerHTML = "";
    }
    storage.map((palabra) => {
      document.querySelector(
        "#historialBusqueda > ul"
      ).innerHTML += `<li id="historialLista" class="list-group-item border-0 bg-transparent"><a class="text-decoration-none text-dark fw-bold text-capitalize" href="#">${palabra}</a></li>`;
    });
  }

  return {
    resetear,
    agregar,
    leer,
  };
}

const almacenamiento = new Almacenamiento();

if (document.querySelector("#btn-buscar")) {
  document.querySelector("#busqueda").addEventListener("focus", () => {
    almacenamiento.leer();
  });

  document.querySelector("#borrarHistorial").addEventListener("click", () => {
    almacenamiento.resetear();
  });

  document.querySelector("#btn-buscar").addEventListener("click", (e) => {
    document.querySelector("#busqueda").blur();

    let palabra = "";

    palabra = document.querySelector("#busqueda").value.trim();

    if (palabra == "") {
      return;
    }

    almacenamiento.agregar(palabra);

    document.querySelector("#busqueda").value = "";

    localStorage.setItem(palabra, palabra);

    document.querySelector("#listaPalabras").innerHTML = "";

    e.preventDefault();

    fetch("https://jisho.org/api/v1/search/words?keyword=" + palabra)
      .then((res) => res.json())
      .then((datos) => {
        console.log(datos);
        datos.data.map((res) => {
          function validarNivel() {
            if (res.jlpt.length != 0) {
              return (
                '<p class="my-3 bg-primary m-auto rounded px-2" style="width: fit-content;">' +
                res.jlpt[0] +
                "</p>"
              );
            } else {
              return "";
            }
          }

          function validarFrecuencia() {
            if (res.is_common == true) {
              return (
                '<p class="my-3 bg-success m-auto rounded px-2" style="width: fit-content;">' +
                "Muy frecuente" +
                "</p>"
              );
            } else {
              return (
                '<p class="my-3 bg-rojo m-auto rounded px-2" style="width: fit-content;">' +
                "Poco frecuente" +
                "</p>"
              );
            }
          }

          document.querySelector("#listaPalabras").innerHTML +=
            '<div class="d-flex flex-column border-bottom border-2 border-dark py-4 mx-5">' +
            '<p class="my-1">' +
            res.japanese[0].reading +
            "</p>" +
            '<h4 class="fs-2">' +
            res.slug +
            "</h4>" +
            "<div>" +
            '<p class="fw-bold fs-4 my-1">' +
            res.senses[0].english_definitions +
            "</p>" +
            "</div>" +
            '<div class="text-light">' +
            validarNivel() +
            validarFrecuencia() +
            "</div>" +
            "<div>" +
            `<button onclick="guardarPalabra({id: '${res.slug}', lectura: '${res.japanese[0].reading}', significado: '${res.senses[0].english_definitions}'}, event)" class="btn border-0 bg-dark text-light">` +
            "Agregar a favoritos" +
            "</button>" +
            "</div>" +
            "</div>";
        });
        cargarLista();
      });
  });
}

function cargarLista() {
  document.querySelector("#diccionarioHeader").style = "display: none;";
  document.querySelector("#listaPalabras").style =
    "display: block !important;  margin: auto; padding: 0; width: 80%;";
}

function mostrarHistorial() {
  for (let i = 0; i < 5; i++) {
    const key = localStorage.key(i);
    if (key != null && key != "modo") {
      document.querySelector(
        "#listaPalabraReciente"
      ).innerHTML += `<li class="list-group-item m-auto border-0 bg-transparent text-danger">${key}</li>`;
    }
  }
}

if (document.querySelector("#btn-borrar-busquedas")) {
  document
    .querySelector("#btn-borrar-busquedas")
    .addEventListener("click", () => {
      localStorage.clear();
      document.querySelector("#listaPalabraReciente").innerHTML = "";
    });
}

if (document.querySelector("#listaPalabraReciente")) {
  mostrarHistorial();
}

// indexedDB

let db;
let request = indexedDB.open("Jiten", 1);

request.onerror = function () {
  console.log("Error al conectar con la base de datos");
};

request.onsuccess = function () {
  db = request.result;
  console.log(db);
  leerPalabra();
  cantidadPalabra();
};

request.onupgradeneeded = function (event) {
  let db = event.target.result;

  console.log(db);

  let objectStore = db.createObjectStore("Guardados", { keyPath: "id" });
  objectStore.createIndex("Palabra", "id", { autoIncrement: true });
};

const guardarPalabra = (palabra, event) => {
  let transaction = db.transaction(["Guardados"], "readwrite");
  let objectStore = transaction.objectStore("Guardados");
  let request = objectStore.add(palabra);

  event.target.innerText = "✓";
  event.target.setAttribute(
    "class",
    "bg-success border-0 text-light fs-4 rounded-circle px-2"
  );

  console.log(request);
  console.log(palabra);
};

const cantidadPalabra = () => {
  let transaction = db.transaction(["Guardados"], "readwrite");
  let objectStore = transaction.objectStore("Guardados");
  let request = objectStore.count();

  request.onsuccess = function () {
    console.log(request.result);
    if (document.querySelector("#cantidadGuardados")) {
      document.querySelector("#cantidadGuardados").innerText =
        "Cantidad de palabras: " + request.result;
    }
  };
};

const leerPalabra = () => {
  let transaction = db.transaction(["Guardados"], "readonly");
  let objectStore = transaction.objectStore("Guardados");
  let request = objectStore.getAll();
  request.onsuccess = function () {
    if (request.result.length > 0) {
      if (document.querySelector("#contenedorGuardados")) {
        document.querySelector("#contenidoGuardados").innerHTML = "";
        request.result.map((palabra) => {
          document.querySelector("#contenedorGuardados").innerHTML +=
            `<div class="d-flex flex-column border-bottom border-2 border-dark py-4 mx-5" id=${palabra.id}>` +
            '<span id="cantidadGuardados" class="pb-5 fs-4 fw-bold text-success"></span>' +
            '<p class="my-1">' +
            palabra.lectura +
            "</p>" +
            '<h4 class="fs-2">' +
            palabra.id +
            "</h4>" +
            '<p id="palabraSignificado" class="text-break fw-bold fs-4 my-1">' +
            palabra.significado +
            "</p>" +
            '<div class="d-flex flex-row justify-content-center gap-4 pt-4">' +
            '<input class="form-control w-50 bg-secondary text-light" type="text">' +
            `<button class="btn bg-primary text-light" onclick="editarPalabra(event, '${palabra.id}')">` +
            "Editar significado";
          "</button>" + "</div>" + "</div>";
          console.log(palabra);
        });
      }
    }
  };
};

const editarPalabra = (event, id) => {
  let transaction = db.transaction(["Guardados"], "readwrite");
  let objectStore = transaction.objectStore("Guardados");
  console.log(event.target.previousElementSibling.value);

  let palabraNueva = event.target.previousElementSibling.value;

  event.target.parentNode.previousElementSibling.innerText = palabraNueva;

  let getRequest = objectStore.get(id);

  getRequest.onsuccess = function () {
    let palabra = getRequest.result;

    palabra.significado = palabraNueva;

    let updateRequest = objectStore.put(palabra);

    leerPalabra();
    updateRequest.onsuccess = function () {
      console.log("Palabra actualizada exitosamente");
    };

    updateRequest.onerror = function () {
      console.log("Error al actualizar la palabra");
    };
  };
};

// Serviceworker

if ("serviceWorker" in navigator) {
  try {
    navigator.serviceWorker.register("./serviceWorker.js");
    console.log("service worker registered");
  } catch (error) {
    console.log("service worker reg failed");
  }
} else {
  console.log("sw not supperted");
}