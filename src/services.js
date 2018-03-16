import mysql from 'mysql'

// Setup database server reconnection when server timeouts connection:
let connection
function connect () {
  connection = mysql.createConnection({
    host: 'mysql.stud.iie.ntnu.no',
    user: 'g_oops_24',
    password: 'Y3QgOxYS',
    database: 'g_oops_24'
  })

  // Connect to MySQL-server
  connection.connect((error) => {
    if (error) throw error // If error, show error in console and return from this function
  })

  // Add connection error handler
  connection.on('error', (error) => {
    if (error.code === 'PROTOCOL_CONNECTION_LOST') { // Reconnect if connection to server is lost
      connect()
    } else {
      throw error
    }
  })
}
connect()

// Class that performs database queries related to users
class UserService {
  getUsers () {
    return new Promise((resolve, reject) =>{
    connection.query('SELECT * FROM medlem', (error, result) => {
      if(error){
        reject(error);
        return;
      }

      resolve(result);
    });
  });
  }

  getUser (id) {
    return new Promise((resolve, reject) => {
    connection.query('SELECT * FROM medlem WHERE id=?', [id], (error, result) => {
      if(error){
        reject(error);
        return;
      }
      resolve(result);
    });
  });
  }

  addUser (navn, epost, medlemsnr, tlf, passord, callback) {
    return new Promise((resolve, reject) =>{
    connection.query('INSERT INTO medlem (brukernavn, epost, id, tlf, passord) values (?, ?, ?, ?, ?)', [navn, epost, medlemsnr, tlf, passord], (error, result) => {
      if(error){
        reject(error);
        return;
      }

      resolve();
    });
  });
  }

  editUser (firstName, city, id, callback) {
    return new Promise((resolve, reject) => {
    connection.query('UPDATE medlem SET firstName = ?, city = ? WHERE id = ?', [firstName, city, id], (error, result) => {
      if(error){
        reject(error);
        return;
      }
      resolve();
    });
  });
  }
}

class LoginService {
  checkLogin (brukernavn, passord, callback) {
    return new Promise((resolve, reject) =>{
      connection.query('SELECT * from medlem WHERE epost = ?', [brukernavn], (error, result) => {
        if(error){
          reject(error);
          return;
        }
        let login = false
        let medlemsnr = null
        if (result[0].passord === passord) {
          login = true
          medlemsnr = result[0].id;
          console.log(medlemsnr);
        } else {
          login = false
        }
        resolve([medlemsnr, login]);
    });
  });
  }
}

class ArrangementService {
  addArrangement (tlf, navn, meetdate, startdate, enddate, place, desc, callback) {
    let k_id;
    return new Promise((resolve, reject) =>{
      connection.query('SELECT * from medlem where tlf = ?', [tlf], (error, result) => {
        if(error){
          reject(error);
          return;
        }
        k_id = result[0].id
        console.log(result);
        console.log(k_id);

        connection.query('INSERT INTO arrangement (navn, oppmootetidspunkt, starttidspunkt, sluttidspunkt, kordinater, beskrivelse, kontaktperson) values (?, ?, ?, ?, ?, ?, ?)', [navn, meetdate, startdate, enddate, place, desc, k_id])

    });
  });


    resolve();
  }

  getArrangement(sok, callback){
    return new Promise((resolve, reject) =>{
        connection.query('SELECT * from arrangement where navn LIKE ?',[sok], (error, result) =>{
          if(error){
            reject(error);
            return;
          }
          console.log(result);
          resolve(result);
    });
  });

  }
}

let userService = new UserService()
let loginService = new LoginService()
let arrangementService = new ArrangementService()

export { userService, loginService, arrangementService }
