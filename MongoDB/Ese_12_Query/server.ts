import { MongoClient, ObjectId } from 'mongodb';

const connectionString = 'mongodb://localhost:27017';
const dbname = 'entities';

//ExecuteQuery(1);
// ExecuteQuery(2);
// ExecuteQuery(3);
// ExecuteQuery(4);
// ExecuteQuery(5);
// ExecuteQuery(6);
// ExecuteQuery(7);
// ExecuteQuery(8);
// ExecuteQuery(9);
// ExecuteQuery(10);
ExecuteQuery(11);

async function ExecuteQuery(query: number) {
    const client = new MongoClient(connectionString);

    await client.connect().catch(err => {
        console.log("Errore connessione db", err);
    });

    const collection = client.db(dbname).collection('unicorns');

    let cmd;

    switch (query) {
        case 1:
            cmd = collection.find({"weight": {$gte: 700, $lte: 800}}).toArray();

            break;
        case 2:
            //and in forma breve
            //cmd = collection.find({"gender": "m", "loves": "grape", "vampires": {$gt: 60}}).toArray();
            //and in forma estesa (obbligatoria nel caso della OR)
            cmd = collection.find({$and: [{gender: "m"}, {loves: "grape"}, {vampires: {$gt: 60}}]}).toArray();
            break;
        case 3:
            cmd = collection.find({$or: [{gender: "f"}, {weight: {$lte: 500}}]}).toArray();
            break;
        case 4:
            // cmd = collection.find({
            //     $and: [
            //         {
            //             $or: [
            //                 {loves: "apple"}, 
            //                 {loves: "grape"}
            //             ]
            //     }, 
            //         {
            //             vampires: {$gt: 60}
            //         }
            //     ]
            // }).toArray();

            cmd = collection.find({
               loves: {$in: ["apple", "grape"]},
               vampires: {$gt: 60}
            }).toArray();
            break;
        case 5:
            cmd = collection.find({
                loves: {$all: ["grape", "watermelon"]},
                vampires: {$gt: 60}
            }).toArray();
            break;
        case 6:
            cmd = collection.find({
                hair: {$in: ["brown", "grey"]},
            }).toArray();
            break;
        case 7:
            cmd = collection.find({
                $or: [
                    {vaccinated: false},
                    {vaccinated: {$exists: false}}
                ]
            }).toArray();
            break;
        case 8:
            cmd = collection.find({
                gender: "m",
                loves: {$nin: ["apple"]}
            }).toArray();
            break;
        case 9:
            const regex = new RegExp("^a", "i");
            //equivalente a
            //const regex = new RegExp("^[Aa]");
            cmd = collection.find({
                gender: "f",
                name: regex
            }).toArray();
            break;
        case 10:
            let objectId = new ObjectId("68fa12cd3aa9e4882a36dce7");
            cmd = collection.find({
                _id: objectId
            }).toArray();
            break;
        case 11:
            cmd = collection.find({
                gender: "f",
                vampires: {$exists: true}
            }).project({
                _id: 0, 
                name: 1, 
                vampires: 1 
            }).sort({
                vampires: -1,
                name: 1
            }).limit(3).skip(1).toArray();
            break;
    }

    cmd?.then(data => {
        console.log(data);
        console.log("Totale elementi trovati: " + data.length);
    })
    cmd?.catch(err => {
        console.log("Errore esecuzione query", err);
    });
    cmd?.finally(() => {
        client.close();
    });

}
