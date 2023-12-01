pragma solidity ^0.4.21;
pragma experimental ABIEncoderV2;



contract Tracetex {
    uint public pcount;
    uint public rcount;
    uint public ocount;

        // A struct which helps create a new product
        struct productObj {
        string code;
        string name;
        string description;
        string manufactuerName;
        uint price;
    }
        // A struct which helps create a new retailer
    struct retailersObj {
        string code;
        string name;
        string email;
        string location;
        string password;
    }

    // A struct which helps create a new customer
    struct orderObj {
        string pcode;
        string rcode;
        string ocode;
        string ucode;
    }

    struct retailerObj {
        string name;
        string location;
    }

    productObj [] public  products;
    retailersObj [] public  retailers;
    orderObj [] public  orders;




    // Function to create a new code for the product
    function addProduct(string _code, string _name, string _description, string _manufactuerName, uint _price) public payable returns (uint) {
        productObj memory newProd;
        pcount++;
        newProd.code = _code;
        newProd.name = _name;
        newProd.description = _description;
        newProd.manufactuerName = _manufactuerName;
        newProd.price =_price;
        products[pcount]= newProd;
        return 1;
    }

        // Function to create a new code for the product
    function addRetailer(string _code, string _name, string _email, string _location, string _password) public payable returns (uint) {
        retailersObj memory newRet;
        rcount++;
        newRet.code = _code;
        newRet.name = _name;
        newRet.email = _email;
        newRet.location = _location;
        newRet.password =_password;
        retailers[rcount]= newRet;
        return 1;
    }

    function checkProduct(string _code) internal returns (bool) {

        // Iterate over the products array
        for (uint i = 0; i < products.length; i++) {
            if (compareStrings(products[i].code,_code)){
                return true;
            }
        }
            return false;
    }

    function checkRetailer(string _code,string _name,string _password) internal returns (bool) {

        // Iterate over the retailers array
        for (uint i = 0; i < retailers.length; i++) {
            if (compareStrings(retailers[i].code,_code)){
                        if (compareStrings(retailers[i].password,_password) && compareStrings(retailers[i].name,_name)){
                        return true;
                        }
            }
        }
            return false;
    }

    function addOrder(string _pcode, string _rcode,string _rname, string _rpassword, string _ocode, string _ucode) public payable returns (uint) {
       
       if(checkProduct(_pcode) && checkRetailer(_rcode,_rname,_rpassword)){
        orderObj memory newOrd;
        ocount++;
        newOrd.pcode = _pcode;
        newOrd.rcode = _rcode;
        newOrd.ocode = _ocode;
        newOrd.ucode = _ucode;
        orders[ocount]= newOrd;
        return 1;
      }
       return 0;
    }

    function verifyOrder(string _pcode, string _rcode,string _rname, string _rpassword, string _ocode, string _ucode) public view returns (uint) {

       if(checkProduct(_pcode) && checkRetailer(_rcode,_rname,_rpassword)){
        for (uint i = 0; i < orders.length; i++) {
            if (compareStrings(orders[i].ocode,_ocode)){
                        if (compareStrings(orders[i].pcode,_pcode) && compareStrings(orders[i].ucode,_ucode)&& compareStrings(orders[i].rcode,_rcode)){
                        return 1;
                        }
            }
        }
      }
       return 0;
    }


    // Cannot directly compare strings in Solidity
    // This function hashes the 2 strings and then compares the 2 hashes
    function compareStrings(string a, string b) internal returns (bool) {
    	return keccak256(a) == keccak256(b);
    }

    // Function to delete an element from an array
    function remove(uint index, string[] storage array) internal returns(bool) {
        if (index >= array.length)
            return false;

        for (uint i = index; i < array.length-1; i++) {
            array[i] = array[i+1];
        }
        delete array[array.length-1];
        array.length--;
        return true;
    }

    // Function to convert string to bytes32
    function stringToBytes32(string memory source) internal returns (bytes32 result) {
        bytes memory tempEmptyStringTest = bytes(source);
        if (tempEmptyStringTest.length == 0) {
            return 0x0;
        }
        assembly {
            result := mload(add(source, 32))
        }
    }
}
