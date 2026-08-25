import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    collection,
    query,
    where,
    getDocs,
    doc,
    getDoc,
    setDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


/* =========================================================
   VARIABLES
========================================================= */

let utilisateurActuel = null;

let categoriesDisponibles = [];

let groupesCategories = [];

let categoriesSelectionnees = [];

let profilExiste = false;


/* =========================================================
   ELEMENTS HTML
========================================================= */

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

const reseaux =
    document.getElementById("reseaux");

const ajouterReseau =
    document.getElementById("ajouterReseau");

const videoYoutube =
    document.getElementById("videoYoutube");

const categoriesContainer =
    document.getElementById("categoriesContainer");

const categoriesSelectionneesContainer =
    document.getElementById("categoriesSelectionnees");

const saveProfile =
    document.getElementById("saveProfile");

const deconnexion =
    document.getElementById("deconnexion");


/* =========================================================
   VARIABLES RECHERCHE CATEGORIES
========================================================= */

const recherchesCategories = {};


/* =========================================================
   CHARGEMENT
========================================================= */

console.log(
    "creer-profil.js chargé"
);


/* =========================================================
   AFFICHER PHOTO UTILISATEUR
========================================================= */

function afficherPhotoUtilisateur(user){

    if(!photo || !user){

        return;

    }


    if(user.photoURL){

        photo.src =
            user.photoURL.replace(
                "=s96-c",
                "=s512-c"
            );

    }

    else{

        photo.removeAttribute(
            "src"
        );

    }

}


/* =========================================================
   DECONNEXION
========================================================= */

if(deconnexion){

    deconnexion.addEventListener(
        "click",
        async()=>{

            try{

                await signOut(
                    auth
                );


                window.location.href =
                    "index.html";

            }

            catch(error){

                console.error(
                    "Erreur lors de la déconnexion :",
                    error
                );

                alert(
                    "Impossible de se déconnecter."
                );

            }

        }
    );

}


/* =========================================================
   ETAT AUTHENTIFICATION
========================================================= */

onAuthStateChanged(
    auth,
    async(user)=>{

        utilisateurActuel =
            user;


        /* =========================
           NON CONNECTE
        ========================= */

        if(!user){

            alert(
                "Tu dois être connecté pour créer ton profil."
            );


            window.location.href =
                "index.html";


            return;

        }


        /* =========================
           CONNECTE
        ========================= */

        console.log(
            "Utilisateur connecté :",
            user.uid
        );


        afficherPhotoUtilisateur(
            user
        );


        await chargerProfilExistant();

        await chargerCategories();

    }
);


/* =========================================================
   CHARGER PROFIL EXISTANT
========================================================= */

async function chargerProfilExistant(){

    if(!utilisateurActuel){

        return;

    }


    try{

        const profilRef =
            doc(
                db,
                "users",
                utilisateurActuel.uid
            );


        const profilSnap =
            await getDoc(
                profilRef
            );


        if(profilSnap.exists()){

            profilExiste =
                true;


            const data =
                profilSnap.data();


            /* =========================
               PSEUDO
            ========================= */

            if(pseudo){

                pseudo.value =
                    data.pseudo || "";

            }


            /* =========================
               DESCRIPTION COURTE
            ========================= */

            if(descriptionCourte){

                descriptionCourte.value =
                    data.descriptionCourte || "";

            }


            /* =========================
               DESCRIPTION LONGUE
            ========================= */

            if(descriptionLongue){

                descriptionLongue.value =
                    data.descriptionLongue || "";

            }


            /* =========================
               VIDEO
            ========================= */

            if(videoYoutube){

                videoYoutube.value =
                    data.videoYoutube || "";

            }


            /* =========================
               CATEGORIES
            ========================= */

            if(
                Array.isArray(
                    data.categories
                )
            ){

                categoriesSelectionnees =
                    [...data.categories];

            }


            /* =========================
               RESEAUX
            ========================= */

            if(
                Array.isArray(
                    data.reseaux
                )
            ){

                data.reseaux.forEach(
                    reseau=>{

                        ajouterBlocReseau(
                            reseau.type || "",
                            reseau.lien || ""
                        );

                    }
                );

            }


            if(saveProfile){

                saveProfile.textContent =
                    "💾 Enregistrer les modifications";

            }


            afficherCategoriesSelectionnees();

        }

        else{

            profilExiste =
                false;


            if(saveProfile){

                saveProfile.textContent =
                    "💾 Créer mon profil";

            }

        }

    }

    catch(error){

        console.error(
            "Erreur lors du chargement du profil :",
            error
        );

    }

}


