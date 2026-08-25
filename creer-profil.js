/* =========================================================
   CREER / MODIFIER PROFIL
   Firebase + Firestore
========================================================= */

import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    doc,
    getDoc,
    setDoc,
    collection,
    getDocs,
    query,
    where
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


/* =========================================================
   UTILISATEUR CONNECTÉ
========================================================= */

let utilisateurActuel = null;


/* =========================================================
   ELEMENTS HTML
========================================================= */

const compteConnecte =
    document.getElementById("compteConnecte");

const deconnexion =
    document.getElementById("deconnexion");

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

const categoriesSelectionnees =
    document.getElementById("categoriesSelectionnees");

const saveProfile =
    document.getElementById("saveProfile");


/* =========================================================
   DONNEES
========================================================= */

let profilExiste = false;

let categoriesDisponibles = [];

let categoriesChoisies = [];

let reseauxListe = [];


/* =========================================================
   VERIFICATION DE LA CONNEXION
========================================================= */

onAuthStateChanged(
    auth,
    async (user) => {

        utilisateurActuel = user;


        /* ==============================================
           PAS CONNECTÉ
        ============================================== */

        if (!user) {

            alert(
                "Tu dois être connecté pour créer ou modifier ton profil."
            );

            window.location.href =
                "index.html";

            return;

        }


        /* ==============================================
           UTILISATEUR CONNECTÉ
        ============================================== */

        afficherCompte(user);

        await chargerProfil(user);

        await chargerCategories();

    }
);


/* =========================================================
   AFFICHER LE COMPTE
========================================================= */

function afficherCompte(user) {

    if (!compteConnecte) {

        return;

    }


    compteConnecte.textContent =
        user.displayName ||
        user.email ||
        "Compte connecté";

}


/* =========================================================
   DECONNEXION
========================================================= */

