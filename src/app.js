import React from 'react'
import ReactDOM from 'react-dom'
import { Link, HashRouter, Switch, Route } from 'react-router-dom'
import { userService, loginService, arrangementService } from './services'

let brukerid = null


class Menu extends React.Component {
  render () {
      if(brukerid != null){
    return (

      <div>
        Menu: <Link to='/start'>Start</Link>
              <Link to='/arrangement'>Arrangement</Link>
              <Link to='/minside'>Minside</Link>
      </div>
    );
  }
  return(
    <div>
    </div>
  )
  }
}

// Component that shows a list of all the customers
class Innlogging extends React.Component {
  render () {
    return (
      <div>
        <br />
        <table>
          <tbody>
            <tr>
              <td>Brukernavn: </td>
              <td><input type="text" ref="unInput" defaultValue="peter@test.no" /></td>
              <td><button ref="newUserButton">Ny bruker</button></td>
            </tr>
            <tr>
              <td>Passord: </td>
              <td><input type="password" ref="pwInput" defaultValue="12345" /> </td>
              <td><button ref="newPasswordButton">Glemt passord?</button></td>
            </tr>
            <tr>
              <td></td>
              <td><button ref="innlogginButton">Logg inn</button></td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>

    )
  }

  // Called after render() is called for the first time
  componentDidMount () {
    this.refs.innlogginButton.onclick = () => {
      loginService.checkLogin(this.refs.unInput.value, this.refs.pwInput.value, (login, medlemsnr) => {
        if (login) {
          console.log('Innlogget')
          brukerid = medlemsnr
          console.log(brukerid)
          this.props.history.push('/start')
        } else {
          console.log('Feil brukernavn eller passord')
        }
      })
    }
    this.refs.newPasswordButton.onclick = () => {
      this.props.history.push('/nyttpassord')
    }
    this.refs.newUserButton.onclick = () => {
      this.props.history.push('/nybruker')
    }
  };
}

class NyBruker extends React.Component {
  render () {
    return (
      <div>
        <table>
          <tbody>
            <tr>
              <td>Navn: </td>
              <td><input type="text" ref="navnInput" defaultValue="Peter" /></td>
            </tr>
            <tr>
              <td>Epost: </td>
              <td><input type="email" ref="epostInput" defaultValue='peter@test.no' /></td>
            </tr>
            <tr>
              <td>Medlemsnr: </td>
              <td><input type="number" ref="medlemsnrInput" defaultValue='18124'  /></td>
            </tr>
            <tr>
              <td>Telefonnummer: </td>
              <td><input type="number" ref="tlfInput" defaultValue='95485648' /></td>
            </tr>
            <tr>
              <td>Gateadresse: </td>
              <td><input type="text" ref="adresseInput" defaultValue='Brandhaugveita 4' /></td>
            </tr>
            <tr>
              <td>Postnummer: </td>
              <td><input type="text" ref="postnrInput" defaultValue='7012' /></td>
            </tr>
            <tr>
              <td>Poststed: </td>
              <td><input type="text" ref="poststedInput" defaultValue='Trondheim' /></td>
            </tr>
            <tr>
              <td>Passord: </td>
              <td><input type="password" ref="passwordInput1" defaultValue='12345' /></td>
            </tr>
            <tr>
              <td>Gjenta passord: </td>
              <td><input type="password" ref="passwordInput2" defaultValue='12345' /> </td>
            </tr>
          </tbody>
        </table>
        <button ref="createuserButton">Ferdig</button>
      </div>
    )
  }
  componentDidMount () {
    this.refs.createuserButton.onclick = () => {
      if (this.refs.passwordInput1.value === this.refs.passwordInput2.value) {
        userService.addUser(this.refs.navnInput.value, this.refs.epostInput.value, this.refs.medlemsnrInput.value, this.refs.tlfInput.value, this.refs.passwordInput1.value, () => {
          console.log('User added')
        })
      } else {
        alert('Passordene må være like')
      }
    }
  }
}

class NyttPassord extends React.Component {
  render () {
    return (
      <div>
        Epost: <input type='email' ref='nyEpostInput' />
        <button ref='newPasswordButton'>Be om nytt passord</button>
      </div>
    )
  }
  componentDidMount () {

  }
}

