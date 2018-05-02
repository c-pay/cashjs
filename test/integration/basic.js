/* global describe, it */

var assert = require('assert')
var bigi = require('bigi')
var bitcoin = require('../../')
var blockchain = require('./_blockchain')

describe('bitcoinjs-lib (basic)', function () {
  it('can generate a random bitcoin address', function () {
    // for testing only
    function rng () { return Buffer.from('zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz') }

    // generate random keyPair
    var keyPair = bitcoin.ECPair.makeRandom({ rng: rng })
    var address = keyPair.getAddress()

    assert.strictEqual(address, '1F5VhMHukdnUES9kfXqzPzMeF1GPHKiF64')
  });

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

  it('can generate an address from a SHA256 hash', function () {
    var hash = bitcoin.crypto.sha256('correct horse battery staple')
    var d = bigi.fromBuffer(hash)

    var keyPair = new bitcoin.ECPair(d)
    var address = keyPair.getAddress()

    assert.strictEqual(address, '1C7zdTfnkzmr13HfA2vNm5SJYRK6nEKyq8')
  })

  it('can generate a random keypair for alternative networks', function () {
    // for testing only
    function rng () { return Buffer.from('zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz') }

    var litecoin = bitcoin.networks.litecoin

    var keyPair = bitcoin.ECPair.makeRandom({ network: litecoin, rng: rng })
    var wif = keyPair.toWIF()
    var address = keyPair.getAddress()

    assert.strictEqual(address, 'LZJSxZbjqJ2XVEquqfqHg1RQTDdfST5PTn')
    assert.strictEqual(wif, 'T7A4PUSgTDHecBxW1ZiYFrDNRih2o7M8Gf9xpoCgudPF9gDiNvuS')
  })

  it('can import an address via WIF', function () {
    var keyPair = bitcoin.ECPair.fromWIF('Kxr9tQED9H44gCmp6HAdmemAzU3n84H3dGkuWTKvE23JgHMW8gct')
    var address = keyPair.getAddress()

    assert.strictEqual(address, '19AAjaTUbRjQCMuVczepkoPswiZRhjtg31')
  })

  it('can create a Transaction', function () {
    var keyPair = bitcoin.ECPair.fromWIF('L1uyy5qTuGrVXrmrsvHWHgVzW9kKdrp27wBC7Vs6nZDTF2BRUVwy')
    var tx = new bitcoin.TransactionBuilder()

    tx.addInput('aa94ab02c182214f090e99a0d57021caffd0f195a81c24602b1028b130b63e31', 0)
    tx.addOutput('1Gokm82v6DmtwKEB8AiVhm82hyFSsEvBDK', 15000)
    tx.sign(0, keyPair)

    assert.strictEqual(tx.build().toHex(), '0100000001313eb630b128102b60241ca895f1d0ffca2170d5a0990e094f2182c102ab94aa000000006b483045022100aefbcf847900b01dd3e3debe054d3b6d03d715d50aea8525f5ea3396f168a1fb022013d181d05b15b90111808b22ef4f9ebe701caf2ab48db269691fdf4e9048f4f60121029f50f51d63b345039a290c94bffd3180c99ed659ff6ea6b1242bca47eb93b59fffffffff01983a0000000000001976a914ad618cf4333b3b248f9744e8e81db2964d0ae39788ac00000000')
  })

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

  it('can create a [complex] Transaction', function (done) {
    this.timeout(30000)

    var testnet = bitcoin.networks.testnet
    var alice = bitcoin.ECPair.makeRandom({ network: testnet })
    var bob = bitcoin.ECPair.makeRandom({ network: testnet })
    var alicesAddress = alice.getAddress()
    var bobsAddress = bob.getAddress()

    blockchain.t.faucetMany([
      {
        address: alicesAddress,
        value: 4e4
      },
      {
        address: bobsAddress,
        value: 2e4
      }
    ], function (err, unspents) {
      if (err) return done(err)

      var tx = new bitcoin.TransactionBuilder(testnet)
      tx.addInput(unspents[0].txId, unspents[0].vout)
      tx.addInput(unspents[1].txId, unspents[1].vout)
      tx.addOutput(blockchain.t.RETURN, 3e4)
      tx.addOutput('mvGVHWi6gbkBZZPaqBVRcxvKVPYd9r3fp7', 1e4)
      tx.sign(0, alice)
      tx.sign(1, bob)

      blockchain.t.transactions.propagate(tx.build().toHex(), done)
    })
  })
})
