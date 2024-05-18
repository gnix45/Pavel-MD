const{
    DisconnectReason,
    useMultiFileAuthState
} = require("@whiskeysockets/baileys");
const useMongoDBAuthState = require("./mongoAuthState")
//const {DisconnectReason} = require("@whiskeysockets/baileys");
const makeWASocket = require("@whiskeysockets/baileys").default;
const { MongoClient } = require("mongodb");
const mongoURL = "mongodb+srv://pavel:212234@cluster0.4iedbad.mongodb.net/";
async function conectionLogic() {
    //const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys')
    const mongoClient = new MongoClient(mongoURL, {
        useNewURLParser: true,
        useUnifiedTopology: true
    });
    await mongoClient.connect();
    const collection = mongoClient.db("whatsapp_api").collection('auth_info_baileys');
    const { state, saveCreds } = await useMongoDBAuthState(collection)
    const sock = makeWASocket({
        // can provide additional config here
        printQRInTerminal: true,
        auth: state,
    })
    sock.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect,qr } = update || {};

        if (qr) {
            console.log(qr);
            // write custom logic over here
        }      
        if (connection === "close") {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
        
            if (shouldReconnect) {
            conectionLogic();
            }
        }
        
    });
        sock.ev.on('messages.update', (messageInfo) =>{
            console.log(messageInfo);
        })

        sock.ev.on("messages.upsert",(messageInfoUpsert)=>{
            console.log(messageInfoUpsert)
        })
    sock.ev.on ('creds.update', saveCreds)
}

conectionLogic();

