import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    collection,
    getDocs,
    query,
    where,
    doc,
    getDoc,
    setDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


/* ===========================
   ELEMENTS HTML
=========================== */

const photo =
    document.getElementById("photo");

const pseudo =
    document.getElementById("pseudo");

const pseudoEtat =
    document.getElementById("pseudoEtat");

const descriptionCourte =
    document.getElementById("descriptionCourte");

const descriptionLongue =
    document.getElementById("descriptionLongue");

const videoYoutube =
    document.getElementById("videoYoutube");

const categoriesContainer =
    document.getElementById("categoriesContainer");

const categoriesSelectionnees =
    document.getElementById("categoriesSelectionnees");

const ajouterReseau =
    document.getElementById("ajouterReseau");

const reseaux =
    document.getElementById("reseaux");

const saveProfile =
    document.getElementById("saveProfile");

const compteConnecte =
    document.getElementById("compteConnecte");

const deconnexion =
    document.getElementById("deconnexion");


/* ===========================
   VARIABLES
=========================== */

let utilisateurActuel = null;

const categoriesChoisies = [];


/* ===========================
   UTILISATEUR CONNECTE
=========================== */

onAuthStateChanged(auth, async (user)=>{

    if(!user){

        window.location.href =
            "index.html";

        return;

    }


    utilisateurActuel = user;


    /* ===========================
       PHOTO GOOGLE
    =========================== */

    if(user.photoURL){

        photo.src =
            user.photoURL.replace(
                "=s96-c",
                "=s512-c"
            );

    }


    /* ===========================
       COMPTE CONNECTE
    =========================== */

    if(compteConnecte){

        compteConnecte.textContent =
            user.displayName ||
            user.email ||
            "";

    }


    /* ===========================
       CHARGEMENT
    =========================== */

    try{

        await chargerCategories();

        await chargerProfil(user);

    }catch(error){

        console.error(
            "Erreur lors du chargement :",
            error
        );

    }

});


/* ===========================
   DECONNEXION
=========================== */

if(deconnexion){

    deconnexion.addEventListener(
        "click",
        async ()=>{

            try{

                await auth.signOut();

                window.location.href =
                    "index.html";

            }catch(error){

                console.error(
                    "Erreur déconnexion :",
                    error
                );

            }

        }
    );

}


/* ===========================
   CHARGER LES CATEGORIES
=========================== */

async function chargerCategories(){

    categoriesContainer.innerHTML =
        "Chargement...";


    const snapshot =
        await getDocs(
            collection(db,"categories")
        );


    categoriesContainer.innerHTML = "";


    snapshot.forEach((categorieDoc)=>{

        const data =
            categorieDoc.data();


        const details =
            document.createElement("details");


        details.style.marginBottom =
            "15px";


        const summary =
            document.createElement("summary");


        summary.textContent =
            categorieDoc.id.replaceAll(
                "_",
                " "
            );


        details.appendChild(summary);


        /* ===========================
           RECHERCHE CATEGORIE
        =========================== */

        const recherche =
            document.createElement("input");


        recherche.type =
            "text";


        recherche.placeholder =
            "Rechercher...";


        recherche.style.marginTop =
            "10px";


        details.appendChild(
            recherche
        );


        /* ===========================
           LISTE
        =========================== */

        const liste =
            document.createElement("div");


        liste.style.display =
            "flex";


        liste.style.flexWrap =
            "wrap";


        liste.style.gap =
            "10px";


        liste.style.marginTop =
            "15px";


        const listeCategories =
            data.liste || [];


        listeCategories.forEach(
            (categorie)=>{

                const bouton =
                    document.createElement("button");


                bouton.type =
                    "button";


                bouton.textContent =
                    categorie;


                bouton.style.background =
                    "#2f2f2f";


                bouton.style.color =
                    "white";


                bouton.style.border =
                    "1px solid #555";


                bouton.style.borderRadius =
                    "20px";


                bouton.style.padding =
                    "8px 14px";


                bouton.style.cursor =
                    "pointer";


                bouton.style.transition =
                    "0.2s";


                bouton.dataset.selected =
                    "false";


                bouton.addEventListener(
                    "click",
                    ()=>{

                        if(
                            bouton.dataset.selected
                            === "false"
                        ){

                            selectionnerCategorie(
                                categorie,
                                bouton
                            );

                        }else{

                            retirerCategorie(
                                categorie,
                                bouton
                            );

                        }

                    }
                );


                liste.appendChild(
                    bouton
                );

            }
        );


        /* ===========================
           RECHERCHE
        =========================== */

        recherche.addEventListener(
            "input",
            ()=>{

                const texte =
                    recherche.value
                    .toLowerCase()
                    .trim();


                liste
                .querySelectorAll("button")
                .forEach((button)=>{

                    button.style.display =
                        button.textContent
                        .toLowerCase()
                        .includes(texte)
                        ? "inline-block"
                        : "none";

                });

            }
        );


        details.appendChild(
            liste
        );


        categoriesContainer.appendChild(
            details
        );

    });

}