/* =========================================================
   CHARGER LES CATEGORIES FIRESTORE
========================================================= */

async function chargerCategories(){

    if(!categoriesContainer){

        return;

    }


    try{

        categoriesContainer.innerHTML = `

            <p style="
                color:#888;
                text-align:center;
                padding:15px;
            ">
                Chargement des catégories...
            </p>

        `;


        const snapshot =
            await getDocs(
                collection(
                    db,
                    "categories"
                )
            );


        categoriesDisponibles = [];

        groupesCategories = [];


        /* =================================================
           PARCOURIR LES GROUPES
        ================================================= */

        snapshot.forEach(
            categorieDoc=>{

                const data =
                    categorieDoc.data();


                /*
                    Le nom du document Firestore
                    devient le grand titre.

                    Exemple :

                    categories/
                      Gaming
                        liste: [...]

                      Création
                        liste: [...]
                */


                const nomGroupe =
                    categorieDoc.id;


                const liste =
                    Array.isArray(data.liste)
                    ? data.liste
                    : [];


                const groupe = {

                    id:
                        categorieDoc.id,

                    nom:
                        nomGroupe,

                    categories:
                        []

                };


                liste.forEach(
                    categorie=>{

                        let nouvelleCategorie = null;


                        /* =========================
                           CATEGORIE TEXTE
                        ========================= */

                        if(
                            typeof categorie ===
                            "string"
                        ){

                            nouvelleCategorie = {

                                id:
                                    categorie,

                                nom:
                                    categorie

                            };

                        }


                        /* =========================
                           CATEGORIE OBJET
                        ========================= */

                        else if(
                            categorie &&
                            typeof categorie ===
                            "object"
                        ){

                            const id =
                                categorie.id ||
                                categorie.nom ||
                                categorie.name;


                            const nom =
                                categorie.nom ||
                                categorie.name ||
                                categorie.id;


                            if(id){

                                nouvelleCategorie = {

                                    id:
                                        id,

                                    nom:
                                        nom

                                };

                            }

                        }


                        if(
                            !nouvelleCategorie
                        ){

                            return;

                        }


                        /* =========================
                           EVITER DOUBLONS
                        ========================= */

                        const existeDeja =
                            categoriesDisponibles.some(
                                item =>
                                    item.id ===
                                    nouvelleCategorie.id
                            );


                        if(
                            !existeDeja
                        ){

                            categoriesDisponibles.push({

                                ...nouvelleCategorie,

                                groupeId:
                                    groupe.id,

                                groupeNom:
                                    groupe.nom

                            });

                        }


                        groupe.categories.push(
                            nouvelleCategorie
                        );

                    }
                );


                if(
                    groupe.categories.length > 0
                ){

                    groupesCategories.push(
                        groupe
                    );

                }

            }
        );


        if(
            categoriesDisponibles.length === 0
        ){

            categoriesContainer.innerHTML = `

                <p style="
                    color:#888;
                    text-align:center;
                    padding:15px;
                ">
                    Aucune catégorie disponible.
                </p>

            `;

            return;

        }


        /* =================================================
           AFFICHAGE
        ================================================= */

        afficherCategories();

        afficherCategoriesSelectionnees();

    }

    catch(error){

        console.error(
            "Erreur lors du chargement des catégories :",
            error
        );


        categoriesContainer.innerHTML = `

            <p style="
                color:#ff6b6b;
                text-align:center;
                padding:15px;
            ">
                Impossible de charger les catégories.
            </p>

        `;

    }

}


/* =========================================================
   AFFICHER LES CATEGORIES
========================================================= */

