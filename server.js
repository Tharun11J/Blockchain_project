const express = require('express');
const app = express();
const mysql = require('mysql');
const session = require('express-session');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const Web3 = require('web3');
const BigNumber = require('bignumber.js');
const fs = require('fs');
var rand = require("random-key");
app.set('view engine', 'ejs');
///// Secret ID for session
const secret_id = process.env.secret;



///// IP and port
const IP = 'localhost';
const port = process.env.PORT || 8080;
const seckey="tracetex";


///////////////////encryption and decryption////////////////////////////

const encrypt = (plainText, password) => {
	try {
	  const iv = crypto.randomBytes(16);
	  const key = crypto.createHash('md5').update(password).digest('hex').substr(0,32); // Use 'hex' instead of 'base64'
	  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  
	  let encrypted = cipher.update(plainText, 'utf-8', 'hex');
	  encrypted += cipher.final('hex');
	  return iv.toString('hex') + ':' + encrypted;
  
	} catch (error) {
	  console.log(error);
	}
  }
  
  const decrypt = (encryptedText, password) => {
	try {
	  const textParts = encryptedText.split(':');
	  const iv = Buffer.from(textParts.shift(), 'hex');
	
	  const encryptedData = Buffer.from(textParts.join(':'), 'hex');
	  const key = crypto.createHash('md5').update(password).digest('hex').substr(0,32); // Use 'hex' instead of 'base64'
	  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
	  
	  let decrypted = decipher.update(encryptedData, 'hex', 'utf-8');
	  decrypted += decipher.final('utf-8');
	  return decrypted;
  
	} catch (error) {
	  console.log(error)
	}
  }
  
//////////////////////////////////////

// Body-parser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));


// MySQL Connection
const connection = mysql.createConnection({
    host: "localhost",
    user: 'block',
    password: 'block',
    database: 'tracetex1'
});

connection.connect(function(err) {
    if (!err) {
        console.log('Connected to MySql!\n');
    } else {
		throw err;
        console.log('Not connected to MySql.\n');
    }
});

// Web3 connection
const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:7545'));
console.log(`Talking with a geth server ${web3.version.api} \n`);

const abiArray = [

		{
		  "constant": false,
		  "inputs": [
			{
			  "name": "_code",
			  "type": "string"
			},
			{
			  "name": "_name",
			  "type": "string"
			},
			{
			  "name": "_description",
			  "type": "string"
			},
			{
			  "name": "_manufacturerName",
			  "type": "string"
			},
			{
			  "name": "_price",
			  "type": "uint256"
			}
		  ],
		  "name": "addProduct",
		  "outputs": [
			{
			  "name": "",
			  "type": "uint256"
			}
		  ],
		  "payable": true,
		  "stateMutability": "payable",
		  "type": "function"
		} 
	  
	,
		{
		  "constant": false,
		  "inputs": [
			{
			  "name": "_code",
			  "type": "string"
			},
			{
			  "name": "_name",
			  "type": "string"
			},
			{
			  "name": "_email",
			  "type": "string"
			},
			{
			  "name": "_location",
			  "type": "string"
			},
			{
			  "name": "_password",
			  "type": "string"
			}
		  ],
		  "name": "addRetailer",
		  "outputs": [
			{
			  "name": "",
			  "type": "uint256"
			}
		  ],
		  "payable": true,
		  "stateMutability": "payable",
		  "type": "function"
		}	  
  ,

  {
    "constant": false,
    "inputs": [
      {
        "name": "_pcode",
        "type": "string"
      },
      {
        "name": "_rcode",
        "type": "string"
      },
      {
        "name": "_rname",
        "type": "string"
      },
      {
        "name": "_rpassword",
        "type": "string"
      },
      {
        "name": "_ocode",
        "type": "string"
      },
      {
        "name": "_ucode",
        "type": "string"
      }
    ],
    "name": "addOrder",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": true,
    "stateMutability": "payable",
    "type": "function"
  }
  ,

  {
    "constant": true,
    "inputs": [
      {
        "name": "_pcode",
        "type": "string"
      },
      {
        "name": "_rcode",
        "type": "string"
      },
      {
        "name": "_rname",
        "type": "string"
      },
      {
        "name": "_rpassword",
        "type": "string"
      },
      {
        "name": "_ocode",
        "type": "string"
      },
      {
        "name": "_ucode",
        "type": "string"
      }
    ],
    "name": "verifyOrder",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }
  
];

