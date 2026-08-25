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

const rechercheCategories =
    document.getElementById(
        "rechercheCategories"
    );

const saveProfile =
    document.getElementById("saveProfile");

const deconnexion =
    document.getElementById("deconnexion");


/* =========================================================
   INITIALISATION
========================================================= */

console.log(
    "creer-profil.js chargé"
);


/* =========================================================
   PHOTO UTILISATEUR
========================================================= */

function afficherPhotoUtilisateur(user){

    if(
        !photo ||
        !user
    ){

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

        photo.removeAttribute("src");

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

                await signOut(auth);

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
           NON CONNECTE
        ============================================== */

        if(!user){

            alert(
                "Tu dois être connecté pour créer ton profil."
            );

            window.location.href =
                "index.html";

            return;

        }


        /* ==============================================
           CONNECTE
        ============================================== */

        console.log(
            "Utilisateur connecté :",
            user.uid
        );


        afficherPhotoUtilisateur(user);


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
            await getDoc(profilRef);


        if(profilSnap.exists()){

            profilExiste = true;

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
               DESCRIPTIONS
            ========================= */

            if(descriptionCourte){

                descriptionCourte.value =
                    data.descriptionCourte || "";

            }


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
                Array.isArray(data.categories)
            ){

                categoriesSelectionnees =
                    [...data.categories];

            }


            /* =========================
               RESEAUX
            ========================= */

            if(
                Array.isArray(data.reseaux)
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

            profilExiste = false;

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

            <p class="messageCategories">
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


        /* ==============================================
           LECTURE DES CATEGORIES
        ============================================== */

        snapshot.forEach(
            categorieDoc=>{

                const data =
                    categorieDoc.data();


                /*
                   Format :

                   categories/
                       document
                           liste: [
                               "Gaming",
                               "Minecraft"
                           ]
                */


                if(
                    Array.isArray(data.liste)
                ){

                    data.liste.forEach(
                        categorie=>{

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


        /* ==============================================
           SUPPRIMER DOUBLONS
        ============================================== */

        const uniques = [];

        const dejaPresentes =
            new Set();


        categoriesDisponibles.forEach(
            categorie=>{

                if(
                    !categorie.id ||
                    dejaPresentes.has(
                        categorie.id
                    )
                ){

                    return;

                }


                dejaPresentes.add(
                    categorie.id
                );


                uniques.push(categorie);

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

            <p class="messageCategories">
                Impossible de charger les catégories.
            </p>

        `;

    }

}


/* =========================================================
   RECHERCHE DES CATEGORIES
   IMPORTANT :
   CETTE RECHERCHE NE CONCERNE QUE LES CATEGORIES
========================================================= */

if(rechercheCategories){

    rechercheCategories.addEventListener(
        "input",
        ()=>{

            afficherCategories();

        }
    );

}


/* =========================================================
   AFFICHER LES CATEGORIES
========================================================= */

function afficherCategories(){

    if(!categoriesContainer){

        return;

    }


    categoriesContainer.innerHTML = "";


    /* ==============================================
       RECUPERER LA RECHERCHE
    ============================================== */

    const recherche =
        rechercheCategories
            ? rechercheCategories.value
                .trim()
                .toLowerCase()
            : "";


    /* ==============================================
       FILTRER
    ============================================== */

    const categoriesFiltrees =
        categoriesDisponibles.filter(
            categorie=>{

                const nom =
                    String(
                        categorie.nom ||
                        categorie.id ||
                        ""
                    ).toLowerCase();


                return nom.includes(
                    recherche
                );

            }
        );


    /* ==============================================
       AUCUN RESULTAT
    ============================================== */

    if(
        categoriesFiltrees.length === 0
    ){

        categoriesContainer.innerHTML = `

            <div class="messageCategories">

                ${
                    recherche
                    ? "🔎 Aucune catégorie trouvée."
                    : "Aucune catégorie disponible."
                }

            </div>

        `;

        return;

    }


    /* ==============================================
       CREER LES BOUTONS
    ============================================== */

    categoriesFiltrees.forEach(
        categorie=>{

            const bouton =
                document.createElement("button");


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
               CATEGORIE SELECTIONNEE
            ========================================== */

            if(
                categoriesSelectionnees.includes(
                    valeur
                )
            ){

                bouton.classList.add(
                    "selectionnee"
                );

            }


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
   AFFICHER CATEGORIES SELECTIONNEES
========================================================= */

function afficherCategoriesSelectionnees(){

    if(!categoriesSelectionneesContainer){

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
                document.createElement("div");


            tag.textContent =
                "🏷️ " + categorie;


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
   AJOUTER UN RESEAU
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
   CREER UN BLOC RESEAU
========================================================= */

function ajouterBlocReseau(
    typeValeur = "",
    lienValeur = ""
){

    if(!reseaux){

        return;

    }


    const bloc =
        document.createElement("div");


    bloc.className =
        "blocReseau";


    /* ==============================================
       TYPE
    ============================================== */

    const type =
        document.createElement("input");


    type.type =
        "text";


    type.placeholder =
        "Réseau";


    type.value =
        typeValeur;


    /* ==============================================
       LIEN
    ============================================== */

    const lien =
        document.createElement("input");


    lien.type =
        "url";


    lien.placeholder =
        "https://...";


    lien.value =
        lienValeur;


    /* ==============================================
       SUPPRIMER
    ============================================== */

    const supprimer =
        document.createElement("button");


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


    bloc.appendChild(type);

    bloc.appendChild(lien);

    bloc.appendChild(supprimer);


    reseaux.appendChild(bloc);

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


            /* ==========================================
               VERIFIER FIRESTORE
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
                            valeur
                        )
                    );


                const snapshot =
                    await getDocs(q);


                let utiliseParQuelquun =
                    false;


                snapshot.forEach(
                    profilDoc=>{

                        if(
                            profilDoc.id !==
                            utilisateurActuel?.uid
                        ){

                            utiliseParQuelquun =
                                true;

                        }

                    }
                );


                if(utiliseParQuelquun){

                    pseudoEtat.textContent =
                        "❌ Ce pseudo est déjà utilisé.";

                    pseudoEtat.style.color =
                        "#ff5252";

                }

                else{

                    pseudoEtat.textContent =
                        "✅ Ce pseudo est disponible.";

                    pseudoEtat.style.color =
                        "#4caf50";

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
   SAUVEGARDER LE PROFIL
========================================================= */

if(saveProfile){

    saveProfile.addEventListener(
        "click",
        async()=>{

            /* ==========================================
               UTILISATEUR
            ========================================== */

            if(!utilisateurActuel){

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


            if(pseudoValeur === ""){

                alert(
                    "Veuillez choisir un pseudo."
                );

                pseudo?.focus();

                return;

            }


            if(pseudoValeur.length < 3){

                alert(
                    "Le pseudo doit contenir au moins 3 caractères."
                );

                pseudo?.focus();

                return;

            }


            /* ==========================================
               DESCRIPTIONS
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
                !verifierYoutube(video)
            ){

                alert(
                    "Veuillez entrer un lien YouTube valide."
                );

                videoYoutube?.focus();

                return;

            }


            /* ==========================================
               VERIFIER PSEUDO
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
                    await getDocs(q);


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


                    pseudo?.focus();

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
               DONNEES
            ========================================== */

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


            /* ==========================================
               SAUVEGARDE FIRESTORE
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
                    "Erreur lors de la sauvegarde :",
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