function afficherCategories(){

    if(!categoriesContainer){

        return;

    }


    categoriesContainer.innerHTML =
        "";


    groupesCategories.forEach(
        groupe=>{

            /* =================================================
               SECTION DU GROUPE
            ================================================= */

            const section =
                document.createElement(
                    "div"
                );


            section.className =
                "groupeCategorie";


            section.style.marginBottom =
                "30px";


            /* =================================================
               GRAND TITRE
            ================================================= */

            const titre =
                document.createElement(
                    "h3"
                );


            titre.textContent =
                groupe.nom;


            titre.style.fontSize =
                "24px";


            titre.style.margin =
                "0 0 12px";


            titre.style.color =
                "white";


            section.appendChild(
                titre
            );


            /* =================================================
               BARRE DE RECHERCHE
            ================================================= */

            const recherche =
                document.createElement(
                    "input"
                );


            recherche.type =
                "search";


            recherche.placeholder =
                "🔍 Rechercher une catégorie...";


            recherche.value =
                recherchesCategories[
                    groupe.id
                ] || "";


            recherche.style.width =
                "100%";


            recherche.style.padding =
                "12px 15px";


            recherche.style.margin =
                "0 0 15px";


            recherche.style.borderRadius =
                "12px";


            recherche.style.border =
                "1px solid #444";


            recherche.style.background =
                "#181818";


            recherche.style.color =
                "white";


            recherche.style.outline =
                "none";


            recherche.style.fontSize =
                "14px";


            recherche.style.boxSizing =
                "border-box";


            recherche.addEventListener(
                "focus",
                ()=>{

                    recherche.style.borderColor =
                        "#3ea6ff";

                }
            );


            recherche.addEventListener(
                "blur",
                ()=>{

                    recherche.style.borderColor =
                        "#444";

                }
            );


            section.appendChild(
                recherche
            );


            /* =================================================
               CONTENEUR CATEGORIES
            ================================================= */

            const categoriesGroupe =
                document.createElement(
                    "div"
                );


            categoriesGroupe.className =
                "categoriesGroupe";


            categoriesGroupe.style.display =
                "flex";


            categoriesGroupe.style.flexWrap =
                "wrap";


            categoriesGroupe.style.gap =
                "8px";


            /* =================================================
               AFFICHER CATEGORIES
            ================================================= */

            function afficherCategoriesGroupe(){

                categoriesGroupe.innerHTML =
                    "";


                const rechercheTexte =
                    recherche.value
                        .trim()
                        .toLowerCase();


                recherchesCategories[
                    groupe.id
                ] =
                    rechercheTexte;


                const categoriesFiltrees =
                    groupe.categories.filter(
                        categorie=>{

                            if(
                                !rechercheTexte
                            ){

                                return true;

                            }


                            return (
                                String(
                                    categorie.nom
                                )
                                .toLowerCase()
                                .includes(
                                    rechercheTexte
                                )
                            );

                        }
                    );


                if(
                    categoriesFiltrees.length ===
                    0
                ){

                    const aucun =
                        document.createElement(
                            "p"
                        );


                    aucun.textContent =
                        "Aucune catégorie trouvée.";


                    aucun.style.color =
                        "#777";


                    aucun.style.fontSize =
                        "14px";


                    aucun.style.margin =
                        "5px 0";


                    categoriesGroupe.appendChild(
                        aucun
                    );


                    return;

                }


                categoriesFiltrees.forEach(
                    categorie=>{

                        const bouton =
                            document.createElement(
                                "button"
                            );


                        bouton.type =
                            "button";


                        bouton.className =
                            "categorie";


                        bouton.textContent =
                            categorie.nom ||
                            categorie.id;


                        const valeur =
                            categorie.id ||
                            categorie.nom;


                        /* =========================
                           STYLE
                        ========================= */

                        bouton.style.padding =
                            "9px 14px";


                        bouton.style.borderRadius =
                            "20px";


                        bouton.style.border =
                            "1px solid #444";


                        bouton.style.background =
                            "#333";


                        bouton.style.color =
                            "white";


                        bouton.style.cursor =
                            "pointer";


                        bouton.style.fontSize =
                            "14px";


                        bouton.style.transition =
                            ".2s";


                        /* =========================
                           SELECTION
                        ========================= */

                        if(
                            categoriesSelectionnees.includes(
                                valeur
                            )
                        ){

                            bouton.classList.add(
                                "selectionnee"
                            );


                            bouton.style.background =
                                "#3ea6ff";


                            bouton.style.borderColor =
                                "#3ea6ff";


                            bouton.style.boxShadow =
                                "0 0 12px rgba(62,166,255,.25)";

                        }


                        /* =========================
                           SURVOL
                        ========================= */

                        bouton.addEventListener(
                            "mouseenter",
                            ()=>{

                                bouton.style.transform =
                                    "translateY(-2px)";

                            }
                        );


                        bouton.addEventListener(
                            "mouseleave",
                            ()=>{

                                bouton.style.transform =
                                    "translateY(0)";

                            }
                        );


                        /* =========================
                           CLIC
                        ========================= */

                        bouton.addEventListener(
                            "click",
                            ()=>{

                                if(
                                    categoriesSelectionnees.includes(
                                        valeur
                                    )
                                ){

                                    categoriesSelectionnees =
                                        categoriesSelectionnees.filter(
                                            item =>
                                                item !==
                                                valeur
                                        );

                                }

                                else{

                                    categoriesSelectionnees.push(
                                        valeur
                                    );

                                }


                                afficherCategories();

                                afficherCategoriesSelectionnees();

                            }
                        );


                        categoriesGroupe.appendChild(
                            bouton
                        );

                    }
                );

            }


            recherche.addEventListener(
                "input",
                afficherCategoriesGroupe
            );


            section.appendChild(
                categoriesGroupe
            );


            afficherCategoriesGroupe();


            categoriesContainer.appendChild(
                section
            );

        }
    );

}


