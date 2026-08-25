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
    document.getElementById(
        "categoriesSelectionnees"
    );

const saveProfile =
    document.getElementById("saveProfile");

const deconnexion =
    document.getElementById("deconnexion");


/* =========================================================
   BARRES DE RECHERCHE
========================================================= */

const rechercheCategories =
    document.getElementById(
        "rechercheCategories"
    );

const rechercheReseaux =
    document.getElementById(
        "rechercheReseaux"
    );


/* =========================================================
   INITIALISATION
========================================================= */

console.log(
    "creer-profil.js chargé"
);


/* =========================================================
   AFFICHER LA PHOTO
========================================================= */

function afficherPhotoUtilisateur(user){

    if(
        !photo ||
        !user
    ){

        return;

    }


    if(
        user.photoURL
    ){

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
   ETAT DE CONNEXION
========================================================= */

onAuthStateChanged(
    auth,
    async(user)=>{

        utilisateurActuel =
            user;


        if(!user){

            console.log(
                "Aucun utilisateur connecté."
            );


            alert(
                "Tu dois être connecté pour créer ton profil."
            );


            window.location.href =
                "index.html";


            return;

        }


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
   CHARGER LE PROFIL EXISTANT
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
                    data.pseudo ||
                    "";

            }


            /* =========================
               DESCRIPTION COURTE
            ========================= */

            if(descriptionCourte){

                descriptionCourte.value =
                    data.descriptionCourte ||
                    "";

            }


            /* =========================
               DESCRIPTION LONGUE
            ========================= */

            if(descriptionLongue){

                descriptionLongue.value =
                    data.descriptionLongue ||
                    "";

            }


            /* =========================
               VIDEO
            ========================= */

            if(videoYoutube){

                videoYoutube.value =
                    data.videoYoutube ||
                    "";

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
                    (reseau)=>{

                        ajouterBlocReseau(
                            reseau.type ||
                            "",
                            reseau.lien ||
                            ""
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

            <p class="message-recherche">
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


        categoriesDisponibles =
            [];


        snapshot.forEach(
            (categorieDoc)=>{

                const data =
                    categorieDoc.data();


                /*
                    Structure :

                    categories/
                        document
                            liste: [
                                "Gaming",
                                "Minecraft",
                                ...
                            ]
                */


                if(
                    Array.isArray(
                        data.liste
                    )
                ){

                    data.liste.forEach(
                        (categorie)=>{

                            if(
                                typeof categorie ===
                                "string"
                            ){

                                categoriesDisponibles.push({

                                    id:
                                        categorie,

                                    nom:
                                        categorie

                                });

                            }

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

                                    categoriesDisponibles.push({

                                        id:
                                            id,

                                        nom:
                                            nom

                                    });

                                }

                            }

                        }
                    );

                }

            }
        );


        /* =====================================================
           SUPPRIMER DOUBLONS
        ===================================================== */

        const uniques = [];

        const dejaPresente =
            new Set();


        categoriesDisponibles.forEach(
            (categorie)=>{

                if(
                    !categorie.id ||
                    dejaPresente.has(
                        categorie.id
                    )
                ){

                    return;

                }


                dejaPresente.add(
                    categorie.id
                );


                uniques.push(
                    categorie
                );

            }
        );


        categoriesDisponibles =
            uniques;


        afficherCategories();

        afficherCategoriesSelectionnees();

    }

    catch(error){

        console.error(
            "Erreur lors du chargement des catégories :",
            error
        );


        categoriesContainer.innerHTML = `

            <p class="message-recherche">
                ❌ Impossible de charger les catégories.
            </p>

        `;

    }

}


/* =========================================================
   AFFICHER LES CATEGORIES
========================================================= */

function afficherCategories(
    recherche = ""
){

    if(!categoriesContainer){

        return;

    }


    categoriesContainer.innerHTML =
        "";


    const rechercheNormalisee =
        recherche
            .trim()
            .toLowerCase();


    const categoriesFiltrees =
        categoriesDisponibles.filter(
            (categorie)=>{

                const nom =
                    String(
                        categorie.nom ||
                        categorie.id ||
                        ""
                    ).toLowerCase();


                return nom.includes(
                    rechercheNormalisee
                );

            }
        );


    if(
        categoriesFiltrees.length === 0
    ){

        categoriesContainer.innerHTML = `

            <div class="message-recherche">
                🔎 Aucune catégorie trouvée.
            </div>

        `;

        return;

    }


    categoriesFiltrees.forEach(
        (categorie)=>{

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


            if(
                categoriesSelectionnees.includes(
                    valeur
                )
            ){

                bouton.classList.add(
                    "selectionnee"
                );

            }


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
                                    item !== valeur
                            );

                    }

                    else{

                        categoriesSelectionnees.push(
                            valeur
                        );

                    }


                    afficherCategories(
                        rechercheCategories
                            ? rechercheCategories.value
                            : ""
                    );


                    afficherCategoriesSelectionnees();

                }
            );


            categoriesContainer.appendChild(
                bouton
            );

        }
    );

}


