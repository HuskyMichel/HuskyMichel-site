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
   VERIFICATION DES ELEMENTS
========================================================= */

console.log(
    "creer-profil.js chargé"
);


/* =========================================================
   AFFICHER LA PHOTO GOOGLE
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


        /* ==============================================
           PERSONNE NON CONNECTEE
        ============================================== */

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


        /* ==============================================
           UTILISATEUR CONNECTE
        ============================================== */

        console.log(
            "Utilisateur connecté :",
            user.uid
        );


        afficherPhotoUtilisateur(
            user
        );


        /* Charger le profil existant */

        await chargerProfilExistant();


        /* Charger les catégories */

        await chargerCategories();

    }
);


/* =========================================================
   CHARGER LE PROFIL EXISTANT
========================================================= */

async function chargerProfilExistant(){

    if(
        !utilisateurActuel
    ){

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


        /* ==============================================
           PROFIL EXISTANT
        ============================================== */

        if(
            profilSnap.exists()
        ){

            profilExiste =
                true;


            const data =
                profilSnap.data();


            console.log(
                "Profil existant trouvé :",
                data
            );


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


            /* =========================
               BOUTON
            ========================= */

            if(saveProfile){

                saveProfile.textContent =
                    "💾 Enregistrer les modifications";

            }


            afficherCategoriesSelectionnees();

        }

        else{

            profilExiste =
                false;


            console.log(
                "Aucun profil existant."
            );


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

    if(
        !categoriesContainer
    ){

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


        categoriesDisponibles =
            [];


        /* ==============================================
           PARCOURIR LES DOCUMENTS
        ============================================== */

        snapshot.forEach(
            (categorieDoc)=>{

                const data =
                    categorieDoc.data();


                /*
                   Structure prévue :

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

                                categoriesDisponibles.push({

                                    id:
                                        categorie.id ||
                                        categorie.nom ||
                                        categorie.name,

                                    nom:
                                        categorie.nom ||
                                        categorie.name ||
                                        categorie.id

                                });

                            }

                        }
                    );

                }

            }
        );


        /*
           Si aucune catégorie n'a été trouvée
        */

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


        /* ==============================================
           SUPPRIMER LES DOUBLONS
        ============================================== */

        const categoriesUniques =
            [];


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


                categoriesUniques.push(
                    categorie
                );

            }
        );


        categoriesDisponibles =
            categoriesUniques;


        /* ==============================================
           AFFICHER
        ============================================== */

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

    if(
        !categoriesContainer
    ){

        return;

    }


    categoriesContainer.innerHTML =
        "";


    categoriesDisponibles.forEach(
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


            /* ==========================================
               STYLE CATEGORIE
            ========================================== */

            bouton.style.margin =
                "5px";


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


            bouton.style.transition =
                ".2s";


            /* ==========================================
               CATEGORIE DEJA SELECTIONNEE
            ========================================== */

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


            /* ==========================================
               SURVOL
            ========================================== */

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


            /* ==========================================
               CLIC
            ========================================== */

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


                    afficherCategories();

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
   AFFICHER LES CATEGORIES SELECTIONNEES
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
                                item !== categorie
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
   AJOUTER UN BLOC RESEAU
========================================================= */

function ajouterBlocReseau(
    typeValeur = "",
    lienValeur = ""
){

    if(
        !reseaux
    ){

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


    /* ==============================================
       TYPE
    ============================================== */

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


    /* ==============================================
       LIEN
    ============================================== */

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


    /* ==============================================
       BOUTON SUPPRIMER
    ============================================== */

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
   VERIFICATION DU PSEUDO
========================================================= */

if(pseudo){

    pseudo.addEventListener(
        "input",
        async()=>{

            const valeur =
                pseudo.value.trim();


            if(
                !pseudoEtat
            ){

                return;

            }


            if(
                valeur === ""
            ){

                pseudoEtat.textContent =
                    "";

                return;

            }


            if(
                valeur.length < 3
            ){

                pseudoEtat.textContent =
                    "⚠️ Le pseudo doit contenir au moins 3 caractères.";

                pseudoEtat.style.color =
                    "#ffb347";

                return;

            }


            /*
               Si le pseudo correspond déjà
               à celui du profil actuel,
               il est évidemment disponible.
            */

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


                if(
                    snapshot.empty
                ){

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
    );

}


/* =========================================================
   RECUPERER LES RESEAUX
========================================================= */

function recupererReseaux(){

    if(
        !reseaux
    ){

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


            if(
                inputs.length < 2
            ){

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
   VERIFIER LE LIEN YOUTUBE
========================================================= */

function verifierYoutube(
    url
){

    if(
        !url
    ){

        return true;

    }


    return (
        url.includes(
            "youtube.com"
        ) ||
        url.includes(
            "youtu.be"
        )
    );

}


/* =========================================================
   ENREGISTRER LE PROFIL
========================================================= */

if(saveProfile){

    saveProfile.addEventListener(
        "click",
        async()=>{

            /* ==========================================
               UTILISATEUR
            ========================================== */

            if(
                !utilisateurActuel
            ){

                alert(
                    "Tu dois être connecté."
                );

                return;

            }


            /* ==========================================
               PSEUDO
            ========================================== */

            const pseudoValeur =
                pseudo
                    ? pseudo.value.trim()
                    : "";


            if(
                pseudoValeur === ""
            ){

                alert(
                    "Veuillez choisir un pseudo."
                );


                if(pseudo){

                    pseudo.focus();

                }


                return;

            }


            if(
                pseudoValeur.length < 3
            ){

                alert(
                    "Le pseudo doit contenir au moins 3 caractères."
                );


                if(pseudo){

                    pseudo.focus();

                }


                return;

            }


            /* ==========================================
               DESCRIPTION
            ========================================== */

            const courte =
                descriptionCourte
                    ? descriptionCourte.value.trim()
                    : "";


            const longue =
                descriptionLongue
                    ? descriptionLongue.value.trim()
                    : "";


            /* ==========================================
               VIDEO
            ========================================== */

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


            /* ==========================================
               VERIFIER LE PSEUDO DANS FIRESTORE
            ========================================== */

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

                        /*
                           On ignore notre propre profil
                           lorsqu'on le modifie.
                        */

                        if(
                            profilDoc.id !==
                            utilisateurActuel.uid
                        ){

                            pseudoDejaUtilise =
                                true;

                        }

                    }
                );


                if(
                    pseudoDejaUtilise
                ){

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


            /* ==========================================
               RESEAUX
            ========================================== */

            const listeReseaux =
                recupererReseaux();


            /* ==========================================
               DONNEES DU PROFIL
            ========================================== */

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


            /* ==========================================
               SAUVEGARDE
            ========================================== */

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
                   merge:true permet de conserver
                   les données déjà présentes dans
                   le document, notamment les sous-
                   collections likes/favoris.
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
   INITIALISATION
========================================================= */

console.log(
    "Système de création de profil prêt."
);