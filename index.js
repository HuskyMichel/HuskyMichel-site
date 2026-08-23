import { auth, db } from "./firebase.js";

import {
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    collection,
    getDocs,
    doc,
    getDoc,
    setDoc,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


/* =========================================================
   ELEMENTS HTML
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

const listeProfils =
    document.getElementById("listeProfils");

const recherche =
    document.querySelector(".search input");

const resultatsRecherche =
    document.getElementById("resultatsRecherche");


/* =========================================================
   UTILISATEUR ACTUEL
========================================================= */

let utilisateurActuel = null;


/* =========================================================
   GOOGLE
========================================================= */

const provider =
    new GoogleAuthProvider();

provider.setCustomParameters({
    prompt: "select_account"
});


/* =========================================================
   STYLE DES LIKES
========================================================= */

const styleLikes =
    document.createElement("style");

styleLikes.textContent = `

/* =====================================================
   BOUTON LIKE
===================================================== */

.boutonLike{

    position:relative;

    display:flex;

    align-items:center;

    justify-content:center;

    gap:8px;

    min-width:145px;

    padding:12px 18px;

    margin-top:15px;

    border:none;

    border-radius:30px;

    background:#333;

    color:white;

    font-size:16px;

    font-weight:bold;

    cursor:pointer;

    transition:

        transform .2s ease,

        background .25s ease,

        box-shadow .25s ease;

    overflow:hidden;

}


.boutonLike:hover{

    transform:scale(1.06);

    background:#444;

}


.boutonLike:active{

    transform:scale(.94);

}


/* =====================================================
   LIKE ACTIF
===================================================== */

.boutonLike.liked{

    background:linear-gradient(
        135deg,
        #ff4f81,
        #ff1744
    );

    box-shadow:

        0 0 10px rgba(255,23,68,.5),

        0 0 25px rgba(255,79,129,.35);

}


.boutonLike.liked:hover{

    background:linear-gradient(
        135deg,
        #ff638f,
        #ff2850
    );

}


/* =====================================================
   COEUR PRINCIPAL
===================================================== */

.coeurLike{

    font-size:25px;

    line-height:1;

    transition:

        transform .2s ease;

}


.boutonLike:hover .coeurLike{

    transform:scale(1.2);

}


/* =====================================================
   COMPTEUR
===================================================== */

.nombreLikes{

    font-size:15px;

}


/* =====================================================
   CONTENEUR DES COEURS
===================================================== */

.coeursLike{

    position:absolute;

    inset:0;

    pointer-events:none;

    overflow:hidden;

    z-index:20;

}


/* =====================================================
   PETITS COEURS
===================================================== */

.coeurAnimation{

    position:absolute;

    bottom:5px;

    left:50%;

    font-size:25px;

    opacity:0;

    animation:

        coeurMonte 1.7s ease-out forwards;

    filter:

        drop-shadow(
            0 0 5px rgba(255,80,130,.5)
        );

}


/* =====================================================
   ANIMATION
===================================================== */

@keyframes coeurMonte{

    0%{

        opacity:0;

        transform:
            translate(
                0,
                10px
            )
            scale(.4)
            rotate(0deg);

    }

    15%{

        opacity:1;

    }

    50%{

        opacity:1;

    }

    100%{

        opacity:0;

        transform:
            translate(
                var(--deplacementX),
                -150px
            )
            scale(1.2)
            rotate(var(--rotation));

    }

}


/* =====================================================
   ANIMATION DU BOUTON
===================================================== */

.boutonLike.likeAnimation{

    animation:

        boutonLike .45s ease;

}


@keyframes boutonLike{

    0%{

        transform:scale(1);

    }

    35%{

        transform:scale(1.18);

    }

    65%{

        transform:scale(.92);

    }

    100%{

        transform:scale(1);

    }

}


/* =====================================================
   CARTE
===================================================== */

.carteProfil{

    position:relative;

}


/* =====================================================
   LIKE SUR CARTE
===================================================== */

.carteLikes{

    margin-top:12px;

    display:flex;

    align-items:center;

    gap:10px;

}


/* =====================================================
   RESPONSIVE
===================================================== */

@media(max-width:600px){

    .boutonLike{

        min-width:130px;

        padding:11px 15px;

        font-size:15px;

    }

    .coeurLike{

        font-size:23px;

    }

}

`;

document.head.appendChild(styleLikes);


/* =========================================================
   MENU DU COMPTE
========================================================= */

if(avatar){

    avatar.addEventListener(
        "click",
        (event)=>{

            event.stopPropagation();

            if(!menu){

                return;

            }

            menu.style.display =
                menu.style.display === "block"
                ? "none"
                : "block";

        }
    );

}


document.addEventListener(
    "click",
    (event)=>{

        if(
            profile &&
            !profile.contains(event.target)
        ){

            if(menu){

                menu.style.display =
                    "none";

            }

        }

    }
);


/* =========================================================
   CONNEXION
========================================================= */

if(loginBtn){

    loginBtn.addEventListener(
        "click",
        async()=>{

            try{

                await signInWithPopup(
                    auth,
                    provider
                );

            }

            catch(error){

                console.error(
                    "Erreur lors de la connexion :",
                    error
                );

            }

        }
    );

}


/* =========================================================
   DECONNEXION
========================================================= */

if(logout){

    logout.addEventListener(
        "click",
        async()=>{

            try{

                await signOut(auth);

            }

            catch(error){

                console.error(
                    "Erreur lors de la déconnexion :",
                    error
                );

            }

        }
    );

}


/* =========================================================
   CREER LES COEURS
========================================================= */

function lancerAnimationCoeurs(
    conteneur,
    nombre = 25
){

    if(!conteneur){

        return;

    }


    const coeurs = [
        "❤️",
        "🩷",
        "💕",
        "💗",
        "💖",
        "💓"
    ];


    for(
        let i = 0;
        i < nombre;
        i++
    ){

        const coeur =
            document.createElement("span");


        coeur.className =
            "coeurAnimation";


        coeur.textContent =
            coeurs[
                Math.floor(
                    Math.random() *
                    coeurs.length
                )
            ];


        const position =
            Math.random() * 100;


        const deplacement =
            (
                Math.random() * 180
                - 90
            ) + "px";


        const rotation =
            (
                Math.random() * 90
                - 45
            ) + "deg";


        const taille =
            18 +
            Math.random() * 20;


        const delai =
            Math.random() * .6;


        coeur.style.left =
            position + "%";


        coeur.style.fontSize =
            taille + "px";


        coeur.style.setProperty(
            "--deplacementX",
            deplacement
        );


        coeur.style.setProperty(
            "--rotation",
            rotation
        );


        coeur.style.animationDelay =
            delai + "s";


        conteneur.appendChild(
            coeur
        );


        setTimeout(
            ()=>{

                coeur.remove();

            },
            2600
        );

    }

}


/* =========================================================
   RECUPERER LES LIKES
========================================================= */

async function recupererLikes(
    userId
){

    try{

        const likesRef =
            collection(
                db,
                "users",
                userId,
                "likes"
            );


        const snapshot =
            await getDocs(
                likesRef
            );


        return snapshot.size;

    }

    catch(error){

        console.error(
            "Erreur récupération likes :",
            error
        );

        return 0;

    }

}


/* =========================================================
   VERIFIER SI L'UTILISATEUR A LIKE
========================================================= */

async function utilisateurAime(
    userId
){

    if(!utilisateurActuel){

        return false;

    }


    try{

        const likeRef =
            doc(
                db,
                "users",
                userId,
                "likes",
                utilisateurActuel.uid
            );


        const likeSnap =
            await getDoc(
                likeRef
            );


        return likeSnap.exists();

    }

    catch(error){

        console.error(
            "Erreur vérification like :",
            error
        );

        return false;

    }

}


/* =========================================================
   METTRE A JOUR LE BOUTON LIKE
========================================================= */

function mettreAJourBoutonLike(
    bouton,
    aime,
    nombre
){

    if(!bouton){

        return;

    }


    if(aime){

        bouton.classList.add(
            "liked"
        );

    }else{

        bouton.classList.remove(
            "liked"
        );

    }


    const coeur =
        bouton.querySelector(
            ".coeurLike"
        );


    const compteur =
        bouton.querySelector(
            ".nombreLikes"
        );


    if(coeur){

        coeur.textContent =
            aime
            ? "❤️"
            : "♡";

    }


    if(compteur){

        compteur.textContent =
            nombre +
            (
                nombre <= 1
                ? " like"
                : " likes"
            );

    }

}


/* =========================================================
   GERER UN LIKE
========================================================= */

async function gererLike(
    userId,
    bouton,
    conteneurCoeurs
){

    if(!utilisateurActuel){

        alert(
            "Tu dois être connecté pour liker un profil ❤️"
        );

        return;

    }


    const likeRef =
        doc(
            db,
            "users",
            userId,
            "likes",
            utilisateurActuel.uid
        );


    try{

        const likeSnap =
            await getDoc(
                likeRef
            );


        /* =================================================
           DEJA LIKE
        ================================================= */

        if(likeSnap.exists()){

            await deleteDoc(
                likeRef
            );


            const nouveauNombre =
                await recupererLikes(
                    userId
                );


            mettreAJourBoutonLike(
                bouton,
                false,
                nouveauNombre
            );


            return;

        }


        /* =================================================
           NOUVEAU LIKE
        ================================================= */

        await setDoc(
            likeRef,
            {

                uid:
                    utilisateurActuel.uid,

                date:
                    new Date()

            }
        );


        const nouveauNombre =
            await recupererLikes(
                userId
            );


        mettreAJourBoutonLike(
            bouton,
            true,
            nouveauNombre
        );


        /* =================================================
           ANIMATION
        ================================================= */

        bouton.classList.remove(
            "likeAnimation"
        );


        void bouton.offsetWidth;


        bouton.classList.add(
            "likeAnimation"
        );


        lancerAnimationCoeurs(
            conteneurCoeurs,
            35
        );


    }

    catch(error){

        console.error(
            "Erreur lors du like :",
            error
        );


        alert(
            "Impossible d'enregistrer ton like."
        );

    }

}


/* =========================================================
   ETAT DE LA CONNEXION
========================================================= */

onAuthStateChanged(
    auth,
    async(user)=>{

        utilisateurActuel =
            user;


        /* =================================================
           UTILISATEUR CONNECTE
        ================================================= */

        if(user){

            /* PHOTO GOOGLE */

            if(
                avatar &&
                user.photoURL
            ){

                avatar.src =
                    user.photoURL.replace(
                        "=s96-c",
                        "=s512-c"
                    );

            }


            /* AFFICHER LE COMPTE */

            if(loginBtn){

                loginBtn.style.display =
                    "none";

            }


            if(profile){

                profile.style.display =
                    "block";

            }


            /* =================================================
               VERIFIER LE PROFIL FIRESTORE
            ================================================= */

            try{

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


                if(
                    !profilSnap.exists()
                ){

                    window.location.href =
                        "creation-profil.html";

                    return;

                }

            }

            catch(error){

                console.error(
                    "Erreur lors de la vérification du profil :",
                    error
                );

            }


            chargerProfils();

        }


        /* =================================================
           UTILISATEUR NON CONNECTE
        ================================================= */

        else{

            if(loginBtn){

                loginBtn.style.display =
                    "block";

            }


            if(profile){

                profile.style.display =
                    "none";

            }


            chargerProfils();

        }

    }
);


/* =========================================================
   CHARGER LES PROFILS
========================================================= */

async function chargerProfils(){

    if(!listeProfils){

        return;

    }


    listeProfils.innerHTML =
        "";


    try{

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "users"
                )
            );


        snapshot.forEach(
            async(profilDoc)=>{

                const data =
                    profilDoc.data();


                const userId =
                    profilDoc.id;


                /* =================================================
                   CREER LA CARTE
                ================================================= */

                const carte =
                    document.createElement(
                        "div"
                    );


                carte.className =
                    "carteProfil";


                /* =================================================
                   CATEGORIES
                ================================================= */

                const categories =
                    Array.isArray(
                        data.categories
                    )
                    ? data.categories
                    : [];


                const troisCategories =
                    categories.slice(
                        0,
                        3
                    );


                const autresCategories =
                    categories.slice(
                        3
                    );


                let categoriesHTML =
                    "";


                troisCategories.forEach(
                    (categorie)=>{

                        categoriesHTML += `

                            <span
                                class="categorieCarte"
                            >
                                🏷️ ${categorie}
                            </span>

                        `;

                    }
                );


                if(
                    autresCategories.length > 0
                ){

                    categoriesHTML += `

                        <span
                            class="
                                categorieCarte
                                categoriePlus
                            "
                        >
                            +${autresCategories.length}
                        </span>


                        <div
                            class="categoriesCachees"
                        >

                            ${
                                autresCategories
                                .map(
                                    (categorie)=>`

                                        <span
                                            class="
                                                categorieCarte
                                            "
                                        >
                                            🏷️ ${categorie}
                                        </span>

                                    `
                                )
                                .join("")
                            }

                        </div>

                    `;

                }


                /* =================================================
                   RESEAUX
                ================================================= */

                const reseaux =
                    Array.isArray(
                        data.reseaux
                    )
                    ? data.reseaux
                    : [];


                let reseauxHTML =
                    "";


                reseaux.forEach(
                    (reseau)=>{

                        if(
                            !reseau ||
                            !reseau.lien
                        ){

                            return;

                        }


                        let emoji =
                            "🌐";


                        if(
                            reseau.type
                            === "YouTube"
                        ){

                            emoji =
                                "▶️";

                        }

                        else if(
                            reseau.type
                            === "Twitch"
                        ){

                            emoji =
                                "🎮";

                        }

                        else if(
                            reseau.type
                            === "Discord"
                        ){

                            emoji =
                                "💬";

                        }

                        else if(
                            reseau.type
                            === "TikTok"
                        ){

                            emoji =
                                "🎵";

                        }

                        else if(
                            reseau.type
                            === "Instagram"
                        ){

                            emoji =
                                "📸";

                        }

                        else if(
                            reseau.type
                            === "Snapchat"
                        ){

                            emoji =
                                "👻";

                        }

                        else if(
                            reseau.type
                            === "Facebook"
                        ){

                            emoji =
                                "🔵";

                        }

                        else if(
                            reseau.type
                            === "Kick"
                        ){

                            emoji =
                                "🟢";

                        }

                        else if(
                            reseau.type
                            === "Paypal"
                        ){

                            emoji =
                                "💰";

                        }

                        else if(
                            reseau.type
                            === "Site Web"
                        ){

                            emoji =
                                "🌐";

                        }


                        reseauxHTML += `

                            <a
                                class="reseauCarte"
                                href="${reseau.lien}"
                                target="_blank"
                                rel="
                                    noopener
                                    noreferrer
                                "
                            >

                                ${emoji}
                                ${reseau.type}

                            </a>

                        `;

                    }
                );


                /* =================================================
                   CONTENU DE LA CARTE
                ================================================= */

                carte.innerHTML = 
				
				/* =========================================================
   BOUTON LIKE
========================================================= */

const boutonLike =
    carte.querySelector(".boutonLike");


const nombreLikes =
    carte.querySelector(".nombreLikes");


/* =========================================================
   ANIMATION DES COEURS
========================================================= */

function lancerAnimationCoeurs(){

    carte.classList.add("animationLike");


    for(let i = 0; i < 12; i++){

        const coeur =
            document.createElement("div");

        coeur.className =
            "coeurAnimation";

        coeur.textContent =
            "❤️";


        /* Position aléatoire */

        coeur.style.left =
            Math.random() * 90 + "%";


        coeur.style.bottom =
            Math.random() * 30 + "%";


        /* Taille aléatoire */

        coeur.style.fontSize =
            (25 + Math.random() * 25) + "px";


        /* Petit décalage */

        coeur.style.animationDelay =
            (Math.random() * 0.25) + "s";


        carte.appendChild(coeur);


        /* Supprimer après l'animation */

        setTimeout(()=>{

            coeur.remove();

        },1300);

    }


    /* Retour à la couleur normale */

    setTimeout(()=>{

        carte.classList.remove(
            "animationLike"
        );

    },1000);

}`

                    <img
                        class="cartePhoto"
                        src="${data.photo || ""}"
                        alt="
                            Photo de
                            ${data.pseudo || "profil"}
                        "
                    >


                    <div
                        class="carteContenu"
                    >

                        <div
                            class="cartePseudo"
                        >

                            ${data.pseudo || "Sans pseudo"}

                        </div>


                        <div
                            class="carteDescription"
                        >

                            ${
                                data.descriptionCourte
                                ||
                                "Aucune description"
                            }

                        </div>


                        <div
                            class="carteCategories"
                        >

                            ${categoriesHTML}

                        </div>


                        ${
                            reseauxHTML
                            ? `

                                <div
                                    class="carteReseaux"
                                >

                                    ${reseauxHTML}

                                </div>

                            `
                            : ""
                        }


                        <!-- =================================
                             LIKE
                        ================================== -->

                        <div
                            class="carteLikes"
                        >

                            <button
                                class="boutonLike"
                                type="button"
                            >

                                <span
                                    class="coeurLike"
                                >
                                    ♡
                                </span>


                                <span
                                    class="nombreLikes"
                                >
                                    0 likes
                                </span>


                                <div
                                    class="coeursLike"
                                ></div>

                            </button>

                        </div>


                        <!-- =================================
                             VOIR PROFIL
                        ================================== -->

                        <button
                            class="boutonVoirProfil"
                            type="button"
                        >

                            👤 Voir profil

                        </button>

                    </div>

                `;


                /* =================================================
                   ELEMENTS LIKE
                ================================================= */

                const boutonLike =
                    carte.querySelector(
                        ".boutonLike"
                    );


                const coeursLike =
                    carte.querySelector(
                        ".coeursLike"
                    );


                /* =================================================
                   CHARGER LE NOMBRE DE LIKES
                ================================================= */

                try{

                    const nombreLikes =
                        await recupererLikes(
                            userId
                        );


                    const aime =
                        await utilisateurAime(
                            userId
                        );


                    mettreAJourBoutonLike(
                        boutonLike,
                        aime,
                        nombreLikes
                    );

                }

                catch(error){

                    console.error(
                        "Erreur chargement likes :",
                        error
                    );

                }


                /* =================================================
                   CLIC LIKE
                ================================================= */

                if(boutonLike){

                    boutonLike.addEventListener(
                        "click",
                        async(event)=>{

                            event.stopPropagation();


                            await gererLike(
                                userId,
                                boutonLike,
                                coeursLike
                            );

                        }
                    );

                }


                /* =================================================
                   BOUTON +X
                ================================================= */

                const boutonPlus =
                    carte.querySelector(
                        ".categoriePlus"
                    );


                if(boutonPlus){

                    boutonPlus.addEventListener(
                        "click",
                        (event)=>{

                            event.stopPropagation();


                            const categoriesCachees =
                                carte.querySelector(
                                    ".categoriesCachees"
                                );


                            if(
                                !categoriesCachees
                            ){

                                return;

                            }


                            if(
                                categoriesCachees
                                .style
                                .display
                                === "flex"
                            ){

                                categoriesCachees
                                .style
                                .display =
                                    "none";


                                boutonPlus
                                .textContent =
                                    "+" +
                                    categoriesCachees
                                    .querySelectorAll(
                                        ".categorieCarte"
                                    )
                                    .length;

                            }

                            else{

                                categoriesCachees
                                .style
                                .display =
                                    "flex";


                                boutonPlus
                                .textContent =
                                    "−";

                            }

                        }
                    );

                }


                /* =================================================
                   RESEAUX
                ================================================= */

                const liensReseaux =
                    carte.querySelectorAll(
                        ".reseauCarte"
                    );


                liensReseaux.forEach(
                    (lien)=>{

                        lien.addEventListener(
                            "click",
                            (event)=>{

                                event.stopPropagation();

                            }
                        );

                    }
                );


                /* =================================================
                   BOUTON VOIR PROFIL
                ================================================= */

                const boutonVoirProfil =
                    carte.querySelector(
                        ".boutonVoirProfil"
                    );


                if(boutonVoirProfil){

                    boutonVoirProfil.addEventListener(
                        "click",
                        (event)=>{

                            event.stopPropagation();


                            window.location.href =
                                "profil.html?pseudo=" +
                                encodeURIComponent(
                                    data.pseudo
                                );

                        }
                    );

                }


                /* =================================================
                   AJOUTER LA CARTE
                ================================================= */

                listeProfils.appendChild(
                    carte
                );


                /* =================================================
                   CLIC SUR LA CARTE
                ================================================= */

                carte.addEventListener(
                    "click",
                    (event)=>{

                        if(
                            event.target.closest(
                                ".categoriePlus"
                            )
                        ){

                            return;

                        }


                        if(
                            event.target.closest(
                                ".reseauCarte"
                            )
                        ){

                            return;

                        }


                        if(
                            event.target.closest(
                                ".boutonVoirProfil"
                            )
                        ){

                            return;

                        }


                        if(
                            event.target.closest(
                                ".boutonLike"
                            )
                        ){

                            return;

                        }


                        window.location.href =
                            "profil.html?pseudo=" +
                            encodeURIComponent(
                                data.pseudo
                            );

                    }
                );

            }
        );


    }

    catch(error){

        console.error(
            "Erreur lors du chargement des profils :",
            error
        );


        listeProfils.innerHTML = `

            <p>

                Impossible de charger les profils.

            </p>

        `;

    }

}


