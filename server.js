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


// Creating a new Product
app.get('/createProduct', (req, res) => {
    res.sendFile('views/createProduct.html', { root: __dirname });
});

// Creating a new retailer
app.get('/createRetailer', (req, res) => {
    res.sendFile('views/createRetailer.html', { root: __dirname });
});

// verifying products
app.get('/verify', (req, res) => {
    res.sendFile('views/verify.html', { root: __dirname });
});

// View all available items
app.get('/viewItems', (req, res) => {

	 connection.query("SELECT * FROM product WHERE pstatus='A' ORDER BY pname", function (err, rows) {
		 if (err) {
		   res.render('placeOrder', { data: '' })
		 } else {
		   res.render('placeOrder', { data: rows })
		 }
	   })
 });
 

app.get('/products', (req, res) => {

	 connection.query("SELECT * FROM product ORDER BY pname", function (err, rows) {
		 if (err) {
		   res.render('allProducts', { data: '' })
		 } else {
		   res.render('allProducts', { data: rows })
		 }
	   })
 });

 app.get('/retailers', (req, res) => {

  connection.query("SELECT * FROM retailer ORDER BY retailerName", function (err, rows) {
    if (err) {
      res.render('allRetailers', { data: '' })
    } else {
      res.render('allRetailers', { data: rows })
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
    // Adding the product in MySQL
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

// Server start
app.listen(port, (req, res) => {
    console.log(`Listening to port ${port}...\n`);
});
