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
      <Link to='/bestemme' className="nav-link">administrator</Link>
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
      loginService.checkLogin(this.refs.unInput.value, this.refs.pwInput.value).then(([medlemsnr, login, admin]) => {
        if (login && admin) {
          console.log('Innlogget som admin');
          administrator = admin;
          brukerid = medlemsnr;
          this.props.history.push('/start');
        }
        if(login && !admin){
          console.log('Innlogget som bruker');
          brukerid = medlemsnr;
          this.props.history.push('/start');
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
    this.refs.newPasswordButton.onclick = () => {
      emailService.newPassword(this.refs.nyEpostInput.value)
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
        <Route exact path='/arrangement' component={Arrangement} />
        <Route exact path='/minside' component={MineSider} />
        <Route exact path='/nyttarrangement' component={NyttArrangement} />
        <Route exact path='/bestemme' component={Administrator} />
      </Switch>
    </div>
  </HashRouter>
), document.getElementById('root'))
