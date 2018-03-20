import mysql from 'mysql'
import nodemailer from 'nodemailer'

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

let transporter = nodemailer.createTransport({
  pool: true,
  host: 'mail.fastname.no',
  port: 587,
  secure: false,
  auth: {
    user: 'rodekorsprosjekt@2rz.no',
    pass: '25JyrJSCfe8h'
  }
});

transporter.verify(function(error, success) {
   if (error) {
        console.log(error);
   } else {
        console.log('Server is ready to take our messages');
   }
});

class EmailService {
  newPassword (clientEmail) {
    return new Promise((resolve, reject) => {

      let message = {
        from: 'rodekorsprosjekt@2rz.no',
        to: clientEmail,
        subject: 'Nytt Passord',
        text: 'Vi har sendt deg et nytt passord, men vet ikke helt hvordan det kommer til å fungere enda.',
        html: '<h1>Vi har sendt deg et nytt passord, men vet ikke helt hvordan det kommer til å fungere enda.</h1>'
      }

      transporter.sendMail(message), (err, info) => {
        if(err){
          reject(err)
          return;
        }
        resolve(info)
      }
    })
  }

}

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
        let admin = false
        let medlemsnr = null
        if (result[0].passord === passord && result[0].admin === 1) {
          login = true
          admin = true
          medlemsnr = result[0].id;
          console.log(admin);
          console.log(medlemsnr);
        } else if(result[0].passord === passord) {
          login = true
          medlemsnr = result[0].id;
        }else{
          login = false
        }
        resolve([medlemsnr, login, admin]);
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
let emailService = new EmailService()

export { userService, loginService, arrangementService, emailService }
