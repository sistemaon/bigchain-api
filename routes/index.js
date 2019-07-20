const express = require('express');
const driver = require('bigchaindb-driver');
const bip39 = require('bip39');

const router = express.Router();

const API_PATH = 'http://localhost:9984/api/v1/'

const conn = new driver.Connection(API_PATH)

const userKeypair = new driver.Ed25519Keypair();
// const userKeypair = new driver.Ed25519Keypair(bip39.mnemonicToSeed("yourString"))

const assetdata = {
        'bicycle': {
                'serial_number': 12398,
                'manufacturer': 'Bicycle Inc.',
        }
}
const metadata = {'planet': 'earth'}

const assetCreation = ( req, res, next ) => {

  const txCreateUserSimple = driver.Transaction.makeCreateTransaction(
          assetdata,
          metadata,

          // A transaction needs an output
          [ driver.Transaction.makeOutput(
                  driver.Transaction.makeEd25519Condition(userKeypair.publicKey))
          ],
          userKeypair.publicKey
  )
  console.log(' txCreateUserSimple ::; ', txCreateUserSimple);

  const txCreateUserSimpleSigned = driver.Transaction.signTransaction(txCreateUserSimple, userKeypair.privateKey)
  console.log(' txCreateUserSimpleSigned ::; ', txCreateUserSimpleSigned);

  const connPostTransaction = conn.postTransactionCommit(txCreateUserSimpleSigned)
  console.log(' connPostTransaction ::; ', connPostTransaction);

  const usertxid = txCreateUserSimpleSigned.id
  console.log(' usertxid ::; ', usertxid);

  res.status(201).json({ txid: usertxid });

}

const getAssets = ( req, res, next ) => {
  const connGetAssets = conn.searchAssets('Bicycle Inc.')
        .then(assets => {
          // console.log('Found assets with serial number Bicycle Inc.:', assets)
          return res.status(200).json({ assets: assets})
        })
}

const seedkp = ( req, res, next ) => {
  // const newkp = userKeypair(bip39.mnemonicToSeed("yourString").slice(0, 32))
  const newkp = new driver.Ed25519Keypair(bip39.mnemonicToSeed("passwordSecretSAmc986").slice(0, 32))
  console.log(' newkp ::; ', newkp)

}

router.post('/createAssetion', assetCreation);
router.post('/getAssetion', getAssets);
router.post('/ernk', seedkp);

module.exports = router;
