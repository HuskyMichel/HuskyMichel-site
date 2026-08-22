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
    getDocs
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


/* ===========================
   ELEMENTS HTML
=========================== */

const loginBtn = document.getElementById("loginBtn");
const profile = document.getElementById("profile");
const avatar = document.getElementById("avatar");
const menu = document.getElementById("menu");
const logout = document.getElementById("logout");

const recherche = document.getElementById("rechercheProfil");

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

const retourAccueil =
    document.getElementById("retourAccueil");


/* ===========================
   GOOGLE
=========================== */

const provider = new GoogleAuthProvider();

provider.setCustomParameters({
    prompt: "select_account"
});


/* ===========================
   MENU COMPTE
=========================== */

avatar.addEventListener("click", (event)=>{

    event.stopPropagation();

    if(menu.style.display === "block"){

        menu.style.display = "none";

    }else{

        menu.style.display = "block";

    }

});


document.addEventListener("click",(event)=>{

    if(!profile.contains(event.target)){

        menu.style.display = "none";

    }

});


/* ===========================
   CONNEXION
=========================== */

loginBtn.addEventListener("click", async ()=>{

    try{

        await signInWithPopup(auth,provider);

    }catch(error){

        console.error(
            "Erreur de connexion :",
            error
        );

    }

});


/* ===========================
   DECONNEXION
=========================== */

logout.addEventListener("click", async ()=>{

    try{

        await signOut(auth);

        menu.style.display = "none";

    }catch(error){

        console.error(
            "Erreur de déconnexion :",
            error
        );

    }

});


/* ===========================
   ETAT DE CONNEXION
=========================== */

onAuthStateChanged(auth,(user)=>{

    if(user){

        loginBtn.style.display = "none";

        profile.style.display = "block";


        if(user.photoURL){

            avatar.src =
                user.photoURL.replace(
                    "=s96-c",
                    "=s512-c"
                );

        }

    }else{

        loginBtn.style.display = "block";

        profile.style.display = "none";

    }

});


/* ===========================
   RECUPERER LE PSEUDO
=========================== */

const params =
    new URLSearchParams(
        window.location.search
    );

const pseudoRecherche =
    params.get("pseudo");


if(!pseudoRecherche){

    afficherErreur(
        "Aucun profil demandé."
    );

}else{

    chargerProfil(pseudoRecherche);

}


/* ===========================
   CHARGER LE PROFIL
=========================== */

async function chargerProfil(pseudoRecherche){

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


        if(resultat.empty){

            afficherErreur(
                "Profil introuvable."
            );

            return;

        }


        const data =
            resultat.docs[0].data();


        /* ===========================
           PHOTO
        =========================== */

        if(data.photo){

            photo.src =
                data.photo.replace(
                    "=s96-c",
                    "=s512-c"
                );

        }else{

            photo.style.display = "none";

        }


        /* ===========================
           PSEUDO
        =========================== */

        pseudo.textContent =
            data.pseudo || "Sans pseudo";


        /* ===========================
           DESCRIPTION COURTE
        =========================== */

        descriptionCourte.textContent =
            data.descriptionCourte ||
            "Aucune description";


        /* ===========================
           DESCRIPTION LONGUE
        =========================== */

        descriptionLongue.textContent =
            data.descriptionLongue ||
            "Aucune description."


        /* ===========================
           CATEGORIES
        =========================== */

        categories.innerHTML = "";


        if(
            data.categories &&
            data.categories.length > 0
        ){

            data.categories.forEach(
                (categorie)=>{

                    const tag =
                        document.createElement("div");

                    tag.className = "tag";

                    tag.textContent =
                        "🏷️ " + categorie;

                    categories.appendChild(tag);

                }
            );

        }else{

            categories.innerHTML =
                "<span>Aucune catégorie.</span>";

        }


        /* ===========================
           RESEAUX
        =========================== */

        reseaux.innerHTML = "";


        if(
            data.reseaux &&
            data.reseaux.length > 0
        ){

            data.reseaux.forEach(
                (reseau)=>{

                    const div =
                        document.createElement("div");

                    div.className =
                        "reseau";


                    const titre =
                        document.createElement("strong");

                    titre.textContent =
                        reseau.type || "Réseau";


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


                    div.appendChild(titre);

                    div.appendChild(
                        document.createTextNode(" : ")
                    );

                    div.appendChild(lien);


                    reseaux.appendChild(div);

                }
            );

        }else{

            reseaux.innerHTML =
                "<span>Aucun réseau renseigné.</span>";

        }


        /* ===========================
           VIDEO YOUTUBE
        =========================== */

        videoContainer.innerHTML = "";


        if(data.videoYoutube){

            const url =
                convertirYoutubeEmbed(
                    data.videoYoutube
                );


            if(url){

                videoContainer.innerHTML = `

                    <iframe

                        src="${url}"

                        title="Vidéo YouTube"

                        allow="accelerometer;
                        autoplay;
                        clipboard-write;
                        encrypted-media;
                        gyroscope;
                        picture-in-picture;
                        web-share"

                        allowfullscreen>

                    </iframe>

                `;

            }else{

                sectionVideo.style.display =
                    "none";

            }

        }else{

            sectionVideo.style.display =
                "none";

        }

    }catch(error){

        console.error(
            "Erreur lors du chargement du profil :",
            error
        );

        afficherErreur(
            "Impossible de charger ce profil."
        );

    }

}


/* ===========================
   CONVERSION YOUTUBE
=========================== */

function convertirYoutubeEmbed(url){

    try{

        const urlObj =
            new URL(url);


        /* ===========================
           youtube.com/watch?v=
        =========================== */

        if(
            urlObj.hostname.includes(
                "youtube.com"
            )
        ){

            const videoId =
                urlObj.searchParams.get("v");


            if(videoId){

                return (
                    "https://www.youtube.com/embed/" +
                    videoId
                );

            }

        }


        /* ===========================
           youtu.be/ID
        =========================== */

        if(
            urlObj.hostname.includes(
                "youtu.be"
            )
        ){

            const videoId =
                urlObj.pathname.substring(1);


            if(videoId){

                return (
                    "https://www.youtube.com/embed/" +
                    videoId
                );

            }

        }


        return null;

    }catch(error){

        return null;

    }

}


/* ===========================
   ERREUR
=========================== */

function afficherErreur(message){

    document.body.innerHTML = `

        <div style="

            color:white;

            text-align:center;

            margin-top:100px;

            font-family:Arial,sans-serif;

        ">

            <h1>

                ${message}

            </h1>

            <br>

            <button

                onclick="window.location.href='index.html'"

                style="

                    background:#3ea6ff;

                    color:white;

                    border:none;

                    padding:12px 20px;

                    border-radius:10px;

                    cursor:pointer;

                    font-size:16px;

                "

            >

                ← Retour à l'accueil

            </button>

        </div>

    `;

}


/* ===========================
   RECHERCHE
=========================== */

recherche.addEventListener(
    "keydown",
    (event)=>{

        if(event.key !== "Enter"){

            return;

        }


        const valeur =
            recherche.value.trim();


        if(valeur === ""){

            return;

        }


        window.location.href =
            "profil.html?pseudo=" +
            encodeURIComponent(valeur);

    }
);


/* ===========================
   RETOUR ACCUEIL
=========================== */

retourAccueil.addEventListener(
    "click",
    ()=>{

        window.location.href =
            "index.html";

    }
);