/* =========================================================
   AFFICHER CATEGORIES SELECTIONNEES
========================================================= */

function afficherCategoriesSelectionnees(){

    if(
        !categoriesSelectionneesContainer
    ){

        return;

    }


    categoriesSelectionneesContainer.innerHTML =
        "";


    if(
        categoriesSelectionnees.length === 0
    ){

        categoriesSelectionneesContainer.innerHTML = `

            <span style="
                color:#777;
                font-size:14px;
            ">
                Aucune catégorie sélectionnée.
            </span>

        `;

        return;

    }


    categoriesSelectionnees.forEach(
        categorie=>{

            const tag =
                document.createElement(
                    "div"
                );


            tag.textContent =
                "🏷️ " +
                categorie;


            tag.style.display =
                "inline-flex";


            tag.style.alignItems =
                "center";


            tag.style.gap =
                "6px";


            tag.style.padding =
                "8px 12px";


            tag.style.borderRadius =
                "20px";


            tag.style.background =
                "#3ea6ff";


            tag.style.color =
                "white";


            tag.style.fontSize =
                "14px";


            tag.style.fontWeight =
                "bold";


            tag.style.cursor =
                "pointer";


            tag.title =
                "Cliquer pour retirer";


            tag.addEventListener(
                "click",
                ()=>{

                    categoriesSelectionnees =
                        categoriesSelectionnees.filter(
                            item =>
                                item !==
                                categorie
                        );


                    afficherCategories();

                    afficherCategoriesSelectionnees();

                }
            );


            categoriesSelectionneesContainer.appendChild(
                tag
            );

        }
    );

}


/* =========================================================
   AJOUT RESEAU
========================================================= */

if(ajouterReseau){

    ajouterReseau.addEventListener(
        "click",
        ()=>{

            ajouterBlocReseau();

        }
    );

}


/* =========================================================
   AJOUTER BLOC RESEAU
========================================================= */

