import mysql from 'mysql'
import nodemailer from 'nodemailer'
const passwordHash =require ('password-hash');

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
    return new Promise((resolve, reject) => {
      let message = {
        from: 'rodekorsprosjekt@2rz.no',
        to:  clientEmail,
        subject: 'Innkalling til vakt',
        text: 'Du har blitt kalt inn til ' + arrNavn + ' som ' + rolle + ' den ' + arrDato + '. Gå inn på appen for å godta vakten.',
        html: 'Du har blitt kalt inn til ' + arrNavn + ' som ' + rolle + ' den ' + arrDato + '. Gå inn på appen for å godta vakten.'
      }

      transporter.sendMail(message, (err, info) => {
        if (err) {
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
      resolve(result);
    });
  });
  }

  addUser (fornavn, etternavn, brukernavn, epost, medlemsnr, tlf, adresse, passord, postnr) {
    return new Promise((resolve, reject) =>{
    let pord = passwordHash.generate(passord);
    connection.query('INSERT INTO medlem (fornavn, etternavn, brukernavn, epost, id, tlf, adresse, passord, poststed_postnr) values (?, ?, ?, ?, ?, ?, ?, ?, ?)', [fornavn, etternavn, brukernavn, epost, medlemsnr, tlf, adresse, pord, postnr], (error, result) => {
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
      let pord = passwordHash.generate(passord);
      connection.query('UPDATE medlem SET passord = ? WHERE epost = ?', [pord, epost], (error, result) => {
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
      let pord = passwordHash.generate(password);
    connection.query('UPDATE medlem SET passord = ? WHERE id = ?', [pord, id], (error, result) => {
      if(error){
        reject(error);
        return;
      }
      resolve();
    });
  });
  }

  setPassive(from, to, id) {
    return new Promise((resolve, reject) => {
    connection.query('INSERT INTO passiv (m_id, f_dato, t_dato) values (?, ?, ?)', [id, from, to], (error, result) => {
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
        if (passwordHash.verify(passord,result[0].passord)) {
          login = true
          localStorage.setItem('signedInUser', JSON.stringify(result[0])); // Store User-object in browser
      }else{
          login = false
        }
        console.log(passwordHash.verify(passord,result[0].passord));
        console.log(login);

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
        console.log(result);
        if (result.length === 0) {
          reject(error);
          return;
        }else{
            m_id = result[0].id;
        }
        console.log(m_id);
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
          reject(error);
          return;
        }
      })
    })
  }
}

class ArrangementService {
  getYourArrangements(id){
    return new Promise((resolve, reject)=>{
      connection.query('SELECT a.navn,a.beskrivelse,a.starttidspunkt,a.sluttidspunkt from arrangement a inner join vakt v on v.a_id = a.id inner join medlem m on m.id = v.m_id where m.id = ?', [id] ,(error, result)=>{
        if(error){
          reject(error);
          return;
        }
        console.log(result);
        resolve(result);
      })
    })
  }
  getAllArrangement(){
    return new Promise((resolve, reject)=>{
      connection.query('SELECT * from arrangement',(error, result)=>{
        if(error){
          reject(error);
          return;
        }
        console.log(result);
        resolve(result);
      })
    })
  }
  addArrangement (tlf, navn, meetdate, startdate, enddate, desc, roller, longitude, latitude) {
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

          connection.query('INSERT INTO arrangement (navn, oppmootetidspunkt, starttidspunkt, sluttidspunkt,  beskrivelse, kontaktperson, longitute, latitute) values (?, ?, ?, ?, ?, ?, ?, ?)', [navn, meetdate, startdate, enddate, desc, k_id, longitude, latitude], (error, result) => {
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

  addShift(a_id, m_id, r_id){
    return new Promise((resolve, reject) =>{
      connection.query('UPDATE vakt SET m_id = ? WHERE a_id = ? AND r_id = ? AND m_id IS NULL LIMIT 1', [m_id, a_id, r_id], (error, result) =>{
        if(error){
          reject(error);
          return;
        }

        resolve(result);
      });
    });
  }

  getRoles(a_id) {
    return new Promise((resolve, reject) =>{
      connection.query('SELECT r_id, COUNT(r_id) as antall, navn FROM vakt INNER JOIN rolle on r_id = rolle.id WHERE a_id = ? GROUP BY r_id', [a_id], (error, result) =>{
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
  getAdminMelding(){
    return new Promise((resolve, reject) =>{
      connection.query('SELECT * from Adminmelding where id = ?',[1], (error, result) =>{
        if(error){
          reject(error);
          return;
        }

        resolve(result);
      });
    });
  }
  updateAdminMelding(input){
    return new Promise((resolve, reject) =>{
      connection.query('UPDATE Adminmelding set melding = ? where id = ?', [input, 1], (error, result) =>{
        if(error){
          reject(error);
          return;
        }

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


class VaktValg {
  static lagListe3(id) {
    return new Promise((resolve, reject) => {
      connection.query('SELECT ro.r_id, ro.m_id, le.brukernavn, le.interesse, le.vaktpoeng, 0 AS "registrert", 0 AS "opptatt" FROM ( SELECT rr.r_id, rr.antall, rr.m_id FROM ( SELECT r_id, COUNT(*) AS antall FROM rolle_kvalifikasjon rk GROUP BY r_id ) ra INNER JOIN ( SELECT r_id, m_id, COUNT(*) AS antall FROM medlem_kvalifikasjon mk INNER JOIN rolle_kvalifikasjon rk ON mk.k_id = rk.k_id GROUP BY r_id, m_id ) rr ON ra.r_id = rr.r_id WHERE ra.antall =  rr.antall ) ro INNER JOIN ( SELECT DISTINCT m.id, m.brukernavn, EXISTS (SELECT * FROM interesse i WHERE i.m_id = m.id AND i.a_id = ar.id) AS "interesse", m.vaktpoeng FROM passiv p  RIGHT JOIN medlem m ON p.m_id = m.id  LEFT JOIN vakt v ON m.id = v.m_id CROSS JOIN ( SELECT * FROM arrangement WHERE id = ? ) ar WHERE m.aktiv = true  AND NOT(ar.starttidspunkt BETWEEN IFNULL(p.f_dato, 0)  AND IFNULL(p.t_dato, 0)) AND NOT EXISTS(SELECT * FROM arrangement ai INNER JOIN vakt vi ON ai.id = vi.a_id WHERE IFNULL(vi.m_id, 0) = m.id AND IFNULL(ai.starttidspunkt, 0) = ar.starttidspunkt) AND NOT(m.id = ar.kontaktperson) ) le ON ro.m_id = le.id WHERE ro.r_id IN ( SELECT DISTINCT r_id FROM vakt WHERE a_id = ? )', [id, id], (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        console.log(result);
        resolve(result);
      });
    });
  }

  static getReg(id) {
    return new Promise((resolve, reject) => {
      connection.query('SELECT v.r_id, m.id AS m_id, m.brukernavn, EXISTS (SELECT * FROM interesse i WHERE i.m_id = m.id AND i.a_id = a.id) AS "interesse", m.vaktpoeng, r_id AS "registrert", r_id AS "opptatt" FROM arrangement a INNER JOIN vakt v ON a.id = v.a_id INNER JOIN medlem m ON v.m_id = m.id WHERE a.id = ?', [id], (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        console.log(result);
        resolve(result);
      });
    });
  }

  static setVakt(m_id, a_id, r_id) {
    return new Promise((resolve, reject) => {
      connection.query('UPDATE vakt SET m_id = ? WHERE a_id = ? AND r_id = ? AND m_id IS NULL LIMIT 1', [m_id, a_id, r_id], (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        console.log(result);
        resolve(result);
      });
    });
  }

  static removeVakt(m_id, a_id, r_id) {
    return new Promise((resolve, reject) => {
      connection.query('UPDATE vakt SET m_id = NULL WHERE a_id = ? AND r_id = ? AND m_id = ? LIMIT 1', [a_id, r_id, m_id], (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        console.log(result);
        resolve(result);
      });
    });
  }








}


class PassivService {
  static kanMeld(m_id, start, slutt) {
    return new Promise((resolve, reject) => {
      connection.query('SELECT COUNT(*) AS antall FROM medlem m WHERE m.id = ? AND NOT EXISTS ( SELECT * FROM passiv pi WHERE pi.m_id = m.id AND (? BETWEEN pi.f_dato AND pi.t_dato) OR (? BETWEEN pi.f_dato AND pi.t_dato)) AND NOT EXISTS ( SELECT * FROM arrangement ai INNER JOIN vakt vi ON ai.id = vi.a_id WHERE vi.m_id = m.id AND ((? BETWEEN ai.starttidspunkt AND ai.sluttidspunkt) OR (? BETWEEN ai.starttidspunkt AND ai.sluttidspunkt)))', [m_id, start, slutt, start, slutt], (error, result) => {
        if(error) {
          reject(error);
        }
        resolve(result);
      });
    });
  }
  static setPassiv(m_id, start, slutt) {
    return new Promise((resolve, reject) => {
      connection.query('INSERT INTO passiv VALUES(?, ?, ?)', [m_id, start, slutt], (error, result) => {
        if(error) {
          reject(error);
        }
        resolve(result);
      });
    });
  }
}


class UtstyrService {
  static getAllUtstyr() {
    return new Promise((resolve, reject) => {
      connection.query('SELECT * FROM utstyr', (error, result) => {
        if(error) {
          reject(error);
        }
        resolve(result);
      });
    });
  }
  static addUtstyr(navn) {
    return new Promise((resolve, reject) => {
      connection.query('INSERT INTO utstyr (navn) VALUES(?)', [navn], (error, result) => {
        if(error) {
          reject(error);
        }
        resolve(result);
      });
    });
  }
  static alterUtstyr(id, navn) {
    return new Promise((resolve, reject) => {
      connection.query('UPDATE utstyr SET navn = ? WHERE id = ?', [navn, id], (error, result) => {
        if(error) {
          reject(error);
        }
        resolve(result);
      });
    });
  }
  static removeUtstyr(id) {
    return new Promise((resolve, reject) => {
      connection.query('DELETE FROM utstyr WHERE id = ?', [id], (error, result) => {
        if(error) {
          reject(error);
        }
        resolve(result);
      });
    });
  }


  static getAllRU() {
    return new Promise((resolve, reject) => {
      connection.query('SELECT r_id, u_id, r.navn AS "r_navn", u.navn AS "u_navn", antall FROM utstyr u INNER JOIN r_utstyr ru ON u.id = ru.u_id INNER JOIN rolle r ON ru.r_id = r.id', (error, result) => {
        if(error) {
          reject(error);
        }
        resolve(result);
      });
    });
  }
  static addRU(r_id, u_id, antall) {
    return new Promise((resolve, reject) => {
      connection.query('INSERT INTO r_utstyr (r_id, u_id, antall) VALUES(?, ?, ?)', [r_id, u_id, antall], (error, result) => {
        if(error) {
          reject(error);
        }
        resolve(result);
      });
    });
  }
  static alterRU(r_id, u_id, antall) {
    return new Promise((resolve, reject) => {
      connection.query('UPDATE r_utstyr SET antall = ? WHERE r_id = ? AND u_id = ?', [antall, r_id, u_id], (error, result) => {
        if(error) {
          reject(error);
        }
        resolve(result);
      });
    });
  }
  static removeRU(r_id, u_id) {
    return new Promise((resolve, reject) => {
      connection.query('DELETE FROM r_utstyr WHERE r_id = ? AND u_id = ?', [r_id, u_id], (error, result) => {
        if(error) {
          reject(error);
        }
        resolve(result);
      });
    });
  }




}




export { userService, loginService, arrangementService, emailService, administratorFunctions, VaktValg, PassivService, UtstyrService }
