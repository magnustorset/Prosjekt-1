import React from 'react'
import ReactDOM from 'react-dom'
import { Link, HashRouter, Switch, Route } from 'react-router-dom'
import { userService, loginService, arrangementService, emailService } from './services'
let brukerid = null
let administrator = false
let klokke = 0

class ErrorMessage extends React.Component {
  constructor() {
    super();

    this.message = '';
  }

  render() {
    // Only show when this.message is not empty
    let displayValue;
    if(this.message=='') displayValue = 'none';
    else displayValue = 'inline';

    return (
      <div style={{display: displayValue}}>
        <b><font color='red'>{this.message}</font></b>
        <button ref='closeButton'>Close</button>
      </div>
    );
  }

  componentDidMount() {
    errorMessage = this;
    this.refs.closeButton.onclick = () => {
      this.message = '';
      this.forceUpdate();
    };
  }

  componentWillUnmount() {
    errorMessage = null;
  }

  set(message) {
    this.message = message;
    this.forceUpdate();
  }
}
let errorMessage; // ErrorMessage-instance

class Menu extends React.Component {
  render () {
      if(brukerid != null && administrator === true){
    return (
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="navbar-brand">
      <img src="src/test.png" width="30" height="30" className="d-inline-block align-top" alt="" />
      Røde Kors</div>
      <div className='navbar-header'>
  <button onClick={()=>{let kollaps = document.getElementById('navbarSupportedContent');
  kollaps.style.display ='none';
  if(klokke == 0){kollaps.style.display = 'inline'; klokke++}
  else if(klokke == 1){klokke++; kollaps.style.display = 'none';}
  if(kollaps.style.display =='none'){klokke=0;}}}
   className="navbar-toggler" type="button" data-toggle="collapse" data-target=".navbar-collapse" >
   <span className="navbar-toggler-icon"></span>
  </button>
  </div>
  <div className="navbar-collapse collapse" id="navbarSupportedContent" aria-expanded="false" aria-controls="navbarSupportedContent">
    <ul className="nav navbar-nav mr-auto">
      <li className="nav-item active">
      <Link to='/start' className='nav-link'>Start</Link>
      </li>
      <li className="nav-item">
        <Link to='/arrangement'className='nav-link'>Arrangement</Link>
      </li>
      <li className='nav-item'>
      <Link to='/minside'className='nav-link'><span className="glyphicon glyphicon-user"></span>Minside</Link>
      </li>
      <li className='nav-item'>
      <Link to='/bestemme' className="nav-link">Administrator</Link>
      </li>
    </ul>
    <ul className="nav navbar-nav navbar-right">
      <li>
      <input type='text' className='form-control' />
      </li>
    </ul>
  </div>
  </nav>
    );
  }
   if(brukerid != null && administrator === false){
     return(
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
    <div className="navbar-brand">
    <img src="src/test.png" width="30" height="30" className="d-inline-block align-top" alt="" />
    Røde Kors</div>
    <div className='navbar-header'>
<button onClick={()=>{let kollaps = document.getElementById('navbarSupportedContent');
kollaps.style.display ='none';
if(klokke == 0){kollaps.style.display = 'inline'; klokke++}
else if(klokke == 1){klokke++; kollaps.style.display = 'none';}
if(kollaps.style.display =='none'){klokke=0;}}}className="navbar-toggler" type="button" data-toggle="collapse" data-target=".navbar-collapse" >
 <span className="navbar-toggler-icon"></span>
</button>
</div>
<div className="navbar-collapse collapse" id="navbarSupportedContent">
  <ul className="navbar-nav mr-auto">
    <li className="nav-item active">
    <Link to='/start' className='nav-link'>Start</Link>
    </li>
    <li className="nav-item">
      <Link to='/arrangement'className='nav-link'>Arrangement</Link>
    </li>
    <li className='nav-item'>
    <Link to='/minside'className='nav-link'><span className="glyphicon glyphicon-user"></span>Minside</Link>
    </li>
  </ul>
  <ul className="nav navbar-nav navbar-right">
    <li>
    <input type='text' className='form-control' />
    </li>
  </ul>
</div>
</nav>
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
    // let divStyle = {
    // padding: '50px',
    // marginTop: '350px',
    // marginLeft: '600px',
    // marginRight: '450px',
    // backgroundColor: '#ffffcc'
    //   };
    // let tableStyle ={
    //   paddingBottom: '10px',
    //   paddingLeft: '10px'
    // }
    return (
      <div className='Rot'>
        <br />
        <table >
          <tbody>
            <tr>
              <td >Brukernavn: </td>
              <td ><input type="text" ref="unInput" defaultValue="sindre@test.no" /></td>
              <td ><button ref="newUserButton">Ny bruker</button></td>
            </tr>
            <tr>
              <td >Passord: </td>
              <td ><input type="password" ref="pwInput" defaultValue="passord" /> </td>
              <td ><button ref="newPasswordButton">Glemt passord?</button></td>
            </tr>
            <tr>
              <td></td>
              <td ><button className="btn btn-primary" ref="innlogginButton">Logg inn</button></td>
              <td ></td>
            </tr>
          </tbody>
        </table>
      </div>

    )
  }

  // Called after render() is called for the first time
  componentDidMount () {
    this.refs.innlogginButton.onclick = () => {
      loginService.checkLogin(this.refs.unInput.value, this.refs.pwInput.value).then(([medlemsnr, login, admin, aktiv]) => {
        if (login && admin && aktiv) {
          console.log('Innlogget som admin');
          administrator = admin;
          brukerid = medlemsnr;
          this.props.history.push('/start');
        }
        if(login && !admin && aktiv){
          console.log('Innlogget som bruker');
          brukerid = medlemsnr;
          this.props.history.push('/start');
        }
        if(!aktiv){
          alert('Administrator har ikke godkjent brukeren din enda.');
        }
      }).catch((error) => {
        if(errorMessage) errorMessage.set('Login feilet');
      });
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
              <td><input type="text" ref="postnrInput" defaultValue='0000' /></td>
            </tr>
            <tr>
              <td>Poststed: </td>
              <td><input type="text" ref="poststedInput" defaultValue='Test' /></td>
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
        <button ref='bakcButton'>Tilbake</button>
      </div>
    )
  }
  componentDidMount () {
    this.refs.bakcButton.onclick = () => {
      this.props.history.push('/');
    }
    this.refs.createuserButton.onclick = () => {
      if (this.refs.passwordInput1.value === this.refs.passwordInput2.value) {
        userService.addUser(this.refs.navnInput.value, this.refs.epostInput.value, this.refs.medlemsnrInput.value, this.refs.tlfInput.value,this.refs.adresseInput.value, this.refs.passwordInput1.value,this.refs.postnrInput.value).then(() => {
          console.log('User added')
        }).catch((error) => {
          if(errorMessage) errorMessage.set('Kunne ikke legge til ny bruker' +error);
        });
      }
    }
  }
}
let brukerEpost;
class NyttPassord extends React.Component {
  render () {
    return (
      <div>
        Epost: <input type='email' ref='nyEpostInput' /> <br />

        <button ref='newPasswordButton'>Be om nytt passord</button>
        <button ref='backButton'>Tilbake</button>
      </div>
    )
  }
  componentDidMount () {
    this.refs.newPasswordButton.onclick = () => {
      brukerEpost = this.refs.nyEpostInput.value
      let emailCheck = Math.floor(Math.random() * 100000);
      loginService.navn(emailCheck, brukerEpost).then(() => {
      })
      emailService.newPassword(brukerEpost, emailCheck).then(() => {
        console.log('Epost sendt');
        this.props.history.push('/kode')
      })

    }
    this.refs.backButton.onclick = () => {
      this.props.history.push('/')
    }
  }
}

class ResetPassord extends React.Component {
  constructor() {
    super()
  }

  render() {
    return (
      <div>
        <input type='text' ref='kodeInput' /> <br />
        <button ref='kodeButton'>Sjekk kode</button>
      </div>
    )
  }

  componentDidMount() {
    console.log(brukerEpost);
    this.refs.kodeButton.onclick = () => {
      loginService.emailCheck(brukerEpost, this.refs.kodeInput.value).then(() => {

      })
      }
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
    userService.getUser(this.id).then((result) =>{
      console.log(this.id);
      this.user = result[0];
      console.log(this.user);
      this.forceUpdate();
    }).catch((error) =>{
      if(errorMessage) errorMessage.set('Finner ikke bruker');
    });

    this.refs.logOut.onclick = () =>{
      brukerid = null;
      administrator = false;
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
      <input type='text' ref='searchArrangement' onChange={ () =>{arrangementService.getArrangement(this.refs.searchArrangement.value + '%').then((result)=>{this.arrangement= '';this.arrangement = result; this.forceUpdate();}).catch((error) =>{if(errorMessage) errorMessage.set('Finner ikke arrangement');});}} />
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
      arrangementService.addArrangement(this.refs.k_tlf.value, this.refs.a_name.value, this.refs.a_meetdate.value, this.refs.a_startdate.value, this.refs.a_enddate.value, this.refs.a_place.value, this.refs.a_desc.value).then(() => {
        console.log('Arrangement laget')
      }).catch((error) =>{
        if(errorMessage) errorMessage.set('Kunne ikke legge til arrangement');
      });
    }

  }
}

class MineSider extends React.Component {
  constructor() {
    super();

    this.user = [];
    this.id = brukerid;
  }
  render(){
    return(
      <div>
        <h1>Min Side</h1>

        <table>
          <tbody>
            <tr><td>Medlemmsnummer: {this.user.id}</td><td>Postnummer: {this.user.poststed_postnr}</td></tr>
            <tr><td>Epost: {this.user.epost}</td><td>Poststed: {this.user.poststed}</td></tr>
            <tr><td>Telefonnummer: {this.user.tlf}</td><td>Gateadresse: {this.user.adresse}</td></tr>
          </tbody>
        </table>
        <button ref='setPassive'>Meld deg passiv</button>
        <button ref='seeQualifications'>Se kvalifikasjoner</button>
        <button ref='changeInfo'>Endre personalia</button>
        <button ref='changePassword'>Endre passord</button>
        <button ref='makeAdmin'>Gjør bruker til admin '(for admin)'</button>
      </div>
    )
  }
  componentDidMount(){
    userService.getUser(this.id).then((result) =>{
      console.log(this.id);
      this.user = result[0];
      console.log(this.user);
      this.forceUpdate();
    }).catch((error) =>{
      if(errorMessage) errorMessage.set('Finner ikke bruker');
    });
    this.refs.changeInfo.onclick = () =>{
      this.props.history.push('/forandreinfo');
    }
    this.refs.changePassword.onclick = () =>{
      this.props.history.push('/forandrepassord');
    }
  }
}
class ForandreBrukerInfo extends React.Component {
  constructor() {
    super();

    this.user = [];
    this.id = brukerid;

  }
  render(){
    return(
      <div>
        <h1>Min Side {this.user.id}</h1>

        <table>
          <tbody>
            <tr><td>Medlemmsnummer:</td><td>Postnummer:<input type='number' ref='zipInput' /></td></tr>
            <tr><td>Epost: <input ref='emailInput' /></td><td>Poststed:</td></tr>
            <tr><td>Telefonnummer: <input type='number' ref='tlfInput' /></td><td>Gateadresse: <input ref='adressInput' /></td></tr>
          </tbody>
        </table>
        <button ref='saveButton'>Lagre forandringer</button>
        <button ref='cancelButton'>Forkast forandringer</button>
      </div>
    )
  }
  update() {
    userService.getUser(this.id).then((result) =>{
      this.refs.emailInput.value = result[0].epost;
      this.refs.tlfInput.value = result[0].tlf;
      this.refs.adressInput.value = result[0].adresse;
      this.refs.zipInput.value = result[0].poststed_postnr;
      this.forceUpdate();
    }).catch((error) =>{
      if(errorMessage) errorMessage.set('Finner ikke bruker');
    });
  }
  componentDidMount(){
    userService.getUser(this.id).then((result) =>{
      console.log(this.id);
      this.user = result[0];
      console.log(this.user);
      this.forceUpdate();
    }).catch((error) =>{
      if(errorMessage) errorMessage.set('Finner ikke bruker');
    });
    this.refs.cancelButton.onclick = () =>{
      this.props.history.push('/minside');
    }
    this.refs.saveButton.onclick = () =>{
      userService.editUser(this.refs.emailInput.value, this.refs.adressInput.value, this.refs.tlfInput.value, this.refs.zipInput.value, this.id).then(() =>{
      this.props.history.push('/minside');
    }).catch((error) =>{
      if(errorMessage) errorMessage.set('Klarte ikke å oppdatere bruker');
    });
    }
  this.update();
  }
}

class ForandrePassord extends React.Component {
  constructor() {
    super();

    this.user = [];
    this.id = brukerid;
  }
  render(){
    return(
      <div>
      <h2>Lag nytt passord</h2>
      Skriv inn nytt et passord:<input type='password' ref='passwordInput1' />

      Skriv på nytt igjen:<input type='password' ref='passwordInput2' />

      <button ref='saveButton'>Lagre nytt passord</button>
      <button ref='cancelButton'>Ikke lagre</button>
      </div>
    )
  }
    componentDidMount() {
      userService.getUser(this.id).then((result) =>{
        console.log(this.id);
        this.user = result[0];
        console.log(this.user);
        this.forceUpdate();
      }).catch((error) =>{
        if(errorMessage) errorMessage.set('Finner ikke bruker');
      });

      this.refs.saveButton.onclick = () =>{
          if(this.refs.passwordInput1.value === this.refs.passwordInput2.value) {

          userService.editPassword(this.refs.passwordInput1.value, this.id).then(() =>{
          
          this.props.history.push('/minside');
        }).catch((error) =>{
          if(errorMessage) errorMessage.set('Klarte ikke å oppdatere passord');
        });
        }
        else {
          alert('Passordfeltene må være like')
        }
    }

      this.refs.cancelButton.onclick = () =>{
        this.props.history.push('/minside');
      }
    }
}

class Administrator extends React.Component {
  render(){
    return(
      <div>
    Administrator muligheter kommer opp her.
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
    <ErrorMessage />
      <Menu />
      <Switch>
        <Route exact path='/' component={Innlogging} />
        <Route exact path='/start' component={StartSide} />
        <Route exact path='/nybruker' component={NyBruker} />
        <Route exact path='/nyttpassord' component={NyttPassord} />
        <Route exact path='/kode' component={ResetPassord} />
        <Route exact path='/arrangement' component={Arrangement} />
        <Route exact path='/minside' component={MineSider} />
        <Route exact path='/nyttarrangement' component={NyttArrangement} />
        <Route exact path='/bestemme' component={Administrator} />
        <Route exact path='/forandreinfo' component={ForandreBrukerInfo} />
        <Route exact path='/forandrepassord' component={ForandrePassord} />
      </Switch>
    </div>
  </HashRouter>
), document.getElementById('root'))
