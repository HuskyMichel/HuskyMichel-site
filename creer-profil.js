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
const categoriesSelectionnees = document.getElementById("categoriesSelectionnees");
const categoriesChoisies = [];
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

        const liste = document.createElement("div");

liste.style.display = "flex";
liste.style.flexWrap = "wrap";
liste.style.gap = "10px";
liste.style.marginTop = "15px";

        data.liste.forEach((categorie)=>{

            const bouton = document.createElement("button");

bouton.type = "button";
bouton.textContent = categorie;

bouton.style.background = "#2f2f2f";
bouton.style.color = "white";
bouton.style.border = "1px solid #555";
bouton.style.borderRadius = "20px";
bouton.style.padding = "8px 14px";
bouton.style.cursor = "pointer";
bouton.style.transition = "0.2s";

bouton.dataset.selected = "false";

bouton.onclick = () => {

    if(bouton.dataset.selected === "false"){

        bouton.dataset.selected = "true";

        bouton.style.background = "#3ea6ff";
        bouton.style.borderColor = "#3ea6ff";

        categoriesChoisies.push(categorie);

    }else{

        bouton.dataset.selected = "false";

        bouton.style.background = "#2f2f2f";
        bouton.style.borderColor = "#555";

        const index = categoriesChoisies.indexOf(categorie);

        if(index > -1){

            categoriesChoisies.splice(index,1);

        }

    }

    afficherCategoriesChoisies();

};

liste.appendChild(bouton);

        });

        recherche.addEventListener("input",()=>{

            const texte=recherche.value.toLowerCase();

            liste.querySelectorAll("button").forEach((button)=>{

                button.style.display =
button.textContent.toLowerCase().includes(texte)
? "inline-block"
: "none";

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

function afficherCategoriesChoisies(){

    categoriesSelectionnees.innerHTML = "";

    categoriesChoisies.forEach((categorie)=>{

        const tag = document.createElement("div");

        tag.textContent = "🏷️ " + categorie + " ✕";

        tag.style.display = "inline-block";
        tag.style.margin = "5px";
        tag.style.padding = "8px 12px";
        tag.style.background = "#3ea6ff";
        tag.style.borderRadius = "20px";
        tag.style.cursor = "pointer";

        tag.onclick = ()=>{

            categoriesChoisies.splice(
                categoriesChoisies.indexOf(categorie),
                1
            );

            document.querySelectorAll("#categoriesContainer button").forEach((b)=>{

                if(b.textContent === categorie){

                    b.dataset.selected="false";
                    b.style.background="#2f2f2f";
                    b.style.borderColor="#555";

                }

            });

            afficherCategoriesChoisies();

        };

        categoriesSelectionnees.appendChild(tag);

    });

}