function ajouterBlocReseau(
    typeValeur = "",
    lienValeur = ""
){

    if(!reseaux){

        return;

    }


    const bloc =
        document.createElement(
            "div"
        );


    bloc.className =
        "blocReseau";


    bloc.style.display =
        "flex";


    bloc.style.gap =
        "10px";


    bloc.style.alignItems =
        "center";


    bloc.style.marginBottom =
        "10px";


    /* =================================================
       TYPE
    ================================================= */

    const type =
        document.createElement(
            "input"
        );


    type.type =
        "text";


    type.placeholder =
        "Réseau";


    type.value =
        typeValeur;


    type.style.flex =
        "0 0 30%";


    /* =================================================
       LIEN
    ================================================= */

    const lien =
        document.createElement(
            "input"
        );


    lien.type =
        "url";


    lien.placeholder =
        "https://...";


    lien.value =
        lienValeur;


    lien.style.flex =
        "1";


    /* =================================================
       SUPPRIMER
    ================================================= */

    const supprimer =
        document.createElement(
            "button"
        );


    supprimer.type =
        "button";


    supprimer.textContent =
        "✕";


    supprimer.title =
        "Supprimer ce réseau";


    supprimer.style.padding =
        "10px 14px";


    supprimer.style.background =
        "#333";


    supprimer.style.border =
        "1px solid #555";


    supprimer.style.color =
        "white";


    supprimer.addEventListener(
        "click",
        ()=>{

            bloc.remove();

        }
    );


    bloc.appendChild(
        type
    );


    bloc.appendChild(
        lien
    );


    bloc.appendChild(
        supprimer
    );


    reseaux.appendChild(
        bloc
    );

}


/* =========================================================
   VERIFICATION PSEUDO
========================================================= */

if(pseudo){

    pseudo.addEventListener(
        "input",
        async()=>{

            const valeur =
                pseudo.value.trim();


            if(!pseudoEtat){

                return;

            }


            if(valeur === ""){

                pseudoEtat.textContent =
                    "";

                return;

            }


            if(valeur.length < 3){

                pseudoEtat.textContent =
                    "⚠️ Le pseudo doit contenir au moins 3 caractères.";


                pseudoEtat.style.color =
                    "#ffb347";


                return;

            }


            if(
                profilExiste &&
                utilisateurActuel
            ){

                try{

                    const profilRef =
                        doc(
                            db,
                            "users",
                            utilisateurActuel.uid
                        );


                    const profilSnap =
                        await getDoc(
                            profilRef
                        );


                    if(
                        profilSnap.exists() &&
                        profilSnap.data().pseudo ===
                            valeur
                    ){

                        pseudoEtat.textContent =
                            "✅ Ton pseudo actuel";


                        pseudoEtat.style.color =
                            "#4caf50";


                        return;

                    }

                }

                catch(error){

                    console.error(
                        error
                    );

                }

            }


            try{

                const q =
                    query(
                        collection(
                            db,
                            "users"
                        ),
                        where(
                            "pseudo",
                            "==",
                            valeur
                        )
                    );


                const snapshot =
                    await getDocs(
                        q
                    );


                if(snapshot.empty){

                    pseudoEtat.textContent =
                        "✅ Ce pseudo est disponible.";


                    pseudoEtat.style.color =
                        "#4caf50";

                }

                else{

                    pseudoEtat.textContent =
                        "❌ Ce pseudo est déjà utilisé.";


                    pseudoEtat.style.color =
                        "#ff5252";

                }

            }

            catch(error){

                console.error(
                    "Erreur vérification pseudo :",
                    error
                );


                pseudoEtat.textContent =
                    "";

            }

        }
    );

}


/* =========================================================
   RECUPERER RESEAUX
========================================================= */

function recupererReseaux(){

    if(!reseaux){

        return [];

    }


    const resultat = [];


    const blocs =
        reseaux.querySelectorAll(
            ".blocReseau"
        );


    blocs.forEach(
        bloc=>{

            const inputs =
                bloc.querySelectorAll(
                    "input"
                );


            if(inputs.length < 2){

                return;

            }


            const type =
                inputs[0].value.trim();


            const lien =
                inputs[1].value.trim();


            if(type || lien){

                resultat.push({

                    type:
                        type,

                    lien:
                        lien

                });

            }

        }
    );


    return resultat;

}


/* =========================================================
   VERIFIER YOUTUBE
========================================================= */

function verifierYoutube(url){

    if(!url){

        return true;

    }


    return (
        url.includes("youtube.com") ||
        url.includes("youtu.be")
    );

}


/* =========================================================
   ENREGISTRER PROFIL
========================================================= */

