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

const loginBtn = document.getElementById("loginBtn");
const profile = document.getElementById("profile");
const avatar = document.getElementById("avatar");
const menu = document.getElementById("menu");
const logout = document.getElementById("logout");
const listeProfils = document.getElementById("listeProfils");
const recherche = document.querySelector(".search input");

let utilisateurConnecte = null;


/* =========================================================
   GOOGLE
========================================================= */

const provider = new GoogleAuthProvider();

provider.setCustomParameters({
    prompt: "select_account"
});


/* =========================================================
   MENU DU COMPTE
========================================================= */

if(avatar){

    avatar.addEventListener("click",(event)=>{

        event.stopPropagation();

        menu.style.display =
            menu.style.display === "block"
            ? "none"
            : "block";

    });

}


document.addEventListener("click",(event)=>{

    if(profile && !profile.contains(event.target)){

        if(menu){

            menu.style.display = "none";

        }

    }

});


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
                "Erreur lors de la connexion :",
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

        }catch(error){

            console.error(
                "Erreur lors de la déconnexion :",
                error
            );

        }

    });

}


/* =========================================================
   ETAT DE LA CONNEXION
========================================================= */

onAuthStateChanged(auth,async(user)=>{

    utilisateurConnecte = user || null;


    /* =====================================================
       UTILISATEUR CONNECTE
    ===================================================== */

    if(user){

        if(user.photoURL && avatar){

            avatar.src =
                user.photoURL.replace(
                    "=s96-c",
                    "=s512-c"
                );

        }


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
                await getDoc(profilRef);


            if(!profilSnap.exists()){

                window.location.href =
                    "creation-profil.html";

                return;

            }

        }catch(error){

            console.error(
                "Erreur lors de la vérification du profil :",
                error
            );

        }


        chargerProfils();

    }


    /* =====================================================
       UTILISATEUR DECONNECTE
    ===================================================== */

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

});


/* =========================================================
   ANIMATION DES COEURS
========================================================= */

function explosionCoeurs(carte){

    for(let i = 0; i < 12; i++){

        const coeur =
            document.createElement("span");

        coeur.className =
            "coeurLike";

        coeur.textContent =
            ["❤️","💖","💕","💗","💓"][
                Math.floor(
                    Math.random() * 5
                )
            ];


        const x =
            Math.random() * 90 + 5;

        const y =
            Math.random() * 70 + 10;


        coeur.style.left =
            x + "%";

        coeur.style.top =
            y + "%";


        coeur.style.setProperty(
            "--rotation",
            (Math.random() * 60 - 30) + "deg"
        );


        carte.appendChild(coeur);


        setTimeout(()=>{

            coeur.remove();

        },1200);

    }

}


/* =========================================================
   GERER UN LIKE
========================================================= */

async function gererLike(
    userId,
    profilId,
    bouton,
    compteur,
    carte
){

    /* =====================================================
       PAS CONNECTE
    ===================================================== */

    if(!utilisateurConnecte){

        alert(
            "Tu dois être connecté pour aimer un profil ❤️"
        );

        return;

    }


    /* =====================================================
       DOCUMENT DU LIKE
    ===================================================== */

    const likeRef =
        doc(
            db,
            "users",
            profilId,
            "likes",
            userId
        );


    try{

        const likeSnap =
            await getDoc(likeRef);


        /* =================================================
           DEJA LIKE
        ================================================= */

        if(likeSnap.exists()){

            await deleteDoc(likeRef);

            bouton.textContent =
                "♡ J'aime";

            bouton.classList.remove(
                "likeActif"
            );


            let nombre =
                parseInt(
                    compteur.dataset.nombre || "0"
                );


            nombre =
                Math.max(
                    0,
                    nombre - 1
                );


            compteur.dataset.nombre =
                nombre;


            compteur.textContent =
                "❤️ " +
                nombre +
                " likes";

        }


        /* =================================================
           PAS ENCORE LIKE
        ================================================= */

        else{

            await setDoc(
                likeRef,
                {
                    uid: userId,
                    date: Date.now()
                }
            );


            bouton.textContent =
                "♥ J'aime";

            bouton.classList.add(
                "likeActif"
            );


            let nombre =
                parseInt(
                    compteur.dataset.nombre || "0"
                );


            nombre++;


            compteur.dataset.nombre =
                nombre;


            compteur.textContent =
                "❤️ " +
                nombre +
                " likes";


            /* ANIMATION */

            explosionCoeurs(carte);

        }

    }catch(error){

        console.error(
            "Erreur lors du like :",
            error
        );

        alert(
            "Impossible de modifier le like."
        );

    }

}


