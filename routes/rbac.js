const express = require('express');
const BigchainDB = require('bigchaindb-driver');
const bip39 = require('bip39');
const Orm = require('bigchaindb-orm').default;

const router = express.Router();

const API_PATH = 'http://localhost:9984/api/v1/'
const conn = new BigchainDB.Connection(API_PATH)

// const seed = bip39.mnemonicToSeed('seedPhrase').slice(0,32)
// const newUserKeypair = new BigchainDB.Ed25519Keypair(seed)


// router.post('/transferassetbcdb', transferUserAssetBigchain);

module.exports = router;