const address = '0xb58803c8b220921D0f2907bFB0Fb462fA6D7C110';

const contract = web3.eth.contract(abiArray);

const contractInstance = contract.at(address);

// This function generates a QR code
function generateQRCode() {
    return crypto.randomBytes(20).toString('hex');
}


// Hash email using md5
function hashMD5(email) {
    return crypto.createHash('md5').update(email).digest('hex');
}

// Routes for webpages
app.use(express.static(__dirname + '/views'));


app.get('/', (req, res) => {
    res.sendFile('views/index.html', { root: __dirname });
});


// Creating a new retailer
app.get('/createProduct', (req, res) => {
    res.sendFile('views/createProduct.html', { root: __dirname });
});

// Creating a new retailer
app.get('/createRetailer', (req, res) => {
    res.sendFile('views/createRetailer.html', { root: __dirname });
});

// Creating a new retailer
app.get('/verify', (req, res) => {
    res.sendFile('views/verify.html', { root: __dirname });
});

// Manufacturer generates a QR Code here
app.get('/viewItems', (req, res) => {
	// res.sendFile('views/placeOrder.html', { root: __dirname });
	 connection.query("SELECT * FROM product WHERE pstatus='A' ORDER BY pname", function (err, rows) {
		 if (err) {
		   res.render('placeOrder', { data: '' })
		 } else {
		   res.render('placeOrder', { data: rows })
		 }
	   })
 });
 
 // Manufacturer generates a QR Code here
app.get('/products', (req, res) => {
	// res.sendFile('views/placeOrder.html', { root: __dirname });
	 connection.query("SELECT * FROM product ORDER BY pname", function (err, rows) {
		 if (err) {
		   res.render('allProducts', { data: '' })
		 } else {
		   res.render('allProducts', { data: rows })
		 }
	   })
 });



app.post('/addProduct', (req, res) => {
    console.log('Request to /add a product\n');
    let pname = req.body.pname;
    let pdes = req.body.pdes;
    let mname = req.body.mname;
    let pprice = req.body.pprice;
	let pcode = rand.generate(3);
    console.log(`pprice: ${pprice} \n`);
	try {
    // Adding the user in MySQL
    connection.query('SELECT * FROM PRODUCT WHERE ucode = ? LIMIT 1', [pcode], (error, results) => {
        if (error) {
            throw error;
			return res.status(400).send('Error.Please try again');
        }
        if (results.length) {
            return res.status(400).send('Product already exists!');
        }
        connection.query('INSERT INTO PRODUCT VALUES (?,?,?,?,?,?)', [pcode,pname, pdes, mname, pprice,'A'], (error, results) => {
            if (error) {
				throw error;
				return res.status(400).send('Error.Please try again');
            }
            res.status(200).send('Product addition successful!');
            // Adding Product to the Blockchain
            let ok = contractInstance.addProduct(pcode,pname, pdes, mname, pprice, { from: web3.eth.accounts[0], gas: 3500000 });
			console.log(` addproduct ${ok} \n`);
			if (ok) {
                console.log(`Product ${pname} successfully added to Blockchain!\n`);
            } else {
                console.log('ERROR! Product could not be added to Blockchain.\n');
            }
        });
    });
	} catch (error) {
		console.error('Error:', error);
		return res.status(400).send('Error. Please try again.');
	}


});