/* ===========================
   SELECTION CATEGORIE
=========================== */

function selectionnerCategorie(
    categorie,
    bouton
){

    if(
        categoriesChoisies.includes(
            categorie
        )
    ){

        return;

    }


    categoriesChoisies.push(
        categorie
    );


    bouton.dataset.selected =
        "true";


    bouton.style.background =
        "#3ea6ff";


    bouton.style.borderColor =
        "#3ea6ff";


    afficherCategoriesChoisies();

}


/* ===========================
   RETIRER CATEGORIE
=========================== */

function retirerCategorie(
    categorie,
    bouton
){

    bouton.dataset.selected =
        "false";


    bouton.style.background =
        "#2f2f2f";


    bouton.style.borderColor =
        "#555";


    const index =
        categoriesChoisies.indexOf(
            categorie
        );


    if(index !== -1){

        categoriesChoisies.splice(
            index,
            1
        );

    }


    afficherCategoriesChoisies();

}


/* ===========================
   AFFICHER CATEGORIES CHOISIES
=========================== */

function afficherCategoriesChoisies(){

    categoriesSelectionnees.innerHTML =
        "";


    categoriesChoisies.forEach(
        (categorie)=>{

            const tag =
                document.createElement("div");


            tag.textContent =
                "🏷️ " +
                categorie +
                " ✕";


            tag.style.display =
                "inline-block";


            tag.style.margin =
                "5px";


            tag.style.padding =
                "8px 12px";


            tag.style.background =
                "#3ea6ff";


            tag.style.borderRadius =
                "20px";


            tag.style.cursor =
                "pointer";


            tag.addEventListener(
                "click",
                ()=>{

                    const index =
                        categoriesChoisies
                        .indexOf(categorie);


                    if(index !== -1){

                        categoriesChoisies
                        .splice(
                            index,
                            1
                        );

                    }


                    document
                    .querySelectorAll(
                        "#categoriesContainer button"
                    )
                    .forEach((button)=>{

                        if(
                            button.textContent
                            === categorie
                        ){

                            button.dataset.selected =
                                "false";

                            button.style.background =
                                "#2f2f2f";

                            button.style.borderColor =
                                "#555";

                        }

                    });


                    afficherCategoriesChoisies();

                }
            );


            categoriesSelectionnees.appendChild(
                tag
            );

        }
    );

}


/* ===========================
   AJOUTER UN RESEAU
=========================== */

ajouterReseau.addEventListener(
    "click",
    ()=>{

        ajouterUnReseau();

    }
);


