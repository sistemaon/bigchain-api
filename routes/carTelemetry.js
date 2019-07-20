const express = require('express');
const BigchainDB = require('bigchaindb-driver');
const bip39 = require('bip39');
const Orm = require('bigchaindb-orm').default;

const router = express.Router();

const API_PATH = 'http://localhost:9984/api/v1/'
const conn = new BigchainDB.Connection(API_PATH)

// const userKeypair = new BigchainDB.Ed25519Keypair();
// const userKeypair = new BigchainDB.Ed25519Keypair(bip39.mnemonicToSeed("yourString"))
class DID extends Orm {
    constructor(entity) {
        super(API_PATH)
        this.entity = entity
    }
}
// console.log(DID);
// const DID = new Orm(API_PATH)

// password
const seedPhrase = 'seedPhrase'
// user password seed
const seed = bip39.mnemonicToSeed(seedPhrase).slice(0,32)
// user seed keypair
const alice = new BigchainDB.Ed25519Keypair(seed)
// console.log(seedPhrase);

// console.log(seed);

// console.log(alice);

// product keypair
const car = new BigchainDB.Ed25519Keypair()
// product consume keypair
const sensorGPS = new BigchainDB.Ed25519Keypair()
// console.log(car);

// console.log(sensorGPS);

// user DID
const userDID = new DID(alice.publicKey)
// product DID
const carDID = new DID(car.publicKey)
// product consume DID
const gpsDID = new DID(sensorGPS.publicKey)
// console.log(userDID);

// console.log(carDID);

// console.log(gpsDID);

// user model, additional_information
userDID.define("myModel", "https://schema.org/v1/myModel")
// product model, additional_information
carDID.define("myModel", "https://schema.org/v1/myModel")
// product consume model, additional_information
gpsDID.define("myModel", "https://schema.org/v1/myModel")
// console.log(userDID);

// console.log(carDID);

// console.log(gpsDID);


const createDigitalRegistration = ( req, res, next ) => {

  userDID.models.myModel.create({
          keypair: alice,
          data: {
              name: 'Alice',
              bithday: '03/08/2000'
          }
      }).then(asset => {
          userDID.id = 'did:' + asset.id
          document.body.innerHTML +='<h3>Transaction created</h3>'
          document.body.innerHTML +=asset.id
      })
  console.log('userDID ::; ', userDID);

  const vehicle = {
    value: '6sd8f68sd67',
    power: {
      engine: '2.5',
      hp: '220 hp',
    },
    consumption: '10.8 l'
  }

  carDID.models.myModel.create({
          keypair: alice,
          data: {
              vehicle
          }
      }).then(asset => {
        console.log('carDID.asset.id ::; ', asset.id);
          carDID.id = 'did:' + asset.id
          console.log('carDID.id ::; ', carDID.id);
          document.body.innerHTML +='<h3>Transaction created</h3>'
          document.body.innerHTML +=txTelemetrySigned.id
      })
  console.log('carDID ::; ', carDID);

  gpsDID.models.myModel.create({
          keypair: car,
          data: {
              gps_identifier: 'a32bc2440da012'
          }
      }).then(asset => {
          gpsDID.id =  'did:' + asset.id
          document.body.innerHTML +='<h3>Transaction created</h3>'
          document.body.innerHTML +=txTelemetrySigned.id
      })
  console.log('gpsDID ::; ', gpsDID);

  res.status(201).json({ userDID: userDID,
                         carDID: carDID,
                         gpsDID: gpsDID
                      })

}

const updateMileage = (did = carDID, newMileage = 36927) => {
    did.models.myModel
    .retrieve(did.id)
    .then(assets => {
        // assets is an array of myModel
        // the retrieve asset contains the last (unspent) state
        // of the asset
        console.log('assets[0] ::; ', assets[0]);
        const assetsToReturn = assets[0].append({
            toPublicKey: car.publicKey,
            keypair: car,
            data: { newMileage }
        })
        console.log('assetsToReturn ::; ', assetsToReturn);
        return assetsToReturn
    })
    .then(updatedAsset => {
      console.log('updatedAsset ::; ', updatedAsset);
        did.mileage =  updatedAsset.data.newMileage
        document.body.innerHTML +='<h3>Append transaction created</h3>'
        document.body.innerHTML +=txTelemetrySigned.id
        return updatedAsset
    })
}

const updateDigitaRegistration = ( req, res, next ) => {
  updateMileage()
}


router.post('/createdr', createDigitalRegistration);
router.post('/updatedr', updateDigitaRegistration);


module.exports = router;