app.post('/retailerSignup', (req, res) => {
    console.log('Request to /retailerSignup\n');
    let retailerEmail = req.body.email;
    let retailerName = req.body.name;
    let retailerLocation = req.body.location;
    let retailerPassword = req.body.password;
    let retailerHashedPassword = retailerPassword;
    let retailerHashedEmail = hashMD5(retailerEmail);
	let rcode = rand.generate(3);
    console.log(`retailerEmail: ${retailerEmail}, hashedEmail: ${retailerHashedEmail} \n`);
    // Adding the retailer in MySQL
    connection.query('SELECT * FROM retailer WHERE retailerEmail = ? LIMIT 1', [retailerEmail], (error, results) => {
        if (error) {
			console.error('SQL Error:', error);
			return res.status(500).send('Internal Server Error');
        }
        if (results.length) {
            return res.status(400).send('Email already exists!');
        }
        connection.query('INSERT INTO retailer (retailerCode,retailerName, retailerEmail, retailerLocation, retailerHashedPassword) VALUES (?,?,?,?,?)', [rcode,retailerName, retailerEmail, retailerLocation,
                                                                    retailerHashedPassword], (error, results) => {
            if (error) {
				console.error('SQL Error:', error);
				return res.status(500).send('Internal Server Error');
            }
            // Adding retailer to Blockchain
            // Adding Product to the Blockchain
            let ok = contractInstance.addRetailer(rcode,retailerName,retailerHashedEmail,retailerLocation, retailerHashedPassword,{ from: web3.eth.accounts[0], gas: 3500000 });
			console.log(` addretailer ${ok} \n`);
			if (ok) {
                console.log(`retailer successfully added to Blockchain!\n`);
				return res.status(200).send('Adding Retailer successful');
            } else {
                console.log(`ERROR retailer successfully added to Blockchain!\n`);
				return res.status(400).send('Adding Retailer Unsuccessful');
            }

        });
    });
});

// Add retailer to Blockchain
function createRetailer(retailerHashedEmail, retailerName, retailerLocation) {
    return contractInstance.createRetailer(retailerHashedEmail, retailerName, retailerLocation,
                                        { from: web3.eth.accounts[0], gas: 3500000 });
}

app.post('/placeOrder', (req, res) => {
	console.log(`Request to place order\n`);
	let pcode = req.body.ucode;
	let name = req.body.name;
    let password = req.body.password;
	let ocode= rand.generate(4);
		connection.query('SELECT * FROM retailer WHERE retailerName = ? and retailerHashedPassword = ? LIMIT 1', [name, password], (error, results) => {
			if (error) {
				console.error('SQL Error:', error);
				return res.status(500).send('Internal Server Error');
			}
			if (results.length) {
				let retailerEmail = results[0].retailerEmail;
				let retailerCode = results[0].retailerCode;
				console.log("Retailer Email:", retailerEmail);
				connection.query('SELECT * FROM product WHERE ucode = ? LIMIT 1', [pcode], (error, results) => {
					if (results.length) {
						let status_string=pcode+" "+results[0].mname+" "+ocode+" "+name+" "+retailerEmail;
						const ucode= encrypt(status_string,seckey)
						console.log(`decrypted details ${decrypt(ucode,seckey)} successfully\n`);
						connection.query('INSERT INTO orders (ocode, ucode,pcode, rname, remail) VALUES (?,?,?,?,?)', [ocode,ucode,pcode,name,retailerEmail], (error, results) => {
							if (error) {
								console.error('SQL Error:', error);
								return res.status(500).send('Internal Server Error');
							}

							let ok = contractInstance.addOrder(pcode,retailerCode,name,password, ocode,ucode, { from: web3.eth.accounts[0], gas: 3500000 });
							console.log(` addorder ${ok} \n`);
							if (ok) {
								connection.query('UPDATE PRODUCT SET pstatus = ? WHERE ucode = ?',['O', pcode],
								(error, results) => {
								  if (error) {
									console.error("Error updating the record:", error);
									// Handle the error appropriately
								  } else {
									console.log("Record updated successfully");
									// Handle the success case if needed
								  }
								}
							  );
								console.log(`Order successfu!\n`);
								return res.status(200).send(`Adding Order successful. Order code is ${ocode} \n   Your unique code is ${ucode}`);
							} else {
								console.log(`ERROR order Unsuccessful!\n`);
								return res.status(400).send('Adding order Unsuccessful');
							}


							});
					}
					else{
						return res.status(500).send('Internal Server Error. Product not found');
					}
				});

			}
		});




 });


 app.post('/verifyOrder', (req, res) => {
	console.log('Request to /Verify order\n');
    let pname = req.body.pname;
    let pmanu = req.body.pmanu;
	let ocode = req.body.ocode;
    let ucode = req.body.ucode;
    let remail = req.body.remail;
    let rpassword = req.body.rpassword;


	connection.query('SELECT * FROM retailer WHERE retailerEmail = ? and retailerHashedPassword= ? LIMIT 1', [remail,rpassword], (error, results) => {
        if (error) {
			console.error('SQL Error:', error);
			return res.status(500).send('Internal Server Error');
        }
        if (results.length) {
		let decrypted_string=decrypt(ucode,seckey);
		const regex = /[^\[\]\s]+/g;

		const tokens = decrypted_string.match(regex);
		let pcode=tokens[0];
		let rname=tokens[3];
		let rcode=results[0].retailerCode;
		console.log(tokens[3]);
		console.log(` pcode ${pcode} \n`);		
		console.log(` rcode ${rcode} \n`);
		console.log(` ranme ${rname} \n`);
		console.log(` rpassword ${rpassword} \n`);
		console.log(` ocode ${ocode} \n`);
		console.log(` ucode ${ucode} \n`);
		let ok = contractInstance.verifyOrder(pcode,rcode,rname,rpassword,ocode,ucode);
		console.log(` output ${ok} \n`);	
		if (ok==1) {
			console.log(`Product is original!\n`);
			res.status(200).send(`Product is original and is shipped from manufacturer ${pmanu}`);
		} else {
			console.log('ERROR! Product not original.\n');
			res.status(200).send(`Product is not original and is not shipped from manufacturer`);
		}


		} else{
			return res.status(400).send('Credentials do not belong to a Retailer');
		}
    });


});

