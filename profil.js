const videoContainer = document.getElementById("videoContainer");
if(data.videoYoutube){

    let url = data.videoYoutube;

    url = url.replace("watch?v=", "embed/");
    url = url.replace("youtu.be/", "www.youtube.com/embed/");

    videoContainer.innerHTML = `
        <iframe
            width="100%"
            height="500"
            src="${url}"
            frameborder="0"
            allowfullscreen>
        </iframe>
    `;

}
import { db } from "./firebase.js";

import {
    collection,
    query,
    where,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const params = new URLSearchParams(window.location.search);

const pseudoRecherche = params.get("pseudo");

if(!pseudoRecherche){

    document.body.innerHTML = "<h1 style='color:white;text-align:center;margin-top:50px;'>Aucun profil demandé.</h1>";

    throw new Error("Pseudo manquant");

}

const photo = document.getElementById("photo");
const pseudo = document.getElementById("pseudo");
const descriptionCourte = document.getElementById("descriptionCourte");
const descriptionLongue = document.getElementById("descriptionLongue");
const categories = document.getElementById("categories");
const reseaux = document.getElementById("reseaux");

const q = query(
    collection(db,"users"),
    where("pseudo","==",pseudoRecherche)
);

const resultat = await getDocs(q);

if(resultat.empty){

    document.body.innerHTML = "<h1 style='color:white;text-align:center;margin-top:50px;'>Profil introuvable.</h1>";

}else{

    const data = resultat.docs[0].data();

    photo.src = data.photo.replace("=s96-c", "=s512-c");

    pseudo.textContent = data.pseudo;

    descriptionCourte.textContent = data.descriptionCourte;

    descriptionLongue.textContent = data.descriptionLongue;

    categories.innerHTML = "";

    data.categories.forEach((categorie)=>{

        const tag = document.createElement("div");

        tag.className = "tag";

        tag.textContent = categorie;

        categories.appendChild(tag);

    });

    reseaux.innerHTML = "";

    data.reseaux.forEach((reseau)=>{

        const div = document.createElement("div");

        div.className = "reseau";

        div.innerHTML = `
            <strong>${reseau.type}</strong> :
            <a href="${reseau.lien}" target="_blank" style="color:#3ea6ff;">
                ${reseau.lien}
            </a>
        `;

        reseaux.appendChild(div);

    });

}