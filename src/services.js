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

class VaktValg {
  static searchUser(input){
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

  static getArrangement () {
    return new Promise((resolve, reject) =>{
      connection.query('SELECT a.id AS arr_id, r_id AS rolle_id, a.navn AS arr_navn, r.navn AS rolle_navn, COUNT(*) AS antall, a.oppmootetidspunkt, a.starttidspunkt, a.sluttidspunkt FROM arrangement a INNER JOIN vakt v ON a.id = a_id INNER JOIN rolle r ON r_id = r.id GROUP BY a_id, r_id', (error, result) => {
        if(error){
          reject(error);
          return;
        }
        resolve(result);
      });
    });
  }

  static lagListe(id) {
    return new Promise((resolve, reject) =>{
      this.getArr(id).then((res)=>{
        let a = res[0];
        this.getAvailable(id, a.starttidspunkt, a.kontaktperson).then((res)=>{
          let available = res;
          this.getArrangementRoller(id).then((res)=>{
            let roller = res;
            console.log(roller);
            let rolleList = [];
            let proms = [];
            for (var i = 0; i < roller.length; i++) {
              console.log(roller[i].rolle_id);
              proms.push(this.getKvalified(roller[i].rolle_id).then((res) => {
                rolleList.push(res);
                console.log(rolleList);
                console.log('added kval-list');
              }).catch((err) => {
                console.log('Error with kval-list');
                console.log(err);
              }));
            }
            Promise.all(proms).then(() => {
              console.log('proms ferdig');

            }).catch(() => {
              console.log('proms feilet');
            });

            console.log('Finished kval-lists');

          }).catch(()=>{
            console.log('Feil med brukerListen.');
          });
        }).catch(()=>{
          console.log('Feil med brukerListen.');
        });
      }).catch(()=>{
        console.log('Feil med arrangementet.');
      });
    });

  }

  static lagListe2(id) {
    return new Promise((resolve, reject) =>{
      let data = {};
      let proms = [];

      proms[0] = this.getArr(id).then((res) => {
        data.arr = res[0];
        console.log('Got array.');
      }).catch((err) => {
        console.log('Error getting array.');
        console.log(err);
      });

      proms[1] = this.getArrangementRoller(id).then((res) => {
        data.roll = res;
        console.log('Got rolles');
      }).catch((err) => {
        console.log('Error getting rolles.');
        console.log(err);
      });

      Promise.all(proms).then((res) => {
        console.log(data);
        console.log(data.av);
        this.getAvailable(data.arr.id, data.arr.starttidspunkt, data.arr.kontaktperson).then((res) => {
          console.log('Got available members.');
          data.av = res;
          data.avId = [];
          data.kan = [];
          let proms = [];

          for (let i in data.av) {
            data.avId[i] = data.av[i].id;
          }
          for (let i in data.roll) {
            proms[i] = this.getKvalified(data.roll[i].rolle_id, data.avId).then((res) => {
              data.kan.push(res);
            }).catch((err) => {
              console.log('Error getting candidates.');
              console.log(err);
            });
          }
          Promise.all(proms).then((res) => {
            console.log(data);
            console.log('done');
          }).catch((err) => {
            console.log('Error finnishing all proms (2)');
            console.log(err);
          });
        }).catch((err) => {
          console.log('Error getting available members.');
          console.log(err);
        });
      }).catch((err) => {
        console.log('Error finnishing promises.');
        console.log(err);
      });
    });

  }

  static lagListe3(id) {
    return new Promise((resolve, reject) => {
      connection.query('SELECT ro.r_id, ro.m_id, le.brukernavn FROM ( SELECT rr.r_id, rr.antall, rr.m_id FROM ( SELECT r_id, COUNT(*) AS antall FROM rolle_kvalifikasjon rk GROUP BY r_id ) ra INNER JOIN ( SELECT r_id, m_id, COUNT(*) AS antall FROM medlem_kvalifikasjon mk INNER JOIN rolle_kvalifikasjon rk ON mk.k_id = rk.k_id GROUP BY r_id, m_id ) rr ON ra.r_id = rr.r_id WHERE ra.antall = rr.antall ) ro INNER JOIN ( SELECT DISTINCT m.id, m.brukernavn FROM passiv p RIGHT JOIN medlem m ON p.m_id = m.id LEFT JOIN vakt v ON m.id = v.m_id LEFT JOIN arrangement a ON v.a_id = a.id CROSS JOIN ( SELECT * FROM arrangement WHERE id = ? ) ar WHERE m.aktiv = true AND NOT(ar.starttidspunkt BETWEEN IFNULL(p.f_dato, 0) AND IFNULL(p.t_dato, 0)) AND NOT(IFNULL(a.starttidspunkt, 0) = ar.starttidspunkt) AND NOT(m.id = ar.kontaktperson) ) le ON ro.m_id = le.id WHERE ro.r_id IN ( SELECT DISTINCT r_id FROM vakt WHERE a_id = ? )', [id, id], (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(result);
      });
    });
  }

  static listKval() {
    return new Promise((resolve, reject) => {
      connection.query('SELECT ro.r_id, ro.m_id, le.brukernavn FROM ( SELECT rr.r_id, rr.antall, rr.m_id FROM ( SELECT r_id, COUNT(*) AS antall FROM rolle_kvalifikasjon rk GROUP BY r_id ) ra INNER JOIN ( SELECT r_id, m_id, COUNT(*) AS antall FROM medlem_kvalifikasjon mk INNER JOIN rolle_kvalifikasjon rk ON mk.k_id = rk.k_id GROUP BY r_id, m_id ) rr ON ra.r_id = rr.r_id WHERE ra.antall = rr.antall ) ro INNER JOIN ( SELECT DISTINCT id, brukernavn FROM medlem m WHERE m.aktiv = true ) le ON ro.m_id = le.id', (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(result);
      });
    });
  }

  static getAllRolls() {
    return new Promise((resolve, reject) => {
      connection.query('SELECT id, navn FROM rolle', (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(result);
      });
    });
  }

  static getAvailable(id, start, kont) {
    // console.log('SELECT m.id, m.brukernavn, m.vaktpoeng, (m.id IN (SELECT m_id FROM interesse WHERE a_id = ?)) AS "Interesse" FROM passiv p RIGHT JOIN medlem m ON p.m_id = m.id LEFT JOIN vakt v ON m.id = v.m_id LEFT JOIN arrangement a ON v.a_id = a.id WHERE m.aktiv = true  AND NOT(? BETWEEN IFNULL(p.f_dato, 0) AND IFNULL(p.t_dato, 0)) AND NOT(IFNULL(a.starttidspunkt, 0) = ?) AND NOT(m.id = ?), [' + id + ', ' + start + ', ' + start + ', ' + kont + ']');
    return new Promise((resolve, reject) =>{
      connection.query('SELECT m.id, m.brukernavn, m.vaktpoeng, (m.id IN (SELECT m_id FROM interesse WHERE a_id = ?)) AS "Interesse" FROM passiv p RIGHT JOIN medlem m ON p.m_id = m.id LEFT JOIN vakt v ON m.id = v.m_id LEFT JOIN arrangement a ON v.a_id = a.id WHERE m.aktiv = true  AND NOT(? BETWEEN IFNULL(p.f_dato, 0) AND IFNULL(p.t_dato, 0)) AND NOT(IFNULL(a.starttidspunkt, 0) = ?) AND NOT(m.id = ?)', [id, start, start, kont], (error, result) => {
        if(error){
          reject(error);
          return;
        }
        console.log(result);
        resolve(result);
      });
    });
  }

  static getArr(id) {
    return new Promise((resolve, reject) => {
      connection.query('SELECT id, starttidspunkt, kontaktperson FROM arrangement WHERE id = ?', [id], (error, result) => {

        if(error){
          reject(error);
          return;
        }
        resolve(result);
      });
    });
  }

  static getKvalified(r, pool) {
    return new Promise((resolve, reject) => {
      console.log(r);
      connection.query('SELECT m_id FROM rolle_kvalifikasjon rk INNER JOIN medlem_kvalifikasjon mk ON rk.k_id = mk.k_id WHERE r_id = ? AND m_id IN (?) GROUP BY m_id HAVING COUNT(*) = (SELECT COUNT(*) FROM rolle_kvalifikasjon WHERE r_id = ?);', [r, pool, r], (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        let res = [r, result]
        resolve(res);
      })
    })
  }

  static arrayTest() {
    return new Promise((resolve, reject) => {
      connection.query('SELECT id FROM medlem WHERE aktiv = 1', (error, result) => {
        if(error){
          reject(error);
          return;
        }
        console.log(result);
        let res = [];
        for (var i = 0; i < result.length; i++) {
          res[i] = result[i].id;
        }
        console.log(res);
        connection.query('SELECT * FROM medlem', (error, result) => {
          if(error){
            reject(error);
            return;
          }
          console.log(result);
          connection.query('SELECT * FROM medlem WHERE id IN (?)', [res], (error, result) => {
            if(error){
              reject(error);
              return;
            }
            console.log(result);
          });
        });
      });
    });
  }

  static getArrangementRoller(id) {
    return new Promise((resolve, reject) =>{
      connection.query('SELECT r.id AS rolle_id, COUNT(*) AS antall FROM arrangement a INNER JOIN vakt v ON a.id = a_id INNER JOIN rolle r ON r_id = r.id WHERE a.id = ? GROUP BY r_id', [id], (error, result) => {
        if(error){
          reject(error);
          return;
        }
        resolve(result);
      });
    });
  }
}



export { userService, loginService, arrangementService, emailService, administratorFunctions, VaktValg }