/**
 * Description: Adds a user to the database and to the blockchain
 * Request:     POST /signUp
 * Send:        JSON object which contains name, email, password, phone
 * Receive:     200 if successful, 400 otherwise
 */
app.post('/signUp', (req, res) => {
    console.log('Request to /signUp\n');
    let name = req.body.name;
    let email = req.body.email;
    let password = req.body.password;
    let phone = req.body.phone;
    let hashedPassword = password;
    console.log(`Email: ${email} \n`);
    // Adding the user in MySQL
    connection.query('SELECT * FROM USER WHERE Email = ? LIMIT 1', [email], (error, results) => {
        if (error) {
            throw error;
            return res.status(400);
        }
        if (results.length) {
            return res.status(400).send('Email already exists!');
        }
        connection.query('INSERT INTO USER VALUES (?,?,?,?)', [name, email, hashedPassword, phone], (error, results) => {
            if (error) {
				//throw error;
				res.status(200).send('Signup not successful!');
            }
            res.status(200).send('Signup successful!');
            // Adding user to the Blockchain
            let ok = createCustomer(email, name, phone);
            if (ok) {
                console.log(`User ${hashedEmail} successfully added to Blockchain!\n`);
            } else {
                console.log('ERROR! User could not be added to Blockchain.\n');
            }
        });
    });
});



app.get('/getProduct', (req, res) => {
	let ok = contractInstance.getProduct('O3sbHz4');
	if (ok) {
		console.log(`Product ${ok} present in Blockchain!\n`);
		res.status(200).send('Product retrieve successful!');
	} else {
		console.log('ERROR! Product not in Blockchain.\n');
		res.status(200).send('Product not retrieved successful!');
	}

});

// Add the user in Blockchain
function createCustomer(hashedEmail, name, phone) {
    return contractInstance.createCustomer(hashedEmail, name, phone, { from: web3.eth.accounts[0], gas: 3500000 });
}



/**
 * Description: Login the user to the app
 * Request:     POST /login
 * Send:        JSON object which contains email, password
 * Receive:     200 if successful, 400 otherwise
 */
app.post('/login', (req, res) => {
    console.log('Request to /login\n');
    let email = req.body.email;
    let password = req.body.password;
    console.log(`Email: ${email} \n`);
    connection.query('SELECT * FROM USER WHERE Email = ? LIMIT 1', [email], (error, results) => {
        if (error) {
            throw error;
            return res.status(400);
        }
        if (results.length) {
            connection.query('SELECT Password FROM USER WHERE Email = (?)', [email], (error, results) => {
                if (error) {
                    throw error;
                    return res.status(400);
                }
                let pass = results[0].Password;
                if (password===pass) {
                    console.log(`Login successful with ${email} \n`);
                    return res.status(200).send('Login successful!');
                }
                return res.status(400).send('Login failed.');
            });
        }
        console.log('Email does not exist!\n');
        return res.status(400).send('Email does not exist!');
    });
});





