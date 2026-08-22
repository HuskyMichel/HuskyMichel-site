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

const provider = new GoogleAuthProvider();

provider.setCustomParameters({
    prompt: "select_account"
});

/* ===========================
   MENU
=========================== */

avatar.addEventListener("click", (e)=>{

    e.stopPropagation();

    menu.style.display =
        menu.style.display==="block"
        ? "none"
        : "block";

});

document.addEventListener("click",(e)=>{

    if(!profile.contains(e.target)){

        menu.style.display="none";

    }

});

/* ===========================
   CONNEXION
=========================== */

loginBtn.addEventListener("click", async ()=>{

    try{

        await signInWithPopup(auth, provider);

    }catch(error){

        console.error(error);

    }

});

/* ===========================
   DECONNEXION
=========================== */

logout.addEventListener("click", async ()=>{

    try{

        await signOut(auth);

    }catch(error){

        console.error(error);

    }

});

/* ===========================
   ETAT DE LA CONNEXION
=========================== */

onAuthStateChanged(auth, async(user)=>{

    if(user){

        avatar.src = user.photoURL.replace("=s96-c","=s512-c");

        loginBtn.style.display = "none";

        profile.style.display = "block";

        const profilRef = doc(db,"users",user.uid);

        const profilSnap = await getDoc(profilRef);

        if(!profilSnap.exists()){

            window.location.href = "creation-profil.html";
            return;

        }

        chargerProfils();

    }

    else{

        loginBtn.style.display = "block";

        profile.style.display = "none";

        chargerProfils();

    }

});

/* ===========================
   CHARGER LES PROFILS
=========================== */

async function chargerProfils(){

    listeProfils.innerHTML = "";

    try{

        const snapshot =
            await getDocs(collection(db,"users"));

        snapshot.forEach((profilDoc)=>{

            const data = profilDoc.data();

            const carte =
                document.createElement("div");

            carte.className = "carteProfil";

            carte.innerHTML = `

                <img
                    class="cartePhoto"
                    src="${data.photo || ""}"
                    alt="Photo de ${data.pseudo || "profil"}"
                >

                <div class="carteContenu">

                    <div class="cartePseudo">
                        👤 ${data.pseudo || "Sans pseudo"}
                    </div>

                    <div class="carteDescription">
                        ${data.descriptionCourte || "Aucune description"}
                    </div>

                    <div class="carteLikes">
                        ❤️ 0 likes
                    </div>

                </div>

            `;

            listeProfils.appendChild(carte);

        });

    }catch(error){

        console.error(
            "Erreur lors du chargement des profils :",
            error
        );

        listeProfils.innerHTML =
            "<p>Impossible de charger les profils.</p>";

    }

}