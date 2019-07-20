const express = require('express');
const BigchainDB = require('bigchaindb-driver');
const bip39 = require('bip39');
const Orm = require('bigchaindb-orm').default;

const router = express.Router();

const API_PATH = 'http://localhost:9984/api/v1/'
const conn = new BigchainDB.Connection(API_PATH)

// const seed = bip39.mnemonicToSeed('seedPhrase').slice(0,32)
// const newUserKeypair = new BigchainDB.Ed25519Keypair(seed)
const painting = {
    name: 'Meninas',
    author: 'Diego Rodríguez de Silva y Velázquez',
    place: 'Madrid',
    year: '1656'
}
const createPaint = ( user ) => {
    console.log(' user ::; ', user);
    // Construct a transaction payload
    const txCreatePaint = BigchainDB.Transaction.makeCreateTransaction(
        // Asset field
        {
            painting,
        },
        // Metadata field, contains information about the transaction itself
        // (can be `null` if not needed)
        {
            datetime: new Date().toString(),
            location: 'Madrid',
            value: {
                value_eur: '25000000€',
                value_btc: '2200',
            }
        },
        // Output. For this case we create a simple Ed25519 condition
        [BigchainDB.Transaction.makeOutput(
            BigchainDB.Transaction.makeEd25519Condition(user.publicKey))],
        // Issuers
        user.publicKey
    )
    console.log('txCreatePaint ::; ', txCreatePaint);
    // The owner of the painting signs the transaction
    const txSigned = BigchainDB.Transaction.signTransaction(txCreatePaint,
        user.privateKey)
    console.log('txSigned ::; ', txSigned);

    // Send the transaction off to BigchainDB
    conn.postTransactionCommit(txSigned)
        .then(res => {
            console.log('txSigned ::; ', txSigned);
            console.log('res ::; ', res);
            document.body.innerHTML += '<h3>Transaction created</h3>';
            document.body.innerHTML += txSigned.id
            // txSigned.id corresponds to the asset id of the painting
        })
}

const createUserBigchain = ( req, res ) => {

  // password
  const seedPhrase = 'seedPhrase'
  console.log('seedPhrase ::; ', seedPhrase);

  // user password seed
  const seed = bip39.mnemonicToSeed(seedPhrase).slice(0,32)
  console.log('seed ::; ', seed);

  // user seed keypair
  const newUserKeypair = new BigchainDB.Ed25519Keypair(seed)
  console.log('newUserKeypair ::; ', newUserKeypair);


  createPaint( newUserKeypair )

  res.status(201).json({  seedPhrase: seedPhrase,
                          seed: seed,
                          newUserKeypair: newUserKeypair
                       })
}

const transferOwnership = (txCreatedID, newOwner, lastOwner) => {
    // Get transaction payload by ID
    conn.getTransaction(txCreatedID)
        .then((txCreated) => {
            console.log('txCreated ::; ', txCreated);
            const createTranfer = BigchainDB.Transaction.
            makeTransferTransaction(
                // The output index 0 is the one that is being spent
                [{
                    tx: txCreated,
                    output_index: 0
                }],
                [BigchainDB.Transaction.makeOutput(
                    BigchainDB.Transaction.makeEd25519Condition(
                        newOwner.publicKey))],
                {
                    datetime: new Date().toString(),
                    value: {
                        value_eur: '30000000€',
                        value_btc: '2100',
                    }
                }
            )
            console.log('createTranfer ::; ', createTranfer);

            // Sign with the key of the owner of the painting (Alice)
            const signedTransfer = BigchainDB.Transaction
                .signTransaction(createTranfer, lastOwner.privateKey)
                console.log('signedTransfer ::; ', signedTransfer);
            return conn.postTransactionCommit(signedTransfer)
        })
        .then(res => {
            console.log('res ::; ', res);
            document.body.innerHTML += '<h3>Transfer Transaction created</h3>'
            document.body.innerHTML += res.id
        })
}

const transferUserAssetBigchain = ( req, res ) => {

  // password
  const seedPhrase = 'seedPhrase'
  console.log('seedPhrase ::; ', seedPhrase);

  // user password seed
  const seed = bip39.mnemonicToSeed(seedPhrase).slice(0,32)
  console.log('seed ::; ', seed);

  // user seed keypair
  const newUserKeypair = new BigchainDB.Ed25519Keypair(seed)
  console.log('newUserKeypair ::; ', newUserKeypair);

  const txCreatedID = '5f837e15850dc38314086fbb4cadc0c9e00983995160ad968789d17773e7ec1b'
  const lastOwner = {
      publicKey: "GEkKQDKFf5qzi7WwY2VzwBd3VyLhCu1aSaWjSAU7dCpo",
      privateKey: "7jWaeDMRTdTx6YZkpiRHEBhgoHWURrAAn31n5cuepVRL"
  }
  transferOwnership( txCreatedID, newUserKeypair, lastOwner )

  res.status(201).json({  seedPhrase: seedPhrase,
                          seed: seed,
                          newUserKeypair: newUserKeypair
                       })

}


router.post('/createuserbcdb', createUserBigchain);
router.post('/transferassetbcdb', transferUserAssetBigchain);

module.exports = router;