/* =========================================================
   CATEGORIES SELECTIONNEES
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
        (categorie)=>{

            const tag =
                document.createElement(
                    "div"
                );


            tag.className =
                "categorie-selectionnee";


            tag.textContent =
                "🏷️ " +
                categorie;


            tag.title =
                "Cliquer pour retirer";


            tag.addEventListener(
                "click",
                ()=>{

                    categoriesSelectionnees =
                        categoriesSelectionnees.filter(
                            item =>
                                item !== categorie
                        );


                    afficherCategories(
                        rechercheCategories
                            ? rechercheCategories.value
                            : ""
                    );


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
   RECHERCHE CATEGORIES
========================================================= */

if(rechercheCategories){

    rechercheCategories.addEventListener(
        "input",
        ()=>{

            afficherCategories(
                rechercheCategories.value
            );

        }
    );

}


/* =========================================================
   RESEAUX SOCIAUX
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
   AJOUTER UN RESEAU
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


    /* =====================================================
       TYPE
    ===================================================== */

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


    type.className =
        "reseau-type";


    /* =====================================================
       LIEN
    ===================================================== */

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


    lien.className =
        "reseau-lien";


    /* =====================================================
       SUPPRIMER
    ===================================================== */

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
   RECHERCHE RESEAUX
========================================================= */

if(rechercheReseaux){

    rechercheReseaux.addEventListener(
        "input",
        ()=>{

            const recherche =
                rechercheReseaux.value
                    .trim()
                    .toLowerCase();


            const blocs =
                reseaux
                    ? reseaux.querySelectorAll(
                        ".blocReseau"
                    )
                    : [];


            blocs.forEach(
                (bloc)=>{

                    const texte =
                        bloc.textContent
                            .toLowerCase();


                    if(
                        recherche === "" ||
                        texte.includes(
                            recherche
                        )
                    ){

                        bloc.style.display =
                            "flex";

                    }

                    else{

                        bloc.style.display =
                            "none";

                    }

                }
            );

        }
    );

}


/* =========================================================
   BARRES DE RECHERCHE GENERALES
========================================================= */

const recherchesGenerales =
    document.querySelectorAll(
        ".recherche-section[data-search-section]"
    );


recherchesGenerales.forEach(
    (barre)=>{

        barre.addEventListener(
            "input",
            ()=>{

                const valeur =
                    barre.value
                        .trim()
                        .toLowerCase();


                const section =
                    barre.closest(
                        ".section"
                    );


                if(!section){

                    return;

                }


                /*
                   On ne cache jamais la barre
                   de recherche elle-même.
                */

                const elements =
                    section.querySelectorAll(
                        "label, input:not(.recherche-section), textarea, img, p"
                    );


                elements.forEach(
                    (element)=>{

                        /*
                           Pour les sections de formulaire,
                           la recherche sert surtout à
                           rechercher du texte déjà présent.
                           On évite donc de cacher les
                           champs principaux.
                        */

                        if(
                            element.id === "pseudoEtat"
                        ){

                            return;

                        }

                    }
                );

            }
        );

    }
);


/* =========================================================
   VERIFICATION DU PSEUDO
========================================================= */

if(pseudo){

    let verificationPseudoTimer =
        null;


    pseudo.addEventListener(
        "input",
        ()=>{

            clearTimeout(
                verificationPseudoTimer
            );


            verificationPseudoTimer =
                setTimeout(
                    verifierDisponibilitePseudo,
                    400
                );

        }
    );

}


async function verifierDisponibilitePseudo(){

    if(!pseudo || !pseudoEtat){

        return;

    }


    const valeur =
        pseudo.value.trim();


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
            "Erreur lors de la vérification du pseudo :",
            error
        );


        pseudoEtat.textContent =
            "";

    }

}


/* =========================================================
   RECUPERER LES RESEAUX
========================================================= */

function recupererReseaux(){

    if(!reseaux){

        return [];

    }


    const resultat =
        [];


    const blocs =
        reseaux.querySelectorAll(
            ".blocReseau"
        );


    blocs.forEach(
        (bloc)=>{

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


            if(
                type ||
                lien
            ){

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
   ENREGISTRER LE PROFIL
========================================================= */

if(saveProfile){

    saveProfile.addEventListener(
        "click",
        async()=>{

            if(!utilisateurActuel){

                alert(
                    "Tu dois être connecté."
                );

                return;

            }


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


            const courte =
                descriptionCourte
                    ? descriptionCourte.value.trim()
                    : "";


            const longue =
                descriptionLongue
                    ? descriptionLongue.value.trim()
                    : "";


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


            /* =================================================
               VERIFIER LE PSEUDO
            ================================================= */

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
                    (profilDoc)=>{

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


            /* =================================================
               RESEAUX
            ================================================= */

            const listeReseaux =
                recupererReseaux();


            /* =================================================
               DONNEES
            ================================================= */

            const donneesProfil = {

                uid:
                    utilisateurActuel.uid,

                pseudo:
                    pseudoValeur,

                email:
                    utilisateurActuel.email ||
                    "",

                photo:
                    utilisateurActuel.photoURL ||
                    "",

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


            /* =================================================
               SAUVEGARDE
            ================================================= */

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


                /*
                   merge:true conserve les autres
                   données du document.
                */

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