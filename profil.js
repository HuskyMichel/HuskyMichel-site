import { auth, db } from "./firebase.js";

import {
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    collection,
    query,
    where,
    getDocs,
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


/* =========================================================
   ELEMENTS DU PROFIL
========================================================= */

const photo = document.getElementById("photo");
const pseudo = document.getElementById("pseudo");
const descriptionCourte =
    document.getElementById("descriptionCourte");

const descriptionLongue =
    document.getElementById("descriptionLongue");

const categories =
    document.getElementById("categories");

const reseaux =
    document.getElementById("reseaux");

const videoContainer =
    document.getElementById("videoContainer");

const sectionVideo =
    document.getElementById("sectionVideo");


/* =========================================================
   ELEMENTS DE LA BARRE DU HAUT
========================================================= */

const loginBtn =
    document.getElementById("loginBtn");

const profile =
    document.getElementById("profile");

const avatar =
    document.getElementById("avatar");

const menu =
    document.getElementById("menu");

const logout =
    document.getElementById("logout");

const recherche =
    document.getElementById("rechercheProfil");


/* =========================================================
   PROFIL DEMANDE
========================================================= */

const params =
    new URLSearchParams(window.location.search);

const pseudoRecherche =
    params.get("pseudo");


/* =========================================================
   VERIFICATION DU PSEUDO
========================================================= */

if(!pseudoRecherche){

    document.body.innerHTML = `

        <div style="
            color:white;
            text-align:center;
            margin-top:100px;
            font-family:Arial;
        ">

            <h1>Aucun profil demandé.</h1>

            <p>
                Retourne à l'accueil pour choisir un profil.
            </p>

            <button
                onclick="window.location.href='index.html'"
                style="
                    padding:12px 20px;
                    background:#3ea6ff;
                    color:white;
                    border:none;
                    border-radius:10px;
                    cursor:pointer;
                "
            >

                ← Retour à l'accueil

            </button>

        </div>

    `;

    throw new Error("Pseudo manquant");

}


/* =========================================================
   GOOGLE
========================================================= */

const provider =
    new GoogleAuthProvider();

provider.setCustomParameters({
    prompt:"select_account"
});


/* =========================================================
   MENU DU COMPTE
========================================================= */

if(avatar && menu && profile){

    avatar.addEventListener("click",(event)=>{

        event.stopPropagation();

        menu.style.display =
            menu.style.display === "block"
            ? "none"
            : "block";

    });


    document.addEventListener("click",(event)=>{

        if(!profile.contains(event.target)){

            menu.style.display = "none";

        }

    });

}


/* =========================================================
   CONNEXION
========================================================= */

if(loginBtn){

    loginBtn.addEventListener("click",async()=>{

        try{

            await signInWithPopup(
                auth,
                provider
            );

        }catch(error){

            console.error(
                "Erreur de connexion :",
                error
            );

        }

    });

}


/* =========================================================
   DECONNEXION
========================================================= */

if(logout){

    logout.addEventListener("click",async()=>{

        try{

            await signOut(auth);

            window.location.href =
                "index.html";

        }catch(error){

            console.error(
                "Erreur lors de la déconnexion :",
                error
            );

        }

    });

}


/* =========================================================
   ETAT DE CONNEXION
========================================================= */

onAuthStateChanged(auth,(user)=>{

    if(user){

        /* =========================
           UTILISATEUR CONNECTÉ
        ========================= */

        if(loginBtn){

            loginBtn.style.display =
                "none";

        }


        if(profile){

            profile.style.display =
                "block";

        }


        if(avatar){

            if(user.photoURL){

                avatar.src =
                    user.photoURL.replace(
                        "=s96-c",
                        "=s512-c"
                    );

            }

        }

    }else{

        /* =========================
           UTILISATEUR DÉCONNECTÉ
        ========================= */

        if(loginBtn){

            loginBtn.style.display =
                "block";

        }


        if(profile){

            profile.style.display =
                "none";

        }

    }

});


/* =========================================================
   RECHERCHE DE PROFIL EN DIRECT
========================================================= */

const resultatsRecherche =
    document.getElementById("resultatsRecherche");


if(recherche && resultatsRecherche){

    recherche.addEventListener(
        "input",
        async()=>{

            const texte =
                recherche.value.trim();


            /* =========================
               RECHERCHE VIDE
            ========================= */

            if(texte === ""){

                resultatsRecherche.innerHTML = "";

                resultatsRecherche.style.display =
                    "none";

                return;

            }


            try{

                const snapshot =
                    await getDocs(
                        collection(db,"users")
                    );


                resultatsRecherche.innerHTML = "";


                const texteRecherche =
                    texte.toLowerCase();


                let nombreResultats = 0;


                snapshot.forEach((profilDoc)=>{

                    const data =
                        profilDoc.data();


                    const pseudo =
                        data.pseudo || "";


                    if(
                        pseudo
                            .toLowerCase()
                            .includes(
                                texteRecherche
                            )
                    ){

                        nombreResultats++;


                        /* =========================
                           RESULTAT
                        ========================= */

                        const resultat =
                            document.createElement("div");

                        resultat.className =
                            "resultatRecherche";


                        /* =========================
                           PSEUDO
                        ========================= */

                        const nom =
                            document.createElement("div");

                        nom.className =
                            "resultatRecherchePseudo";

                        nom.textContent =
                            pseudo;


                        /* =========================
                           PHOTO
                        ========================= */

                        const image =
                            document.createElement("img");

                        image.src =
                            data.photo || "";

                        image.alt =
                            pseudo;


                        /* =========================
                           AJOUT
                        ========================= */

                        resultat.appendChild(
                            nom
                        );

                        resultat.appendChild(
                            image
                        );


                        /* =========================
                           CLIC
                        ========================= */

                        resultat.addEventListener(
                            "click",
                            ()=>{

                                window.location.href =
                                    "profil.html?pseudo=" +
                                    encodeURIComponent(
                                        pseudo
                                    );

                            }
                        );


                        resultatsRecherche.appendChild(
                            resultat
                        );

                    }

                });


                /* =========================
                   AFFICHAGE
                ========================= */

                if(nombreResultats > 0){

                    resultatsRecherche.style.display =
                        "block";

                }else{

                    resultatsRecherche.innerHTML = "";

                    resultatsRecherche.style.display =
                        "none";

                }


            }catch(error){

                console.error(
                    "Erreur lors de la recherche :",
                    error
                );

                resultatsRecherche.innerHTML = "";

                resultatsRecherche.style.display =
                    "none";

            }

        }
    );

}


/* =========================================================
   CHARGEMENT DU PROFIL
========================================================= */

async function chargerProfil(){

    try{

        const q = query(
            collection(db,"users"),
            where(
                "pseudo",
                "==",
                pseudoRecherche
            )
        );


        const resultat =
            await getDocs(q);


        /* =========================
           PROFIL INTROUVABLE
        ========================= */

        if(resultat.empty){

            document.body.innerHTML = `

                <div style="
                    color:white;
                    text-align:center;
                    margin-top:100px;
                    font-family:Arial;
                ">

                    <h1>Profil introuvable.</h1>

                    <p>
                        Le profil
                        <strong>
                            ${pseudoRecherche}
                        </strong>
                        n'existe pas.
                    </p>

                    <button
                        onclick="
                            window.location.href='index.html'
                        "
                        style="
                            padding:12px 20px;
                            background:#3ea6ff;
                            color:white;
                            border:none;
                            border-radius:10px;
                            cursor:pointer;
                        "
                    >

                        ← Retour à l'accueil

                    </button>

                </div>

            `;

            return;

        }


        /* =========================
           DONNEES
        ========================= */

        const data =
            resultat.docs[0].data();


        /* =====================================================
           PHOTO
        ===================================================== */

        if(photo){

            if(data.photo){

                photo.src =
                    data.photo.replace(
                        "=s96-c",
                        "=s512-c"
                    );

            }else{

                photo.src = "";

            }

        }


        /* =====================================================
           PSEUDO
        ===================================================== */

        if(pseudo){

            pseudo.textContent =
                data.pseudo ||
                "Sans pseudo";

        }


        /* =====================================================
           DESCRIPTION COURTE
        ===================================================== */

        if(descriptionCourte){

            descriptionCourte.textContent =
                data.descriptionCourte ||
                "Aucune description";

        }


        /* =====================================================
           DESCRIPTION LONGUE
        ===================================================== */

        if(descriptionLongue){

            descriptionLongue.textContent =
                data.descriptionLongue ||
                "Aucune description.";

        }


        /* =====================================================
           CATEGORIES
        ===================================================== */

        if(categories){

            categories.innerHTML = "";


            const listeCategories =
                data.categories || [];


            if(listeCategories.length === 0){

                categories.innerHTML = `

                    <span style="color:#aaa;">

                        Aucune catégorie

                    </span>

                `;

            }else{

                listeCategories.forEach(
                    (categorie)=>{

                        const tag =
                            document.createElement("div");

                        tag.className =
                            "tag";

                        tag.textContent =
                            "🏷️ " + categorie;

                        categories.appendChild(
                            tag
                        );

                    }
                );

            }

        }


        /* =====================================================
           RESEAUX
        ===================================================== */

        if(reseaux){

            reseaux.innerHTML = "";


            const listeReseaux =
                data.reseaux || [];


            if(listeReseaux.length === 0){

                reseaux.innerHTML = `

                    <div style="color:#aaa;">

                        Aucun réseau renseigné.

                    </div>

                `;

            }else{

                listeReseaux.forEach(
                    (reseau)=>{

                        const div =
                            document.createElement("div");

                        div.className =
                            "reseau";


                        const titre =
                            document.createElement("strong");

                        titre.textContent =
                            reseau.type ||
                            "Réseau";


                        const lien =
                            document.createElement("a");


                        lien.href =
                            reseau.lien;


                        lien.target =
                            "_blank";


                        lien.rel =
                            "noopener noreferrer";


                        lien.textContent =
                            reseau.lien;


                        div.appendChild(
                            titre
                        );


                        div.appendChild(
                            document.createTextNode(
                                " : "
                            )
                        );


                        div.appendChild(
                            lien
                        );


                        reseaux.appendChild(
                            div
                        );

                    }
                );

            }

        }


        /* =====================================================
           VIDEO YOUTUBE
        ===================================================== */

        if(videoContainer){

            videoContainer.innerHTML = "";


            const video =
                data.videoYoutube;


            if(video && video.trim() !== ""){

                let url =
                    video.trim();


                let videoId = "";


                /* =========================
                   youtube.com/watch?v=
                ========================= */

                if(
                    url.includes(
                        "youtube.com/watch?v="
                    )
                ){

                    const urlObjet =
                        new URL(url);


                    videoId =
                        urlObjet.searchParams.get(
                            "v"
                        );

                }


                /* =========================
                   youtu.be/
                ========================= */

                else if(
                    url.includes(
                        "youtu.be/"
                    )
                ){

                    videoId =
                        url.split(
                            "youtu.be/"
                        )[1];

                    if(videoId){

                        videoId =
                            videoId.split(
                                "?"
                            )[0];

                    }

                }


                /* =========================
                   youtube.com/embed/
                ========================= */

                else if(
                    url.includes(
                        "youtube.com/embed/"
                    )
                ){

                    videoId =
                        url.split(
                            "youtube.com/embed/"
                        )[1];

                    if(videoId){

                        videoId =
                            videoId.split(
                                "?"
                            )[0];

                    }

                }


                if(videoId){

                    videoContainer.innerHTML = `

                        <iframe

                            src="https://www.youtube.com/embed/${videoId}"

                            title="Vidéo YouTube"

                            frameborder="0"

                            allow="
                                accelerometer;
                                autoplay;
                                clipboard-write;
                                encrypted-media;
                                gyroscope;
                                picture-in-picture;
                                web-share
                            "

                            allowfullscreen>

                        </iframe>

                    `;

                }else{

                    videoContainer.innerHTML = `

                        <p style="color:#aaa;">

                            Impossible de lire cette vidéo YouTube.

                        </p>

                    `;

                }

            }else{

                /* =========================
                   PAS DE VIDEO
                ========================= */

                if(sectionVideo){

                    sectionVideo.style.display =
                        "none";

                }

            }

        }


        console.log(
            "Profil chargé :",
            data.pseudo
        );


    }catch(error){

        console.error(
            "Erreur lors du chargement du profil :",
            error
        );


        document.body.innerHTML = `

            <div style="
                color:white;
                text-align:center;
                margin-top:100px;
                font-family:Arial;
            ">

                <h1>

                    Une erreur est survenue

                </h1>

                <p>

                    Impossible de charger ce profil.

                </p>

                <button
                    onclick="
                        window.location.href='index.html'
                    "
                    style="
                        padding:12px 20px;
                        background:#3ea6ff;
                        color:white;
                        border:none;
                        border-radius:10px;
                        cursor:pointer;
                    "
                >

                    ← Retour à l'accueil

                </button>

            </div>

        `;

    }

}


/* =========================================================
   LANCEMENT
========================================================= */

chargerProfil();

/* =========================================================
   RETOUR ACCUEIL
========================================================= */

const logoAccueil =
    document.getElementById("logoAccueil");

const retourAccueil =
    document.getElementById("retourAccueil");


if(logoAccueil){

    logoAccueil.addEventListener("click",()=>{

        window.location.href = "index.html";

    });

}


if(retourAccueil){

    retourAccueil.addEventListener("click",()=>{

        window.location.href = "index.html";

    });

}

/* =========================================================
   LIKE DU PROFIL
========================================================= */

const boutonLikeProfil =
    document.getElementById("boutonLikeProfil");

const compteurLikesProfil =
    document.getElementById("compteurLikesProfil");

const listeLikers =
    document.getElementById("listeLikers");


/* =========================================================
   ANIMATION DES COEURS SUR TOUTE LA PAGE
========================================================= */

function lancerAnimationCoeursProfil(){

    /* =====================================================
       EFFET ROSE / ROUGE SUR LA PAGE
    ===================================================== */

    document.body.classList.remove(
        "animationAmour"
    );


    /* Force le navigateur à relancer l'animation */

    void document.body.offsetWidth;


    document.body.classList.add(
        "animationAmour"
    );


    /* =====================================================
       NOMBRE DE COEURS
    ===================================================== */

    const nombreCoeurs = 35;


    /* =====================================================
       CREATION DES COEURS
    ===================================================== */

    for(
        let i = 0;
        i < nombreCoeurs;
        i++
    ){

        const coeur =
            document.createElement("div");


        coeur.className =
            "coeurProfilAnimation";


        coeur.textContent =
            "❤️";


        /* =================================================
           POSITION DE DEPART
        ================================================= */

        coeur.style.left =
            (
                Math.random() * 100
            ) +
            "vw";


        coeur.style.top =
            (
                45 +
                Math.random() * 55
            ) +
            "vh";


        /* =================================================
           TAILLE
        ================================================= */

        coeur.style.fontSize =
            (
                25 +
                Math.random() * 40
            ) +
            "px";


        /* =================================================
           DEPLACEMENT
        ================================================= */

        coeur.style.setProperty(
            "--deplacement",
            (
                -150 +
                Math.random() * 300
            ) +
            "px"
        );


        /* =================================================
           ROTATION
        ================================================= */

        coeur.style.setProperty(
            "--rotation",
            (
                -35 +
                Math.random() * 70
            ) +
            "deg"
        );


        /* =================================================
           DELAI
        ================================================= */

        coeur.style.animationDelay =
            (
                Math.random() * .5
            ) +
            "s";


        document.body.appendChild(
            coeur
        );


        /* =================================================
           SUPPRESSION
        ================================================= */

        setTimeout(
            ()=>{

                coeur.remove();

            },
            2200
        );

    }


    /* =====================================================
       RETIRER L'EFFET DE LA PAGE
    ===================================================== */

    setTimeout(
        ()=>{

            document.body.classList.remove(
                "animationAmour"
            );

        },
        1200
    );

}


/* =========================================================
   ANIMATION DU BOUTON
========================================================= */

function animerBoutonLikeProfil(){

    if(!boutonLikeProfil){

        return;

    }


    boutonLikeProfil.classList.add(
        "likeClick"
    );


    setTimeout(
        ()=>{

            boutonLikeProfil.classList.remove(
                "likeClick"
            );

        },
        300
    );

}


/* =========================================================
   AFFICHER LES PERSONNES QUI ONT LIKÉ
========================================================= */

async function chargerLikersProfil(){

    if(
        !pseudoRecherche ||
        !listeLikers
    ){

        return;

    }


    try{

        /* =================================================
           RECUPERER LES LIKES
        ================================================= */

        const likesRef =
            collection(
                db,
                "users",
                pseudoRecherche,
                "likes"
            );


        const likesSnapshot =
            await getDocs(
                likesRef
            );


        listeLikers.innerHTML =
            "";


        /* =================================================
           AUCUN LIKE
        ================================================= */

        if(
            likesSnapshot.empty
        ){

            return;

        }


        /* =================================================
           CHARGER LES PROFILS DES LIKERS
        ================================================= */

        for(
            const likeDoc of likesSnapshot.docs
        ){

            const uid =
                likeDoc.id;


            try{

                const utilisateurRef =
                    doc(
                        db,
                        "users",
                        uid
                    );


                const utilisateurSnap =
                    await getDoc(
                        utilisateurRef
                    );


                /*
                   Si le document users/{uid}
                   existe, on utilise son profil.
                */

                if(
                    utilisateurSnap.exists()
                ){

                    const data =
                        utilisateurSnap.data();


                    const liker =
                        document.createElement(
                            "div"
                        );


                    liker.className =
                        "liker";


                    const image =
                        document.createElement(
                            "img"
                        );


                    image.src =
                        data.photo ||
                        "";


                    image.alt =
                        data.pseudo ||
                        "Utilisateur";


                    const nom =
                        document.createElement(
                            "span"
                        );


                    nom.textContent =
                        data.pseudo ||
                        "Utilisateur";


                    liker.appendChild(
                        image
                    );


                    liker.appendChild(
                        nom
                    );


                    /*
                       Cliquer sur le liker
                       ouvre son profil.
                    */

                    liker.addEventListener(
                        "click",
                        ()=>{

                            if(
                                data.pseudo
                            ){

                                window.location.href =
                                    "profil.html?pseudo=" +
                                    encodeURIComponent(
                                        data.pseudo
                                    );

                            }

                        }
                    );


                    liker.style.cursor =
                        "pointer";


                    listeLikers.appendChild(
                        liker
                    );

                }

            }

            catch(error){

                console.error(
                    "Impossible de charger le liker :",
                    error
                );

            }

        }

    }

    catch(error){

        console.error(
            "Erreur lors du chargement des likers :",
            error
        );

    }

}


/* =========================================================
   CHARGER LES LIKES DU PROFIL
========================================================= */

async function chargerLikesProfil(){

    if(
        !pseudoRecherche ||
        !compteurLikesProfil
    ){

        return;

    }


    try{

        /* =================================================
           COLLECTION DES LIKES
        ================================================= */

        const likesRef =
            collection(
                db,
                "users",
                pseudoRecherche,
                "likes"
            );


        const snapshot =
            await getDocs(
                likesRef
            );


        const nombre =
            snapshot.size;


        /* =================================================
           COMPTEUR
        ================================================= */

        compteurLikesProfil.textContent =
            "❤️ " +
            nombre +
            (
                nombre > 1
                ? " likes"
                : " like"
            );


        /* =================================================
           VERIFIER MON LIKE
        ================================================= */

        if(
            utilisateurActuel &&
            boutonLikeProfil
        ){

            const monLikeRef =
                doc(
                    db,
                    "users",
                    pseudoRecherche,
                    "likes",
                    utilisateurActuel.uid
                );


            const monLikeSnap =
                await getDoc(
                    monLikeRef
                );


            if(
                monLikeSnap.exists()
            ){

                boutonLikeProfil.classList.add(
                    "liked"
                );


                boutonLikeProfil.textContent =
                    "♥ J'aime";

            }

            else{

                boutonLikeProfil.classList.remove(
                    "liked"
                );


                boutonLikeProfil.textContent =
                    "♡ J'aime";

            }

        }


        /* =================================================
           CHARGER LES PERSONNES
        ================================================= */

        await chargerLikersProfil();

    }

    catch(error){

        console.error(
            "Erreur lors du chargement des likes du profil :",
            error
        );

    }

}


/* =========================================================
   LIKER / UNLIKER LE PROFIL
========================================================= */

async function gererLikeProfil(){

    /* =====================================================
       CONNEXION OBLIGATOIRE
    ===================================================== */

    if(!utilisateurActuel){

        alert(
            "Tu dois être connecté pour aimer un profil ❤️"
        );

        return;

    }


    /* =====================================================
       VERIFICATION
    ===================================================== */

    if(
        !boutonLikeProfil ||
        !pseudoRecherche
    ){

        return;

    }


    /* =====================================================
       EVITER LES CLICS RAPIDES
    ===================================================== */

    if(
        boutonLikeProfil.dataset.chargement ===
        "true"
    ){

        return;

    }


    boutonLikeProfil.dataset.chargement =
        "true";


    try{

        /* =================================================
           REFERENCE DU LIKE
        ================================================= */

        const likeRef =
            doc(
                db,
                "users",
                pseudoRecherche,
                "likes",
                utilisateurActuel.uid
            );


        const likeSnap =
            await getDoc(
                likeRef
            );


        /* =================================================
           RETIRER LE LIKE
        ================================================= */

        if(
            likeSnap.exists()
        ){

            await deleteDoc(
                likeRef
            );


            boutonLikeProfil.classList.remove(
                "liked"
            );


            boutonLikeProfil.textContent =
                "♡ J'aime";


            /*
               Recharge le compteur
               et les personnes.
            */

            await chargerLikesProfil();

        }


        /* =================================================
           AJOUTER LE LIKE
        ================================================= */

        else{

            await setDoc(
                likeRef,
                {

                    uid:
                        utilisateurActuel.uid,

                    date:
                        new Date()

                }
            );


            boutonLikeProfil.classList.add(
                "liked"
            );


            boutonLikeProfil.textContent =
                "♥ J'aime";


            /* =================================================
               ANIMATION BOUTON
            ================================================= */

            animerBoutonLikeProfil();


            /* =================================================
               GROSSE ANIMATION SUR LA PAGE
            ================================================= */

            lancerAnimationCoeursProfil();


            /*
               Recharge compteur + likers.
            */

            await chargerLikesProfil();

        }

    }

    catch(error){

        console.error(
            "Erreur lors du like du profil :",
            error
        );


        alert(
            "Impossible de modifier le like."
        );

    }


    boutonLikeProfil.dataset.chargement =
        "false";

}


/* =========================================================
   BOUTON LIKE
========================================================= */

if(boutonLikeProfil){

    boutonLikeProfil.addEventListener(
        "click",
        (event)=>{

            event.stopPropagation();

            gererLikeProfil();

        }
    );

}