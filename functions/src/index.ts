import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as express from 'express';
import * as cors from 'cors';
// Configuración de base de datos
const serviceAccount = require("./serviceAccountKey.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://firestore-grafica-6bf44.firebaseio.com"
})
// Referencia a la base de datos, cuando necesite trabajar con la base de datos utilizare esté db
const db = admin.firestore();

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
export const helloWorld = functions.https.onRequest((request, response) => {
 response.json({
     mensaje: "Hola mundo desde funciones de firebase !!!"
    });
});

// async permite utilizar uun await
export const getGOTY = functions.https.onRequest(async (request, response) => {
  
    // const nombre = request.query.nombre || 'Sin nombre';
    // response.json({
    //     nombre
    // })

    // Referencia a mi Goty Year
    const gotyRef = db.collection('goty');
    // Hagho un snaoshoot
    const docsSnap = await gotyRef.get();// get regresa un promise por lo cual se transforma en in proceso asincrono || no es instantanio

    const juegos = docsSnap.docs.map(doc => doc.data());
    // Referencia a como se encuentra la bd en ese momento || no es recomendado
    // response.json( (await docsSnap).docs[0].data() );
    response.json(juegos);
});


// subrilo a producción seria subirlo al panel


// EXpress para crearnos un get y un post
const app = express();

//Cors: para que mi aplicación acepte peticiones de otros dominios
app.use(cors({ origin: true }));

// Petición GET
app.get('/goty',async(req,res)=>{
     const gotyRef = db.collection("goty");
     // Hagho un snaoshoot
     const docsSnap = gotyRef.get(); // get regresa un promise por lo cual se transforma en in proceso asincrono || no es instantanio

     const juegos = (await docsSnap).docs.map(doc => doc.data());
    res.json(juegos);
});
// Petición POST

app.post('/goty/:id',async(req,res)=>{
    const id = req.params.id;
    const gameRef = db.collection('goty').doc(id);
    const gameSnap = await gameRef.get();

    if(!gameSnap.exists){
        res.status(404).json({
            ok:false,
            mensaje:'No existe un juego con ese id'
        });
    }else{
        // res.json('Juego existe');
        const antes = gameSnap.data() || { votos: 0}; // validación de seguridad
        await gameRef.update({
            votos: antes.votos + 1
        });
        res.json({
            ok:true,
            mensaje:`Gracias por tu voto a ${ antes.name }`
        });
    }
    });

export const api = functions.https.onRequest(app);