class StartSide extends React.Component {
  constructor() {
  super(); // Call React.Component constructor

  this.user = [];
  this.id = brukerid;
}
  render () {

    return (
      <div>
        <h1>Hei, {this.user.brukernavn}!</h1>
        Id: {this.id};
        <button ref='logOut'>Logg ut</button>
      </div>
    )
  }
  componentDidMount () {
    userService.getUser(this.id,(result) =>{
      console.log(this.id);
      this.user = result[0];
      console.log(this.user);
      this.forceUpdate();
    });
    this.refs.logOut.onclick = () =>{
      brukerid = null;
      this.props.history.push('/');
    }
  }
}

class Arrangement extends React.Component{
  constructor(){
    super();
    this.arrangement = [];
  }
  render(){
    let a = 10;
    let tableItems = [];
    for(let table of this.arrangement){
      tableItems.push(<tr key={a}><td>Navn</td><td>Kontaktperson</td></tr>,<tr key={table.id}><td>{table.navn}</td><td>{table.kontaktperson}</td></tr>)
      a++;
    }
    return(
      <div>
      <input type='text' ref='searchArrangement' onChange={ () =>{arrangementService.getArrangement(this.refs.searchArrangement.value + '%',(result)=>{this.arrangement= '';this.arrangement = result; this.forceUpdate();});}} />
      <button ref='searchButton'>Søk arrangement</button>
      <table>
      <tbody>
      {tableItems}
      </tbody>
      </table>
        <Link to='/nyttarrangement'>Nytt Arrangement</Link>
      </div>
    )
  }
  componentDidMount(){
  // this.refs.searchButton.onclick = () =>{
  //   arrangementService.getArrangement(this.refs.searchArrangement.value,(result)=>{
  //       this.arrangement = result;
  //       this.forceUpdate();
  //     });
  }
  }


class NyttArrangement extends React.Component{
  render(){
    return(
      <div>
        Navn: <input type="text" ref="a_name" defaultValue="Test" /> <br />
        Startdato: <input type="datetime-local" ref="a_startdate" /> <br /> {/*Autofyll med dagens dato*/}
        Sluttdato: <input type="datetime-local" ref="a_enddate" /> <br />
        Oppmøtetidspunkt: <input type="datetime-local" ref="a_meetdate" /> <br />
        Oppmøtested: <input type="text" ref="a_place" defaultValue="Her" /> <br />
        Beskrivelse: <textarea rows="4" cols="20" ref="a_desc" defaultValue="En tekstlig beskrivelse"/> <br />
        Kontaktperson: <br />
        Navn: <input type="text" ref="k_name" defaultValue="Lars" /> <br />
        Telefon: <input type="number" ref="k_tlf" defaultValue="95485648" /> <br />
      <button ref="arrangementButton">Lag arrangement</button>
      </div>
    )
  }
  componentDidMount(){
    this.refs.arrangementButton.onclick = () => {
      console.log(this.refs.a_startdate.value);
      arrangementService.addArrangement(this.refs.k_tlf.value, this.refs.a_name.value, this.refs.a_meetdate.value, this.refs.a_startdate.value, this.refs.a_enddate.value, this.refs.a_place.value, this.refs.a_desc.value, () => {
        console.log('Arrangement laget');
      })
    }

  }
}

class MineSider extends React.Component {
  render(){
    return(
      <div>
      Her skal din info vises
      </div>
    )
  }
  componentDidMount(){

  }
}
// The Route-elements define the different pages of the application
// through a path and which component should be used for the path.
// The path can include a variable, for instance
// path='/customer/:customerId' component={CustomerDetails}
// means that the path /customer/5 will show the CustomerDetails
// with props.match.params.customerId set to 5.
ReactDOM.render((
  <HashRouter>
    <div>
      <Menu />
      <Switch>
        <Route exact path='/' component={Innlogging} />
        <Route exact path='/start' component={StartSide} />
        <Route exact path='/nybruker' component={NyBruker} />
        <Route exact path='/nyttpassord' component={NyttPassord} />
        <Route exact path='/arrangement' component={Arrangement} />
        <Route exact path='/minside' component={MineSider} />
        <Route exact path='/nyttarrangement' component={NyttArrangement} />
      </Switch>
    </div>
  </HashRouter>
), document.getElementById('root'))