/**
 * Description: Login the retailer to the app
 * Request:     POST /retailerLogin
 * Send:        JSON object which contains email, password
 * Receive:     200 if successful, 400 otherwise
 */
app.post('/retailerLogin', (req, res) => {
    console.log('Request to /retailerLogin\n');
    let retailerEmail = req.body.email;
    let retailerPassword = req.body.password;
    console.log(`Email: ${retailerEmail} \n`);
    connection.query('SELECT retailerHashedPassword FROM RETAILER WHERE retailerEmail = ?', [retailerEmail], (error, results) => {
        if (error) {
            throw error;
            return res.status(400);
        }
        let pass = results[0].retailerHashedPassword ;
		if (password===pass){
            console.log(`${retailerEmail} has successfully logged in\n`);
            return res.status(200).send('Retailer login successful!');
        }
        console.log(`${retailerEmail} COULD NOT login\n`);
        return res.status(400).send('Retailer login failed.');
    })
});


/**
 * Description: Get reatiler details
 * Request:     GET /retailerDetails
 * Send:
 * Receive:     JSON object of retailer details if successful, 400 otherwise
 */
app.get('/retailerDetails', (req, res) => {
    connection.query('Select * from RETAILER', (error, results) => {
        if(error) {
            throw error;
            return res.status(400).send('ERROR');
        }
        console.log(`Retailer details are:\n ${results} \n`);
        return res.status(400).send(JSON.parse(JSON.stringify(results)));
    })
});


/**
 * Description: Add retailer to code
 * Request:     POST /addRetailerToCode
 * Send:        JSON object which contains code, email
 * Receive:     200 if successful, 400 otherwise
 */
app.post('/addRetailerToCode', (req, res) => {
    console.log('Request to /addRetailerToCode\n');
    let code = req.body.code;
    let retailerEmail = req.body.email;
    let hashedEmail = hashMD5(retailerEmail);
    console.log(`retailerEmail: ${retailerEmail}, hashed email: ${hashedEmail} \n`);
    let ok = contractInstance.addRetailerToCode(code, hashedEmail);
    if(!ok) {
        return res.status(400).send('Error');
    }
    console.log(`Successfully added ${hashedEmail} to code ${code} \n`);
    return res.status(200).send('Success');
});


/**
 * Description: Lists all the assets owned by the user
 * Request:     POST /myAssets
 * Send:        JSON object which contains email
 * Receive:     JSON array of objects which contain brand, model, description, status, manufacturerName,manufacturerLocation,
 *                                                  manufacturerTimestamp, retailerName, retailerLocation, retailerTimestamp
 */
app.post('/myAssets', (req, res) => {
    console.log('Request to /myAssets\n');
    let myAssetsArray = [];
    let email = req.body.email;
    let hashedEmail = hashMD5(email);
    let arrayOfCodes = contractInstance.getCodes(hashedEmail);
    console.log(`Email ${email}`);
    console.log(`Customer has these product codes: ${arrayOfCodes} \n`);
    for (code in arrayOfCodes) {
        let ownedCodeDetails = contractInstance.getOwnedCodeDetails(arrayOfCodes[code]);
        let notOwnedCodeDetails = contractInstance.getNotOwnedCodeDetails(arrayOfCodes[code]);
        myAssetsArray.push({
            'code': arrayOfCodes[code], 'brand': notOwnedCodeDetails[0],
            'model': notOwnedCodeDetails[1], 'description': notOwnedCodeDetails[2],
            'status': notOwnedCodeDetails[3], 'manufacturerName': notOwnedCodeDetails[4],
            'manufacturerLocation': notOwnedCodeDetails[5], 'manufacturerTimestamp': notOwnedCodeDetails[6],
            'retailerName': ownedCodeDetails[0], 'retailerLocation': ownedCodeDetails[1],
            'retailerTimestamp': ownedCodeDetails[2]
        });
    }
    res.status(200).send(JSON.parse(JSON.stringify(myAssetsArray)));
});


