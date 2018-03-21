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
  port: 465,
  secure: true,
  auth: {
    user: 'rodekorsprosjekt@2rz.no',
    pass: '25JyrJSCfe8h'
  },
  tls: {
        // do not fail on invalid certs
        rejectUnauthorized: false
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
  newPassword (clientEmail, emailCheck) {
    return new Promise((resolve, reject) => {

      let message = {
        from: 'rodekorsprosjekt@2rz.no',
        to: clientEmail,
        subject: 'Nytt Passord',
        text: 'Din kode for å gjenoprette passord er ' + emailCheck,
        html: '<h1>Din kode for å gjenoprette passord er ' + emailCheck + '</h1>'
      }

      transporter.sendMail(message, (err, info) => {
        if(err){
          reject(err)
          return;
        }

        resolve(info);
      });
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
    connection.query('SELECT * FROM medlem INNER JOIN poststed ON poststed_postnr = postnr WHERE id=?', [id], (error, result) => {

      if(error){
        reject(error);
        return;
      }
      console.log(result[0]);
      resolve(result);
    });
  });
  }

  addUser (navn, epost, medlemsnr, tlf, adresse, passord, postnr) {
    return new Promise((resolve, reject) =>{
    connection.query('INSERT INTO medlem (brukernavn, epost, id, tlf, adresse, passord, poststed_postnr) values (?, ?, ?, ?, ?, ?, ?)', [navn, epost, medlemsnr, tlf, adresse, passord, postnr], (error, result) => {
      if(error){
        reject(error);
        return;
      }

      resolve();
    });
  });
  }




  newPassword(passord, epost) {
    return new Promise((resolve, reject) => {
      connection.query('UPDATE medlem SET passord = ? WHERE epost = ?', [passord, epost], (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve()
      })
    })
  }

  editUser (firstName, city, id, callback) {
    return new Promise((resolve, reject) => {
    connection.query('UPDATE medlem SET epost = ?, adresse = ?, tlf = ?, poststed_postnr = ? WHERE id = ?', [email, adress, tlf, zip, id], (error, result) => {
      if(error){
        reject(error);
        return;
      }
      resolve();
    });
  });
  }

  editPassword(password, id, callback) {
    return new Promise((resolve, reject) => {
    connection.query('UPDATE medlem SET passord = ? WHERE id = ?', [password, id], (error, result) => {
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
    return new Promise((resolve, reject) => {
      connection.query('SELECT * from medlem WHERE epost = ?', [brukernavn], (error, result) => {
        if(error){
          reject(error);
          return;
        }
        let aktiv = false
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
        if(result[0].aktiv === 1){
          aktiv = true
        }else{
          aktiv = false
        }
        resolve([medlemsnr, login, admin, aktiv]);
    });
  });
  }

  navn(kode, email) {
    let m_id
    return new Promise((resolve, reject) => {
      connection.query('SELECT id from medlem where epost = ?', [email], (error, result) => {
        if(error){
          reject(error);
          return;
        }

        let m_id = result[0].id
        let date = new Date()
        date.setMinutes(date.getMinutes() + 30)

        connection.query('INSERT INTO recovery values (?, ?, ?)', [m_id, date, kode], (error, result) => {
          if(error){
            reject(error);
            return;
          }
          resolve();

        })
      })
    })
  }

  emailCheck(email, kode) {
    return new Promise((resolve, reject) => {
      connection.query('SELECT COUNT(*) as count from recovery inner join medlem on medlem.id = recovery.m_id where epost = ? AND kode = ? and forbruksdato > NOW()', [email, kode], (error, result) => {
        if(error){
          reject(error);
          return;
        }

        if (result[0].count > 0) {
          resolve()
        } else{
          reject('Feil kode')
          return;
        }
      })
    })
  }
}

class ArrangementService {
  addArrangement (tlf, navn, meetdate, startdate, enddate, place, desc, roller) {
      let k_id;
      return new Promise((resolve, reject) =>{
        connection.query('SELECT * from medlem where tlf = ?', [tlf], (error, result) => {
          if(error){
            reject(error);
            return;
          }
          k_id = result[0].id
          // console.log(result);
          // console.log(k_id);

          connection.query('INSERT INTO arrangement (navn, oppmootetidspunkt, starttidspunkt, sluttidspunkt, kordinater, beskrivelse, kontaktperson) values (?, ?, ?, ?, ?, ?, ?)', [navn, meetdate, startdate, enddate, place, desc, k_id], (error, result) => {
            if(error){
              console.log(error);
              return;
            }
            // console.log(roller);
            // console.log(result);
            // console.log(result.insertId);
            for (var i = 0; i < roller.length; i++) {
              for (var o = 0; o < roller[i].antall; o++) {
                // console.log(roller[i].id);
                connection.query('INSERT INTO vakt (a_id, r_id) values (?, ?)', [result.insertId, roller[i].id], (error, result) => {
                  // console.log(roller);
                  // console.log(result);
                  // console.log(result.insertId);

                });
              }
            }
          });
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
          resolve(result);
    });
  });

  }
}

class AdministratorFunctions{
  ikkeAktiveBrukere(){
    return new Promise((resolve, reject) => {
      connection.query('SELECT * from medlem where aktiv = ?',[false], (error, result) =>{
        if(error){
          reject(error);
          return;
        }
        console.log(result);
        resolve(result);
      });
    });
  }

  aktiverBruker(id){
    return new Promise((resolve, reject) =>{
      connection.query('update medlem set aktiv = ? where id = ?', [true,id], (error,result)=>{
        if(error){
          reject(error);
          return;
        }
        console.log('Brukeren er nå aktiv');
        resolve();
      });
    });
  }
}

let userService = new UserService()
let loginService = new LoginService()
let arrangementService = new ArrangementService()
let emailService = new EmailService()
let administratorFunctions = new AdministratorFunctions()

export { userService, loginService, arrangementService, emailService, administratorFunctions }
