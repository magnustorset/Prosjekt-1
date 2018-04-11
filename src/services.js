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

  innkalling (clientEmail, rolle, arrNavn, arrDato) {
    return new Primise((resolve, reject) => {
      let message = {
        from: 'rodekorsprosjekt@2rz.no',
        to:  clientEmail,
        subject: 'Innkalling til vakt',
        text: 'Du har blitt kalt inn til ' + arrnavn + ' som ' + rolle + ' den ' + arrdato + '. Gå inn på appen for å godta vakten.',
        html: 'Du har blitt kalt inn til ' + arrnavn + ' som ' + rolle + ' den ' + arrdato + '. Gå inn på appen for å godta vakten.'
      }
    })
  }

}
// Class that performs database queries related to users
class UserService {


  searchUser(input){
    return new Promise((resolve, reject) =>{
      connection.query('SELECT * FROM medlem where tlf = ? or epost = ? or brukernavn = ?', [input, input, input], (error, result)=>{
        if(error){
          reject(error);
          return;

        }
        resolve(result);
      });
    });
  }

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

  addUser (fornavn, etternavn, brukernavn, epost, medlemsnr, tlf, adresse, passord, postnr) {
    return new Promise((resolve, reject) =>{
    connection.query('INSERT INTO medlem (fornavn, etternavn, brukernavn, epost, id, tlf, adresse, passord, poststed_postnr) values (?, ?, ?, ?, ?, ?, ?, ?, ?)', [fornavn, etternavn, brukernavn, epost, medlemsnr, tlf, adresse, passord, postnr], (error, result) => {
      if(error){
        reject(error);
        return;
      }

      resolve();
    });
  });
  }

  getUserQualifications (id, callback) {
    return new Promise((resolve, reject) => {
    connection.query('SELECT navn, `gyldig til` FROM kvalifikasjon, medlem_kvalifikasjon WHERE m_id = 18124 AND k_id = kvalifikasjon.id ', [id], (error, result) => {

      if(error){
        reject(error);
        return;
      }

      resolve(result);
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

  editUser (email, adress, tlf, zip, id,) {
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
        let login = false
        if (result[0].passord === passord) {
          login = true
      }else{
          login = false
        }
        localStorage.setItem('signedInUser', JSON.stringify(result[0])); // Store User-object in browser
        resolve(login);
    });
  });
  }

  getSignedInUser(): ?User {
  let item: ?string = localStorage.getItem('signedInUser'); // Get User-object from browser
  if(!item) return null;

  return JSON.parse(item);
}
  signOut(): ?User {
  localStorage.removeItem('signedInUser');
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
        connection.query('SELECT *, arrangement.id as a_id from arrangement INNER JOIN medlem on kontaktperson = medlem.id where navn LIKE ?',[sok], (error, result) =>{
          if(error){
            reject(error);
            return;
          }
          resolve(result);
    });
  });

  }

  showArrangement(id){
    return new Promise((resolve, reject) =>{
      connection.query('SELECT * from arrangement where id = ?', [id], (error, result) =>{
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
  deaktiverBruker(id){
    return new Promise((resolve, reject)=>{
      connection.query('UPDATE medlem set aktiv = ? where id = ?', [false, id], (error, result)=>{
        if(error){
          reject(error);
          return;
        }

        console.log('Brukerene er deaktivert');
        resolve();
      });
    });
  }
  makeUserAdmin(id){
    return new Promise((resolve, reject)=>{
      connection.query('UPDATE medlem set admin = ? where id = ? ',[true, id], (error,result)=>{
        if(error){
          reject(error);
          return;
        }

        console.log('Brukeren er nå admin');
        resolve();
      });
    });
  }
  deleteAdmin(id){
    return new Promise((resolve, reject)=>{
      connection.query('UPDATE medlem set admin = ? where id = ? ',[false, id], (error,result)=>{
        if(error){
          reject(error);
          return;
        }

        console.log('Brukeren er ikke admin lengre');
        resolve();
      });
    });
  }
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