function ajouterUnReseau(
    type = "",
    lien = ""
){

    const div =
        document.createElement("div");


    div.style.display =
        "flex";


    div.style.gap =
        "10px";


    div.style.marginBottom =
        "10px";


    div.innerHTML = `

        <select class="typeReseau">

            <option value="YouTube"
                ${type === "YouTube" ? "selected" : ""}>
                YouTube
            </option>

            <option value="Twitch"
                ${type === "Twitch" ? "selected" : ""}>
                Twitch
            </option>

            <option value="Discord"
                ${type === "Discord" ? "selected" : ""}>
                Discord
            </option>

            <option value="TikTok"
                ${type === "TikTok" ? "selected" : ""}>
                TikTok
            </option>

            <option value="Instagram"
                ${type === "Instagram" ? "selected" : ""}>
                Instagram
            </option>

            <option value="Snapchat"
                ${type === "Snapchat" ? "selected" : ""}>
                Snapchat
            </option>

            <option value="Kick"
                ${type === "Kick" ? "selected" : ""}>
                Kick
            </option>

            <option value="Facebook"
                ${type === "Facebook" ? "selected" : ""}>
                Facebook
            </option>

            <option value="Paypal"
                ${type === "Paypal" ? "selected" : ""}>
                Paypal
            </option>

            <option value="Site Web"
                ${type === "Site Web" ? "selected" : ""}>
                Site Web
            </option>

        </select>


        <input
            class="lienReseau"
            type="text"
            value="${echapperHTML(lien)}"
            placeholder="Lien ou identifiant"
        >


        <button
            type="button"
            class="supprimerReseau">
            ❌
        </button>

    `;


    div
    .querySelector(".supprimerReseau")
    .addEventListener(
        "click",
        ()=>{

            div.remove();

        }
    );


    reseaux.appendChild(
        div
    );

}


/* ===========================
   CHARGER LE PROFIL EXISTANT
=========================== */

async function chargerProfil(user){

    const profilRef =
        doc(
            db,
            "users",
            user.uid
        );


    const profilSnap =
        await getDoc(
            profilRef
        );


    /* ===========================
       NOUVEAU PROFIL
    =========================== */

    if(!profilSnap.exists()){

        saveProfile.textContent =
            "Créer mon profil";

        return;

    }


    /* ===========================
       PROFIL EXISTANT
    =========================== */

    const data =
        profilSnap.data();


    /* ===========================
       PSEUDO
    =========================== */

    pseudo.value =
        data.pseudo || "";


    /* ===========================
       DESCRIPTION COURTE
    =========================== */

    descriptionCourte.value =
        data.descriptionCourte || "";


    /* ===========================
       DESCRIPTION LONGUE
    =========================== */

    descriptionLongue.value =
        data.descriptionLongue || "";


    /* ===========================
       VIDEO
    =========================== */

    videoYoutube.value =
        data.videoYoutube || "";


    /* ===========================
       CATEGORIES
    =========================== */

    categoriesChoisies.length = 0;


    document
    .querySelectorAll(
        "#categoriesContainer button"
    )
    .forEach((button)=>{

        button.dataset.selected =
            "false";

        button.style.background =
            "#2f2f2f";

        button.style.borderColor =
            "#555";

    });


    if(
        Array.isArray(
            data.categories
        )
    ){

        data.categories.forEach(
            (categorie)=>{

                const boutons =
                    document
                    .querySelectorAll(
                        "#categoriesContainer button"
                    );


                boutons.forEach(
                    (button)=>{

                        if(
                            button.textContent
                            === categorie
                        ){

                            selectionnerCategorie(
                                categorie,
                                button
                            );

                        }

                    }
                );

            }
        );

    }


    afficherCategoriesChoisies();


    /* ===========================
       RESEAUX
    =========================== */

    reseaux.innerHTML =
        "";


    if(
        Array.isArray(
            data.reseaux
        )
    ){

        data.reseaux.forEach(
            (reseau)=>{

                ajouterUnReseau(
                    reseau.type || "",
                    reseau.lien || ""
                );

            }
        );

    }


    /* ===========================
       BOUTON
    =========================== */

    saveProfile.textContent =
        "Mettre à jour mon profil";

}


/* ===========================
   VERIFICATION PSEUDO
=========================== */

pseudo.addEventListener(
    "input",
    verifierPseudo
);


