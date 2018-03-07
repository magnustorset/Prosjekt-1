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
  getUsers (callback) {
    connection.query('SELECT * FROM medlem', (error, result) => {
      if (error) throw error

      callback(result)
    })
  }

  getUser (id, callback) {
    connection.query('SELECT * FROM medlem WHERE id=?', [id], (error, result) => {
      if (error) throw error

      callback(result[0])
    })
  }

  addUser (navn, epost, medlemsnr, tlf, passord, callback) {
    connection.query('INSERT INTO medlem (brukernavn, epost, id, tlf, passord) values (?, ?, ?, ?, ?)', [navn, epost, medlemsnr, tlf, passord], (error, result) => {
      if (error) throw error

      console.log('test')

      callback()
    })
  }

  editUser (firstName, city, id, callback) {
    connection.query('UPDATE medlem SET firstName = ?, city = ? WHERE id = ?', [firstName, city, id], (error, result) => {
      if (error) throw error

      callback()
    })
  }
}

class LoginService {
  checkLogin (brukernavn, passord, callback) {
    connection.query('SELECT * from medlem WHERE epost = ?', [brukernavn], (error, result) => {
      if (error) throw error
      let login = false
      let medlemsnr = null
      if (result[0].passord === passord) {
        login = true
        medlemsnr = result[0].medlem_nr
      } else {
        login = false
      }

      callback(login, medlemsnr)
    })
  }
}

let userService = new UserService()
let loginService = new LoginService()

export { userService, loginService }
