var connection = mysql.createConnection({
port:'3306',
host: 'lyl3nln24eqcxxot.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
user: 'xg5zu6ft9vcegj1i',
password: 'u7ulq2hmz6797r5n',
database:'rkycf99cdfosu3q0',
timeout: 10000, // 10 seconds
multipleStatements: true

});

module.exports = db;