/* =========================================================
   RECHERCHE DE PROFIL EN DIRECT
========================================================= */

if(
    recherche &&
    resultatsRecherche
){

    recherche.addEventListener(
        "input",
        async()=>{

            const texte =
                recherche.value.trim();


            /* =================================================
               RECHERCHE VIDE
            ================================================= */

            if(
                texte === ""
            ){

                resultatsRecherche.innerHTML =
                    "";


                resultatsRecherche.style.display =
                    "none";


                return;

            }


            try{

                const snapshot =
                    await getDocs(
                        collection(
                            db,
                            "users"
                        )
                    );


                resultatsRecherche.innerHTML =
                    "";


                const texteRecherche =
                    texte.toLowerCase();


                let nombreResultats =
                    0;


                snapshot.forEach(
                    (profilDoc)=>{

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


                            /* =================================================
                               RESULTAT
                            ================================================= */

                            const resultat =
                                document.createElement(
                                    "div"
                                );


                            resultat.className =
                                "resultatRecherche";


                            /* =================================================
                               PSEUDO
                            ================================================= */

                            const nom =
                                document.createElement(
                                    "div"
                                );


                            nom.className =
                                "resultatRecherchePseudo";


                            nom.textContent =
                                pseudo;


                            /* =================================================
                               PHOTO
                            ================================================= */

                            const image =
                                document.createElement(
                                    "img"
                                );


                            image.src =
                                data.photo || "";


                            image.alt =
                                pseudo;


                            /* =================================================
                               ORDRE
                            ================================================= */

                            resultat.appendChild(
                                nom
                            );


                            resultat.appendChild(
                                image
                            );


                            /* =================================================
                               CLIC
                            ================================================= */

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

                    }
                );


                /* =================================================
                   AFFICHAGE
                ================================================= */

                if(
                    nombreResultats > 0
                ){

                    resultatsRecherche.style.display =
                        "block";

                }

                else{

                    resultatsRecherche.innerHTML =
                        "";


                    resultatsRecherche.style.display =
                        "none";

                }

            }

            catch(error){

                console.error(
                    "Erreur lors de la recherche :",
                    error
                );


                resultatsRecherche.innerHTML =
                    "";


                resultatsRecherche.style.display =
                    "none";

            }

        }
    );

}

if(boutonLike){

    boutonLike.addEventListener(
        "click",
        (event)=>{

            event.stopPropagation();


            /* =========================
               ANIMATION
            ========================= */

            lancerAnimationCoeurs();


            /* =========================
               ANIMATION DU BOUTON
            ========================= */

            boutonLike.classList.add(
                "liked",
                "likeClick"
            );


            setTimeout(()=>{

                boutonLike.classList.remove(
                    "likeClick"
                );

            },250);


            /* =========================
               COMPTEUR
            ========================= */

            let likes =
                parseInt(
                    nombreLikes.textContent
                ) || 0;


            likes++;


            nombreLikes.textContent =
                likes;

        }
    );

}