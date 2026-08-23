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
    getDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


/* ===========================
   ELEMENTS HTML
=========================== */

const loginBtn = document.getElementById("loginBtn");
const profile = document.getElementById("profile");
const avatar = document.getElementById("avatar");
const menu = document.getElementById("menu");
const logout = document.getElementById("logout");
const listeProfils = document.getElementById("listeProfils");
const recherche = document.querySelector(".search input");


/* ===========================
   GOOGLE
=========================== */

const provider = new GoogleAuthProvider();

provider.setCustomParameters({
    prompt: "select_account"
});


/* ===========================
   MENU DU COMPTE
=========================== */

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

        menu.style.display = "none";

    }

});


/* ===========================
   CONNEXION
=========================== */

if(loginBtn){

    loginBtn.addEventListener("click",async()=>{

        try{

            await signInWithPopup(auth,provider);

        }

        catch(error){

            console.error(
                "Erreur lors de la connexion :",
                error
            );

        }

    });

}


/* ===========================
   DECONNEXION
=========================== */

if(logout){

    logout.addEventListener("click",async()=>{

        try{

            await signOut(auth);

        }

        catch(error){

            console.error(
                "Erreur lors de la déconnexion :",
                error
            );

        }

    });

}


/* ===========================
   ETAT DE LA CONNEXION
=========================== */

