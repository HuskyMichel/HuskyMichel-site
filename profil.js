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
    getDoc,
    setDoc,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


/* =========================================================
   UTILISATEUR ACTUEL
========================================================= */

let utilisateurActuel = null;


/* =========================================================
   PROFIL ACTUEL
========================================================= */

let profilActuelUid = null;

let profilActuelData = null;


/* =========================================================
   ELEMENTS DU PROFIL
========================================================= */

const photo =
    document.getElementById("photo");

const pseudo =
    document.getElementById("pseudo");

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

const resultatsRecherche =
    document.getElementById("resultatsRecherche");


/* =========================================================
   ELEMENTS DES LIKES
========================================================= */

const boutonLikeProfil =
    document.getElementById("boutonLikeProfil");

const compteurLikesProfil =
    document.getElementById("compteurLikesProfil");

const listeLikers =
    document.getElementById("listeLikers");


/* =========================================================
   ELEMENTS DES FAVORIS
========================================================= */

const sectionFavoris =
    document.getElementById("sectionFavoris");

const listeFavoris =
    document.getElementById("listeFavoris");


/* =========================================================
   PROFIL DEMANDE
========================================================= */

const params =
    new URLSearchParams(
        window.location.search
    );

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
                id="retourErreur"
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


    const retourErreur =
        document.getElementById(
            "retourErreur"
        );


    if(retourErreur){

        retourErreur.addEventListener(
            "click",
            ()=>{

                window.location.href =
                    "index.html";

            }
        );

    }

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

if(
    avatar &&
    menu &&
    profile
){

    avatar.addEventListener(
        "click",
        (event)=>{

            event.stopPropagation();

            menu.style.display =
                menu.style.display === "block"
                ? "none"
                : "block";

        }
    );


    document.addEventListener(
        "click",
        (event)=>{

            if(
                !profile.contains(
                    event.target
                )
            ){

                menu.style.display =
                    "none";

            }

        }
    );

}


/* =========================================================
   AFFICHER LE COMPTE CONNECTE
========================================================= */

function afficherCompteConnecte(user){

    if(loginBtn){

        loginBtn.style.display =
            "none";

        loginBtn.hidden =
            true;

    }


    if(profile){

        profile.style.display =
            "block";

        profile.hidden =
            false;

    }


    if(avatar){

        if(
            user &&
            user.photoURL
        ){

            avatar.src =
                user.photoURL.replace(
                    "=s96-c",
                    "=s512-c"
                );

        }

    }

}


/* =========================================================
   AFFICHER LE COMPTE DECONNECTE
========================================================= */

function afficherCompteDeconnecte(){

    if(loginBtn){

        loginBtn.style.display =
            "block";

        loginBtn.hidden =
            false;

    }


    if(profile){

        profile.style.display =
            "none";

        profile.hidden =
            true;

    }


    if(menu){

        menu.style.display =
            "none";

    }

}


/* =========================================================
   CONNEXION GOOGLE
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
                    "Erreur lors de la connexion Google :",
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

                window.location.href =
                    "index.html";

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
   ETAT DE CONNEXION
========================================================= */

onAuthStateChanged(
    auth,
    async(user)=>{

        utilisateurActuel =
            user;


        /* ================================================
           CONNECTE
        ================================================ */

        if(user){

            afficherCompteConnecte(
                user
            );

        }


        /* ================================================
           DECONNECTE
        ================================================ */

        else{

            afficherCompteDeconnecte();

        }


        /*
           Le profil doit être chargé après avoir
           déterminé l'utilisateur connecté.
        */

        await chargerProfil();

    }
);


/* =========================================================
   RECHERCHE DE PROFIL
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


            /* ==============================================
               RECHERCHE VIDE
            ============================================== */

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


                        const nomProfil =
                            data.pseudo ||
                            "";


                        if(
                            nomProfil
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
                                nomProfil;


                            const image =
                                document.createElement(
                                    "img"
                                );


                            image.src =
                                data.photo ||
                                "";


                            image.alt =
                                nomProfil;


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
                                            nomProfil
                                        );

                                }
                            );


                            resultatsRecherche.appendChild(
                                resultat
                            );

                        }

                    }
                );


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