if(saveProfile){

    saveProfile.addEventListener(
        "click",
        async()=>{

            /* =========================
               CONNEXION
            ========================= */

            if(!utilisateurActuel){

                alert(
                    "Tu dois être connecté."
                );

                return;

            }


            /* =========================
               PSEUDO
            ========================= */

            const pseudoValeur =
                pseudo
                    ? pseudo.value.trim()
                    : "";


            if(pseudoValeur === ""){

                alert(
                    "Veuillez choisir un pseudo."
                );


                if(pseudo){

                    pseudo.focus();

                }


                return;

            }


            if(pseudoValeur.length < 3){

                alert(
                    "Le pseudo doit contenir au moins 3 caractères."
                );


                if(pseudo){

                    pseudo.focus();

                }


                return;

            }


            /* =========================
               DESCRIPTIONS
            ========================= */

            const courte =
                descriptionCourte
                    ? descriptionCourte.value.trim()
                    : "";


            const longue =
                descriptionLongue
                    ? descriptionLongue.value.trim()
                    : "";


            /* =========================
               VIDEO
            ========================= */

            const video =
                videoYoutube
                    ? videoYoutube.value.trim()
                    : "";


            if(
                !verifierYoutube(
                    video
                )
            ){

                alert(
                    "Veuillez entrer un lien YouTube valide."
                );


                if(videoYoutube){

                    videoYoutube.focus();

                }


                return;

            }


            /* =========================
               VERIFIER PSEUDO
            ========================= */

            try{

                const q =
                    query(
                        collection(
                            db,
                            "users"
                        ),
                        where(
                            "pseudo",
                            "==",
                            pseudoValeur
                        )
                    );


                const snapshot =
                    await getDocs(
                        q
                    );


                let pseudoDejaUtilise =
                    false;


                snapshot.forEach(
                    profilDoc=>{

                        if(
                            profilDoc.id !==
                            utilisateurActuel.uid
                        ){

                            pseudoDejaUtilise =
                                true;

                        }

                    }
                );


                if(pseudoDejaUtilise){

                    alert(
                        "Ce pseudo est déjà utilisé."
                    );


                    if(pseudoEtat){

                        pseudoEtat.textContent =
                            "❌ Ce pseudo est déjà utilisé.";


                        pseudoEtat.style.color =
                            "#ff5252";

                    }


                    if(pseudo){

                        pseudo.focus();

                    }


                    return;

                }

            }

            catch(error){

                console.error(
                    "Erreur lors de la vérification du pseudo :",
                    error
                );


                alert(
                    "Impossible de vérifier le pseudo."
                );


                return;

            }


            /* =========================
               RESEAUX
            ========================= */

            const listeReseaux =
                recupererReseaux();


            /* =========================
               DONNEES
            ========================= */

            const donneesProfil = {

                uid:
                    utilisateurActuel.uid,

                pseudo:
                    pseudoValeur,

                email:
                    utilisateurActuel.email || "",

                photo:
                    utilisateurActuel.photoURL || "",

                descriptionCourte:
                    courte,

                descriptionLongue:
                    longue,

                reseaux:
                    listeReseaux,

                videoYoutube:
                    video,

                categories:
                    [...categoriesSelectionnees],

                dateCreation:
                    new Date()

            };


            /* =========================
               SAUVEGARDE
            ========================= */

            try{

                saveProfile.disabled =
                    true;


                saveProfile.textContent =
                    "⏳ Enregistrement...";


                const profilRef =
                    doc(
                        db,
                        "users",
                        utilisateurActuel.uid
                    );


                await setDoc(
                    profilRef,
                    donneesProfil,
                    {
                        merge:true
                    }
                );


                console.log(
                    "Profil enregistré avec succès."
                );


                saveProfile.textContent =
                    "✅ Profil enregistré !";


                setTimeout(
                    ()=>{

                        window.location.href =
                            "profil.html?pseudo=" +
                            encodeURIComponent(
                                pseudoValeur
                            );

                    },
                    1000
                );

            }

            catch(error){

                console.error(
                    "Erreur lors de la création du profil :",
                    error
                );


                alert(
                    "Une erreur est survenue lors de l'enregistrement du profil."
                );


                saveProfile.disabled =
                    false;


                saveProfile.textContent =
                    profilExiste
                    ? "💾 Enregistrer les modifications"
                    : "💾 Créer mon profil";

            }

        }
    );

}


/* =========================================================
   FIN
========================================================= */

console.log(
    "Système de création de profil prêt."
);