onAuthStateChanged(auth,async(user)=>{

    /* ===========================
       UTILISATEUR CONNECTE
    =========================== */

    if(user){

        /* PHOTO GOOGLE */

        if(user.photoURL){

            avatar.src =
                user.photoURL.replace(
                    "=s96-c",
                    "=s512-c"
                );

        }


        /* AFFICHER LE COMPTE */

        loginBtn.style.display = "none";

        profile.style.display = "block";


        /* ===========================
           VERIFIER LE PROFIL FIRESTORE
        =========================== */

        try{

            const profilRef =
                doc(
                    db,
                    "users",
                    user.uid
                );

            const profilSnap =
                await getDoc(profilRef);


            /* PROFIL INEXISTANT */

            if(!profilSnap.exists()){

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


        /* CHARGER LES PROFILS */

        chargerProfils();

    }


    /* ===========================
       UTILISATEUR NON CONNECTE
    =========================== */

    else{

        loginBtn.style.display = "block";

        profile.style.display = "none";


        /* LES PROFILS RESTENT VISIBLES */

        chargerProfils();

    }

});


/* ===========================
   CHARGER LES PROFILS
=========================== */

async function chargerProfils(){

    /* VIDER LA LISTE */

    listeProfils.innerHTML = "";


    try{

        /* ===========================
           RECUPERER LES UTILISATEURS
        =========================== */

        const snapshot =
            await getDocs(
                collection(db,"users")
            );


        /* ===========================
           PARCOURIR LES PROFILS
        =========================== */

        snapshot.forEach((profilDoc)=>{

            const data =
                profilDoc.data();


            /* ===========================
               CREER LA CARTE
            =========================== */

            const carte =
                document.createElement("div");

            carte.className =
                "carteProfil";


            /* ===========================
               CATEGORIES
            =========================== */

            const categories =
                Array.isArray(data.categories)
                ? data.categories
                : [];


            const troisCategories =
                categories.slice(0,3);

            const autresCategories =
                categories.slice(3);


            let categoriesHTML = "";


            /* ===========================
               3 PREMIERES CATEGORIES
            =========================== */

            troisCategories.forEach((categorie)=>{

                categoriesHTML += `

                    <span class="categorieCarte">
                        🏷️ ${categorie}
                    </span>

                `;

            });


            /* ===========================
               CATEGORIES SUPPLEMENTAIRES
            =========================== */

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
                            .map((categorie)=>`

                                <span class="categorieCarte">
                                    🏷️ ${categorie}
                                </span>

                            `)
                            .join("")
                        }

                    </div>

                `;

            }


            /* ===========================
               RESEAUX SOCIAUX
            =========================== */

            const reseaux =
                Array.isArray(data.reseaux)
                ? data.reseaux
                : [];


            let reseauxHTML = "";


            reseaux.forEach((reseau)=>{

                if(!reseau || !reseau.lien){

                    return;

                }


                let emoji = "🌐";


                if(reseau.type === "YouTube"){

                    emoji = "▶️";

                }

                else if(reseau.type === "Twitch"){

                    emoji = "🎮";

                }

                else if(reseau.type === "Discord"){

                    emoji = "💬";

                }

                else if(reseau.type === "TikTok"){

                    emoji = "🎵";

                }

                else if(reseau.type === "Instagram"){

                    emoji = "📸";

                }

                else if(reseau.type === "Snapchat"){

                    emoji = "👻";

                }

                else if(reseau.type === "Facebook"){

                    emoji = "🔵";

                }

                else if(reseau.type === "Kick"){

                    emoji = "🟢";

                }

                else if(reseau.type === "Paypal"){

                    emoji = "💰";

                }

                else if(reseau.type === "Site Web"){

                    emoji = "🌐";

                }


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

            });


            /* ===========================
               CONTENU DE LA CARTE
            =========================== */

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

                        ${data.descriptionCourte || "Aucune description"}

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
                        class="boutonVoirProfil"
                        type="button"
                    >

                        👤 Voir profil

                    </button>

                </div>

            `;


            /* ===========================
               BOUTON +X
            =========================== */

            const boutonPlus =
                carte.querySelector(
                    ".categoriePlus"
                );


            if(boutonPlus){

                boutonPlus.addEventListener(
                    "click",
                    (event)=>{

                        /*
                           Empêche le clic de
                           déclencher l'ouverture
                           du profil
                        */

                        event.stopPropagation();


                        const categoriesCachees =
                            carte.querySelector(
                                ".categoriesCachees"
                            );


                        if(!categoriesCachees){

                            return;

                        }


                        /* ===========================
                           FERMER
                        =========================== */

                        if(
                            categoriesCachees.style.display
                            === "flex"
                        ){

                            categoriesCachees.style.display =
                                "none";


                            boutonPlus.textContent =
                                "+" +
                                categoriesCachees
                                .querySelectorAll(
                                    ".categorieCarte"
                                )
                                .length;

                        }


                        /* ===========================
                           OUVRIR
                        =========================== */

                        else{

                            categoriesCachees.style.display =
                                "flex";


                            boutonPlus.textContent =
                                "−";

                        }

                    }
                );

            }


            /* ===========================
               RESEAUX
               EMPECHE LE CLIC PROFIL
            =========================== */

            const liensReseaux =
                carte.querySelectorAll(
                    ".reseauCarte"
                );


            liensReseaux.forEach((lien)=>{

                lien.addEventListener(
                    "click",
                    (event)=>{

                        event.stopPropagation();

                    }
                );

            });


            /* ===========================
               BOUTON VOIR PROFIL
            =========================== */

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


            /* ===========================
               AJOUTER LA CARTE
            =========================== */

            listeProfils.appendChild(carte);


            /* ===========================
               CLIQUER SUR LA CARTE
            =========================== */

            carte.addEventListener(
                "click",
                (event)=>{

                    /*
                       Si on clique sur le +X,
                       on ne quitte pas la page.
                    */

                    if(
                        event.target.closest(
                            ".categoriePlus"
                        )
                    ){

                        return;

                    }


                    /*
                       Si on clique sur un réseau,
                       le réseau s'occupe du clic.
                    */

                    if(
                        event.target.closest(
                            ".reseauCarte"
                        )
                    ){

                        return;

                    }


                    /*
                       Si on clique sur le bouton,
                       le bouton s'occupe du clic.
                    */

                    if(
                        event.target.closest(
                            ".boutonVoirProfil"
                        )
                    ){

                        return;

                    }


                    /* OUVERTURE DU PROFIL */

                    window.location.href =
                        "profil.html?pseudo=" +
                        encodeURIComponent(
                            data.pseudo
                        );

                }
            );

        });


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


                    /* =========================
                       RECHERCHE DU PSEUDO
                    ========================= */

                    if(
                        pseudo
                            .toLowerCase()
                            .includes(
                                texteRecherche
                            )
                    ){

                        nombreResultats++;


                        /* =========================
                           CREATION DU RESULTAT
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
                           ORDRE
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