/* =========================================================
   CHARGER LE PROFIL
========================================================= */

async function chargerProfil(){

    if(!pseudoRecherche){

        return;

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
                    pseudoRecherche
                )
            );


        const resultat =
            await getDocs(q);


        /* ==============================================
           PROFIL INTROUVABLE
        ============================================== */

        if(
            resultat.empty
        ){

            document.body.innerHTML = `

                <div style="
                    color:white;
                    text-align:center;
                    margin-top:100px;
                    font-family:Arial;
                ">

                    <h1>
                        Profil introuvable.
                    </h1>

                    <p>
                        Le profil
                        <strong>
                            ${pseudoRecherche}
                        </strong>
                        n'existe pas.
                    </p>

                    <button
                        id="retourIntrouvable"
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


            const retourIntrouvable =
                document.getElementById(
                    "retourIntrouvable"
                );


            if(retourIntrouvable){

                retourIntrouvable.addEventListener(
                    "click",
                    ()=>{

                        window.location.href =
                            "index.html";

                    }
                );

            }


            return;

        }


        /* ==============================================
           DOCUMENT DU PROFIL
        ============================================== */

        const profilDoc =
            resultat.docs[0];


        profilActuelUid =
            profilDoc.id;


        profilActuelData =
            profilDoc.data();


        const data =
            profilActuelData;


        /* ==============================================
           PHOTO
        ============================================== */

        if(photo){

            if(data.photo){

                photo.src =
                    data.photo.replace(
                        "=s96-c",
                        "=s512-c"
                    );

            }

            else{

                photo.src =
                    "";

            }

        }


        /* ==============================================
           PSEUDO
        ============================================== */

        if(pseudo){

            pseudo.textContent =
                data.pseudo ||
                "Sans pseudo";

        }


        /* ==============================================
           DESCRIPTION COURTE
        ============================================== */

        if(descriptionCourte){

            descriptionCourte.textContent =
                data.descriptionCourte ||
                "Aucune description";

        }


        /* ==============================================
           DESCRIPTION LONGUE
        ============================================== */

        if(descriptionLongue){

            descriptionLongue.textContent =
                data.descriptionLongue ||
                "Aucune description.";

        }


        /* ==============================================
           CATEGORIES
        ============================================== */

        if(categories){

            categories.innerHTML =
                "";


            const listeCategories =
                Array.isArray(
                    data.categories
                )
                ? data.categories
                : [];


            if(
                listeCategories.length === 0
            ){

                categories.innerHTML = `

                    <span style="color:#aaa;">

                        Aucune catégorie

                    </span>

                `;

            }

            else{

                listeCategories.forEach(
                    (categorie)=>{

                        const tag =
                            document.createElement(
                                "div"
                            );


                        tag.className =
                            "tag";


                        tag.textContent =
                            "🏷️ " +
                            categorie;


                        categories.appendChild(
                            tag
                        );

                    }
                );

            }

        }


        /* ==============================================
           RESEAUX
        ============================================== */

        if(reseaux){

            reseaux.innerHTML =
                "";


            const listeReseaux =
                Array.isArray(
                    data.reseaux
                )
                ? data.reseaux
                : [];


            if(
                listeReseaux.length === 0
            ){

                reseaux.innerHTML = `

                    <div style="color:#aaa;">

                        Aucun réseau renseigné.

                    </div>

                `;

            }

            else{

                listeReseaux.forEach(
                    (reseau)=>{

                        if(
                            !reseau
                        ){

                            return;

                        }


                        const div =
                            document.createElement(
                                "div"
                            );


                        div.className =
                            "reseau";


                        const titre =
                            document.createElement(
                                "strong"
                            );


                        titre.textContent =
                            reseau.type ||
                            "Réseau";


                        const lien =
                            document.createElement(
                                "a"
                            );


                        lien.href =
                            reseau.lien ||
                            "#";


                        lien.target =
                            "_blank";


                        lien.rel =
                            "noopener noreferrer";


                        lien.textContent =
                            reseau.lien ||
                            "";


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


        /* ==============================================
           VIDEO YOUTUBE
        ============================================== */

        if(videoContainer){

            videoContainer.innerHTML =
                "";


            const video =
                data.videoYoutube;


            if(
                video &&
                video.trim() !== ""
            ){

                const url =
                    video.trim();


                let videoId =
                    "";


                /* youtube.com/watch?v= */

                if(
                    url.includes(
                        "youtube.com/watch?v="
                    )
                ){

                    try{

                        const urlObjet =
                            new URL(url);


                        videoId =
                            urlObjet
                                .searchParams
                                .get("v") ||
                            "";

                    }

                    catch(error){

                        console.error(
                            "URL YouTube invalide :",
                            error
                        );

                    }

                }


                /* youtu.be/ */

                else if(
                    url.includes(
                        "youtu.be/"
                    )
                ){

                    videoId =
                        url.split(
                            "youtu.be/"
                        )[1] ||
                        "";


                    videoId =
                        videoId.split(
                            "?"
                        )[0];

                }


                /* youtube.com/embed/ */

                else if(
                    url.includes(
                        "youtube.com/embed/"
                    )
                ){

                    videoId =
                        url.split(
                            "youtube.com/embed/"
                        )[1] ||
                        "";


                    videoId =
                        videoId.split(
                            "?"
                        )[0];

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

                }

                else{

                    videoContainer.innerHTML = `

                        <p style="color:#aaa;">

                            Impossible de lire cette vidéo YouTube.

                        </p>

                    `;

                }

            }

            else{

                if(sectionVideo){

                    sectionVideo.style.display =
                        "none";

                }

            }

        }


        /* ==============================================
           FAVORIS
        ============================================== */

        await preparerSystemeFavoris();


        console.log(
            "Profil chargé :",
            data.pseudo
        );

    }

    catch(error){

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
                    id="retourErreurProfil"
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


        const retour =
            document.getElementById(
                "retourErreurProfil"
            );


        if(retour){

            retour.addEventListener(
                "click",
                ()=>{

                    window.location.href =
                        "index.html";

                }
            );

        }

    }

}


/* =========================================================
   PREPARER LE SYSTEME DE FAVORIS
========================================================= */

async function preparerSystemeFavoris(){

    /*
       Si la section n'existe pas dans le HTML,
       on ne fait rien.
    */

    if(
        !sectionFavoris ||
        !listeFavoris
    ){

        return;

    }


    /*
       Par défaut, la section est cachée.
    */

    sectionFavoris.style.display =
        "none";


    /*
       Il faut être connecté.
    */

    if(
        !utilisateurActuel
    ){

        return;

    }


    /*
       Il faut être sur son propre profil.
    */

    if(
        !profilActuelUid
    ){

        return;

    }


    if(
        utilisateurActuel.uid !==
        profilActuelUid
    ){

        return;

    }


    /*
       On affiche la section.
    */

    sectionFavoris.style.display =
        "block";


    await chargerFavoris();


    /*
       Le bouton permettant d'ajouter un profil
       aux favoris n'a pas besoin d'apparaître
       sur son propre profil.
    */

}


/* =========================================================
   CHARGER MES FAVORIS
========================================================= */

async function chargerFavoris(){

    if(
        !utilisateurActuel ||
        !listeFavoris
    ){

        return;

    }


    try{

        const favorisRef =
            collection(
                db,
                "users",
                utilisateurActuel.uid,
                "favoris"
            );


        const favorisSnapshot =
            await getDocs(
                favorisRef
            );


        listeFavoris.innerHTML =
            "";


        /*
           Aucun favori
        */

        if(
            favorisSnapshot.empty
        ){

            listeFavoris.innerHTML = `

                <div style="
                    color:#aaa;
                    padding:10px 0;
                ">

                    Tu n'as encore aucun profil en favori ⭐

                </div>

            `;

            return;

        }


        /*
           Charger chaque profil
        */

        for(
            const favoriDoc
            of favorisSnapshot.docs
        ){

            const profilUid =
                favoriDoc.id;


            try{

                const profilRef =
                    doc(
                        db,
                        "users",
                        profilUid
                    );


                const profilSnapshot =
                    await getDoc(
                        profilRef
                    );


                /*
                   Le profil n'existe plus
                */

                if(
                    !profilSnapshot.exists()
                ){

                    continue;

                }


                const data =
                    profilSnapshot.data();


                creerCarteFavori(
                    profilUid,
                    data
                );

            }

            catch(error){

                console.error(
                    "Erreur lors du chargement d'un favori :",
                    error
                );

            }

        }

    }

    catch(error){

        console.error(
            "Erreur lors du chargement des favoris :",
            error
        );


        listeFavoris.innerHTML = `

            <div style="
                color:#ff7777;
                padding:10px 0;
            ">

                Impossible de charger tes favoris.

            </div>

        `;

    }

}


/* =========================================================
   CREER UNE CARTE FAVORI
========================================================= */

function creerCarteFavori(
    profilUid,
    data
){

    if(!listeFavoris){

        return;

    }


    const carte =
        document.createElement(
            "div"
        );


    carte.className =
        "carteFavori";


    /*
       Style directement dans le JS afin que
       le système fonctionne même sans CSS supplémentaire.
    */

    carte.style.display =
        "flex";

    carte.style.alignItems =
        "center";

    carte.style.gap =
        "12px";

    carte.style.padding =
        "10px 14px";

    carte.style.marginBottom =
        "10px";

    carte.style.background =
        "#202020";

    carte.style.border =
        "1px solid #3a3a3a";

    carte.style.borderRadius =
        "14px";

    carte.style.cursor =
        "pointer";

    carte.style.transition =
        ".2s";


    carte.addEventListener(
        "mouseenter",
        ()=>{

            carte.style.background =
                "#292929";

            carte.style.transform =
                "translateY(-2px)";

        }
    );


    carte.addEventListener(
        "mouseleave",
        ()=>{

            carte.style.background =
                "#202020";

            carte.style.transform =
                "translateY(0)";

        }
    );


    /*
       PHOTO
    */

    const image =
        document.createElement(
            "img"
        );


    image.src =
        data.photo ||
        "";


    image.alt =
        data.pseudo ||
        "Profil";


    image.style.width =
        "55px";

    image.style.height =
        "55px";

    image.style.borderRadius =
        "50%";

    image.style.objectFit =
        "cover";

    image.style.border =
        "2px solid white";


    /*
       CONTENU
    */

    const contenu =
        document.createElement(
            "div"
        );


    contenu.style.flex =
        "1";


    const nom =
        document.createElement(
            "div"
        );


    nom.textContent =
        data.pseudo ||
        "Sans pseudo";


    nom.style.fontWeight =
        "bold";

    nom.style.fontSize =
        "16px";


    const description =
        document.createElement(
            "div"
        );


    description.textContent =
        data.descriptionCourte ||
        "Aucune description";


    description.style.color =
        "#aaa";

    description.style.fontSize =
        "13px";

    description.style.marginTop =
        "4px";


    contenu.appendChild(
        nom
    );


    contenu.appendChild(
        description
    );


    /*
       BOUTON RETIRER
    */

    const boutonRetirer =
        document.createElement(
            "button"
        );


    boutonRetirer.type =
        "button";


    boutonRetirer.textContent =
        "★";


    boutonRetirer.title =
        "Retirer des favoris";


    boutonRetirer.style.border =
        "none";

    boutonRetirer.style.background =
        "transparent";

    boutonRetirer.style.color =
        "#ffd43b";

    boutonRetirer.style.fontSize =
        "24px";

    boutonRetirer.style.cursor =
        "pointer";


    boutonRetirer.addEventListener(
        "click",
        async(event)=>{

            event.stopPropagation();


            await retirerDesFavoris(
                profilUid,
                carte
            );

        }
    );


    /*
       ASSEMBLAGE
    */

    carte.appendChild(
        image
    );


    carte.appendChild(
        contenu
    );


    carte.appendChild(
        boutonRetirer
    );


    /*
       CLIC SUR LA CARTE
    */

    carte.addEventListener(
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


    listeFavoris.appendChild(
        carte
    );

}


/* =========================================================
   AJOUTER UN PROFIL AUX FAVORIS
========================================================= */

async function ajouterAuxFavoris(){

    /*
       Pas connecté
    */

    if(
        !utilisateurActuel
    ){

        alert(
            "Tu dois être connecté pour ajouter un profil aux favoris ⭐"
        );

        return;

    }


    /*
       Pas de profil
    */

    if(
        !profilActuelUid
    ){

        return;

    }


    /*
       On ne peut pas mettre son propre profil
       en favori.
    */

    if(
        utilisateurActuel.uid ===
        profilActuelUid
    ){

        return;

    }


    try{

        const favoriRef =
            doc(
                db,
                "users",
                utilisateurActuel.uid,
                "favoris",
                profilActuelUid
            );


        await setDoc(
            favoriRef,
            {

                profilUid:
                    profilActuelUid,

                pseudo:
                    profilActuelData?.pseudo ||
                    "",

                date:
                    new Date()

            }
        );


        mettreAJourBoutonFavori(
            true
        );


        alert(
            "⭐ Profil ajouté à tes favoris !"
        );

    }

    catch(error){

        console.error(
            "Erreur lors de l'ajout aux favoris :",
            error
        );


        alert(
            "Impossible d'ajouter ce profil aux favoris."
        );

    }

}


/* =========================================================
   RETIRER UN PROFIL DES FAVORIS
========================================================= */

async function retirerDesFavoris(
    profilUid,
    carte = null
){

    if(
        !utilisateurActuel ||
        !profilUid
    ){

        return;

    }


    try{

        const favoriRef =
            doc(
                db,
                "users",
                utilisateurActuel.uid,
                "favoris",
                profilUid
            );


        await deleteDoc(
            favoriRef
        );


        /*
           Si on retire une carte depuis
           "Mes favoris", on la supprime immédiatement.
        */

        if(carte){

            carte.remove();

        }


        /*
           Si toutes les cartes ont disparu,
           on affiche le message.
        */

        if(
            listeFavoris &&
            listeFavoris.children.length === 0
        ){

            listeFavoris.innerHTML = `

                <div style="
                    color:#aaa;
                    padding:10px 0;
                ">

                    Tu n'as encore aucun profil en favori ⭐

                </div>

            `;

        }


        /*
           Mettre à jour le bouton si le profil
           actuellement affiché vient d'être retiré.
        */

        if(
            profilUid === profilActuelUid
        ){

            mettreAJourBoutonFavori(
                false
            );

        }

    }

    catch(error){

        console.error(
            "Erreur lors de la suppression du favori :",
            error
        );


        alert(
            "Impossible de retirer ce profil des favoris."
        );

    }

}


/* =========================================================
   VERIFIER SI LE PROFIL EST EN FAVORI
========================================================= */

async function verifierFavori(){

    if(
        !utilisateurActuel ||
        !profilActuelUid
    ){

        return false;

    }


    /*
       Son propre profil n'a pas besoin
       d'être ajouté aux favoris.
    */

    if(
        utilisateurActuel.uid ===
        profilActuelUid
    ){

        return false;

    }


    try{

        const favoriRef =
            doc(
                db,
                "users",
                utilisateurActuel.uid,
                "favoris",
                profilActuelUid
            );


        const favoriSnapshot =
            await getDoc(
                favoriRef
            );


        return favoriSnapshot.exists();

    }

    catch(error){

        console.error(
            "Erreur lors de la vérification du favori :",
            error
        );


        return false;

    }

}


/* =========================================================
   CREER LE BOUTON FAVORI
========================================================= */

function creerBoutonFavori(){

    if(
        !pseudo ||
        !profilActuelUid
    ){

        return;

    }


    /*
       On cherche la zone des likes.
    */

    const zoneLike =
        document.querySelector(
            ".profilLikeZone"
        );


    if(!zoneLike){

        return;

    }


    /*
       Eviter de créer plusieurs boutons.
    */

    const ancienBouton =
        document.getElementById(
            "boutonFavoriProfil"
        );


    if(ancienBouton){

        ancienBouton.remove();

    }


    /*
       Créer le bouton
    */

    const bouton =
        document.createElement(
            "button"
        );


    bouton.id =
        "boutonFavoriProfil";


    bouton.type =
        "button";


    bouton.className =
        "boutonFavoriProfil";


    bouton.style.padding =
        "11px 20px";

    bouton.style.border =
        "none";

    bouton.style.borderRadius =
        "25px";

    bouton.style.background =
        "#333";

    bouton.style.color =
        "white";

    bouton.style.fontSize =
        "15px";

    bouton.style.fontWeight =
        "bold";

    bouton.style.cursor =
        "pointer";

    bouton.style.transition =
        ".2s";


    /*
       Clic
    */

    bouton.addEventListener(
        "click",
        async(event)=>{

            event.stopPropagation();


            if(
                bouton.dataset.chargement ===
                "true"
            ){

                return;

            }


            bouton.dataset.chargement =
                "true";


            const estFavori =
                await verifierFavori();


            if(estFavori){

                await retirerDesFavoris(
                    profilActuelUid
                );

            }

            else{

                await ajouterAuxFavoris();

            }


            bouton.dataset.chargement =
                "false";

        }
    );


    /*
       Ajouter à la zone
    */

    zoneLike.appendChild(
        bouton
    );


    /*
       Vérifier l'état actuel
    */

    mettreAJourBoutonFavori();

}


/* =========================================================
   METTRE A JOUR LE BOUTON FAVORI
========================================================= */

async function mettreAJourBoutonFavori(
    etatForce = null
){

    const bouton =
        document.getElementById(
            "boutonFavoriProfil"
        );


    if(!bouton){

        return;

    }


    /*
       Si on est sur son propre profil,
       le bouton est caché.
    */

    if(
        !utilisateurActuel ||
        !profilActuelUid ||
        utilisateurActuel.uid ===
        profilActuelUid
    ){

        bouton.style.display =
            "none";

        return;

    }


    bouton.style.display =
        "block";


    let estFavori;


    if(
        etatForce !== null
    ){

        estFavori =
            etatForce;

    }

    else{

        estFavori =
            await verifierFavori();

    }


    if(estFavori){

        bouton.textContent =
            "⭐ Dans mes favoris";

        bouton.style.background =
            "#d89b00";

        bouton.style.color =
            "white";

    }

    else{

        bouton.textContent =
            "☆ Ajouter aux favoris";

        bouton.style.background =
            "#333";

        bouton.style.color =
            "white";

    }

}


/* =========================================================
   ANIMATION DES COEURS
========================================================= */

function lancerAnimationCoeursProfil(){

    document.body.classList.remove(
        "animationAmour"
    );


    void document.body.offsetWidth;


    document.body.classList.add(
        "animationAmour"
    );


    const nombreCoeurs =
        35;


    for(
        let i = 0;
        i < nombreCoeurs;
        i++
    ){

        const coeur =
            document.createElement(
                "div"
            );


        coeur.className =
            "coeurProfilAnimation";


        coeur.textContent =
            "❤️";


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


        coeur.style.fontSize =
            (
                25 +
                Math.random() * 40
            ) +
            "px";


        coeur.style.setProperty(
            "--deplacement",
            (
                -150 +
                Math.random() * 300
            ) +
            "px"
        );


        coeur.style.setProperty(
            "--rotation",
            (
                -35 +
                Math.random() * 70
            ) +
            "deg"
        );


        coeur.style.animationDelay =
            (
                Math.random() * .5
            ) +
            "s";


        document.body.appendChild(
            coeur
        );


        setTimeout(
            ()=>{

                coeur.remove();

            },
            2200
        );

    }


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
   ANIMATION DU BOUTON LIKE
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
   CHARGER LES PERSONNES QUI ONT LIKÉ
========================================================= */

async function chargerLikersProfil(){

    if(
        !pseudoRecherche ||
        !listeLikers
    ){

        return;

    }


    try{

        const likesRef =
            collection(
                db,
                "users",
                profilActuelUid,
                "likes"
            );


        const likesSnapshot =
            await getDocs(
                likesRef
            );


        listeLikers.innerHTML =
            "";


        if(
            likesSnapshot.empty
        ){

            return;

        }


        for(
            const likeDoc
            of likesSnapshot.docs
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


                if(
                    !utilisateurSnap.exists()
                ){

                    continue;

                }


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


                liker.style.cursor =
                    "pointer";


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


                listeLikers.appendChild(
                    liker
                );

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
   CHARGER LES LIKES
========================================================= */

async function chargerLikesProfil(){

    if(
        !profilActuelUid
    ){

        return;

    }


    try{

        const likesRef =
            collection(
                db,
                "users",
                profilActuelUid,
                "likes"
            );


        const snapshot =
            await getDocs(
                likesRef
            );


        const nombre =
            snapshot.size;


        /* ==============================================
           COMPTEUR
        ============================================== */

        if(compteurLikesProfil){

            compteurLikesProfil.textContent =
                "❤️ " +
                nombre +
                (
                    nombre > 1
                    ? " likes"
                    : " like"
                );

        }


        /* ==============================================
           VERIFIER MON LIKE
        ============================================== */

        if(
            boutonLikeProfil
        ){

            if(
                utilisateurActuel
            ){

                const monLikeRef =
                    doc(
                        db,
                        "users",
                        profilActuelUid,
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

            else{

                boutonLikeProfil.classList.remove(
                    "liked"
                );


                boutonLikeProfil.textContent =
                    "♡ J'aime";

            }

        }


        /* ==============================================
           CHARGER LES LIKERS
        ============================================== */

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
   GERER LIKE / UNLIKE
========================================================= */

async function gererLikeProfil(){

    /*
       UTILISATEUR NON CONNECTE
    */

    if(
        !utilisateurActuel
    ){

        alert(
            "Tu dois être connecté pour aimer un profil ❤️"
        );

        return;

    }


    if(
        !boutonLikeProfil ||
        !profilActuelUid
    ){

        return;

    }


    /*
       EVITER LES CLICS RAPIDES
    */

    if(
        boutonLikeProfil.dataset.chargement ===
        "true"
    ){

        return;

    }


    boutonLikeProfil.dataset.chargement =
        "true";


    try{

        const likeRef =
            doc(
                db,
                "users",
                profilActuelUid,
                "likes",
                utilisateurActuel.uid
            );


        const likeSnap =
            await getDoc(
                likeRef
            );


        /* ==============================================
           UNLIKE
        ============================================== */

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

        }


        /* ==============================================
           LIKE
        ============================================== */

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


            /*
               Animation bouton
            */

            animerBoutonLikeProfil();


            /*
               Grosse animation
            */

            lancerAnimationCoeursProfil();

        }


        /*
           Recharger les données
        */

        await chargerLikesProfil();

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

if(
    boutonLikeProfil
){

    boutonLikeProfil.addEventListener(
        "click",
        (event)=>{

            event.stopPropagation();

            gererLikeProfil();

        }
    );

}


/* =========================================================
   RETOUR ACCUEIL
========================================================= */

const logoAccueil =
    document.getElementById(
        "logoAccueil"
    );


const retourAccueil =
    document.getElementById(
        "retourAccueil"
    );


if(logoAccueil){

    logoAccueil.addEventListener(
        "click",
        ()=>{

            window.location.href =
                "index.html";

        }
    );

}


if(retourAccueil){

    retourAccueil.addEventListener(
        "click",
        ()=>{

            window.location.href =
                "index.html";

        }
    );

}


/* =========================================================
   LANCEMENT INITIAL
========================================================= */

/*
   IMPORTANT :
   Le profil est chargé depuis onAuthStateChanged().
   Cela permet de savoir si le profil affiché est
   celui de l'utilisateur connecté avant de charger
   les favoris.
*/


/*
   Si Firebase ne déclenche pas immédiatement
   l'état de connexion, on laisse onAuthStateChanged()
   gérer le lancement.
*/


console.log(
    "profil.js chargé avec le système de favoris."
);