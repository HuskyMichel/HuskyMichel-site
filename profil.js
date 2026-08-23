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
   ELEMENTS FAVORIS
========================================================= */

const boutonFavoriProfil =
    document.getElementById("boutonFavoriProfil");

const sectionFavoris =
    document.getElementById("sectionFavoris");

const listeFavoris =
    document.getElementById("listeFavoris");


/* =========================================================
   ELEMENTS BARRE DU HAUT
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
   ELEMENTS LIKES
========================================================= */

const boutonLikeProfil =
    document.getElementById("boutonLikeProfil");

const compteurLikesProfil =
    document.getElementById("compteurLikesProfil");

const listeLikers =
    document.getElementById("listeLikers");


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
   GOOGLE
========================================================= */

const provider =
    new GoogleAuthProvider();

provider.setCustomParameters({
    prompt: "select_account"
});


/* =========================================================
   VERIFICATION DU PSEUDO
========================================================= */

if (!pseudoRecherche) {

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
        document.getElementById("retourErreur");


    if (retourErreur) {

        retourErreur.addEventListener(
            "click",
            () => {

                window.location.href =
                    "index.html";

            }
        );

    }

}


/* =========================================================
   MENU DU COMPTE
========================================================= */

if (
    avatar &&
    menu &&
    profile
) {

    avatar.addEventListener(
        "click",
        (event) => {

            event.stopPropagation();

            menu.style.display =
                menu.style.display === "block"
                    ? "none"
                    : "block";

        }
    );


    document.addEventListener(
        "click",
        (event) => {

            if (
                !profile.contains(
                    event.target
                )
            ) {

                menu.style.display =
                    "none";

            }

        }
    );

}


/* =========================================================
   AFFICHER COMPTE CONNECTE
========================================================= */

function afficherCompteConnecte(user) {

    if (loginBtn) {

        loginBtn.style.display =
            "none";

        loginBtn.hidden =
            true;

    }


    if (profile) {

        profile.style.display =
            "block";

        profile.hidden =
            false;

    }


    if (avatar) {

        if (
            user &&
            user.photoURL
        ) {

            avatar.src =
                user.photoURL.replace(
                    "=s96-c",
                    "=s512-c"
                );

        }

    }

}


/* =========================================================
   AFFICHER COMPTE DECONNECTE
========================================================= */

function afficherCompteDeconnecte() {

    if (loginBtn) {

        loginBtn.style.display =
            "block";

        loginBtn.hidden =
            false;

    }


    if (profile) {

        profile.style.display =
            "none";

        profile.hidden =
            true;

    }


    if (menu) {

        menu.style.display =
            "none";

    }

}


/* =========================================================
   VERIFIER SI L'UTILISATEUR POSSEDE UN PROFIL
========================================================= */

async function verifierProfilUtilisateur(user) {

    if (!user) {

        return;

    }


    try {

        const utilisateurRef =
            doc(
                db,
                "users",
                user.uid
            );


        const utilisateurSnap =
            await getDoc(
                utilisateurRef
            );


        /* ==============================================
           PAS DE PROFIL
        ============================================== */

        if (
            !utilisateurSnap.exists()
        ) {

            console.log(
                "Aucun profil trouvé pour ce compte."
            );


            window.location.href =
                "creation-profil.html";


            return false;

        }


        /* ==============================================
           PROFIL EXISTANT
        ============================================== */

        console.log(
            "Profil utilisateur trouvé."
        );


        return true;

    }

    catch (error) {

        console.error(
            "Erreur lors de la vérification du profil :",
            error
        );


        return false;

    }

}


/* =========================================================
   CONNEXION GOOGLE
========================================================= */

