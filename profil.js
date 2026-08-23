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
   RECHERCHE DE PROFIL
========================================================= */

if(recherche){

    recherche.addEventListener(
        "keydown",
        async(event)=>{

            if(event.key !== "Enter"){
                return;
            }

            const texte =
                recherche.value.trim();

            if(texte === ""){
                return;
            }

            try{

                const q = query(
                    collection(db,"users"),
                    where(
                        "pseudo",
                        "==",
                        texte
                    )
                );


                const resultat =
                    await getDocs(q);


                if(resultat.empty){

                    alert(
                        "Aucun profil trouvé pour : " +
                        texte
                    );

                    return;

                }


                const profilTrouve =
                    resultat.docs[0].data();


                window.location.href =
                    "profil.html?pseudo=" +
                    encodeURIComponent(
                        profilTrouve.pseudo
                    );


            }catch(error){

                console.error(
                    "Erreur lors de la recherche :",
                    error
                );

                alert(
                    "Impossible d'effectuer la recherche."
                );

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