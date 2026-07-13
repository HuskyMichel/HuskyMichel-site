import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const photo = document.getElementById("photo");
const categoriesContainer = document.getElementById("categoriesContainer");
const ajouterReseau = document.getElementById("ajouterReseau");
const reseaux = document.getElementById("reseaux");

onAuthStateChanged(auth, async (user)=>{

    if(!user){

        window.location.href="index.html";
        return;

    }

    photo.src = user.photoURL;

    chargerCategories();

});

async function chargerCategories(){

    categoriesContainer.innerHTML="";

    const snapshot = await getDocs(collection(db,"categories"));

    snapshot.forEach((doc)=>{

        const data = doc.data();

        const details = document.createElement("details");

        details.style.marginBottom="15px";

        const summary = document.createElement("summary");

        summary.textContent = doc.id.replaceAll("_"," ");

        details.appendChild(summary);

        const recherche = document.createElement("input");

        recherche.type="text";

        recherche.placeholder="Rechercher...";

        recherche.style.marginTop="10px";

        details.appendChild(recherche);

        const liste=document.createElement("div");

        liste.style.marginTop="10px";

        data.liste.forEach((categorie)=>{

            const label=document.createElement("label");

            label.style.display="block";

            label.innerHTML=`
            <input
            type="checkbox"
            value="${categorie}">
            ${categorie}
            `;

            liste.appendChild(label);

        });

        recherche.addEventListener("input",()=>{

            const texte=recherche.value.toLowerCase();

            liste.querySelectorAll("label").forEach((label)=>{

                label.style.display=
                label.textContent.toLowerCase().includes(texte)
                ?"block":"none";

            });

        });

        details.appendChild(liste);

        categoriesContainer.appendChild(details);

    });

}

ajouterReseau.addEventListener("click",()=>{

    const div=document.createElement("div");

    div.style.marginBottom="15px";

    div.innerHTML=`

    <select>

        <option>YouTube</option>

        <option>Twitch</option>

        <option>Discord</option>

        <option>TikTok</option>

        <option>Instagram</option>

        <option>Snapchat</option>

        <option>Kick</option>

        <option>Facebook</option>

        <option>Paypal</option>

        <option>Site Web</option>

    </select>

    <input
    type="text"
    placeholder="Lien">

    `;

    reseaux.appendChild(div);

});