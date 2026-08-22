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

    avatar.addEventListener("click", (e)=>{

        e.stopPropagation();

        menu.style.display =
            menu.style.display === "block"
            ? "none"
            : "block";

    });

}


document.addEventListener("click",(e)=>{

    if(profile && !profile.contains(e.target)){

        menu.style.display = "none";

    }

});


/* ===========================
   CONNEXION
=========================== */

if(loginBtn){

    loginBtn.addEventListener("click", async ()=>{

        try{

            await signInWithPopup(auth, provider);

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

    logout.addEventListener("click", async ()=>{

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

onAuthStateChanged(auth, async(user)=>{

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


            /* Les 3 premières */

            const troisCategories =
                categories.slice(0,3);


            /* Les suivantes */

            const autresCategories =
                categories.slice(3);


            let categoriesHTML = "";


            /* ===========================
               AFFICHER LES 3 PREMIERES
            =========================== */

            troisCategories.forEach((categorie)=>{

                categoriesHTML += `

                    <span class="categorieCarte">
                        🏷️ ${categorie}
                    </span>

                `;

            });


            /* ===========================
               AFFICHER +X
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

                        ${
                            data.descriptionCourte
                            || "Aucune description"
                        }

                    </div>


                    <div class="carteCategories">

                        ${categoriesHTML}

                    </div>


                    <div class="carteLikes">

                        ❤️ 0 likes

                    </div>


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
               AJOUTER LA CARTE
            =========================== */

            listeProfils.appendChild(carte);


            /* ===========================
               OUVRIR LE PROFIL
            =========================== */

            carte.addEventListener(
                "click",
                (event)=>{

                    /*
                       Si on clique sur +X,
                       le profil ne s'ouvre pas.
                    */

                    if(
                        event.target.classList.contains(
                            "categoriePlus"
                        )
                    ){

                        return;

                    }


                    /*
                       Ouverture du profil
                       avec le pseudo
                    */

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