/**
 * Description: Lists all the assets owned by the user
 * Request:     POST /stolen
 * Send:        JSON object which contains code, email
 * Receive:     200 if product status was changed, 400 otherwise.
 */
app.post('/stolen', (req, res) => {
    console.log('Request to /stolen\n');
    let code = req.body.code;
    let email = req.body.email;
    let hashedEmail = hashMD5(email);
    console.log(`Email: ${email} \n`);
    let ok = contractInstance.reportStolen(code, hashedEmail);
    if (!ok) {
        console.log(`ERROR! Code: ${code} status could not be changed.\n`);
        return res.status(400).send('ERROR! Product status could not be changed.');
    }
    console.log(`Product code ${code} successfully changed!\n`);
    res.status(200).send('Product status successfully changed!');
});


// This array keeps track of all the QR Codes in use
const QRCodes = [];

/**
 * Description: Sell a product from myAssets (aka your inventory)
 * Request:     POST /sell
 * Send:        JSON object which contains code, sellerEmail
 * Receive:     List of QR Codes owned by the seller if successful, 400 otherwise
 */
app.post('/sell', (req, res) => {
    console.log('Request to /sell\n');
    let code = req.body.code;
    let sellerEmail = req.body.email;
    console.log(`Email ${sellerEmail} \n`);
    hashedSellerEmail = hashMD5(sellerEmail);
    let currentTime = Date.now();         // Date.now() gets the current time in milliseconds
    let QRCode = generateQRCode();
    let QRCodeObj = {
        'QRCode': QRCode, 'currentTime': currentTime, 'sellerEmail': sellerEmail, 'buyerEmail': '',
        'code': code, 'confirm': '0', 'retailer': '0'
    };
    QRCodes.push(QRCodeObj);
    console.log(`Session created ${(JSON.stringify(QRCode))} \n`);
    res.status(200).send(JSON.parse(JSON.stringify(QRCode)));
});


/**
 * Description: Buy a product
 * Request:     POST /buy
 * Send:        JSON object which contains QRCode, email
 * Receive:     200 if successful, 400 otherwise
 */
app.post('/buy', (req, res) => {
    console.log('Request to /buy\n');
    let QRCode = req.body.QRCode;
    let buyerEmail = req.body.email;
    let currentTime = Date.now();         // Date.now() gets the current time in milliseconds
    console.log(`Email: ${buyerEmail} \n`);
    for (let i = 0; i < QRCodes.length; i++) {
        if (QRCode === QRCodes[i]['QRCode']) {
            let timeElapsed = Math.floor((currentTime - QRCodes[i]['currentTime']) / 1000);
            // QR Codes are valid only for 600 secs
            if (timeElapsed <= 600) {
                QRCodes[i]['buyerEmail'] = buyerEmail;
                console.log(`QRCode matches, Session updated ${(JSON.stringify(QRCode))} \n`);
                return res.status(200).send('Validated!');
            }
            console.log('Time out error\n');
            return res.status(400).send('Timed out!');
        }
    }
    console.log('Could not find QRCode\n');
    return res.status(400).send('Could not find QRCode');
});


/**
 * Description: Get product details
 * Request:     POST /getProductDetails
 * Send:        JSON object which contains code
 * Receive:     JSON object whcih contains brand, model, description, status, manufacturerName, manufacturerLocation,
 *                                         manufacturerTimestamp, retailerName, retailerLocation, retailerTimestamp
 */