/* =========================================================
   CHARGER LES PROFILS
========================================================= */

async function chargerProfils(){

    if(!listeProfils){

        return;

    }


    listeProfils.innerHTML = "";


    try{

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "users"
                )
            );


        for(const profilDoc of snapshot.docs){

            const data =
                profilDoc.data();


            const profilId =
                profilDoc.id;


            /* =================================================
               CATEGORIES
            ================================================= */

            const categories =
                Array.isArray(data.categories)
                ? data.categories
                : [];


            const troisCategories =
                categories.slice(0,3);

            const autresCategories =
                categories.slice(3);


            let categoriesHTML = "";


            troisCategories.forEach(
                (categorie)=>{

                    categoriesHTML += `

                        <span class="categorieCarte">
                            🏷️ ${categorie}
                        </span>

                    `;

                }
            );


            if(autresCategories.length > 0){

                categoriesHTML += `

                    <span
                        class="categorieCarte categoriePlus"
                    >
                        +${autresCategories.length}
                    </span>

                    <div class="categoriesCachees">

                        ${
                            autresCategories
                            .map(
                                (categorie)=>`

                                    <span class="categorieCarte">
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
                Array.isArray(data.reseaux)
                ? data.reseaux
                : [];


            let reseauxHTML = "";


            reseaux.forEach(
                (reseau)=>{

                    if(!reseau || !reseau.lien){

                        return;

                    }


                    let emoji = "🌐";


                    if(reseau.type === "YouTube")
                        emoji = "▶️";

                    else if(reseau.type === "Twitch")
                        emoji = "🎮";

                    else if(reseau.type === "Discord")
                        emoji = "💬";

                    else if(reseau.type === "TikTok")
                        emoji = "🎵";

                    else if(reseau.type === "Instagram")
                        emoji = "📸";

                    else if(reseau.type === "Snapchat")
                        emoji = "👻";

                    else if(reseau.type === "Facebook")
                        emoji = "🔵";

                    else if(reseau.type === "Kick")
                        emoji = "🟢";

                    else if(reseau.type === "Paypal")
                        emoji = "💰";


                    reseauxHTML += `

                        <a
                            class="reseauCarte"
                            href="${reseau.lien}"
                            target="_blank"
                            rel="noopener noreferrer"
                        >

                            ${emoji} ${reseau.type}

                        </a>

                    `;

                }
            );


            /* =================================================
               CREER LA CARTE
            ================================================= */

            const carte =
                document.createElement("div");


            carte.className =
                "carteProfil";


            carte.innerHTML = `

                <img
                    class="cartePhoto"
                    src="${data.photo || ""}"
                    alt="Photo de ${data.pseudo || "profil"}"
                >


                <div class="carteContenu">

                    <div class="cartePseudo">

                        ${data.pseudo || "Sans pseudo"}

                    </div>


                    <div class="carteDescription">

                        ${
                            data.descriptionCourte ||
                            "Aucune description"
                        }

                    </div>


                    <div class="carteCategories">

                        ${categoriesHTML}

                    </div>


                    ${
                        reseauxHTML
                        ? `

                            <div class="carteReseaux">

                                ${reseauxHTML}

                            </div>

                        `
                        : ""
                    }


                    <div class="carteLikes">

                        ❤️ 0 likes

                    </div>


                    <button
                        class="boutonLike"
                        type="button"
                    >

                        ♡ J'aime

                    </button>


                    <button
                        class="boutonVoirProfil"
                        type="button"
                    >

                        👤 Voir profil

                    </button>

                </div>

            `;


            /* =================================================
               RECUPERER LES ELEMENTS LIKE
            ================================================= */

            const boutonLike =
                carte.querySelector(
                    ".boutonLike"
                );


            const compteur =
                carte.querySelector(
                    ".carteLikes"
                );


            /* =================================================
               COMPTER LES LIKES
            ================================================= */

            const likesRef =
                collection(
                    db,
                    "users",
                    profilId,
                    "likes"
                );


            const likesSnapshot =
                await getDocs(
                    likesRef
                );


            const nombreLikes =
                likesSnapshot.size;


            compteur.dataset.nombre =
                nombreLikes;


            compteur.textContent =
                "❤️ " +
                nombreLikes +
                " likes";


            /* =================================================
               VERIFIER SI L'UTILISATEUR A DEJA LIKE
            ================================================= */

            if(utilisateurConnecte){

                const monLikeRef =
                    doc(
                        db,
                        "users",
                        profilId,
                        "likes",
                        utilisateurConnecte.uid
                    );


                const monLike =
                    await getDoc(
                        monLikeRef
                    );


                if(monLike.exists()){

                    boutonLike.textContent =
                        "♥ J'aime";

                    boutonLike.classList.add(
                        "likeActif"
                    );

                }

            }


            /* =================================================
               CLICK LIKE
            ================================================= */

            boutonLike.addEventListener(
                "click",
                (event)=>{

                    event.stopPropagation();


                    gererLike(
                        utilisateurConnecte
                            ? utilisateurConnecte.uid
                            : null,
                        profilId,
                        boutonLike,
                        compteur,
                        carte
                    );

                }
            );


            /* =================================================
               BOUTON + CATEGORIES
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


                        const cache =
                            carte.querySelector(
                                ".categoriesCachees"
                            );


                        if(!cache){

                            return;

                        }


                        if(
                            cache.style.display ===
                            "flex"
                        ){

                            cache.style.display =
                                "none";


                            boutonPlus.textContent =
                                "+" +
                                cache.querySelectorAll(
                                    ".categorieCarte"
                                ).length;

                        }

                        else{

                            cache.style.display =
                                "flex";


                            boutonPlus.textContent =
                                "−";

                        }

                    }
                );

            }


            /* =================================================
               RESEAUX
            ================================================= */

            carte
                .querySelectorAll(
                    ".reseauCarte"
                )
                .forEach(
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
               VOIR PROFIL
            ================================================= */

            const boutonVoirProfil =
                carte.querySelector(
                    ".boutonVoirProfil"
                );


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
                            ".boutonLike"
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


                    window.location.href =
                        "profil.html?pseudo=" +
                        encodeURIComponent(
                            data.pseudo
                        );

                }
            );

        }

    }catch(error){

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

const resultatsRecherche =
    document.getElementById(
        "resultatsRecherche"
    );


if(recherche && resultatsRecherche){

    recherche.addEventListener(
        "input",
        async()=>{

            const texte =
                recherche.value.trim();


            if(texte === ""){

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


                            const resultat =
                                document.createElement(
                                    "div"
                                );


                            resultat.className =
                                "resultatRecherche";


                            const nom =
                                document.createElement(
                                    "div"
                                );


                            nom.className =
                                "resultatRecherchePseudo";


                            nom.textContent =
                                pseudo;


                            const image =
                                document.createElement(
                                    "img"
                                );


                            image.src =
                                data.photo || "";


                            image.alt =
                                pseudo;


                            resultat.appendChild(
                                nom
                            );


                            resultat.appendChild(
                                image
                            );


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


                if(nombreResultats > 0){

                    resultatsRecherche.style.display =
                        "block";

                }

                else{

                    resultatsRecherche.innerHTML =
                        "";

                    resultatsRecherche.style.display =
                        "none";

                }

            }catch(error){

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