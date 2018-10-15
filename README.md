# Hackinout 2018

The Freedom of Press Foundation is an initiative that aims to protect and defend adversarial journalism in the 21st century. Supporting their initiative and keeping in the mind the
secrecy of whistleblowers we present our hack - "Zeta".

Build on decentralized technologies including blockchain and IPFS it aims to maintain the anonymity of the person who is intending to leak crucial information.

# Core

The majority of the application is based on Ethereum blockchain and Inter Planetary File System(IPFS). A smart contract is initially deployed. The smart contract contains the information about all the files that have been leaked or distributed in the system. Storing files over the blockchain is very expensive.

According to Ethereum’s yellow paper, it is approximately 20,0000 gas for 256bit/8 bytes (1word). Based on 10/13/2018 gas prices of 3.2 gwei/gas.
20,000 gas per Transaction of 8 bytes x 3.2 gwei/gas = 64,000 gwei for 8 bytes.
64,000 gwei for 8 bytes. x 1000bytes/8 = 8,000,000 gwei/kB = 0.008 Ether
0.008 Ether/kB x 1000kB = 8 Ether to store a 1Mb

1568.72 $ for storing a 1Mb file on the blockchain, which is way too much expensive. In order to reduce this cost, IPFS has been used. The smart contract will only contain the link of the file that has been stored. The actually files be divided, encrypted and distributed among all the nodes present in the IPFS network.

![Homepage](/res/image.png)

# Features

### Anonymity of Users

All the files are shared by using the user's public key and nowhere else is the identity leaked. Hence our app protects the anonymity of all the doc transactions.

### Public and Private Sharing

The users can choose between the two types of sharing namely - Public and Private. The files that are publicly shared are available to all the users that are present over the blockchain network. The IPFS URL of these files are stored and accessible from the smart contract.

A user may leak a confidential document to a selective person over the internet using public-key infrastructure. In this case, the URL of the file that is stored in the smart contract is first encrypted using the receivers public key. Later, this is decrypted using the private key of the intended user and files becomes available.

![PublicPrivate share](/res/image2.png)

### Spam-Score

A voting mechanism has been implemented to maintain a dynamic spam score that the receivers of the information can use to judge its authenticity. Currently, the users will have pay a small gas amount for voting, which will act as a deterrent of false votes. Later, this voting mechanism can be incentivized through a lottery system, much on the lines of [SpamSlam](https://github.com/CodeMaxx/SpamSlam)

![Spam score](/res/image1.png)

### An E2E encrypted chat based on Signal

While privately sharing information, there is provision for the receiver of the information to chat with the whistleblower. The chat is P2P and has been implemented on Signal Protocol which is popularly known for privacy first architecture.

![Chat app](/res/image3.png)

## Using the App

```bash
# Clone the repository
$ git clone https://github.com/ankitkataria/zeta

# Move to desktop-app/ directory
$ cd desktop-app

# Install the needed dependencies
$ yarn install

# Run the desktop application in development mode
$ yarn start
```
