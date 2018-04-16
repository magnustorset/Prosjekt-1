import React from 'react'
import ReactDOM from 'react-dom'
import { NavLink, Link, HashRouter, Switch, Route, Router } from 'react-router-dom'
import { userService, loginService, arrangementService, emailService, administratorFunctions, VaktValg } from './services'
import createHashHistory from 'history/createHashHistory';
import Popup from 'react-popup';
const history = createHashHistory();
const _ = require('lodash');
const { compose, withProps, lifecycle } = require('recompose')
const {
  withScriptjs,
  withGoogleMap,
  GoogleMap,
  Marker,
} = require('react-google-maps');
const { SearchBox } = require('react-google-maps/lib/components/places/SearchBox');

let brukerid = null
let administrator = false
let klokke = 0
let emailCode = false
let latitude = ''
let longitude = ''
let mapLat = ''
let mapLng = ''
let brukerEpost;
let vis = []

const MapWithASearchBox = compose(
  withProps({
    googleMapURL: "https://maps.googleapis.com/maps/api/js?key=AIzaSyB6bXXLKQ3YaTsHdzUVe5_56svleCvsip8&libraries=geometry,drawing,places",
    loadingElement: <div style={{ height: `100%` }} />,
    containerElement: <div style={{ height: `400px`, width: '400px'}} />,
    mapElement: <div style={{ height: `100%` }} />,
  }),
  lifecycle({
    componentWillMount() {
      let sted = 63.426387
      let stad = 10.392680
      const refs = {}

      this.setState({
        bounds: null,
        center: {
          lat: sted, lng: stad

        },
        markers: [],
        onMapMounted: ref => {
          refs.map = ref;
          console.log('Kartet lastet');

        },
        onBoundsChanged: () => {
          this.setState({
            bounds: refs.map.getBounds(),
            center: refs.map.getCenter(),
          })
        },
        onMarkerMounted: ref =>{
          refs.marker = ref;
          console.log('Markør');
        },
        onSearchBoxMounted: ref => {
          refs.searchBox = ref;
        },
       dragMarker(){
         let b = this.getPosition();
         this.setPosition(b);
         console.log(b.lat(),b.lng());
       },
       onMapClick(){
         let p = refs.marker.getPosition();
         console.log(p.lat(), p.lng());
       },
        onClick(){
          let a = this.getPosition();
          console.log(a.lat(),a.lng());
        },
        onPlacesChanged: () => {
          const places = refs.searchBox.getPlaces();
          const bounds = new google.maps.LatLngBounds();

          places.forEach(place => {
            if (place.geometry.viewport) {
              bounds.union(place.geometry.viewport)
            } else {
              bounds.extend(place.geometry.location)
            }
          });
          const nextMarkers = places.map(place => ({
            position: place.geometry.location,
          }));
          const nextCenter = _.get(nextMarkers, '0.position', this.state.center);

          this.setState({
            center: nextCenter,
            markers: nextMarkers,
          });
          let k = refs.marker.getPosition();
          latitude = k.lat();
          longitude = k.lng();
          console.log(latitude);
          console.log(longitude);
          // refs.map.fitBounds(bounds);
        },
      })
    },
  }),
  withScriptjs,
  withGoogleMap
  )(props =>
    <GoogleMap
    ref={props.onMapMounted}
    defaultZoom={15}
    center={props.center}
    onBoundsChanged={props.onBoundsChanged}
    onClick={props.onMapClick}
    >
      <SearchBox
      ref={props.onSearchBoxMounted}
      bounds={props.bounds}
      controlPosition={google.maps.ControlPosition.TOP_LEFT}
      onPlacesChanged={props.onPlacesChanged}
      >
        <input
          type="text"
          placeholder="Søk etter plass"
          style={{
          boxSizing: `border-box`,
          border: `1px solid transparent`,
          width: `240px`,
          height: `32px`,
          marginTop: `27px`,
          padding: `0 12px`,
          borderRadius: `3px`,
          boxShadow: `0 2px 6px rgba(0, 0, 0, 0.3)`,
          fontSize: `14px`,
          outline: `none`,
          textOverflow: `ellipses`,
          }}
        />
        </SearchBox>
        {props.markers.map((marker, index) =>
          <Marker
            ref={props.onMarkerMounted}
            key={index}
            position={marker.position}
            draggable={true}
            onDragEnd={props.dragMarker}
            onClick={props.onClick}
            />
          )}
          </GoogleMap>
);
const MapWithAMarker = compose(
  withProps({
    googleMapURL: "https://maps.googleapis.com/maps/api/js?key=AIzaSyB6bXXLKQ3YaTsHdzUVe5_56svleCvsip8&libraries=geometry,drawing,places",
    loadingElement: <div style={{ height: `100%` }} />,
    containerElement: <div style={{ height: `400px`, width: '400px'}} />,
    mapElement: <div style={{ height: `100%` }} />,
  }),
  lifecycle({

    componentWillMount() {
      const refs = {}


      this.setState({
        bounds: null,
        center: {
          lat: mapLat, lng: mapLng

        },
        onBoundsChanged: () => {
          this.setState({
            center:{
              lat: mapLat, lng: mapLng
            },
          })
        },
        markers: [],
        onMapMounted: ref => {
          refs.map = ref;
          console.log('Kartet lastet');

        },
        onMarkerMounted: ref =>{
          refs.marker = ref;
          console.log('Markør');
        },
      })
    },
  }),
  withScriptjs,
  withGoogleMap
  )(props =>
    <GoogleMap
    ref={props.onMapMounted}
    defaultZoom={15}
    center={props.center}
    onBoundsChanged={props.onBoundsChanged}
    >


          <Marker
            ref={props.onMarkerMounted}
            position={props.center}


            />

          </GoogleMap>
);

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
class Prompt extends React.Component {
    constructor(props) {
        super(props);


        this.state = {
            value: this.props.defaultValue
        };

        this.onChange = (e) => this._onChange(e);
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.value !== this.state.value) {
            this.props.onChange(this.state.value);
        }
    }

    _onChange(e) {
        let value = e.target.value;

        this.setState({value: value});
    }

    render() {
        return <input type="password" placeholder={this.props.placeholder} className="mm-popup__input" value={this.state.value} onChange={this.onChange} />;
    }
}

  /** Prompt plugin */
  Popup.registerPlugin('prompt', function (defaultValue, placeholder, callback) {
    let promptValue = null;

    let promptChange = function (value) {
        promptValue = value;
    };

    this.create({
        title: 'Skriv inn passordet ditt:',
        content: <Prompt onChange={promptChange} placeholder={placeholder} value={defaultValue} />,
        buttons: {
            left: [{
              text: 'Avbryt',
              classname: 'abort',
              action: function() {
                Popup.close();
              }
            }],
            right: [{
                text: 'Lagre',
                key: '⌘+s',
                className: 'success',
                action: function () {
                    callback(promptValue);
                    Popup.close();

                }
            }]
        }
    });
});