if (loginBtn) {

    loginBtn.addEventListener(
        "click",
        async () => {

            try {

                await signInWithPopup(
                    auth,
                    provider
                );

            }

            catch (error) {

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

if (logout) {

    logout.addEventListener(
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

            }

        }
    );

}


/* =========================================================
   ETAT DE CONNEXION
========================================================= */

onAuthStateChanged(
    auth,
    async (user) => {

        utilisateurActuel =
            user;


        /* ================================================
           CONNECTE
        ================================================ */

        if (user) {

            afficherCompteConnecte(
                user
            );


            /*
             * Vérification du profil personnel.
             *
             * IMPORTANT :
             * Cette vérification concerne uniquement
             * le compte qui vient de se connecter.
             */

            const profilExiste =
                await verifierProfilUtilisateur(
                    user
                );


            if (!profilExiste) {

                return;

            }


            /* ==========================================
               LIKES
            ========================================== */

            await chargerLikesProfil();


            /* ==========================================
               FAVORIS
            ========================================== */

            await chargerEtatFavori();


            /*
             * Si l'utilisateur consulte son propre
             * profil, afficher ses favoris privés.
             */

            await chargerFavoris();

        }


        /* ================================================
           DECONNECTE
        ================================================ */

        else {

            afficherCompteDeconnecte();


            /*
             * IMPORTANT :
             *
             * Les likes sont PUBLICS.
             *
             * Donc même déconnecté on les charge.
             */

            await chargerLikesProfil();


            /*
             * Les favoris sont privés.
             *
             * Donc on les cache lorsqu'on est déconnecté.
             */

            if (sectionFavoris) {

                sectionFavoris.style.display =
                    "none";

            }


            if (boutonFavoriProfil) {

                boutonFavoriProfil.style.display =
                    "none";

            }

        }

    }
);


/* =========================================================
   RECHERCHE DE PROFIL
========================================================= */

if (
    recherche &&
    resultatsRecherche
) {

    recherche.addEventListener(
        "input",
        async () => {

            const texte =
                recherche.value.trim();


            if (
                texte === ""
            ) {

                resultatsRecherche.innerHTML =
                    "";

                resultatsRecherche.style.display =
                    "none";

                return;

            }


            try {

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
                    (profilDoc) => {

                        const data =
                            profilDoc.data();


                        const nomProfil =
                            data.pseudo ||
                            "";


                        if (
                            nomProfil
                                .toLowerCase()
                                .includes(
                                    texteRecherche
                                )
                        ) {

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
                                () => {

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


                if (
                    nombreResultats > 0
                ) {

                    resultatsRecherche.style.display =
                        "block";

                }

                else {

                    resultatsRecherche.innerHTML =
                        "";

                    resultatsRecherche.style.display =
                        "none";

                }

            }

            catch (error) {

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

async function chargerProfil() {

    if (!pseudoRecherche) {

        return;

    }


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
                    pseudoRecherche
                )
            );


        const resultat =
            await getDocs(q);


        /* ==============================================
           PROFIL INTROUVABLE
        ============================================== */

        if (
            resultat.empty
        ) {

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


            if (retourIntrouvable) {

                retourIntrouvable.addEventListener(
                    "click",
                    () => {

                        window.location.href =
                            "index.html";

                    }
                );

            }


            return;

        }


        /* ==============================================
           DONNEES
        ============================================== */

        const profilDoc =
            resultat.docs[0];


        const data =
            profilDoc.data();


        /*
         * On conserve l'ID Firestore du profil.
         * Il sera utile pour les favoris.
         */

        window.profilActuelId =
            profilDoc.id;


        /* ==============================================
           PHOTO
        ============================================== */

        if (photo) {

            if (data.photo) {

                photo.src =
                    data.photo.replace(
                        "=s96-c",
                        "=s512-c"
                    );

            }

            else {

                photo.src =
                    "";

            }

        }


        /* ==============================================
           PSEUDO
        ============================================== */

        if (pseudo) {

            pseudo.textContent =
                data.pseudo ||
                "Sans pseudo";

        }


        /* ==============================================
           DESCRIPTION COURTE
        ============================================== */

        if (descriptionCourte) {

            descriptionCourte.textContent =
                data.descriptionCourte ||
                "Aucune description";

        }


        /* ==============================================
           DESCRIPTION LONGUE
        ============================================== */

        if (descriptionLongue) {

            descriptionLongue.textContent =
                data.descriptionLongue ||
                "Aucune description.";

        }


        /* ==============================================
           CATEGORIES
        ============================================== */

        if (categories) {

            categories.innerHTML =
                "";


            const listeCategories =
                Array.isArray(
                    data.categories
                )
                    ? data.categories
                    : [];


            if (
                listeCategories.length === 0
            ) {

                categories.innerHTML = `

                    <span style="color:#aaa;">
                        Aucune catégorie
                    </span>

                `;

            }

            else {

                listeCategories.forEach(
                    (categorie) => {

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

        if (reseaux) {

            reseaux.innerHTML =
                "";


            const listeReseaux =
                Array.isArray(
                    data.reseaux
                )
                    ? data.reseaux
                    : [];


            if (
                listeReseaux.length === 0
            ) {

                reseaux.innerHTML = `

                    <div style="color:#aaa;">
                        Aucun réseau renseigné.
                    </div>

                `;

            }

            else {

                listeReseaux.forEach(
                    (reseau) => {

                        if (!reseau) {

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

        if (videoContainer) {

            videoContainer.innerHTML =
                "";


            const video =
                data.videoYoutube;


            if (
                video &&
                video.trim() !== ""
            ) {

                const url =
                    video.trim();


                let videoId =
                    "";


                if (
                    url.includes(
                        "youtube.com/watch?v="
                    )
                ) {

                    try {

                        const urlObjet =
                            new URL(url);


                        videoId =
                            urlObjet
                                .searchParams
                                .get("v") ||
                            "";

                    }

                    catch (error) {

                        console.error(
                            "URL YouTube invalide :",
                            error
                        );

                    }

                }


                else if (
                    url.includes(
                        "youtu.be/"
                    )
                ) {

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


                else if (
                    url.includes(
                        "youtube.com/embed/"
                    )
                ) {

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


                if (videoId) {

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

                else {

                    videoContainer.innerHTML = `

                        <p style="color:#aaa;">
                            Impossible de lire cette vidéo YouTube.
                        </p>

                    `;

                }

            }

            else {

                if (sectionVideo) {

                    sectionVideo.style.display =
                        "none";

                }

            }

        }


        console.log(
            "Profil chargé :",
            data.pseudo
        );


        /*
         * Une fois le profil chargé,
         * on actualise l'état du favori.
         */

        await chargerEtatFavori();

    }

    catch (error) {

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


        if (retour) {

            retour.addEventListener(
                "click",
                () => {

                    window.location.href =
                        "index.html";

                }
            );

        }

    }

}


/* =========================================================
   CHARGER LES LIKES
   CONNECTE OU DECONNECTE
========================================================= */

async function chargerLikesProfil() {

    if (
        !pseudoRecherche
    ) {

        return;

    }


    try {

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


        /* ==============================================
           COMPTEUR PUBLIC
        ============================================== */

        if (compteurLikesProfil) {

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
           SI PERSONNE N'EST CONNECTE
        ============================================== */

        if (!utilisateurActuel) {

            if (boutonLikeProfil) {

                boutonLikeProfil.classList.remove(
                    "liked"
                );


                boutonLikeProfil.textContent =
                    "♡ J'aime";

            }


            /*
             * MAIS LES LIKERS RESTENT PUBLICS.
             */

            await chargerLikersProfil();


            return;

        }


        /* ==============================================
           VERIFIER MON LIKE
        ============================================== */

        if (boutonLikeProfil) {

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


            if (
                monLikeSnap.exists()
            ) {

                boutonLikeProfil.classList.add(
                    "liked"
                );


                boutonLikeProfil.textContent =
                    "♥ J'aime";

            }

            else {

                boutonLikeProfil.classList.remove(
                    "liked"
                );


                boutonLikeProfil.textContent =
                    "♡ J'aime";

            }

        }


        /* ==============================================
           LIKERS
        ============================================== */

        await chargerLikersProfil();

    }

    catch (error) {

        console.error(
            "Erreur lors du chargement des likes du profil :",
            error
        );

    }

}


/* =========================================================
   CHARGER LES PERSONNES QUI ONT LIKE
   PUBLIC
========================================================= */

async function chargerLikersProfil() {

    if (
        !pseudoRecherche ||
        !listeLikers
    ) {

        return;

    }


    try {

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


        if (
            likesSnapshot.empty
        ) {

            return;

        }


        for (
            const likeDoc
            of likesSnapshot.docs
        ) {

            const uid =
                likeDoc.id;


            try {

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


                if (
                    !utilisateurSnap.exists()
                ) {

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
                    () => {

                        if (
                            data.pseudo
                        ) {

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

            catch (error) {

                console.error(
                    "Impossible de charger le liker :",
                    error
                );

            }

        }

    }

    catch (error) {

        console.error(
            "Erreur lors du chargement des likers :",
            error
        );

    }

}


/* =========================================================
   GERER LIKE / UNLIKE
========================================================= */

async function gererLikeProfil() {

    if (!utilisateurActuel) {

        alert(
            "Tu dois être connecté pour aimer un profil ❤️"
        );

        return;

    }


    if (
        !boutonLikeProfil ||
        !pseudoRecherche
    ) {

        return;

    }


    if (
        boutonLikeProfil.dataset.chargement ===
        "true"
    ) {

        return;

    }


    boutonLikeProfil.dataset.chargement =
        "true";


    try {

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


        /* ==============================================
           UNLIKE
        ============================================== */

        if (
            likeSnap.exists()
        ) {

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

        else {

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


            animerBoutonLikeProfil();


            lancerAnimationCoeursProfil();

        }


        await chargerLikesProfil();

    }

    catch (error) {

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

if (
    boutonLikeProfil
) {

    boutonLikeProfil.addEventListener(
        "click",
        (event) => {

            event.stopPropagation();

            gererLikeProfil();

        }
    );

}


/* =========================================================
   CHARGER L'ETAT DU FAVORI
========================================================= */

async function chargerEtatFavori() {

    if (
        !boutonFavoriProfil
    ) {

        return;

    }


    /*
     * Pas connecté :
     * le bouton favori est caché.
     */

    if (
        !utilisateurActuel
    ) {

        boutonFavoriProfil.style.display =
            "none";

        return;

    }


    /*
     * On ne peut pas ajouter son propre profil
     * en favori.
     */

    const profilActuel =
        pseudoRecherche;


    if (
        !profilActuel
    ) {

        return;

    }


    boutonFavoriProfil.style.display =
        "inline-flex";


    try {

        const favoriRef =
            doc(
                db,
                "users",
                utilisateurActuel.uid,
                "favoris",
                profilActuel
            );


        const favoriSnap =
            await getDoc(
                favoriRef
            );


        if (
            favoriSnap.exists()
        ) {

            boutonFavoriProfil.textContent =
                "⭐";


            boutonFavoriProfil.classList.add(
                "favoriActif"
            );


            boutonFavoriProfil.title =
                "Retirer des favoris";

        }

        else {

            boutonFavoriProfil.textContent =
                "☆";


            boutonFavoriProfil.classList.remove(
                "favoriActif"
            );


            boutonFavoriProfil.title =
                "Ajouter aux favoris";

        }

    }

    catch (error) {

        console.error(
            "Erreur lors de la vérification du favori :",
            error
        );

    }

}


/* =========================================================
   AJOUTER / RETIRER UN FAVORI
========================================================= */

async function gererFavoriProfil() {

    if (
        !utilisateurActuel
    ) {

        alert(
            "Tu dois être connecté pour ajouter un profil en favori ⭐"
        );

        return;

    }


    if (
        !pseudoRecherche ||
        !boutonFavoriProfil
    ) {

        return;

    }


    if (
        boutonFavoriProfil.dataset.chargement ===
        "true"
    ) {

        return;

    }


    boutonFavoriProfil.dataset.chargement =
        "true";


    try {

        const favoriRef =
            doc(
                db,
                "users",
                utilisateurActuel.uid,
                "favoris",
                pseudoRecherche
            );


        const favoriSnap =
            await getDoc(
                favoriRef
            );


        /* ==============================================
           RETIRER
        ============================================== */

        if (
            favoriSnap.exists()
        ) {

            await deleteDoc(
                favoriRef
            );


            boutonFavoriProfil.textContent =
                "☆";


            boutonFavoriProfil.classList.remove(
                "favoriActif"
            );


            boutonFavoriProfil.title =
                "Ajouter aux favoris";

        }


        /* ==============================================
           AJOUTER
        ============================================== */

        else {

            await setDoc(
                favoriRef,
                {

                    pseudo:
                        pseudoRecherche,

                    date:
                        new Date()

                }
            );


            boutonFavoriProfil.textContent =
                "⭐";


            boutonFavoriProfil.classList.add(
                "favoriActif"
            );


            boutonFavoriProfil.title =
                "Retirer des favoris";


            /*
             * Petite animation
             */

            boutonFavoriProfil.classList.add(
                "favoriClick"
            );


            setTimeout(
                () => {

                    boutonFavoriProfil.classList.remove(
                        "favoriClick"
                    );

                },
                300
            );

        }

    }

    catch (error) {

        console.error(
            "Erreur lors de la modification du favori :",
            error
        );


        alert(
            "Impossible de modifier le favori."
        );

    }


    boutonFavoriProfil.dataset.chargement =
        "false";

}


/* =========================================================
   BOUTON FAVORI
========================================================= */

if (
    boutonFavoriProfil
) {

    boutonFavoriProfil.addEventListener(
        "click",
        (event) => {

            event.stopPropagation();

            gererFavoriProfil();

        }
    );

}


/* =========================================================
   CHARGER MES FAVORIS
========================================================= */

async function chargerFavoris() {

    if (
        !sectionFavoris ||
        !listeFavoris
    ) {

        return;

    }


    /*
     * Les favoris sont privés.
     *
     * On ne les affiche que sur le profil
     * de la personne connectée.
     */

    if (
        !utilisateurActuel
    ) {

        sectionFavoris.style.display =
            "none";

        return;

    }


    try {

        /*
         * On récupère le profil actuellement affiché
         * pour savoir si c'est bien le profil du compte.
         */

        const profilSnapshot =
            await getDocs(
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
                )
            );


        if (
            profilSnapshot.empty
        ) {

            sectionFavoris.style.display =
                "none";

            return;

        }


        const profilDoc =
            profilSnapshot.docs[0];


        /*
         * Ce n'est PAS le profil de l'utilisateur connecté.
         * On ne montre donc pas ses favoris.
         */

        if (
            profilDoc.id !==
            utilisateurActuel.uid
        ) {

            sectionFavoris.style.display =
                "none";

            return;

        }


        /* ==============================================
           RECUPERATION FAVORIS
        ============================================== */

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


        /* ==============================================
           AUCUN FAVORI
        ============================================== */

        if (
            favorisSnapshot.empty
        ) {

            sectionFavoris.style.display =
                "block";


            listeFavoris.innerHTML = `

                <div style="
                    color:#aaa;
                    padding:10px 0;
                ">

                    Aucun profil dans tes favoris pour le moment ⭐

                </div>

            `;


            return;

        }


        /* ==============================================
           AFFICHER LA SECTION
        ============================================== */

        sectionFavoris.style.display =
            "block";


        /* ==============================================
           CHARGER CHAQUE FAVORI
        ============================================== */

        for (
            const favoriDoc
            of favorisSnapshot.docs
        ) {

            const pseudoFavori =
                favoriDoc.id;


            try {

                const profilRef =
                    query(
                        collection(
                            db,
                            "users"
                        ),
                        where(
                            "pseudo",
                            "==",
                            pseudoFavori
                        )
                    );


                const profilSnapshotFavori =
                    await getDocs(
                        profilRef
                    );


                if (
                    profilSnapshotFavori.empty
                ) {

                    continue;

                }


                const data =
                    profilSnapshotFavori
                        .docs[0]
                        .data();


                /* ======================================
                   CARTE FAVORI
                ====================================== */

                const carte =
                    document.createElement(
                        "div"
                    );


                carte.className =
                    "carteFavori";


                carte.style.cursor =
                    "pointer";


                /* ======================================
                   PHOTO
                ====================================== */

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


                /* ======================================
                   INFORMATIONS
                ====================================== */

                const informations =
                    document.createElement(
                        "div"
                    );


                informations.className =
                    "infosFavori";


                const nom =
                    document.createElement(
                        "div"
                    );


                nom.className =
                    "nomFavori";


                nom.textContent =
                    data.pseudo ||
                    pseudoFavori;


                const description =
                    document.createElement(
                        "div"
                    );


                description.className =
                    "descriptionFavori";


                description.textContent =
                    data.descriptionCourte ||
                    "Aucune description";


                informations.appendChild(
                    nom
                );


                informations.appendChild(
                    description
                );


                carte.appendChild(
                    image
                );


                carte.appendChild(
                    informations
                );


                /* ======================================
                   CLIQUER SUR LE PROFIL
                ====================================== */

                carte.addEventListener(
                    "click",
                    () => {

                        window.location.href =
                            "profil.html?pseudo=" +
                            encodeURIComponent(
                                data.pseudo ||
                                pseudoFavori
                            );

                    }
                );


                listeFavoris.appendChild(
                    carte
                );

            }

            catch (error) {

                console.error(
                    "Erreur lors du chargement du favori :",
                    error
                );

            }

        }

    }

    catch (error) {

        console.error(
            "Erreur lors du chargement des favoris :",
            error
        );


        sectionFavoris.style.display =
            "none";

    }

}


/* =========================================================
   ANIMATION DES COEURS
========================================================= */

function lancerAnimationCoeursProfil() {

    document.body.classList.remove(
        "animationAmour"
    );


    void document.body.offsetWidth;


    document.body.classList.add(
        "animationAmour"
    );


    const nombreCoeurs =
        35;


    for (
        let i = 0;
        i < nombreCoeurs;
        i++
    ) {

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
            () => {

                coeur.remove();

            },
            2200
        );

    }


    setTimeout(
        () => {

            document.body.classList.remove(
                "animationAmour"
            );

        },
        1200
    );

}


/* =========================================================
   ANIMATION BOUTON LIKE
========================================================= */

function animerBoutonLikeProfil() {

    if (
        !boutonLikeProfil
    ) {

        return;

    }


    boutonLikeProfil.classList.add(
        "likeClick"
    );


    setTimeout(
        () => {

            boutonLikeProfil.classList.remove(
                "likeClick"
            );

        },
        300
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


if (logoAccueil) {

    logoAccueil.addEventListener(
        "click",
        () => {

            window.location.href =
                "index.html";

        }
    );

}


if (retourAccueil) {

    retourAccueil.addEventListener(
        "click",
        () => {

            window.location.href =
                "index.html";

        }
    );

}


/* =========================================================
   LANCEMENT
========================================================= */

/*
 * Le profil doit être chargé immédiatement,
 * même lorsqu'on est déconnecté.
 *
 * C'est important pour que les likes publics
 * puissent être affichés sans connexion.
 */

chargerProfil();