if (deconnexion) {

    deconnexion.addEventListener(
        "click",
        async () => {

            try {

                await signOut(auth);

                window.location.href =
                    "index.html";

            }

            catch (error) {

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
   CHARGER LE PROFIL EXISTANT
========================================================= */

async function chargerProfil(user) {

    try {

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


        /* ==============================================
           AUCUN PROFIL
        ============================================== */

        if (!profilSnap.exists()) {

            profilExiste =
                false;


            if (saveProfile) {

                saveProfile.textContent =
                    "Créer mon profil";

            }


            /* =========================================
               PHOTO GOOGLE
            ========================================= */

            if (
                photo &&
                user.photoURL
            ) {

                photo.src =
                    user.photoURL.replace(
                        "=s96-c",
                        "=s512-c"
                    );

            }


            /*
               On initialise les valeurs.
            */

            categoriesChoisies = [];

            reseauxListe = [];

            afficherReseaux();

            afficherCategoriesSelectionnees();

            return;

        }


        /* ==============================================
           PROFIL EXISTANT
        ============================================== */

        profilExiste =
            true;


        const data =
            profilSnap.data();


        if (saveProfile) {

            saveProfile.textContent =
                "Enregistrer les modifications";

        }


        /* ==============================================
           PHOTO
        ============================================== */

        if (photo) {

            if (data.photo) {

                photo.src =
                    data.photo;

            }

            else if (user.photoURL) {

                photo.src =
                    user.photoURL.replace(
                        "=s96-c",
                        "=s512-c"
                    );

            }

        }


        /* ==============================================
           PSEUDO
        ============================================== */

        if (pseudo) {

            pseudo.value =
                data.pseudo ||
                "";

        }


        /* ==============================================
           DESCRIPTION COURTE
        ============================================== */

        if (descriptionCourte) {

            descriptionCourte.value =
                data.descriptionCourte ||
                "";

        }


        /* ==============================================
           DESCRIPTION LONGUE
        ============================================== */

        if (descriptionLongue) {

            descriptionLongue.value =
                data.descriptionLongue ||
                "";

        }


        /* ==============================================
           VIDEO YOUTUBE
        ============================================== */

        if (videoYoutube) {

            videoYoutube.value =
                data.videoYoutube ||
                "";

        }


        /* ==============================================
           RESEAUX
        ============================================== */

        reseauxListe =
            Array.isArray(data.reseaux)
                ? [...data.reseaux]
                : [];


        afficherReseaux();


        /* ==============================================
           CATEGORIES
        ============================================== */

        categoriesChoisies =
            Array.isArray(data.categories)
                ? [...data.categories]
                : [];


        afficherCategoriesSelectionnees();

    }

    catch (error) {

        console.error(
            "Erreur lors du chargement du profil :",
            error
        );

        alert(
            "Impossible de charger ton profil."
        );

    }

}


/* =========================================================
   RESEAUX SOCIAUX
========================================================= */

function afficherReseaux() {

    if (!reseaux) {

        return;

    }


    reseaux.innerHTML =
        "";


    /* ==============================================
       AUCUN RESEAU
    ============================================== */

    if (reseauxListe.length === 0) {

        ajouterChampReseau();

        return;

    }


    /* ==============================================
       AFFICHER LES RESEAUX
    ============================================== */

    reseauxListe.forEach(
        (reseau) => {

            ajouterChampReseau(
                reseau.type || "",
                reseau.lien || ""
            );

        }
    );

}


/* =========================================================
   AJOUTER UN CHAMP RESEAU
========================================================= */

function ajouterChampReseau(
    type = "",
    lien = ""
) {

    if (!reseaux) {

        return;

    }


    const bloc =
        document.createElement(
            "div"
        );


    bloc.className =
        "reseauCreation";


    bloc.style.display =
        "flex";

    bloc.style.gap =
        "10px";

    bloc.style.marginBottom =
        "12px";

    bloc.style.alignItems =
        "center";


    /* ==============================================
       TYPE
    ============================================== */

    const inputType =
        document.createElement(
            "input"
        );


    inputType.type =
        "text";

    inputType.placeholder =
        "Nom du réseau";

    inputType.value =
        type;

    inputType.className =
        "reseauType";


    inputType.style.flex =
        "0 0 180px";


    /* ==============================================
       LIEN
    ============================================== */

    const inputLien =
        document.createElement(
            "input"
        );


    inputLien.type =
        "url";

    inputLien.placeholder =
        "https://...";

    inputLien.value =
        lien;

    inputLien.className =
        "reseauLien";


    inputLien.style.flex =
        "1";


    /* ==============================================
       BOUTON SUPPRIMER
    ============================================== */

    const boutonSupprimer =
        document.createElement(
            "button"
        );


    boutonSupprimer.type =
        "button";

    boutonSupprimer.textContent =
        "✕";

    boutonSupprimer.title =
        "Supprimer ce réseau";


    boutonSupprimer.style.padding =
        "10px 14px";

    boutonSupprimer.style.background =
        "#ff1744";


    boutonSupprimer.addEventListener(
        "click",
        () => {

            bloc.remove();

        }
    );


    /* ==============================================
       AJOUT AU DOM
    ============================================== */

    bloc.appendChild(
        inputType
    );

    bloc.appendChild(
        inputLien
    );

    bloc.appendChild(
        boutonSupprimer
    );


    reseaux.appendChild(
        bloc
    );

}


/* =========================================================
   BOUTON AJOUTER RESEAU
========================================================= */

if (ajouterReseau) {

    ajouterReseau.addEventListener(
        "click",
        () => {

            ajouterChampReseau();

        }
    );

}


/* =========================================================
   RECUPERER LES RESEAUX
========================================================= */

function recupererReseaux() {

    const liste =
        [];


    if (!reseaux) {

        return liste;

    }


    const blocs =
        reseaux.querySelectorAll(
            ".reseauCreation"
        );


    blocs.forEach(
        (bloc) => {

            const inputType =
                bloc.querySelector(
                    ".reseauType"
                );


            const inputLien =
                bloc.querySelector(
                    ".reseauLien"
                );


            if (
                !inputType ||
                !inputLien
            ) {

                return;

            }


            const type =
                inputType.value.trim();


            const lien =
                inputLien.value.trim();


            /*
               On ignore une ligne complètement vide.
            */

            if (
                type === "" &&
                lien === ""
            ) {

                return;

            }


            liste.push({

                type:
                    type,

                lien:
                    lien

            });

        }
    );


    return liste;

}


/* =========================================================
   CHARGER LES CATEGORIES FIRESTORE
========================================================= */

async function chargerCategories() {

    if (!categoriesContainer) {

        return;

    }


    try {

        categoriesContainer.innerHTML = `
            <p style="
                color:#aaa;
                margin:0;
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


        snapshot.forEach(
            (categorieDoc) => {

                const data =
                    categorieDoc.data();


                /*
                   Compatibilité avec différentes
                   structures de documents.
                */

                const nom =
                    data.nom ||
                    data.name ||
                    data.titre ||
                    categorieDoc.id;


                if (
                    nom &&
                    !categoriesDisponibles.includes(
                        nom
                    )
                ) {

                    categoriesDisponibles.push(
                        nom
                    );

                }

            }
        );


        /* ==============================================
           AUCUNE CATEGORIE
        ============================================== */

        if (
            categoriesDisponibles.length === 0
        ) {

            categoriesContainer.innerHTML = `
                <p style="
                    color:#aaa;
                    margin:0;
                ">
                    Aucune catégorie disponible.
                </p>
            `;

            afficherCategoriesSelectionnees();

            return;

        }


        /* ==============================================
           AFFICHER
        ============================================== */

        afficherCategoriesDisponibles();

        afficherCategoriesSelectionnees();

    }

    catch (error) {

        console.error(
            "Erreur lors du chargement des catégories :",
            error
        );


        categoriesContainer.innerHTML = `
            <p style="
                color:#ff6b6b;
                margin:0;
            ">
                Impossible de charger les catégories.
            </p>
        `;

    }

}


/* =========================================================
   AFFICHER LES CATEGORIES DISPONIBLES
========================================================= */

function afficherCategoriesDisponibles() {

    if (!categoriesContainer) {

        return;

    }


    categoriesContainer.innerHTML =
        "";


    categoriesDisponibles.forEach(
        (categorie) => {

            const bouton =
                document.createElement(
                    "button"
                );


            bouton.type =
                "button";


            bouton.textContent =
                "🏷️ " +
                categorie;


            bouton.className =
                "categorieBouton";


            /* =========================================
               ETAT SELECTION
            ========================================= */

            if (
                categoriesChoisies.includes(
                    categorie
                )
            ) {

                bouton.classList.add(
                    "selectionnee"
                );

            }


            /* =========================================
               STYLE
            ========================================= */

            bouton.style.margin =
                "5px";

            bouton.style.padding =
                "9px 14px";

            bouton.style.borderRadius =
                "20px";

            bouton.style.border =
                "none";

            bouton.style.cursor =
                "pointer";

            bouton.style.color =
                "white";

            bouton.style.transition =
                ".2s";


            if (
                categoriesChoisies.includes(
                    categorie
                )
            ) {

                bouton.style.background =
                    "#3ea6ff";

            }

            else {

                bouton.style.background =
                    "#181818";

            }


            /* =========================================
               CLIC
            ========================================= */

            bouton.addEventListener(
                "click",
                () => {

                    gererCategorie(
                        categorie
                    );

                }
            );


            categoriesContainer.appendChild(
                bouton
            );

        }
    );

}


/* =========================================================
   GERER UNE CATEGORIE
========================================================= */

function gererCategorie(
    categorie
) {

    const index =
        categoriesChoisies.indexOf(
            categorie
        );


    /* ==============================================
       RETIRER
    ============================================== */

    if (index !== -1) {

        categoriesChoisies.splice(
            index,
            1
        );

    }


    /* ==============================================
       AJOUTER
    ============================================== */

    else {

        categoriesChoisies.push(
            categorie
        );

    }


    /*
       On actualise immédiatement
       les deux parties.
    */

    afficherCategoriesDisponibles();

    afficherCategoriesSelectionnees();

}


/* =========================================================
   AFFICHER LES CATEGORIES SELECTIONNEES
========================================================= */

function afficherCategoriesSelectionnees() {

    if (!categoriesSelectionnees) {

        return;

    }


    categoriesSelectionnees.innerHTML =
        "";


    /* ==============================================
       AUCUNE CATEGORIE
    ============================================== */

    if (
        categoriesChoisies.length === 0
    ) {

        categoriesSelectionnees.innerHTML = `
            <span style="
                color:#888;
            ">
                Aucune catégorie sélectionnée.
            </span>
        `;

        return;

    }


    /* ==============================================
       AFFICHER LES TAGS
    ============================================== */

    categoriesChoisies.forEach(
        (categorie) => {

            const tag =
                document.createElement(
                    "span"
                );


            tag.className =
                "tag";


            tag.textContent =
                "🏷️ " +
                categorie;


            tag.style.display =
                "inline-flex";

            tag.style.alignItems =
                "center";

            tag.style.gap =
                "5px";

            tag.style.padding =
                "8px 13px";

            tag.style.margin =
                "4px";

            tag.style.borderRadius =
                "20px";

            tag.style.background =
                "#3ea6ff";

            tag.style.color =
                "white";

            tag.style.fontWeight =
                "bold";

            tag.style.cursor =
                "pointer";


            tag.title =
                "Cliquer pour retirer";


            tag.addEventListener(
                "click",
                () => {

                    gererCategorie(
                        categorie
                    );

                }
            );


            categoriesSelectionnees.appendChild(
                tag
            );

        }
    );

}


/* =========================================================
   VERIFICATION DU PSEUDO
========================================================= */

if (pseudo) {

    pseudo.addEventListener(
        "input",
        () => {

            verifierPseudo();

        }
    );

}


/* =========================================================
   VERIFIER PSEUDO
========================================================= */

async function verifierPseudo() {

    if (!pseudo) {

        return false;

    }


    const valeur =
        pseudo.value.trim();


    /* ==============================================
       VIDE
    ============================================== */

    if (valeur === "") {

        if (pseudoEtat) {

            pseudoEtat.textContent =
                "";

        }

        return false;

    }


    /* ==============================================
       LONGUEUR
    ============================================== */

    if (
        valeur.length < 3
    ) {

        if (pseudoEtat) {

            pseudoEtat.textContent =
                "❌ Le pseudo doit contenir au moins 3 caractères.";

            pseudoEtat.style.color =
                "#ff5555";

        }

        return false;

    }


    /* ==============================================
       CARACTERES AUTORISES
    ============================================== */

    const pseudoValide =
        /^[a-zA-Z0-9À-ÿ _-]+$/;


    if (
        !pseudoValide.test(
            valeur
        )
    ) {

        if (pseudoEtat) {

            pseudoEtat.textContent =
                "❌ Le pseudo contient des caractères non autorisés.";

            pseudoEtat.style.color =
                "#ff5555";

        }

        return false;

    }


    /* ==============================================
       VERIFICATION FIRESTORE
    ============================================== */

    try {

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


        let pseudoPris =
            false;


        snapshot.forEach(
            (profilDoc) => {

                /*
                   Lors d'une modification,
                   son propre profil est autorisé.
                */

                if (
                    !utilisateurActuel ||
                    profilDoc.id !==
                    utilisateurActuel.uid
                ) {

                    pseudoPris =
                        true;

                }

            }
        );


        /* =========================================
           PSEUDO DEJA UTILISE
        ========================================= */

        if (pseudoPris) {

            if (pseudoEtat) {

                pseudoEtat.textContent =
                    "❌ Ce pseudo est déjà utilisé.";

                pseudoEtat.style.color =
                    "#ff5555";

            }

            return false;

        }


        /* =========================================
           PSEUDO DISPONIBLE
        ========================================= */

        if (pseudoEtat) {

            pseudoEtat.textContent =
                "✅ Ce pseudo est disponible.";

            pseudoEtat.style.color =
                "#4caf50";

        }


        return true;

    }

    catch (error) {

        console.error(
            "Erreur lors de la vérification du pseudo :",
            error
        );


        if (pseudoEtat) {

            pseudoEtat.textContent =
                "⚠️ Impossible de vérifier le pseudo.";

            pseudoEtat.style.color =
                "#ffaa00";

        }


        return false;

    }

}


/* =========================================================
   NETTOYER URL YOUTUBE
========================================================= */

function nettoyerUrlYoutube(
    url
) {

    if (!url) {

        return "";

    }


    return url.trim();

}


/* =========================================================
   VERIFIER VIDEO YOUTUBE
========================================================= */

function verifierVideoYoutube(
    url
) {

    if (!url) {

        return true;

    }


    const texte =
        url.trim();


    /*
       Formats acceptés :
       youtube.com
       www.youtube.com
       m.youtube.com
       youtu.be
    */

    return (
        texte.includes(
            "youtube.com"
        ) ||
        texte.includes(
            "youtu.be"
        )
    );

}


/* =========================================================
   ENREGISTRER LE PROFIL
========================================================= */

if (saveProfile) {

    saveProfile.addEventListener(
        "click",
        async () => {

            await enregistrerProfil();

        }
    );

}


/* =========================================================
   ENREGISTREMENT FIRESTORE
========================================================= */

async function enregistrerProfil() {

    /* ==============================================
       UTILISATEUR
    ============================================== */

    if (!utilisateurActuel) {

        alert(
            "Tu dois être connecté."
        );

        return;

    }


    /* ==============================================
       PSEUDO
    ============================================== */

    if (!pseudo) {

        return;

    }


    const pseudoValeur =
        pseudo.value.trim();


    if (
        pseudoValeur === ""
    ) {

        alert(
            "Veuillez entrer un pseudo."
        );

        pseudo.focus();

        return;

    }


    /* ==============================================
       VERIFICATION PSEUDO
    ============================================== */

    const pseudoValide =
        await verifierPseudo();


    if (!pseudoValide) {

        alert(
            "Veuillez choisir un pseudo valide et disponible."
        );

        pseudo.focus();

        return;

    }


    /* ==============================================
       VIDEO
    ============================================== */

    const video =
        videoYoutube
            ? nettoyerUrlYoutube(
                videoYoutube.value
            )
            : "";


    if (
        video &&
        !verifierVideoYoutube(
            video
        )
    ) {

        alert(
            "Veuillez entrer une URL YouTube valide."
        );

        videoYoutube.focus();

        return;

    }


    /* ==============================================
       RESEAUX
    ============================================== */

    const listeReseaux =
        recupererReseaux();


    /* ==============================================
       PHOTO
    ============================================== */

    let photoProfil =
        "";


    if (photo) {

        photoProfil =
            photo.src ||
            "";

    }


    /*
       Si aucune photo n'est disponible,
       on prend celle de Google.
    */

    if (
        !photoProfil &&
        utilisateurActuel.photoURL
    ) {

        photoProfil =
            utilisateurActuel.photoURL.replace(
                "=s96-c",
                "=s512-c"
            );

    }


    /* ==============================================
       DONNEES DU PROFIL
    ============================================== */

    const donneesProfil = {

        uid:
            utilisateurActuel.uid,

        pseudo:
            pseudoValeur,

        photo:
            photoProfil,

        descriptionCourte:
            descriptionCourte
                ? descriptionCourte.value.trim()
                : "",

        descriptionLongue:
            descriptionLongue
                ? descriptionLongue.value.trim()
                : "",

        reseaux:
            listeReseaux,

        videoYoutube:
            video,

        categories:
            [...categoriesChoisies],

        dateModification:
            new Date()

    };


    /* ==============================================
       DATE DE CREATION
    ============================================== */

    if (!profilExiste) {

        donneesProfil.dateCreation =
            new Date();

    }


    /* ==============================================
       BOUTON
    ============================================== */

    const texteOriginal =
        saveProfile
            ? saveProfile.textContent
            : "";


    if (saveProfile) {

        saveProfile.disabled =
            true;

        saveProfile.textContent =
            "Enregistrement...";

    }


    /* ==============================================
       FIRESTORE
    ============================================== */

    try {

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
                merge: true
            }
        );


        profilExiste =
            true;


        /* =========================================
           SUCCES
        ========================================= */

        if (saveProfile) {

            saveProfile.textContent =
                "✓ Profil enregistré";

            saveProfile.style.background =
                "#4caf50";

        }


        /* =========================================
           REDIRECTION
        ========================================= */

        setTimeout(
            () => {

                window.location.href =
                    "profil.html?pseudo=" +
                    encodeURIComponent(
                        pseudoValeur
                    );

            },
            900
        );

    }

    catch (error) {

        console.error(
            "Erreur lors de l'enregistrement :",
            error
        );


        alert(
            "Impossible d'enregistrer ton profil."
        );


        if (saveProfile) {

            saveProfile.disabled =
                false;

            saveProfile.textContent =
                texteOriginal;

            saveProfile.style.background =
                "";

        }

    }

}


/* =========================================================
   GESTION DE LA PHOTO GOOGLE
========================================================= */

if (photo) {

    photo.addEventListener(
        "error",
        () => {

            /*
               Si l'image Google ne fonctionne pas,
               on cache l'image cassée.
            */

            photo.style.display =
                "none";

        }
    );

}


/* =========================================================
   FIN
========================================================= */

console.log(
    "creer-profil.js chargé correctement."
);