class Menu extends React.Component {
  render () {
      let signedInUser = loginService.getSignedInUser();
      if(signedInUser && signedInUser.admin === 1){
    return (
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="navbar-brand">
          <img src="src/test.png" width="30" height="30" className="d-inline-block align-top" alt="" />
        Røde Kors</div>

      <div className='navbar-header'>
        <button onClick={()=>{this.collapseNavbar()}}
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
          <li className='hopp'>
            <input  ref='serachFieldUser' type='text' className='form-control' />
          </li>
          <li>
          <button  ref='serachUsersButton' className='form-control' onClick={()=>{this.searchUsers();}}><span className='glyphicon glyphicon-search' /></button>
          </li>
          <li className='spaceBetweenSearchAndLogout'>
          <button  className='button' onClick={() => {this.logOut()}}><span className='glyphicon glyphicon-log-out' /></button>
          </li>
        </ul>
      </div>
  </nav>
    );
  }
   if(signedInUser){
     return(
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
    <div className="navbar-brand">
    <img src="src/test.png" width="30" height="30" className="d-inline-block align-top" alt="" />
    Røde Kors</div>
    <div className='navbar-header'>
    <button onClick={()=>{this.collapseNavbar()}}className="navbar-toggler" type="button" data-toggle="collapse" data-target=".navbar-collapse" >
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
    <li className='hopp'>
      <input  ref='serachFieldUser' type='text' className='form-control' />
    </li>
    <li>
  <button  ref='serachUsersButton' className='form-control' onClick={()=>{this.searchUsers();}}>Søk</button>
    </li>
    <li className='spaceBetweenSearchAndLogout'>
    <button  className='button' onClick={() => {this.logOut()}}><span className='glyphicon glyphicon-log-out' /></button>
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
  collapseNavbar(){
    let kollaps = document.getElementById('navbarSupportedContent');
    kollaps.style.display ='none';
    if(klokke == 0){kollaps.style.display = 'inline'; klokke++}
    else if(klokke == 1){klokke++; kollaps.style.display = 'none';}
    if(kollaps.style.display =='none'){klokke=0;}
  }
  searchUsers(){
      userService.searchUser(this.refs.serachFieldUser.value).then((result) =>{
        if(history.location.pathname === '/sokeResultat'){
          vis = result;
          console.log(vis);
          sok.update();
          this.refs.serachFieldUser.value = '';
        }else{
          vis = result;
          history.push('sokeResultat')
          this.refs.serachFieldUser.value = '';
        }
      }).catch((error)=>{
        if(errorMessage) errorMessage.set('Finner ikke brukeren du søker etter' + error);
      });
    }
    logOut(){
      loginService.signOut();
      history.push('/')
    }
  }

class Innlogging extends React.Component {
  render () {

    return (
      <div>
      <div className='Rot container'>
      <form>
      <div className='form-group' id='bilde'>
        <img src='src/Test.png' />
      </div>
        <div className='form-group'>
          <label htmlFor='brukernavn'>Brukernavn:</label>
          <input type="text" ref="unInput" className="form-control col-6" defaultValue="sindersopp@hotmail.com" name='brukernavn'/>
        </div>
        <div className='form-group'>
          <label htmlFor='passord'>Passord:</label>
          <input type="password" ref="pwInput" className="form-control col-4" defaultValue="passord" name='passord'/>
        </div>
        <div className='form-group'>
          <button className="btn btn-primary" ref="innlogginButton">Logg inn</button>
        </div>
        <div className='form-group'>
          <button className='btn-default' ref="newUserButton">Ny bruker</button>
          <button className='btn-default' ref="newPasswordButton">Glemt passord?</button>
        </div>
        </form>
      </div>

      </div>
    )
  }

  // Called after render() is called for the first time
  componentDidMount () {
    this.refs.innlogginButton.onclick = () => {
      loginService.checkLogin(this.refs.unInput.value, this.refs.pwInput.value).then((login) => {
        let signedInUser = loginService.getSignedInUser();
        if (login && signedInUser.admin === 1 && signedInUser.aktiv === 1) {
          console.log('Innlogget som admin');
          brukerid = signedInUser.id;
          administrator = true;
          this.props.history.push('/start');
        }
        if(login && signedInUser.admin !=1 && signedInUser.aktiv === 1){
          console.log('Innlogget som bruker');
          brukerid = signedInUser.id;
          this.props.history.push('/start');
        }
        if(signedInUser.aktiv != 1){
          localStorage.removeItem('signedInUser');
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
            <td>Fornavn: </td>
            <td><input type="text" ref="fornavnInput" defaultValue="Peter" /></td>
          </tr>
          <tr>
            <td>Etternavn: </td>
            <td><input type="text" ref="etternavnInput" defaultValue="Peter" /></td>
          </tr>
            <tr>
              <td>Brukernavn: </td>
              <td><input type="text" ref="brukernavnInput" defaultValue="Peter" /></td>
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
        userService.addUser(this.refs.fornavnInput.value, this.refs.etternavnInput.value, this.refs.brukernavnInput.value, this.refs.epostInput.value, this.refs.medlemsnrInput.value, this.refs.tlfInput.value,this.refs.adresseInput.value, this.refs.passwordInput1.value,this.refs.postnrInput.value).then(() => {
          console.log('User added')
          this.props.history.push('/');
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
        Epost: <input type='email' ref='nyEpostInput' defaultValue='magnus.torset@gmail.com' /> <br />

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
        console.log('Riktig kode');
        emailCode = true
        this.props.history.push('/resetpassord')
      })
      }
    }
  }

  class NyttResetPassord extends React.Component {
    constructor() {
      super()
    }

    render() {
      return (
        <div>
          Passord: <input type='password' ref='passordInput1' /> <br />
          Gjenta passord: <input type='password' ref='passordInput2' /> <br />
          <button ref='byttPassordButton'>Bytt passord</button>
        </div>
      )
    }

    componentDidMount() {
      this.refs.byttPassordButton.onclick = () => {
        if (emailCode && this.refs.passordInput1.value === this.refs.passordInput2.value) {
          userService.newPassword(this.refs.passordInput1.value, brukerEpost).then(() => {
            console.log('Passord byttet');
            this.props.history.push('/')
          })
        }
      }
    }
  }

class StartSide extends React.Component {
  constructor() {
  super(); // Call React.Component constructor
  let signedInUser = loginService.getSignedInUser();
  this.user = [];
  this.id = signedInUser.id;

  this.state = {
    adminMelding: ''
  }
  this.handleChange = this.handleChange.bind(this);
  }
  handleChange(event){
    const target = event.target;
    const value = event.target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  }
  render () {
    return (
      <div className='startside'>
        <h1>Hei, {this.user.brukernavn}!</h1>
        <textarea name='adminMelding' value={this.state.adminMelding} onChange={this.handleChange} />
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
    administratorFunctions.getAdminMelding().then((result) =>{
      this.state.adminMelding = result[0].melding;
      this.forceUpdate();
    }).catch((error) =>{
      if(errorMessage) errorMessage.set('Finner ikke melding' + error);
    });

    }
  }


class Arrangement extends React.Component{
  constructor(){
    super();
    this.arrangement = [];
  }
  render(){
    let a = 100;
    let tableItems = [];
    for(let table of this.arrangement){
      tableItems.push(<tr key={a}><td className='arrangementTable' >Navn</td><td className='arrangementTable'>Kontaktperson</td></tr>,<tr key={table.a_id}><td><Link className='arrangementLink' to={'/visArrangement/'+table.a_id}>{table.navn}</Link></td><td><Link className='arrangementLink' to={'/bruker/'+table.kontaktperson}>{table.fornavn + " " + table.etternavn}</Link></td></tr>)
      a++;
    }
    let signedInUser = loginService.getSignedInUser();
    if(signedInUser.admin === 1)
    {
      return(
        <div className='table-responsive'>
          <table>
            <thead>
              <tr>
                <td>
                <input type='text' ref='searchArrangement' />
                <button ref='searchButton' onClick={ () =>{this.hentArrangement( )}}>Søk arrangement</button>
                </td>
                <td>
                  <Link to='/nyttarrangement'>Nytt Arrangement</Link>
                </td>
              </tr>
            </thead>
            <tbody>
              {tableItems}
            </tbody>
          </table>
        </div>
      )
    }
    return(
      <div>
        <input type='text' ref='searchArrangement'  />
        <button ref='searchButton'onClick={ () => {this.hentArrangement()}}>Søk arrangement</button>
        <table>
          <tbody>
            {tableItems}
          </tbody>
        </table>
      </div>
    )
  }
  hentArrangement(){
    arrangementService.getArrangement(this.refs.searchArrangement.value + '%').then((result) => {
      console.log(result);
      this.arrangement= '';
      this.arrangement = result;
      this.forceUpdate();
    }).catch((error) => {
      if(errorMessage) errorMessage.set('Finner ikke arrangement');
    });
  }
  }

class NyttArrangement extends React.Component{
  constructor() {
    super();
    this.linjer = 1
  }
  render(){
    let table = [];
    for (let i = 0; i < this.linjer; i++) {
      table.push(<tr>
        <td>Rolle id: <input type="number" step="1"/></td>
        <td>Antall: <input type="number" step="1"/></td>
      </tr>);
    }
    console.log(table);
    return(
      <div>
        Navn: <input type="text" ref="a_name" defaultValue="Test" /> <br />
        Startdato: <input type="datetime-local" ref="a_startdate" /> <br /> {/*Autofyll med dagens dato*/}
        Sluttdato: <input type="datetime-local" ref="a_enddate" /> <br />
        Oppmøtetidspunkt: <input type="datetime-local" ref="a_meetdate" /> <br />
        Oppmøtested: <MapWithASearchBox /> <br />
        Beskrivelse: <textarea rows="4" cols="20" ref="a_desc" defaultValue="En tekstlig beskrivelse"/> <br />
        Kontaktperson: <br />
        Navn: <input type="text" ref="k_name" defaultValue="Lars" /> <br />
        Telefon: <input type="number" ref="k_tlf" defaultValue="95485648" /> <br />
        <table>
          <tbody id="rolleTable">
            {table}
          </tbody>
        </table>
        <button ref="tableTest">Tabell test</button>
        <button ref="tableAdd">Tabell add</button><br />
        <button ref="arrangementButton">Lag arrangement</button>
      </div>
    )
  }
  tabelGreie() { //Må endre navn senere
    let table = document.getElementById("rolleTable").children;
    console.log(table);
    let id;
    let count;
    let arr = [];
    for (let tab of table) {
      id = (tab.children[0].children[0].value === "") ? -1 : +tab.children[0].children[0].value;
      count = (tab.children[1].children[0].value === "") ? -1 : +tab.children[1].children[0].value;
      if(id >= 0 && count >= 0){
        arr.push({id: id, antall: count});
      }
    }
    return arr;
  }
  componentDidMount(){
    this.refs.arrangementButton.onclick = () => {
      console.log(this.refs.a_startdate.value);
      let roller = this.tabelGreie();
      console.log(roller);
      arrangementService.addArrangement(this.refs.k_tlf.value, this.refs.a_name.value, this.refs.a_meetdate.value, this.refs.a_startdate.value, this.refs.a_enddate.value, this.refs.a_desc.value, roller, longitude,latitude).then(() => {
        console.log('Arrangement laget')
      }).catch((error) =>{
        if(errorMessage) errorMessage.set('Kunne ikke legge til arrangement');
      });
    }
    //document.getElementById("rolleTable").children

    this.refs.tableTest.onclick = () => {
      this.tabelGreie();
    };

    this.refs.tableAdd.onclick = () => {
      this.linjer++;
      this.forceUpdate();
    };

  }
}

class MineSider extends React.Component {
  constructor() {
    super();
    let signedInUser = loginService.getSignedInUser();
    this.user = [];
    this.id = signedInUser.id;
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
            <tr><td>Passiv fra: <input type='date' ref='passivFra' /></td><td>Passiv til: <input type='date' ref='passivTil' /></td></tr>
          </tbody>
        </table>
        <button ref='setPassive'>Meld deg passiv</button>
        <button ref='seeQualifications'>Se kvalifikasjoner</button>
        <button ref='changeInfo'>Endre personalia</button>
        <button ref='changePassword'>Endre passord</button>
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
    this.refs.setPassive.onclick = () => {
      userService.setPassive(this.refs.passivFra.value, this.refs.passivTil.value, this.id).then(() => {
        console.log('Satt passiv fra ' + this.refs.passivFra.value + ' til ' + this.refs.passivTil.value);
      }).catch((error) =>{
        if(errorMessage) errorMessage.set('Kunne ikke sette deg passiv');
      });
    }
    this.refs.changeInfo.onclick = () =>{
      this.props.history.push('/forandreinfo');
    }
    this.refs.changePassword.onclick = () =>{
      this.props.history.push('/forandrepassord');
    }
    this.refs.seeQualifications.onclick = () =>{
      this.props.history.push('/sekvalifikasjoner');
    }
  }
}

class ForandreBrukerInfo extends React.Component {
  constructor() {
    super();

    let signedInUser = loginService.getSignedInUser();
    let bolle = 5;
    this.user = [];
    this.id = signedInUser.id;

  }
  render(){
    return(
      <div>
        <h1>Min Side </h1>

        <table>
          <tbody>
            <tr><td>Medlemmsnummer: {this.user.id}</td><td>Postnummer:<input type='number' ref='zipInput' /></td></tr>
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
      let email = this.refs.emailInput.value;
      let adress = this.refs.adressInput.value;
      let tlf = this.refs.tlfInput.value;
      let zip = this.refs.zipInput.value;
      let vip = this.id;

      let thePassword = this.user.passord;

      /** Call the plugin */
      Popup.plugins(email, adress, tlf, zip, vip, thePassword).prompt('', 'Passord', function (value,signedInUser) {

          if(value === thePassword){
            userService.editUser(email, adress, tlf, zip, vip).then(() =>{
              history.push('/minside');
          }).catch((error) =>{
            if(errorMessage) errorMessage.set('Klarte ikke å oppdatere bruker');
          });
          alert('Brukerinfo oppdatert.');



         }
         else{
           alert('Du må skrive inn riktig passord for å endre din personlige informasjon!');
         }
      });


    // this.props.history.push('/minside');
    }
  this.update();
  }
}

class ForandrePassord extends React.Component {
  constructor() {
    super();

    let signedInUser = loginService.getSignedInUser();
    this.user = [];
    this.id = signedInUser.id;
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
        let password1 = this.refs.passwordInput1.value;
        let password2 = this.refs.passwordInput2.value;

        let thePassword = this.user.passord;
        let currentId = this.user.id;
        if (password1 === password2){
          Popup.plugins(password1,thePassword,currentId).prompt('', 'Passord', function (value) {
              if(value === thePassword){
                userService.editPassword(password1, currentId).then(() =>{
              }).catch((error) =>{
                if(errorMessage) errorMessage.set('Klarte ikke å oppdatere passord');
              });
              alert('Passordet ble endret.');
             }
             else{
               alert('Passordet stemte ikke.');
             }
          });
          this.props.history.push('/minside');
        }
        else{
          alert('Passordfeltene må være like!')
        }
  }


      this.refs.cancelButton.onclick = () =>{
        this.props.history.push('/minside');
      }
    }
}

class SeKvalifikasjoner extends React.Component {
  constructor() {
    super();

    this.user = [];
    this.kvalifikasjoner = [];
    this.id = brukerid;

  }
  render(){
    let counter = 0;
    let kvalList = [];
    for(let kval of this.kvalifikasjoner){
      console.log(kval);
      kvalList.push(<li key={counter}>{kval.navn}</li>);
      counter++;
    }
    return(
      <div>
        <h2>Kvalifikasjoner</h2>
        <ul>{kvalList}</ul>
        <button ref='tilbakeKnapp'>Gå tilbake</button>
      </div>
    )
  }
  componentDidMount() {
    userService.getUserQualifications(this.id).then((qualifications) => {
      this.kvalifikasjoner = qualifications;

      this.forceUpdate();
    }).catch((error: Error) => {
      if(errorMessage) errorMessage.set("Failed getting qualifications");
    });
    this.refs.tilbakeKnapp.onclick = () =>{
      this.props.history.push('/minside');
    }

  }
}

class Administrator extends React.Component{
  render(){
    return(
      <div className='table-responsive'>
      <table style={{width: '100%'}}>
        <thead>
          <tr>
            <td style={{width: '30%'}}>
              <div><strong>Brukere som må godkjennes</strong></div>
            </td>
            <td style={{width: '30%'}}>
              <div><strong>Godkjenn vaktbytter</strong></div>
            </td>
            <td style={{width: '30%'}}>
              <div><strong>Annet</strong></div>
            </td>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td valign='top' style={{width: '30%'}}>
              <GodkjennBruker />
            </td>
            <td valign='top'>

            </td>
            <td>
            </td>
          </tr>
          <tr>
            <td>
            <textarea ref='adminMelding' />
            <button ref='RegistrerAdminMelding'>Commit</button>
            </td>
            <td>
            </td>
            <td>
            </td>
          </tr>
        </tbody>
      </table>
      </div>
    )
  }
  componentDidMount(){
    this.refs.RegistrerAdminMelding.onclick = ()=> {
      administratorFunctions.updateAdminMelding(this.refs.adminMelding.value);
    }
  }
}


class GodkjennBruker extends React.Component {
  constructor(){
    super();
    this.ikkeAktive = [];
  }
  render(){
    let brukerListe = [];
    for(let bruker of this.ikkeAktive){
      brukerListe.push(<li key={bruker.id}><Link to={'/bruker/'+bruker.id}>{bruker.fornavn},{bruker.etternavn}</Link> <button onClick={() =>{this.godkjenneBruker(bruker.id)}} >Godkjenne</button></li>)
    }
    return(
      <div>
    <ul>
    {brukerListe}
    </ul>
      </div>
    );
  }
  godkjenneBruker(id) {
    administratorFunctions.aktiverBruker(id).then(()=>{
      console.log('Bruker er aktivert')
      administratorFunctions.ikkeAktiveBrukere().then((result)=>{
        this.ikkeAktive = result;
        this.forceUpdate();
      }).catch((error)=>{
        if(errorMessage){errorMessage.set('Kunne ikke hente brukere' +error)};
      });
    }).catch((error)=>{
      if(errorMessage){errorMessage.set('Kunne ikke aktivere bruker' +error)};
    });
  }
  componentDidMount() {

    administratorFunctions.ikkeAktiveBrukere().then((result)=>{
      this.ikkeAktive = result;
      this.forceUpdate();
    }).catch((error)=>{
      if(errorMessage) errorMessage.set('Kunne ikke laste ikke aktiv brukere' + error);
    });
  }
}

class VisSøkeResultat extends React.Component {
  constructor(){
    super();

    this.sokeResultat = vis;
  }
  render(){
   let resultat = [];
   for(let result of this.sokeResultat){
     resultat.push(<li key={result.id}><Link to={'/bruker/'+result.id}>{result.fornavn}, {result.etternavn}</Link></li>);
   }
    return(
      <div>
      <ul>
      {resultat}
      </ul>
      <button onClick={() =>{this.props.history.goBack();}}>Gå tilbake</button>
      </div>
    );
  }

  componentDidMount(){
  sok = this;
  }
  update(){
  this.sokeResultat = vis;
  this.forceUpdate();
  }
}

let sok;
class BrukerSide extends React.Component {
  constructor(props) {
    super(props)
    this.id = props.match.params.id;
    this.user = {}
  }
  render() {
    let signedInUser = loginService.getSignedInUser();
    if (signedInUser.admin === 1 && this.user.admin === 0) {
      return(
        <div>
          <div className="table-responsive">
          <table className='table'>
            <thead>
              <tr>
                <th>{this.user.fornavn}, {this.user.etternavn}</th>
                <th>{this.user.id}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Telefon: </td>
                <td>{this.user.tlf}</td>
                <td>E-post:</td>
                <td>{this.user.epost}</td>
                <td>Vaktpoeng: </td>
                <td>{this.user.vaktpoeng}</td>
              </tr>
              <tr>
                <td>Adresse: </td>
                <td>{this.user.adresse}</td>
                <td>Postnr:</td>
                <td>{this.user.postnr}</td>
                <td>Poststed:</td>
                <td>{this.user.poststed}</td>
              </tr>
              <tr>
              <td><button onClick={() =>{this.makeAdmin()}}>Gjør bruker admin</button></td>
              <td><button onClick={() =>{this.deaktiverBruker()}}>Deaktiver bruker</button></td>
              </tr>
            </tbody>
          </table>
            <button onClick={() =>{this.props.history.goBack();}}>Gå tilbake</button>
          </div>
        </div>
      )
    }
      if(signedInUser.admin === 1 && this.user.admin === 1){
        return(
          <div>
            <div className="table-responsive">
            <table className='table'>
              <thead>
                <tr>
                  <th>{this.user.fornavn}, {this.user.etternavn}</th>
                  <th>{this.user.id}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Telefon: </td>
                  <td>{this.user.tlf}</td>
                  <td>E-post:</td>
                  <td>{this.user.epost}</td>
                  <td>Vaktpoeng: </td>
                  <td>{this.user.vaktpoeng}</td>
                </tr>
                <tr>
                  <td>Adresse: </td>
                  <td>{this.user.adresse}</td>
                  <td>Postnr:</td>
                  <td>{this.user.postnr}</td>
                  <td>Poststed:</td>
                  <td>{this.user.poststed}</td>
                </tr>
                <tr>
                <td><button onClick={() =>{this.deleteAdmin()}}>Fjern bruker som admin</button></td>
                <td><button onClick={() =>{this.deaktiverBruker()}}>Deaktiver bruker</button></td>
                </tr>
              </tbody>
            </table>
              <button onClick={() =>{this.props.history.goBack();}}>Gå tilbake</button>
            </div>
          </div>
        )
    }else{
      return(
        <div>
          <div className="table-responsive">
          <table className='table'>
            <thead>
              <tr>
                <th>{this.user.fornavn}, {this.user.etternavn}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Telefon: </td>
                <td>{this.user.tlf}</td>
                <td>E-post:</td>
                <td>{this.user.epost}</td>
              </tr>
            </tbody>
          </table>
            <button onClick={() =>{this.props.history.push('/start');}}>Gå tilbake</button>
          </div>
        </div>
      )
    }
  }
  deaktiverBruker(){
    administratorFunctions.deaktiverBruker(this.user.id);
  }
  deleteAdmin(){
    administratorFunctions.deleteAdmin(this.user.id);
  }
 makeAdmin(){
   administratorFunctions.makeUserAdmin(this.user.id);
 }
  componentDidMount() {
    userService.getUser(this.id).then((result) => {
      this.user = result[0];
      this.forceUpdate();
    })
  }
}


class VisArrangement extends React.Component {
  constructor(props) {
    super(props)
    this.id = props.match.params.id;
    this.arrangement = [];
    this.user = [];
  }
  render(){

    return(
      <div>
        <table>
          <tbody>
            <tr>
              <td>Arrangement navn:</td><td>{this.arrangement.navn}</td>
            </tr>
            <tr>
              <td>Arrangement beskrivelse:</td><td>{this.arrangement.beskrivelse}</td>
            </tr>
            <tr>
              <td>Kontaktperson:</td><td><Link to={'/bruker/'+this.user.id}>{this.user.fornavn}, {this.user.etternavn}</Link></td>
            </tr>
            <tr>
              <td>Oppmøtetidspunkt:</td>
              <td>{this.changeDate(this.arrangement.oppmootetidspunkt)}</td>
            </tr>
            <tr>
              <td>Starttidspunkt:</td>
              <td>{this.changeDate(this.arrangement.starttidspunkt)}</td>
            </tr>
            <tr>
              <td>Sluttidspunkt:</td>
              <td>{this.changeDate(this.arrangement.sluttidspunkt)}</td>
            </tr>
            <tr>
              <td>Oppmøtested:</td>
            </tr>
            <tr>
            <td><div><MapWithAMarker /></div></td>
            </tr>
            <tr>
              <td><button ref='endreArrangement'>Endre arrangementet</button></td>
              <td><button ref='brukerInnkalling'>Kall inn</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    )
  }
  changeDate(variabel){
    let a = moment(variabel).format('DD.MM.YY HH:mm');
    return a;
  }
  componentWillUnmount(){
    mapLat = '';
    mapLng = '';
    }
  componentDidMount(){
    arrangementService.showArrangement(this.id).then((result)=>{
      this.arrangement = result[0];
      mapLat = this.arrangement.latitute;
      mapLng = this.arrangement.longitute;
    this.forceUpdate();
      userService.getUser(result[0].kontaktperson).then((result)=>{
        this.user = result[0];
        this.forceUpdate();
      }).catch((error)=>{
        if(errorMessage) errorMessage.set('Finner ikke bruker');
      });
    }).catch((error)=>{
      if(errorMessage) errorMessage.set('Finner ikke dette arrangementet'+ error);
    });
    this.refs.endreArrangement.onclick = () =>{
      this.props.history.push('/endreArrangement/'+this.arrangement.id);
    }
    this.refs.brukerInnkalling.onclick = () =>{
      console.log('/innkalling/'+this.arrangement.id);
      this.props.history.push('/inkalling/'+this.arrangement.id);
    }

  }
}

class EndreArrangement extends React.Component {
  constructor(props){
    super(props);
    this.arrangement = [];
    this.id = props.match.params.id;
    this.user = [];
    this.state = {beskrivelse: '',
                  oppmootetidspunkt: '',
                  starttidspunkt: '',
                  sluttidspunkt: ''
                  };

    this.handleChange = this.handleChange.bind(this);
  }
  handleChange(event){
    const target = event.target;
    const value = event.target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  }
  render(){
    return(
      <div>
        <table>
          <tbody>
            <tr>
              <td>Arrangement navn:</td><td>{this.arrangement.navn}</td>
            </tr>
            <tr>
              <td>Arrangement beskrivelse:</td><td><textarea name='beskrivelse' value={this.state.beskrivelse} onChange={this.handleChange} /></td>
            </tr>
            <tr>
              <td>Kontaktperson:</td><td><Link to={'/bruker/'+this.user.id}>{this.user.fornavn}, {this.user.etternavn}</Link></td>
            </tr>
            <tr>
              <td>Oppmøtetidspunkt:</td>
              <td><input type='datetime-local'name='oppmootetidspunkt' value={this.state.oppmootetidspunkt} onChange={this.handleChange}/></td>
            </tr>
            <tr>
              <td>Starttidspunkt:</td>
              <td><input type='datetime-local' name='starttidspunkt' value={this.state.starttidspunkt} onChange={this.handleChange} /></td>
            </tr>
            <tr>
              <td>Sluttidspunkt:</td>
              <td><input type='datetime-local' name='sluttidspunkt' value={this.state.sluttidspunkt} onChange={this.handleChange} /></td>
            </tr>
            <tr>
              <td>Oppmøtested:</td><td><MapWithAMarker /></td>
            </tr>
            <tr>
              <td><button onClick={()=>{this.props.history.goBack()}}>Gå tilbake</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    )
  }
  changeDate(variabel){
  let a = moment(variabel).format('YYYY-MM-DDTHH:mm');
  return a;
  }
  componentDidMount(){
    arrangementService.showArrangement(this.id).then((result)=>{
      this.arrangement = result[0];

      this.state.beskrivelse = this.arrangement.beskrivelse;
      this.state.oppmootetidspunkt = this.changeDate(this.arrangement.oppmootetidspunkt);
      this.state.starttidspunkt = this.changeDate(this.arrangement.starttidspunkt);
      this.state.sluttidspunkt = this.changeDate(this.arrangement.sluttidspunkt);
      mapLat = this.arrangement.latitude;
      mapLng = this.arrangement.longitute;
      this.forceUpdate();
      userService.getUser(result[0].kontaktperson).then((result)=>{
        this.user = result[0];
        this.forceUpdate();
      }).catch((error)=>{
        if(errorMessage) errorMessage.set('Finner ikke bruker');
      });
    }).catch((error)=>{
      if(errorMessage) errorMessage.set('Finner ikke dette arrangementet'+ error);
    });
  }
}

class Innkalling extends React.Component {
  constructor(props) {
    super(props);
    this.id = props.match.params.id;
    this.r = 1;
    this.roller = []
    this.ikkeValgte = []
    this.valgte = []
  }

  render() {
    let rolle = []
    let ikkeValgtePersoner = []
    let valgtePersoner = []
    for(let i in this.ikkeValgte){
      let item = this.ikkeValgte[i];
      if (item.r_id === this.r) {
        ikkeValgtePersoner.push(<li key={item.m_id}>{item.r_id} - {item.brukernavn}<button onClick={() => {this.leggTil(i)}}>Flytt over</button></li>)
      }
    }
    for(let i in this.valgte){
      let item = this.valgte[i];
      if (item.r_id === this.r) {
        valgtePersoner.push(<li key={item.m_id}>{item.r_id} - {item.brukernavn}<button onClick={() => {this.taVekk(i)}}>Flytt over</button></li>)
      }
    }
    for (let roll of this.roller) {
      rolle.push(<option key={roll.r_id} value={roll.r_id}>{roll.navn}</option>)
    }
    return(
      <div>
        <table style={{width: '100%'}}>
          <thead>
            <tr>
              <td><select ref='r'>{rolle}</select>
              <button ref='button'>Button</button>{this.r}</td>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <p><strong>Ikke valgte</strong></p>
              </td>
              <td>
                <p><strong>Valgte</strong></p>
              </td>
            </tr>
            <tr>
              <td style={{width: '50%'}}>
                <table >
                  <tbody>
                    <tr>
                      <td>
                        <ul>
                          {ikkeValgtePersoner}
                        </ul>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
              <td style={{width: '50%'}}>
                <table >
                  <tbody>
                    <tr>
                      <td>
                        <ul>
                          {valgtePersoner}
                        </ul>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    )
  }

  componentDidMount() {
    // SQL med liste over brukere
    console.log(this.id);
    arrangementService.getRoles(this.id).then((result) => {
      this.roller = result
      if (result && result[0]) {
        this.r = result[0].r_id;
      }
      console.log(result);
      this.forceUpdate()
    }).catch((error) => {
      console.log(error);
      if(errorMessage) errorMessage.set('Fant ingen roller i dette arrnagementet' + error)
    })
    this.refs.button.onclick = () => {
      this.r = +this.refs.r.value;
      this.forceUpdate();
    }

    VaktValg.lagListe3(this.id).then((res)=>{
      console.log(res);
      this.ikkeValgte = res;
      this.forceUpdate();
    }).catch((err)=>{
      console.log('Feil med resultatet');
      console.log(err);
    });
    // VaktValg.getRolls(arr_id).then((result) => {
    //   this.roll = result;
    //   this.forceUpdate();
    // }).catch((error) => {
    //   if(errorMessage) errorMessage.set('Finner ikke arrangement');
    // });
  }

  leggTil(i) {
    let flytt = this.ikkeValgte[i].m_id;
    for (let per of this.valgte) {
      if (per.m_id === flytt) {
        return;
      }
    }
    this.valgte.push(this.ikkeValgte.splice(i,1)[0]);
    this.forceUpdate();
  }

  taVekk(i) {
    this.ikkeValgte.push(this.valgte.splice(i,1)[0]);
    this.forceUpdate();
  }
}

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
        <Route exact path='/resetpassord' component={NyttResetPassord} />
        <Route exact path='/arrangement' component={Arrangement} />
        <Route exact path='/minside' component={MineSider} />
        <Route exact path='/nyttarrangement' component={NyttArrangement} />
        <Route exact path='/bestemme' component={Administrator} />

        <Route exact path='/forandreinfo' component={ForandreBrukerInfo} />
        <Route exact path='/forandrepassord' component={ForandrePassord} />

        <Route exact path='/bruker/:id' component={BrukerSide} />
        <Route exact path='/godkjennebruker' component={GodkjennBruker} />
        <Route exact path='/sekvalifikasjoner' component={SeKvalifikasjoner} />
        <Route exact path='/sokeResultat' component={VisSøkeResultat} />
        <Route exact path='/visArrangement/:id' component={VisArrangement} />
        <Route exact path='/endreArrangement/:id' component={EndreArrangement} />
        <Route exact path='/inkalling/:id' component={Innkalling} />


      </Switch>
      <Popup />
    </div>
  </HashRouter>
), document.getElementById('root'))
