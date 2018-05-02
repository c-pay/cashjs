/* global describe, it */

var assert = require('assert')
var bigi = require('bigi')
var bitcoin = require('../../')
var blockchain = require('./_blockchain')

describe('bitcoinjs-lib (basic)', function () {
    it('can generate a random LCC address', function () {
    // for testing only
        var litecoincash = {
            messagePrefix: '\x19Litecoin Signed Message:\n',
            bip32: {
                public: 0x019da462,
                private: 0x019d9cfe
            },
            pubKeyHash: 28,
            scriptHash: 5,
            wif: 176
        };

        var keyPair = bitcoin.ECPair.makeRandom({network:litecoincash});
        var address = keyPair.getAddress();
        var publicKeyHash = bitcoin.crypto.hash160(keyPair.getPublicKeyBuffer());
        document.writeln("<strong>pubKeyHash: " + publicKeyHash.toString('hex') + "</strong><br>");
        document.writeln("privKey: " + keyPair.toWIF() + "<br>");
        document.writeln("address: " + address + "<br>");
  });

  it('can create a Transaction for LiteCoin Cash', function () {
      var litecoincash = {
          messagePrefix: '\x19Litecoin Signed Message:\n',
          bip32: {
              public: 0x019da462,
              private: 0x019d9cfe
          },
          pubKeyHash: 28,
          scriptHash: 5,
          wif: 176
      };

      var key = bitcoin.ECPair.fromWIF("--------------------------------------------------", litecoincash);
      var tx = new bitcoin.TransactionBuilder(litecoincash);
      tx.addInput("4ab4b9fc1c8e94b7fb89d61e72dd832e5a84fde21c479958cae3d8324b3d185d", 1);
      tx.addOutput("CJKGNER7XauqVU4bwWqumkQWoyBGkiUjtL", 2500000);
      tx.addOutput("CH4jrxu1uePWBEgbeULCgzUTVucHEpjHxH", 4800000);
      var hashType = bitcoin.Transaction.SIGHASH_ALL | bitcoin.Transaction.SIGHASH_BITCOINCASHBIP143;
      tx.sign(0, key, null, hashType, 0);
      var result = tx.build();
      console.log(result.toHex());
      console.log(result.getId());
    assert.strictEqual(tx.build().toHex(), '01000000015d183d4b32d8e3ca5899471ce2fd845a2e83dd721ed689fbb7948e1cfcb9b44a010000006b483045022100e501664e49046faf8a90291dd6538cea5989e978c7be5254fc58f7f7fc53f9f802200f1b9bcdf14c07e208d0f8285ac1e5b0de879e7cb25b1beb3b55b18d165ac639412103c64f35291959d75ff3a769d3c7f6711e1864c6a78395a587bf56c2ad3c531aa3ffffffff02a0252600000000001976a914144eb3df3ad74726bd81edec533c4e91c1c78d1d88ac003e4900000000001976a91406974a1699f6a4bd2129545c5bf71bc78809b21088ac00000000')
  });
})
