const videoYoutube = document.getElementById("videoYoutube");
let reseauxAjoutes = [];
import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    collection,
    getDocs,
    query,
    where,
    doc,
    getDoc,
    setDoc
}
from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const photo = document.getElementById("photo");
const categoriesContainer = document.getElementById("categoriesContainer");
const categoriesSelectionnees = document.getElementById("categoriesSelectionnees");
const categoriesChoisies = [];
function selectionnerCategorie(categorie, bouton){

    if(categoriesChoisies.includes(categorie)){
        return;
    }

    categoriesChoisies.push(categorie);

    bouton.dataset.selected = "true";
    bouton.style.background = "#3ea6ff";
    bouton.style.borderColor = "#3ea6ff";

    afficherCategoriesChoisies();

}
const ajouterReseau = document.getElementById("ajouterReseau");
const reseaux = document.getElementById("reseaux");
const pseudo = document.getElementById("pseudo");
const pseudoEtat = document.getElementById("pseudoEtat");
const saveProfile = document.getElementById("saveProfile");
const descriptionCourte = document.getElementById("descriptionCourte");
const descriptionLongue = document.getElementById("descriptionLongue");

const compteConnecte =
    document.getElementById("compteConnecte");

const deconnexion =
    document.getElementById("deconnexion");

onAuthStateChanged(auth, async (user)=>{

    if(!user){

        window.location.href="index.html";
        return;

    }

    photo.src = user.photoURL;

    if(compteConnecte){

        compteConnecte.textContent =
            "👤 " + user.email;

    }

    await chargerCategories();

    await chargerProfil(user);

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

        selectionnerCategorie(categorie, bouton);

    }else{

        bouton.dataset.selected = "false";

        bouton.style.background = "#2f2f2f";
        bouton.style.borderColor = "#555";

        const index = categoriesChoisies.indexOf(categorie);

        if(index > -1){

            categoriesChoisies.splice(index,1);

        }

        afficherCategoriesChoisies();

    }

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

ajouterReseau.addEventListener("click", ajouterUnReseau);

function ajouterUnReseau(type="", lien=""){

    const div = document.createElement("div");

    div.style.display = "flex";
    div.style.gap = "10px";
    div.style.marginBottom = "10px";

    div.innerHTML = `
        <select class="typeReseau">

            <option ${type==="YouTube"?"selected":""}>YouTube</option>
            <option ${type==="Twitch"?"selected":""}>Twitch</option>
            <option ${type==="Discord"?"selected":""}>Discord</option>
            <option ${type==="TikTok"?"selected":""}>TikTok</option>
            <option ${type==="Instagram"?"selected":""}>Instagram</option>
            <option ${type==="Snapchat"?"selected":""}>Snapchat</option>
            <option ${type==="Kick"?"selected":""}>Kick</option>
            <option ${type==="Facebook"?"selected":""}>Facebook</option>
            <option ${type==="Paypal"?"selected":""}>Paypal</option>
            <option ${type==="Site Web"?"selected":""}>Site Web</option>

        </select>

        <input
        class="lienReseau"
        type="text"
        value="${lien}"
        placeholder="Lien ou identifiant">

        <button type="button">❌</button>
    `;

    div.querySelector("button").onclick = ()=>{

        div.remove();

    };

    reseaux.appendChild(div);

}

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
async function chargerProfil(user){

    const profil = await getDoc(doc(db,"users",user.uid));

    if(!profil.exists()){
        return;
    }

    const data = profil.data();
	
	videoYoutube.value = data.videoYoutube || "";
	
	/* ===========================
   RECHARGER LES CATEGORIES
=========================== */

if(data.categories){

    data.categories.forEach((categorie)=>{

        document
        .querySelectorAll("#categoriesContainer button")
        .forEach((button)=>{

            if(button.textContent === categorie){

                selectionnerCategorie(categorie, button);

            }

        });

    });

}

afficherCategoriesChoisies();

    pseudo.value = data.pseudo || "";
    descriptionCourte.value = data.descriptionCourte || "";
    descriptionLongue.value = data.descriptionLongue || "";
	
	// Recharger les réseaux
reseaux.innerHTML = "";

if(data.reseaux){

    data.reseaux.forEach((reseau)=>{

        ajouterUnReseau(reseau.type, reseau.lien);

    });

}

    saveProfile.textContent = "Mettre à jour mon profil";

}
async function verifierPseudo(){

    const valeur = pseudo.value.trim();

    if(valeur.length < 3){

        pseudoEtat.textContent = "Le pseudo doit contenir au moins 3 caractères.";
        pseudoEtat.style.color = "orange";
        return;

    }

    const q = query(
        collection(db,"users"),
        where("pseudo","==",valeur)
    );

    const resultat = await getDocs(q);

    if(resultat.empty){

        pseudoEtat.textContent = "✅ Pseudo disponible";
        pseudoEtat.style.color = "#3ea6ff";

    }else{

        pseudoEtat.textContent = "❌ Ce pseudo est déjà utilisé";
        pseudoEtat.style.color = "red";

    }

}
pseudo.addEventListener("input", verifierPseudo);

saveProfile.addEventListener("click", async () => {

    const user = auth.currentUser;

    if(!user){
        return;
    }

    if(pseudo.value.trim() === ""){

        alert("Tu dois choisir un pseudo.");
        return;

    }

    const categories = [];

    document.querySelectorAll("#categoriesContainer button").forEach((button)=>{

        if(button.dataset.selected === "true"){

            categories.push(button.textContent);

        }

    });

    if(categories.length === 0){

        alert("Choisis au moins une catégorie.");
        return;

    }
const listeReseaux = [];

document.querySelectorAll("#reseaux > div").forEach((div)=>{

    const type = div.querySelector(".typeReseau").value;

    const lien = div.querySelector(".lienReseau").value.trim();

    if(lien !== ""){

        listeReseaux.push({
            type,
            lien
        });

    }

});
    await setDoc(doc(db,"users",user.uid),{
		
		videoYoutube: videoYoutube.value.trim(),
		

        uid:user.uid,

        pseudo:pseudo.value.trim(),

        email:user.email,

        photo:user.photoURL,

        descriptionCourte:descriptionCourte.value,

        descriptionLongue:descriptionLongue.value,

		reseaux: listeReseaux,

        categories:categories,

        dateCreation:new Date()

    });

    alert("Profil enregistré avec succès !");

    window.location.href="index.html";

});

/* ===========================
   DECONNEXION
=========================== */

const compteConnecte =
    document.getElementById("compteConnecte");

const deconnexion =
    document.getElementById("deconnexion");


if(deconnexion){

    deconnexion.addEventListener("click", async ()=>{

        console.log("Bouton déconnexion cliqué");

        try{

            await signOut(auth);

            console.log("Déconnexion réussie");

            window.location.href = "index.html";

        }catch(error){

            console.error(
                "Erreur lors de la déconnexion :",
                error
            );

        }

    });

}