async function verifierPseudo(){

    const valeur =
        pseudo.value.trim();


    if(valeur.length < 3){

        pseudoEtat.textContent =
            "Le pseudo doit contenir au moins 3 caractères.";


        pseudoEtat.style.color =
            "orange";


        return;

    }


    if(
        !utilisateurActuel
    ){

        return;

    }


    const q =
        query(
            collection(db,"users"),
            where(
                "pseudo",
                "==",
                valeur
            )
        );


    const resultat =
        await getDocs(q);


    /* ===========================
       PSEUDO DE SON PROPRE PROFIL
    =========================== */

    if(
        !resultat.empty
    ){

        const autreProfil =
            resultat.docs.find(
                (docSnap)=>
                    docSnap.id !==
                    utilisateurActuel.uid
            );


        if(!autreProfil){

            pseudoEtat.textContent =
                "✅ Ce pseudo est disponible pour ton profil.";

            pseudoEtat.style.color =
                "#3ea6ff";

            return;

        }


        pseudoEtat.textContent =
            "❌ Ce pseudo est déjà utilisé";

        pseudoEtat.style.color =
            "red";

        return;

    }


    pseudoEtat.textContent =
        "✅ Pseudo disponible";


    pseudoEtat.style.color =
        "#3ea6ff";

}


/* ===========================
   ENREGISTRER / REMPLACER
=========================== */

saveProfile.addEventListener(
    "click",
    async ()=>{

        const user =
            auth.currentUser;


        if(!user){

            alert(
                "Tu dois être connecté."
            );

            return;

        }


        const nouveauPseudo =
            pseudo.value.trim();


        /* ===========================
           VALIDATION PSEUDO
        =========================== */

        if(
            nouveauPseudo === ""
        ){

            alert(
                "Tu dois choisir un pseudo."
            );

            return;

        }


        if(
            nouveauPseudo.length < 3
        ){

            alert(
                "Le pseudo doit contenir au moins 3 caractères."
            );

            return;

        }


        /* ===========================
           CATEGORIES
        =========================== */

        const categories =
            [...categoriesChoisies];


        if(categories.length === 0){

            alert(
                "Choisis au moins une catégorie."
            );

            return;

        }


        /* ===========================
           RESEAUX
        =========================== */

        const listeReseaux = [];


        document
        .querySelectorAll(
            "#reseaux > div"
        )
        .forEach((div)=>{

            const type =
                div
                .querySelector(
                    ".typeReseau"
                )
                .value;


            const lien =
                div
                .querySelector(
                    ".lienReseau"
                )
                .value
                .trim();


            if(lien !== ""){

                listeReseaux.push({

                    type: type,

                    lien: lien

                });

            }

        });


        /* ===========================
           DONNEES FINALES
        =========================== */

        const donneesProfil = {

            uid: user.uid,

            pseudo: nouveauPseudo,

            email:
                user.email || "",

            photo:
                user.photoURL || "",

            descriptionCourte:
                descriptionCourte.value.trim(),

            descriptionLongue:
                descriptionLongue.value.trim(),

            videoYoutube:
                videoYoutube.value.trim(),

            categories:
                categories,

            reseaux:
                listeReseaux,

            dateCreation:
                new Date()

        };


        /* ===========================
           SAUVEGARDE FIRESTORE
        =========================== */

        try{

            saveProfile.disabled =
                true;


            saveProfile.textContent =
                "Enregistrement...";


            await setDoc(
                doc(
                    db,
                    "users",
                    user.uid
                ),
                donneesProfil
            );


            console.log(
                "Profil enregistré :",
                donneesProfil
            );


            alert(
                "Profil enregistré avec succès !"
            );


            window.location.href =
                "index.html";


        }catch(error){

            console.error(
                "Erreur Firestore :",
                error
            );


            alert(
                "Erreur lors de l'enregistrement du profil."
            );


            saveProfile.disabled =
                false;


            saveProfile.textContent =
                "Mettre à jour mon profil";

        }

    }
);


/* ===========================
   ECHAPPER HTML
=========================== */

function echapperHTML(texte){

    return String(texte)
        .replaceAll("&","&amp;")
        .replaceAll("<","&lt;")
        .replaceAll(">","&gt;")
        .replaceAll('"',"&quot;")
        .replaceAll("'","&#039;");

}