app.post('/getProductDetails', (req, res) => {
    console.log('Request to /getProductDetails\n');
    let code = req.body.code;
    let QRCode = req.body.QRCode;
    let currentTime = Date.now();         // Date.now() gets the current time in milliseconds
    for (let i = 0; i < QRCodes.length; i++) {
        if (QRCode === QRCodes[i]['QRCode']) {
            let timeElapsed = Math.floor((currentTime - QRCodes[i]['currentTime']) / 1000);
            // QR Codes are valid only for 600 secs
            if (timeElapsed <= 600) {
                let ownedCodeDetails = contractInstance.getOwnedCodeDetails(code);
                let notOwnedCodeDetails = contractInstance.getNotOwnedCodeDetails(code);
                if (!ownedCodeDetails || !notOwnedCodeDetails) {
                    return res.status(400).send('Could not retrieve product details.');
                }
                let productDetails = {
                    'brand': notOwnedCodeDetails[0], 'model': notOwnedCodeDetails[1], 'description': notOwnedCodeDetails[2],
                    'status': notOwnedCodeDetails[3], 'manufacturerName': notOwnedCodeDetails[4],
                    'manufacturerLocation': notOwnedCodeDetails[5], 'manufacturerTimestamp': notOwnedCodeDetails[6],
                    'retailerName': ownedCodeDetails[0], 'retailerLocation': ownedCodeDetails[1],
                    'retailerTimestamp': ownedCodeDetails[2]
                };
                console.log('QRCode matched\n');
                return res.status(200).send(JSON.parse(JSON.stringify(productDetails)));
            }
            console.log('Time out error\n');
            return res.status(400).send('Timed out!');
        }
    }
});


/**
 * Description: Seller confirms deal and gets registered as new owner on the Blockchain
 * Request:     POST /sellerConfirm
 * Send:        JSON object which contains email, QRCode, retailer
 * Receive:     200 if successful, 400 otherwise
 */
app.post('/sellerConfirm', (req, res) => {
    console.log('Request to /sellerConfirm\n');
    let sellerEmail = req.body.email;
    let QRCode = req.body.QRCode;
    let retailer = req.body.retailer;
    console.log(`Email: ${sellerEmail} \n`);
    let currentTime = Date.now();         // Date.now() gets the current time in milliseconds
    let sellerHashedEmail = hashMD5(sellerEmail);
    for (let i = 0; i < QRCodes.length; i++) {
        if (QRCode === QRCodes[i]['QRCode']) {
            let timeElapsed = Math.floor((currentTime - QRCodes[i]['currentTime']) / 1000);
            // QR Codes are valid only for 600 secs
            if (timeElapsed <= 600) {
                QRCodes[i]['confirm'] = '1';
                if(retailer === '1') {
                    QRCodes[i]['retailer'] = '1';
                }
                console.log('Success in sellerConfirm\n');
                return res.status(200).send('Seller confirmed!');
            }
            console.log('Time out error\n');
            return res.status(400).send('Timed out!');
        }
    }
    console.log('Could not find QRCodes\n');
    return res.status(400).send('Could not find QRCodes');
});


/**
 * Description: Buyer confirms deal
 * Request:     POST /buyerConfirm
 * Send:        JSON object which contains email, QRCode
 * Receive:     200 if successful, 400 otherwise
 */
app.post('/buyerConfirm', (req, res) => {
    console.log('Request made to /buyerConfirm\n');
    let buyerEmail = req.body.email;
    let QRCode = req.body.QRCode;
    let currentTime = Date.now();         // Date.now() gets the current time in milliseconds
    console.log(`Email: ${buyerEmail} and QRCode: ${QRCode} \n`);
    for (let i = 0; i < QRCodes.length; i++) {
        if (QRCode === QRCodes[i]['QRCode']) {
            let timeElapsed = Math.floor((currentTime - QRCodes[i]['currentTime']) / 1000);
            // QR Codes are valid only for 600 secs
            if (timeElapsed <= 600) {
                if(QRCodes[i]['confirm'] === '1'){
                    let hashedSellerEmail = hashMD5(QRCodes[i]['sellerEmail']);
                    let hashedBuyerEmail = hashMD5(QRCodes[i]['buyerEmail']);
                    let code = QRCodes[i]['code'];
                    var ok;
                    if(QRCodes[i]['retailer'] === '1'){
                        console.log('Performing transaction for retailer\n');
                        ok = contractInstance.initialOwner(code, hashedSellerEmail, hashedBuyerEmail,
                                                        { from: web3.eth.accounts[0], gas: 3500000 });
                    } else {
                        console.log('Performing transaction for customer\n');
                        ok = contractInstance.changeOwner(code, hashedSellerEmail, hashedBuyerEmail,
                                                        { from: web3.eth.accounts[0], gas: 3500000 });
                    }
                    if (!ok) {
                        return res.status(400).send('Error');
                    }
                    console.log('Success in buyerConfirm, transaction is done!\n');
                    return res.status(200).send('Ok');
                }
                console.log('Buyer has not confirmed\n');
            }
            return res.status(400).send('Timed out!');
        }
    }
    console.log('Product not found\n')
    return res.status(400).send('Product not found');
});

// Function that creates an initial owner for a product
function initialOwner(code, retailerHashedEmail, customerHashedEmail) {
    return contractInstance.initialOwner(code, retailerHashedEmail, customerHashedEmail,
                                        { from: web3.eth.accounts[0], gas: 3500000 });
}

// Function that creates transfers ownership of a product
function changeOwner(code, oldOwnerHashedEmail, newOwnerHashedEmail) {
    return contractInstance.changeOwner(code, oldOwnerHashedEmail, newOwnerHashedEmail,
                                        { from: web3.eth.accounts[0], gas: 3500000 });
}


/**
 * Description: Gives product details if the scannee is not the owner of the product
 * Request:     POST /scan
 * Send:        JSON object which contains code
 * Receive:     JSON object which has productDetails
 */
app.post('/scan', (req, res) => {
    console.log('Request made to /scan\n');
    let code = req.body.code;
    let productDetails = contractInstance.getNotOwnedCodeDetails(code);
    let productDetailsObj = {
        'name': productDetails[0], 'model': productDetails[1], 'status': productDetails[2],
        'description': productDetails[3], 'manufacturerName': productDetails[4],
        'manufacturerLocation': productDetails[5], 'manufacturerTimestamp': productDetails[6]
    };
    console.log(`Code ${code} \n`);
    res.status(200).send(JSON.stringify(productDetailsObj));
});


/**
 * Description: Generates QR codes for the manufacturers
 * Request:     POST /QRCodeForManufacturer
 * Send:        JSON object which contains brand, model, status, description, manufacturerName, manufacturerLocation
 * Receive:     200 if QR code was generated, 400 otherwise.
 */
app.post('/QRCodeForManufacturer', (req, res) => {
    console.log('Request to /QRCodeForManufacturer\n');
    let brand = req.body.brand;
    let model = req.body.model;
    let status = 0;
    let description = req.body.description;
    let manufacturerName = req.body.manufacturerName;
    let manufacturerLocation = req.body.manufacturerLocation;
    let manufacturerTimestamp = new Date();         // Date() gives current timestamp
    manufacturerTimestamp = manufacturerTimestamp.toISOString().slice(0, 10);
    let salt = crypto.randomBytes(20).toString('hex');
    let code = hashMD5(brand + model + status + description + manufacturerName + manufacturerLocation + salt);
    let ok = contractInstance.createCode(code, brand, model, status, description, manufacturerName, manufacturerLocation,
                                        manufacturerTimestamp, { from: web3.eth.accounts[0], gas: 3500000 });
    console.log(`Brand: ${brand} \n`);
    if (!ok) {
        return res.status(400).send('ERROR! QR Code for manufacturer could not be generated.');
    }
    console.log(`The QR Code generated is: ${code} \n`);
    let QRcode = code + '\n' + brand + '\n' + model + '\n' + description + '\n' + manufacturerName + '\n' + manufacturerLocation;
    fs.writeFile('views/davidshimjs-qrcodejs-04f46c6/code.txt', QRcode, (err, QRcode) => {
        if (err) {
            console.log(err);
        }
        console.log('Successfully written QR code to file!\n');
    });
    res.sendFile('views/davidshimjs-qrcodejs-04f46c6/index.html', { root: __dirname });
});


/**
 * Description: Gives all the customer details
 * Request:     GET /getCustomerDetails
 * Send:        JSON object which contains email
 * Receive:     JSON object which contains name, phone
 */
app.get('/getCustomerDetails', (req, res) => {
    console.log('Request to /getCustomerDetails\n');
    let email = req.body.email;
    let hashedEmail = hash(email);
    let customerDetails = contractInstance.getCustomerDetails(hashedEmail);
    console.log(`Email: ${email} \n`);
    let customerDetailsObj = {
        'name': customerDetails[0], 'phone': customerDetails[1]
    };
    res.status(200).send(JSON.parse(JSON.stringify(customerDetailsObj)));
});

// Server start
app.listen(port, (req, res) => {
    console.log(`Listening to port ${port}...\n`);
});
