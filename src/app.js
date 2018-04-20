import React from 'react'
import ReactDOM from 'react-dom'
import { NavLink, Link, HashRouter, Switch, Route, Router } from 'react-router-dom'
import { userService, loginService, arrangementService, emailService, administratorFunctions, VaktValg, PassivService, UtstyrService, KvalifikasjonService, rolleService, malService } from './services'
import createHashHistory from 'history/createHashHistory';
import Popup from 'react-popup';
import BigCalendar from 'react-big-calendar';
import Moment from 'moment'
BigCalendar.momentLocalizer(moment);
let eventen = []
function push(eve){
  history.push('/visArrangement/'+ eve);
}
const MyCalendar = props => (
  <div>
    <BigCalendar
      selecteable
      events={eventen}
      startAccessor='start'
      endAccessor='end'
      style={{height: '400px'}}
      defaultDate={new Date()}
      onSelectEvent={event => push(event.id)}
    />
  </div>
);

const history = createHashHistory();
const passwordHash =require ('password-hash');
const _ = require('lodash');
const { compose, withProps, lifecycle } = require('recompose')
const {
  withScriptjs,
  withGoogleMap,
  GoogleMap,
  Marker,
} = require('react-google-maps');
const { SearchBox } = require('react-google-maps/lib/components/places/SearchBox');

let brukerlogedin = false
let klokke = 0
let emailCode = false
let latitude = 63.4123278
let longitude = 10.404471000000058
let address = ''
let mapLat = 63.4123278
let mapLng = 10.404471000000058
let brukerEpost;
let vis = []
let velgBytteBruker = []

const MapWithASearchBox = compose(
  withProps({
    googleMapURL: "https://maps.googleapis.com/maps/api/js?key=AIzaSyB6bXXLKQ3YaTsHdzUVe5_56svleCvsip8&libraries=geometry,drawing,places",
    loadingElement: <div style={{ height: `100%` }} />,
    containerElement: <div style={{ height: `400px`, width: '400px'}} />,
    mapElement: <div style={{ height: `100%` }} />,
  }),
  lifecycle({
    componentWillMount() {
      let sted = latitude;
      let stad = longitude;
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
         latitude = b.lat();
         longitude = b.lng();
         let latlng = {lat: b.lat(), lng: b.lng()};
         let geocoder = new google.maps.Geocoder();
         geocoder.geocode({'location': latlng},function(results,status){
           if(status === 'OK'){
             address = results[0].formatted_address;
           }
         });

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
          let geocoder = new google.maps.Geocoder();
          let latlng = {lat: k.lat(), lng: k.lng()};
          geocoder.geocode({'location': latlng},function(results,status){
            if(status === 'OK'){
              address = results[0].formatted_address;
            }
          });
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
    >
      <SearchBox
      ref={props.onSearchBoxMounted}
      bounds={props.bounds}
      controlPosition={google.maps.ControlPosition.TOP_LEFT}
      onPlacesChanged={props.onPlacesChanged}
      >
        <input
          className='sokeFelt'
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
        <button className='btn btn-default' ref='closeButton'>Close</button>
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
        return <input type="password" placeholder={this.props.placeholder} className="mm-popup__input sokeFelt" value={this.state.value} onChange={this.onChange} />;
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

class Prompt2 extends React.Component {
      constructor(props) {
          super(props);

          this.brukere = velgBytteBruker;
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
        let bruker = [];
        bruker.push(<option key='11111111' value='0'>Velg bruker:</option>);
        for(let item of this.brukere){
          bruker.push(<option key={item.Id} value={item.Id}>{item.Navn}</option>)
        }
          return <select ref='selectField' className="mm-popup__input sokeFelt" placeholder={this.props.placeholder} value={this.state.value} onChange={this.onChange}>{bruker}</select>;
      }
  }

Popup.registerPlugin('prompt2', function (defaultValue, placeholder, callback) {
      let promptValue = 0;

      let promptChange = function (value) {
          promptValue = value;
          console.log(value);
      };

      this.create({
          title: 'Skriv in medlemsnr til den du skal skifte med:',
          content: <Prompt2 onChange={promptChange} placeholder={placeholder} value={defaultValue} />,
          buttons: {
              left: [{
                text: 'Avbryt',
                classname: 'abort',
                action: function() {
                  Popup.close();
                }
              }],
              right: [{
                  text: 'Send forespørsel',
                  key: '⌘+s',
                  className: 'success',
                  action: function () {
                    if(promptValue!=0){
                      callback(promptValue);
                      Popup.close();
                    }else{
                      alert('Du må velge noen');
                    }
                  }
              }]
          }
      });
    });

class popover extends React.Component {
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
        return <input type="text" placeholder={this.props.placeholder} className="mm-popup__input" value={this.state.value} onChange={this.onChange} />;
    }
}

Popup.registerPlugin('popover', function (content, target) {
    this.create({
        content: content,
        className: 'popover',
        noOverlay: true,

        position: function (box) {
            let bodyRect      = document.getElementById('root').getBoundingClientRect();
            let btnRect       = target.getBoundingClientRect();
            let btnOffsetTop  = btnRect.top - bodyRect.top;
            let btnOffsetLeft = btnRect.left - bodyRect.left;
            let scroll        = document.documentElement.scrollTop || document.body.scrollTop;

            box.style.top  = (btnOffsetTop - box.offsetHeight - 10) - scroll + 'px';
            box.style.left = (btnOffsetLeft + (target.offsetWidth / 2) - (box.offsetWidth / 2)) + 'px';
            box.style.margin = 0;
            box.style.opacity = 1;
        }
    });
});

class popunder extends React.Component {
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
        return <input type="text" placeholder={this.props.placeholder} className="mm-popup__input" value={this.state.value} onChange={this.onChange} />;
    }
}

Popup.registerPlugin('popunder', function (content, target) {
    this.create({
        content: content,
        className: 'popunder',
        noOverlay: true,

        position: function (box) {
            let bodyRect      = document.getElementById('root').getBoundingClientRect();
            let btnRect       = target.getBoundingClientRect();
            let btnOffsetTop  = btnRect.top - bodyRect.top;
            let btnOffsetLeft = btnRect.left - bodyRect.left;
            let scroll        = document.documentElement.scrollTop || document.body.scrollTop;

            box.style.top  = (btnOffsetTop + btnRect.height) - scroll + 'px';
            box.style.left = (btnOffsetLeft + (target.offsetWidth / 2) - (box.offsetWidth / 2)) + 'px';
            box.style.margin = 0;
            box.style.opacity = 1;
        }
    });
});

class popright extends React.Component {
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
        return <input type="text" placeholder={this.props.placeholder} className="mm-popup__input" value={this.state.value} onChange={this.onChange} />;
    }
}

Popup.registerPlugin('popright', function (content, target) {
    this.create({
        content: content,
        className: 'popright',
        noOverlay: true,

        position: function (box) {
            let bodyRect      = document.getElementById('root').getBoundingClientRect();
            let btnRect       = target.getBoundingClientRect();
            let btnOffsetTop  = btnRect.top - bodyRect.top;
            let btnOffsetLeft = btnRect.left - bodyRect.left;
            let scroll        = document.documentElement.scrollTop || document.body.scrollTop;

            box.style.top  = (btnOffsetTop) - scroll + 'px';
            box.style.left = (btnOffsetLeft + btnRect.width) + 'px';
            box.style.margin = 0;
            box.style.opacity = 1;
        }
    });
});

class Menu extends React.Component {
  render () {
      let displayValue;
      let signedInUser = loginService.getSignedInUser();
      if(signedInUser && signedInUser.admin === 1){
    return (
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="navbar-brand">
          <img src="src/test.png" width="30" height="30" className="d-inline-block align-top" alt="" />
        Røde Kors</div>

      <div className='navbar-header'>
        <button className='btn btn-default' onClick={()=>{this.collapseNavbar()}}
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
          <li className='nav-item'>
            <Link to='/T-utstyr' className="nav-link">Utstyr</Link>
          </li>
          <li className='nav-item'>
            <Link to='/T-kvalifikasjon' className="nav-link">Kvalifikasjoner</Link>
          </li>
          <li className='nav-item'>
            <Link to='/T-rolle' className="nav-link">Roller</Link>
          </li>
          <li className='nav-item'>
            <Link to='/mineVakter' className="nav-link">Mine Vakter</Link>
          </li>
          <li className='nav-item'>
            <Link to='/hjelp' className="nav-link">Hjelp</Link>
          </li>
        </ul>
        <ul className="nav navbar-nav navbar-right">
          <li className='hopp'>
            <input  ref='serachFieldUser' type='text' placeholder='Søk etter medlem' className='form-control sokeFelt' />
          </li>
          <li>
          <button ref='serachUsersButton' className='form-control btn btn-default' onClick={()=>{history.push('/sokeResultat'); this.searchUser()}}><span className='glyphicon glyphicon-search' /></button>
          </li>
          <li className='spaceBetweenSearchAndLogout'>
          <button className='btn btn-default'  className='button' onClick={() => {this.logOut()}}><span className='glyphicon glyphicon-log-out' /></button>
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
          Røde Kors
        </div>
        <div className='navbar-header'>
          <button className='btn btn-default' onClick={()=>{this.collapseNavbar()}}className="navbar-toggler" type="button" data-toggle="collapse" data-target=".navbar-collapse" >
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
            <li className='nav-item'>
              <Link to='/mineVakter' className="nav-link">Mine Vakter</Link>
            </li>
            <li className='nav-item'>
              <Link to='/hjelp' className="nav-link">Hjelp</Link>
            </li>
          </ul>
          <ul className="nav navbar-nav navbar-right">
            <li className='hopp'>
              <input  ref='serachFieldUser' type='text' placeholder='Søk etter medlem' className='form-control sokeFelt' />
            </li>
            <li>
              <button className='btn btn-default'  ref='serachUsersButton' className='form-control' onClick={()=>{history.push('/sokeResultat')}}>Søk</button>
            </li>
            <li className='spaceBetweenSearchAndLogout'>
              <button className='btn btn-default'  className='button' onClick={() => {this.logOut()}}><span className='glyphicon glyphicon-log-out' /></button>
            </li>
          </ul>
        </div>
      </nav>
  );
  }
  else{
    return(
      null
    )
  }
  }

  searchUser(){
    let userSearch = '%' + this.refs.serachFieldUser.value + '%'
      userService.searchUser(userSearch).then((result) =>{
        if(history.location.pathname === '/sokeResultat'){
          vis = result;
          sok.update();
          this.refs.serachFieldUser.value = '';
        }else{
          vis = result;
          this.refs.serachFieldUser.value = '';
        }
      }).catch((error)=>{
        if(errorMessage) errorMessage.set('Finner ikke brukeren du søker etter' + error);
      });
  }
  collapseNavbar(){
    let kollaps = document.getElementById('navbarSupportedContent');
    kollaps.style.display ='none';
    if(klokke == 0){kollaps.style.display = 'inline'; klokke++}
    else if(klokke == 1){klokke++; kollaps.style.display = 'none';}
    if(kollaps.style.display =='none'){klokke=0;}
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

      <div className='form-group' id='bilde'>
        <img src='src/Test.png' />
      </div>
        <div className='form-group'>
          <label htmlFor='brukernavn'>Brukernavn:</label>
          <input type="text" ref="unInput" className="form-control col-6 sokeFelt" defaultValue="sindersopp@hotmail.com" name='brukernavn'/>
        </div>
        <div className='form-group'>
          <label htmlFor='passord'>Passord:</label>
          <input type="password" ref="pwInput" className="form-control col-4 sokeFelt" defaultValue="passord" name='passord'/>
        </div>
        <div className='form-group'>
          <button className="btn btn-primary btn-lg" ref="innlogginButton">Logg inn</button>
        </div>
        <div className='form-group'>
          <button className='btn btn-default' ref="newUserButton">Ny bruker</button>
          <button className='btn btn-default' ref="newPasswordButton">Glemt passord?</button>
        </div>

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
          brukerlogedin = true;
          history.push('/start');
        }
        if(login && signedInUser.admin !=1 && signedInUser.aktiv === 1){
          console.log('Innlogget som bruker');
          brukerlogedin = true;
          history.push('/start');
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
      <div className='Rot_nybruker container'>
         <div className='form-group'>
            <label htmlFor='fornavn'>Fornavn:</label>
            <input type="text" ref="fornavnInput" className='form-control col-6 sokeFelt' defaultValue="Fornan" name='fornavn'/>
        </div>
        <div className='form-group'>
            <label htmlFor='etternavn'>Etternavn:</label>
            <input type="text" ref="etternavnInput" className='form-control col-6 sokeFelt' defaultValue="Etternavn" name='etternavn'/>
        </div>
        <div className='form-group'>
            <label htmlFor='brukernavn'>Brukernavn:</label>
            <input type="text" ref="brukernavnInput" className='form-control col-6 sokeFelt'  defaultValue="Brukernavn" name='brukernavn'/>
        </div>
        <div className='form-group'>
            <label htmlFor='epost'>Epost:</label>
            <input type="email" ref="epostInput" className='form-control col-6 sokeFelt' defaultValue='dinepost@dinepost.no' name='epost'/>
        </div>
        <div className='form-group'>
            <label htmlFor='medlemsnr'>Medlemsnr:</label>
            <input type="number" ref="medlemsnrInput" className='form-control col-6 sokeFelt' defaultValue='98123'  name='medlemsnr'/>
        </div>
        <div className='form-group'>
            <label htmlFor='telefon'>Telefonnummer:</label>
            <input type="number" ref="tlfInput" className='form-control col-6 sokeFelt' defaultValue='91909293' name='telefon'/>
        </div>
        <div className='form-group'>
            <label htmlFor='adresse'>Gateadresse:</label>
            <input type="text" ref="adresseInput" className='form-control col-6 sokeFelt' defaultValue='Brandhaugveita 4' name='adressse'/>
        </div>
        <div className='form-group'>
            <label htmlFor='postnr'>Postnummer:</label>
            <input type="text" ref="postnrInput" className='form-control col-6 sokeFelt' defaultValue='0000' name='postnr'/>
        </div>
        <div className='form-group'>
            <label htmlFor='passord'>Passord:</label>
            <input type="password" ref="passwordInput1" className='form-control col-6 sokeFelt' defaultValue='*****' name='passord'/>
        </div>
        <div className='form-group'>
            <label htmlFor='gpassord'>Gjenta passord:</label>
            <input type="password" ref="passwordInput2" className='form-control col-6 sokeFelt' defaultValue='*****' name='gpassord'/>
        </div>
        <div className='form-group'>
            <button className='btn btn-default' ref="createuserButton">Ferdig</button>
            <button className='btn btn-default' onClick={()=>{history.goBack()} }>Tilbake</button>
        </div>
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
        <div className='Rot container'>
          <div className='form-group'>
            <label htmlFor='epost'>E-post: </label>
            <input type='email' name='epost' className='form-control col-6 sokeFelt' ref='nyEpostInput' defaultValue='magnus.torset@gmail.com' /> <br />
          </div>
          <div className='form-group'>
            <button className='btn btn-default' ref='newPasswordButton'>Be om nytt passord</button>
            <button className='btn btn-default' ref='backButton'>Tilbake</button>
          </div>
          <div>
            <ErrorMessage />
          </div>
        </div>
      </div>
    )
  }
  componentDidMount () {
    this.refs.newPasswordButton.onclick = () => {
      brukerEpost = this.refs.nyEpostInput.value
      let emailCheck = Math.floor(Math.random() * 100000);
      loginService.navn(emailCheck, brukerEpost).then(() => {
        emailService.newPassword(brukerEpost, emailCheck).then(() => {
          console.log('Epost sendt');
          this.props.history.push('/kode')
        }).catch((error) =>{
          if(errorMessage) errorMessage.set('Finner ikke epost');
        });
      }).catch((error) =>{
        if(errorMessage) errorMessage.set('Finner ikke epost');
      });
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
        <div className='Rot container'>
          <p className='form-group'>
            Du har nå blitt sendt en epost med en kode. Skriv inn koden her.
          </p>
          <div className='form-group'>
            <label htmlFor='kode'>Kode:</label>
            <input type='text' name='kode' className='form-control col-2 sokeFelt' ref='kodeInput' />
            <button className='btn btn-default' ref='kodeButton'>Sjekk kode</button>
          </div>
          <ErrorMessage />
        </div>
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
      }).catch((error) =>{
        if(errorMessage) errorMessage.set('Feil kode');
      });
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
        <div className='Rot container'>
          <div className='form-group'>
            <label htmlFor='passord1'>Nytt passord</label>
            <input type='password' name='passord1' className='form-control col-4 sokeFelt' ref='passordInput1' />
          </div>
          <div className='form-group'>
            <label htmlFor='passord2'>Gjenta passord</label>
            <input type='password' name='passord2' className='form-control col-4 sokeFelt' ref='passordInput2' />
          </div>
          <div className='form-group'>
            <button className='btn btn-default' ref='byttPassordButton'>Bytt passord</button>
          </div>
        </div>
      </div>
    )
  }

  componentDidMount() {
    this.refs.byttPassordButton.onclick = () => {
      if (emailCode && this.refs.passordInput1.value === this.refs.passordInput2.value) {
        userService.newPassword(this.refs.passordInput1.value, brukerEpost).then(() => {
          console.log('Passord byttet');
          this.props.history.push('/')
        }).catch((error) =>{
          if(errorMessage) errorMessage.set('Kunne ikke bytte passord');
        });
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
  this.eventer = [];

  this.state = {melding: ''
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
  render () {
    return (
      <div className='startside'>
        <h1>Hei, {this.user.brukernavn}!</h1>
        <div className='adminMelding form-group'>
        <label htmlFor='adminMelding'>Melding fra administrator:</label>
        <textarea rows='5' cols='50'id='adminMelding' className='form-control' name='adminMelding' value={this.state.melding} onChange={this.handleChange} />
        </div>
        <div className='calendarStartside form-group'>
        <div className='calendarLabel'>Kommende arrangement</div>
        <MyCalendar />
        </div>
      </div>
    )
  }
  componentWillUnmount(){
    eventen = [];
  }
  componentDidMount () {
    arrangementService.getAllArrangement().then((result)=>{
      this.eventer = result;
      for(let ting of this.eventer){
        eventen.push({id:ting.id, title:ting.navn, start:ting.starttidspunkt, end:ting.sluttidspunkt, desc:ting.beskrivelse});
      }

    }).catch((error)=>{
      if(errorMessage) errorMessage.set('Finner ikke arrangement' + error);
    });
    userService.getUser(this.id).then((result) =>{
      console.log(this.id);
      this.user = result[0];
      console.log(this.user);
      this.forceUpdate();
    }).catch((error) =>{
      if(errorMessage) errorMessage.set('Finner ikke bruker');
    });
    administratorFunctions.getAdminMelding().then((result) =>{
      this.state.melding = result[0].melding;
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
      tableItems.push(<tr key={a}><td className='arrangementTable' >Navn</td><td className='arrangementTable'>Kontaktperson</td></tr>,<tr key={table.a_id}><td className='arrangementTableData'><Link className='arrangementLink' to={'/visArrangement/'+table.a_id}>{table.navn}</Link></td><td className='arrangementTableData'><Link className='arrangementLink' to={'/bruker/'+table.kontaktperson}>{table.fornavn + " " + table.etternavn}</Link></td></tr>)
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
                <input type='text'className='form-control sokeFelt' ref='searchArrangement' /></td>
                <td><button className='btn btn-default' ref='searchButton' onClick={ () =>{this.hentArrangement( )}}>Søk arrangement</button></td>

                <td>
                  <button className='btn btn-default' onClick={ () => {history.push('/nyttarrangement')}}>Nytt Arrangement</button>
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
        <table>
          <thead>
            <tr>
              <td><input type='text' className='form-control sokeFelt' ref='searchArrangement'  /></td>
              <td><button className='btn btn-default' ref='searchButton'onClick={ () => {this.hentArrangement()}}>Søk arrangement</button></td>
            </tr>
          </thead>
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
    this.linjer = 1;
    this.roller = [];
    this.vakter = [];
    this.maler = [];
  }
  render(){
    let rolleList = [];
    let vakter = [];
    let malList = [];

    rolleList.push(<option key="0" value="0"></option>);
    for(let item of this.roller) {
      rolleList.push(<option key={item.id} value={item.id}>{item.navn}</option>);
    }

    for (let i in this.vakter) {
      let item = this.vakter[i];
      vakter.push(
        <tr key={item.id} className='arrangementVaktTabell'>
          <td className='arrangementVaktTabellData'><span className='tableText'>Rolle:</span> {item.navn}</td>
          <td className='arrangementVaktTabellData'><span className='tableText'>Antall: </span><input type="number" step="1" min="1" max="25" defaultValue={item.antall} onChange={(event) => {item.antall = +event.target.value}} /></td>
          <td className='arrangementVaktTabellData'><button className='btn btn-default' onClick={() => {this.vakter.splice(i, 1); console.log(this.vakter); this.forceUpdate()}}>Fjern</button></td>
        </tr>);
    }

    for(let item of this.maler) {
      malList.push(<option key={item.id} value={item.id}>{item.navn}</option>);
    }

    return(
      <div>
      <div>
        <button className='btn btn-default tilbakeKnapp' onClick={()=>{history.goBack()}}>Tilbake</button>
      </div>
        <div className='Rot_nyttArrangement'>
          <div className='form-group break'>
            <label htmlFor='navn'>Navn: </label>
            <input type="text" name='navn' className="form-control col-8 sokeFelt" ref="a_name" defaultValue="Test" />
          </div>
          <div className='form-group'>
            <label htmlFor='startdato'>Startdato: </label>
            <input type="datetime-local" className="form-control col-8 sokeFelt" name='startdato' ref="a_startdate" /> {/*Autofyll med dagens dato*/}
          </div>
          <div className='form-group'>
            <label htmlFor='sluttdato'>Sluttdato: </label>
            <input type="datetime-local" className="form-control col-8 sokeFelt" name='sluttdato' ref="a_enddate" />
          </div>
          <div className='form-group break'>
            <label htmlFor='oppmotetid'>Oppmøtetidspunkt: </label>
            <input type="datetime-local" className="form-control col-8 sokeFelt" name='oppmotetid' ref="a_meetdate" />
          </div>
          <div className='form-group break'>
            <label htmlFor='oppmotested'>Oppmøtested: </label>
            <MapWithASearchBox name='oppmotested' />
          </div>
          <div className='form-group break'>
            <label htmlFor='beskrivelse'>Beskrivelse: </label>
            <textarea rows="4" ref="a_desc" name='beskrivelse' className="form-control col-8 sokeFelt" defaultValue="En tekstlig beskrivelse"/>
          </div>
          <div className='form-group formFritekst'>
            <label>Kontaktperson: </label>
          </div>
          <div className='form-row'>
            <div className='col'>
              <label htmlFor='k_navn'>Navn: </label>
              <input type="text" name='k_name' className="form-control sokeFelt" ref="k_name" defaultValue="Lars" />
            </div>
            <div className='col break'>
              <label htmlFor='k_tlf'>Telefon: </label>
              <input type="number" name='k_tlf' className="form-control sokeFelt" ref="k_tlf" defaultValue="95485648" />
            </div>
          </div>
          <div className='form-group'>
            <label htmlFor='rolle'>Rolle: </label>
            <select ref='rolle' name='rolle' className="form-control-lg sokeFelt">{rolleList}</select>
            <button className='btn btn-default' onClick={() => {this.addVakt()}}>Legg til rolle</button>
            <button className='btn btn-xs btn-default' id='aHelpButton' ref='helpButton'><span className="glyphicon glyphicon-info-sign"></span></button>
          </div>
          <div className='form-group'>
            <table>
              <tbody>
                {vakter}
              </tbody>
            </table>

            <br />
            <div>
              Vakt mal <br />
              Mal: <select ref='mal'>{malList}</select> <button className='btn btn-default' ref='velgMal'>Velg</button> <button className='btn btn-default'ref='slettMal'>Slett</button>
              <br /><br />
              Navn: <input ref='malNavn'/> <button className='btn btn-default' ref='endreMal'>Endre</button> <button className='btn btn-default' ref='leggTilMal'>Legg til</button>
            </div>
          </div>
          <button className='btn btn-default' onClick={()=>{history.goBack()} }>Tilbake</button>
          <button className='btn btn-default' ref="arrangementButton">Lag arrangement</button>
        </div>
      </div>
    )
  }


  componentDidMount(){
    rolleService.getAllRolle().then((res) => {
      this.roller = res;
      this.forceUpdate();
    }).catch((err) => {
      console.log('ERROR: ROLLE_SQL_FAIL');
      console.log(err);
    })

    malService.getMals().then((res) => { //Finnished
      console.log('getMals Sukse!');
      console.log(res);
      this.maler = res;
      this.forceUpdate();
    }).catch((err) => {
      console.log('getMals feil!');
      console.log(err);
    });

    this.refs.arrangementButton.onclick = () => {
      arrangementService.addArrangement(this.refs.k_tlf.value, this.refs.a_name.value, this.refs.a_meetdate.value, this.refs.a_startdate.value, this.refs.a_enddate.value, this.refs.a_desc.value, this.vakter, longitude,latitude, address).then(() => {
        address = ''
        longitude = ''
        latitude = ''
      }).catch((error) =>{
        if(errorMessage) errorMessage.set('Kunne ikke legge til arrangement');
      });
    }


    this.refs.helpButton.onclick = () => {
      Popup.plugins().popover('Velg rollen du vil legge til fra rullegardinmenyen og klikk legg til rolle. Skriv deretter inn antall. Hvis du vil legge til flere roller velger du en ny rolle fra menyen og skriver inn antall igjen.', aHelpButton);
    }


    this.refs.velgMal.onclick = () => {
      let id = this.refs.mal.value;

      malService.getMalRolls(id).then((res) => {
        console.log(res);

        let vakter = [];
        for(let item of res) {
          vakter.push({id: item.r_id, navn: this.addify(item.r_id), antall: item.antall});
        }
        console.log(vakter);
        this.vakter = vakter;

        this.componentDidMount();
      }).catch((err) => {
        console.log('getMalRolls error!');
      });
    }
    this.refs.slettMal.onclick = () => {
      let id = this.refs.mal.value;

      malService.removeMalRolls(id).then((res) => {
        console.log('removeMalRolls sukse!');
        malService.removeMal(id).then((res) => {
          console.log('removeMal sukse!');
          this.componentDidMount();
        }).catch((err) => {
          console.log('removeMal feil!');
        });
      }).catch((err) => {
        console.log('removeMalRolls feil!');
      });
    }
    this.refs.endreMal.onclick = () => { //Finnished
      let id = this.refs.mal.value;
      let navn = this.refs.malNavn.value;
      console.log(id, navn);

      malService.alterMal(id, navn).then((res) => {
        console.log('alterMal sukse!');
        malService.removeMalRolls(id).then((res) => {
          console.log('removeMalRolls sukse!');
          malService.addMalRolls(id, this.vakter).then((res) => {
            console.log('addMalRolls sukse!');
            this.componentDidMount();
          }).catch((err) => {
            console.log('addMalRolls Feil!');

          })
        }).catch((err) => {
          console.log('removeMalRolls error!');
        })
      }).catch((err) => {
        console.log('alterMal error!');
      })
    }
    this.refs.leggTilMal.onclick = () => { //Finnished
      let navn = this.refs.malNavn.value;
      console.log(navn);
      malService.addMal(navn).then((res) => {
        console.log('addMal Sukse!');
        console.log(res);

        malService.addMalRolls(res.insertId, this.vakter).then((res) => {
          console.log('addMalRolls sukse!');
          console.log(res);
          this.componentDidMount();
        }).catch((err) => {
          console.log('addMalRolls Feil!');
          console.log(err);
        })
      }).catch((err) => {
        console.log('addMal Feil!');
        console.log(err);
      })
    }


  }

  addVakt() {
    let r_id = +this.refs.rolle.value;
    let navn = 'Tomt';



    if(r_id && this.vaktValgt(r_id)) {
      for (let item of this.roller) {
        if (r_id === item.id) {
          navn = item.navn;
        }
      }

      this.vakter.push({id: r_id, navn: navn, antall: 1});
      this.forceUpdate();
    }
  }
  vaktValgt(r_id) {
    for (let item of this.vakter) {
      if (r_id === item.id) {
        return false;
      }
    }
    return true;
  }
  addify(id) {
    for(let item of this.roller) {
      if (item.id === id) {
        return item.navn;
      }
    }
    return 'Inngen rolle funnet';
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
        <h1 className='minsideTitle'>Min Side</h1>
        <div className='mineSider'>
        <table >
          <tbody>
            <tr>
              <td className='minsideTabell'><span className='tableText'>Medlemmsnummer:</span> {this.user.id}</td>
              <td className='minsideTabell'><span className='tableText'>Postnummer:</span> {this.user.poststed_postnr}</td>
            </tr>
            <tr>
              <td className='minsideTabell'><span className='tableText'>Epost:</span> {this.user.epost}</td>
              <td className='minsideTabell'><span className='tableText'>Poststed:</span> {this.user.poststed}</td>
            </tr>
            <tr>
              <td className='minsideTabell'><span className='tableText'>Telefonnummer:</span> {this.user.tlf}</td>
              <td className='minsideTabell'><span className='tableText'>Gateadresse:</span> {this.user.adresse}</td>
            </tr>
            <tr>
              <td className='minsideTabell'><button className='btn btn-default' ref='setPassive'>Meld deg passiv</button>
              <button className='btn btn-default' ref='seeQualifications'>Se kvalifikasjoner</button></td>
              <td className='minsideTabell'><button className='btn btn-default' ref='changeInfo'>Endre personalia</button>
              <button className='btn btn-default' ref='changePassword'>Endre passord</button></td>
            </tr>
          </tbody>
        </table>
        </div>
        <div className='calendarMinesider'>
        <div className='calendarLabel'>Mine arrangement</div>
        <MyCalendar />
        </div>
      </div>
    )
  }
  componentDidMount(){
    arrangementService.getYourArrangements(loginService.getSignedInUser().id).then((result)=>{
      for(let ting of result){
        eventen.push({id:ting.id, title:ting.navn, start:ting.starttidspunkt, end:ting.sluttidspunkt, desc:ting.beskrivelse})
      }
      console.log(eventen)
    }).catch((error)=>{
      if(errorMessage) errorMessage.set('Finner ikke dine arrangement' + error);
    });
    userService.getUser(this.id).then((result) =>{
      console.log(this.id);
      this.user = result[0];
      console.log(this.user);
      this.forceUpdate();
    }).catch((error) =>{
      if(errorMessage) errorMessage.set('Finner ikke bruker');
    });

    this.refs.setPassive.onclick = () =>{
      this.props.history.push('/passiv');
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

class Passiv extends React.Component {
  render() {
    return(
      <div>
        <label htmlFor='passivFra'>Passiv fra: </label>
        <input type='date' name='passivFra' className='sokeFelt' ref='passivFra' />
        <label htmlFor='passivTil'>Passiv til: </label>
        <input type='date' name='passivTil' className='sokeFelt' ref='passivTil' />
        <button className='btn btn-default' ref='setPassive'>Sett passiv</button>
        <button className='btn btn-default' ref='tilbakeButton'>Tilbake</button>
      </div>
    )
  }

  componentDidMount() {
    this.refs.setPassive.onclick = () => {
      let m_id = loginService.getSignedInUser().id;
      console.log(m_id);
      let start = this.refs.passivFra.value
      let slutt = this.refs.passivTil.value
      if(start <= slutt) {
        PassivService.kanMeld(m_id, start, slutt).then((res) => {
          console.log(res);
          if(res[0].antall) {
            PassivService.setPassiv(m_id, start, slutt).then((res) => {
              console.log(res);
            }).catch(() => {
              console.log(error);
              if(errorMessage) errorMessage.set('Error');
            });
            history.push('/minside')
          } else {
            console.log('Du er opptatt på denne tiden.');
          }
        }).catch((error) =>{
          console.log(error);
          if(errorMessage) errorMessage.set('Kunne ikke sette deg passiv');
        });
      } else {
        alert('Sluttdato må være senere enn startdato')
      }
    }
    this.refs.tilbakeButton.onclick = () => {
      history.push('/minside')
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
        <h1 className='minsideTitle'>Min Side </h1>
        <div className='endrePersonalia'>
          <table className='sentrer personaliaTable'>
            <tbody>
              <tr>
                <td className='personaliaTable'><fieldset disabled><label htmlFor='medlemsnr'>Medlemmsnummer: </label> <input type='text' name='medlemsnr' className='form-control sokeFelt' placeholder={this.user.id} /></fieldset></td>
                <td className='personaliaTable'><label htmlFor='postnr'>Postnummer: </label><input type='number' maxLength='4' name='postnr' className='form-control sokeFelt' ref='zipInput' /></td>
              </tr>
              <tr>
                <td className='personaliaTable'><label htmlFor='epost'>Epost: </label><input ref='emailInput' className='form-control sokeFelt'/></td>
                <td className='personaliaTable'><label htmlFor='postnr'>Poststed: </label><fieldset disabled><input type='text' name='medlemsnr' className='form-control sokeFelt' /></fieldset></td>
              </tr>
              <tr className='break'>
                <td className='personaliaTable'><label htmlFor='tlf'>Telefonnummer: </label><input className='form-control sokeFelt' name='tlf' type='number' ref='tlfInput' /></td>
                <td className='personaliaTable'><label htmlFor='addr'>Gateadresse: </label><input className='form-control sokeFelt' name='addr' ref='adressInput' /></td>
              </tr>
              <tr className='break'>
                <td className='personaliaTable'><button className='btn btn-default' ref='saveButton'>Lagre forandringer</button></td>
                <td className='personaliaTable'><button className='btn btn-default' ref='cancelButton'>Forkast forandringer</button></td>
              </tr>
            </tbody>
          </table>
        </div>
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

          if(passwordHash.verify(value,thePassword)){
            userService.editUser(email, adress, tlf, zip, vip).then(() =>{
              history.push('/minside');
          }).catch((error) =>{
            if(errorMessage) errorMessage.set('Klarte ikke å oppdatere bruker');
          });




         }
         else{
           alert('Du må skrive inn riktig passord for å endre din personlige informasjon!');
         }
      });
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

      Skriv inn nytt et passord:<input type='password' className='sokeFelt' ref='passwordInput1' />

      Skriv på nytt igjen:<input type='password' className='sokeFelt' ref='passwordInput2' />

      <button className='btn btn-default' ref='saveButton'>Lagre nytt passord</button>
      <button className='btn btn-default' ref='cancelButton'>Ikke lagre</button>
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
              if(passwordHash.verify(value,thePassword)){
                userService.editPassword(password1, currentId).then(() =>{
                  history.push('/minside');
              }).catch((error) =>{
                if(errorMessage) errorMessage.set('Klarte ikke å oppdatere passord');
              });

             }
             else{
               alert('Passordet stemte ikke.');
             }
          });

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
    this.id = loginService.getSignedInUser().id;

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
        <button className='btn btn-default' ref='tilbakeKnapp'>Gå tilbake</button>
      </div>
    )
  }
  componentDidMount() {
    userService.getUserQualifications(this.id).then((qualifications) => {
      this.kvalifikasjoner = qualifications;

      this.forceUpdate();
    }).catch((error: Error) => {
      if(errorMessage) errorMessage.set("Failed getting qualifications" + error);
    });
    this.refs.tilbakeKnapp.onclick = () =>{
      this.props.history.goBack();
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
              <div>
              <strong>Brukere som må godkjennes</strong>
              <button className='btn btn-xs btn-default' id='godkjennBrukerHelpButton' ref='godkjennBrukerHelpButton'><span className="glyphicon glyphicon-info-sign"> </span></button>
              </div>
            </td>
            <td style={{width: '30%'}}>
              <div>
              <strong>Godkjenn vaktbytter</strong>
              <button className='btn btn-xs btn-default' id='godkjennVaktHelpButton' ref='godkjennVaktHelpButton'><span className="glyphicon glyphicon-info-sign"> </span></button>
              </div>
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
              <ByttVakt />
            </td>
            <td>
              <div className='form-group'>
                <label htmlFor='adminMelding'>Skriv melding til brukerne:</label> <button className='btn btn-xs btn-default' id='adminMeldingHelpButton' ref='adminMeldingHelpButton'><span className="glyphicon glyphicon-info-sign"> </span></button>

                <textarea ref='adminMelding' className='form-control col-8 sokeFelt' name='adminMelding'/>
                <button className='btn btn-default' ref='RegistrerAdminMelding'>Commit</button>
              </div>
            </td>
          </tr>
          <tr>
            <td>
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
      this.refs.adminMelding.value = '';
    }
    this.refs.godkjennBrukerHelpButton.onclick = () => {
      Popup.plugins().popright('Her vises brukere som er laget, men ikke godkjent. Klikk et navn for å se info om bruker. Klikk "Godkjenn" for å godkjenne en bruker.', godkjennBrukerHelpButton);
    }
    this.refs.godkjennVaktHelpButton.onclick = () => {
      Popup.plugins().popright('Her vises vakter som en bruker ønsker å bytte, men som ikke er godkjent. Klikk et navn for å se info om bruker. Klikk på arrangementet for mer info om arrangementet. Klikk "Godta" eller "Avslå" for å godkjenne eller avslå byttet.', godkjennVaktHelpButton);
    }
    this.refs.adminMeldingHelpButton.onclick = () => {
      Popup.plugins().popunder('Her kan du skrive en melding som vil dukke opp på fremsiden for alle brukere', adminMeldingHelpButton);
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
      brukerListe.push(<li key={bruker.id}><Link to={'/bruker/'+bruker.id}>{bruker.fornavn},{bruker.etternavn}</Link> <button className='btn btn-default' onClick={() =>{this.godkjenneBruker(bruker.id)}} >Godkjenne</button></li>)
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

class ByttVakt extends React.Component{
  constructor(){
    super();
    this.vaktbytter = []
  }
  render(){
    let vakter = []
    for(let bytte of this.vaktbytter){
      vakter.push(<tr key={bytte.id}><td><Link to={'/bruker/'+bytte.om_id}>{bytte.byttenavn}</Link>, vil bytte vakt med <Link to={'/bruker/'+bytte.nm_id}>{bytte.navn}</Link> på arrangement <Link to={'/visArrangement/'+bytte.aid}>{bytte.arrangement} </Link>som {bytte.rollenavn}</td><td><button className='btn btn-default' onClick={()=>{this.godtaVaktBytte(bytte.id,bytte.nm_id,bytte.vakt_id)}}>Godta</button><button className='btn btn-default' onClick={()=>{this.avsloVaktBytte(bytte.id)}}>Avslå</button></td></tr>)
    }
    return(
      <div>
        <table>
          <tbody>
            {vakter}
          </tbody>
        </table>
      </div>
    );
  }
  avsloVaktBytte(vaktid){
    administratorFunctions.avsloVaktBytte(vaktid).then(()=>{
      this.componentDidMount();
    }).catch((error)=>{
      if(errorMessage) errorMessage.set('Fikk ikke avlått vaktbytte' + error);
    });
  }
  godtaVaktBytte(vaktBytteid,personid,vakt_id){
    administratorFunctions.godtaVaktBytte(vaktBytteid,personid,vakt_id).then(()=>{
      this.componentDidMount();
    }).catch((error)=>{
      if(errorMessage) errorMessage.set('Fikk ikke godtatt vakt' + error);
    });
  }
  componentDidMount(){
    administratorFunctions.getVaktBytter().then((result)=>{
      this.vaktbytter = result;
      this.forceUpdate();
    }).catch((error)=>{
      if(errorMessage) errorMessage.set('Finner ikke vaktbytter' + error);
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
      <button className='btn btn-default' onClick={() =>{this.props.history.goBack();}}>Gå tilbake</button>
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
          <div className="brukerSideTabell">
          <table className="brukerSideTabell">
            <thead>
              <tr>
                <th className="brukerSideHead">{this.user.fornavn} {this.user.etternavn}</th>
                <th className="brukerSideHead">{this.user.id}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="brukerSideData"><span className='tableText'>E-post: </span> {this.user.epost}</td>
                <td className="brukerSideData"><span className='tableText'>Adresse: </span> {this.user.adresse}</td>

              </tr>
              <tr>
                <td className="brukerSideData"><span className='tableText'>Telefon: </span>{this.user.tlf}</td>
                <td className="brukerSideData"><span className='tableText'>Postnummer: </span>{this.user.postnr}</td>

              </tr>
              <tr>
                <td className="brukerSideData"><span className='tableText'>Vaktpoeng: </span> {this.user.vaktpoeng}</td>
                <td className="brukerSideData"><span className='tableText'>Poststed: </span> {this.user.poststed}</td>
              </tr>
              <tr>
              <td className="brukerSideButtons"><button className='btn btn-default' onClick={() =>{this.makeAdmin()}}>Gjør bruker admin</button></td>
              <td className="brukerSideButtons"><button className='btn btn-default' onClick={() =>{this.deaktiverBruker()}}>Deaktiver bruker</button></td>
              <td className="brukerSideButtons"><button className='btn btn-default' onClick={() =>{history.push('/sekvalifikasjoner')}}>Se kvalifikasjoner</button></td>
              </tr>
            </tbody>
          </table>
            <button className='btn btn-default' onClick={() =>{this.props.history.goBack();}}>Gå tilbake</button>
          </div>
        </div>
      )
    }
      if(signedInUser.admin === 1 && this.user.admin === 1){
        return(
          <div>
            <div className="brukerSideTabell">
            <table className="brukerSideTabell">
              <thead>
                <tr>
                  <th className="brukerSideHead">{this.user.fornavn} {this.user.etternavn}</th>
                  <th className="brukerSideHead">{this.user.id}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="brukerSideData"><span className='tableText'>E-post: </span> {this.user.epost}</td>
                  <td className="brukerSideData"><span className='tableText'>Adresse: </span> {this.user.adresse}</td>

                </tr>
                <tr>
                  <td className="brukerSideData"><span className='tableText'>Telefon: </span>{this.user.tlf}</td>
                  <td className="brukerSideData"><span className='tableText'>Postnummer: </span>{this.user.postnr}</td>

                </tr>
                <tr>
                  <td className="brukerSideData"><span className='tableText'>Vaktpoeng: </span> {this.user.vaktpoeng}</td>
                  <td className="brukerSideData"><span className='tableText'>Poststed: </span> {this.user.poststed}</td>
                </tr>
                <tr>
                  <td className="brukerSideButtons"><button className='btn btn-default' onClick={() =>{this.makeAdmin()}}>Gjør bruker admin</button></td>
                  <td className="brukerSideButtons"><button className='btn btn-default' onClick={() =>{this.deaktiverBruker()}}>Deaktiver bruker</button></td>
                  <td className="brukerSideButtons"><button className='btn btn-default' onClick={() =>{history.push('/sekvalifikasjoner')}}>Se kvalifikasjoner</button></td>
                </tr>
              </tbody>
            </table>
              <button className='btn btn-default' onClick={() =>{this.props.history.goBack();}}>Gå tilbake</button>
            </div>
          </div>
        )
    }else{
      return(
        <div>
          <div>
          <table className='brukerSideTabell'>
            <thead>
              <tr>
                <th className='brukerSideHead'>{this.user.fornavn} {this.user.etternavn}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className='brukerSideData'><span className='bold'>Telefon:</span> </td>
                <td className='brukerSideData'>{this.user.tlf}</td>
                <td className='brukerSideData'>E-post:</td>
                <td className='brukerSideData'>{this.user.epost}</td>
              </tr>
            </tbody>
          </table>
            <button className='btn btn-default' onClick={() =>{this.props.history.goBack();}}>Gå tilbake</button>
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
    let signedInUser = loginService.getSignedInUser();
    if(signedInUser.admin === 1){

    return(
      <div>
      <div>
        <button className='btn btn-default tilbakeKnapp' onClick={()=>{history.goBack()}}>Tilbake</button>
      </div>
        <div className='Rot_nyttArrangement'>
            <div className='form-group'>
          <label htmlFor='navn'>Arragnemnet navn:</label>
           <p name='navn'>{this.arrangement.navn}</p>
            </div>
            <div className='form-group'>
              <label htmlFor='beskrivelse'>Arragnemnet beskrivelse:</label>
              <p name='beskrivelse'>{this.arrangement.beskrivelse}</p>
            </div>
            <div className='form-group'>
              <label htmlFor='kontaktperson'>Kontaktperson:</label>
              <p name='kontaktperson'><Link to={'/bruker/'+this.user.id}>{this.user.fornavn}, {this.user.etternavn}</Link></p>
            </div>
            <div className='form-group'>
                <label htmlFor='oppmote'>Oppmøtetidspunkt:</label>
              <p name='oppmote'>{this.changeDate(this.arrangement.oppmootetidspunkt)}</p>
            </div>
            <div className='form-group'>
              <label htmlFor='start'>Starttidspunkt:</label>
              <p name='start'>{this.changeDate(this.arrangement.starttidspunkt)}</p>
            </div>
            <div className='form-group'>
              <label htmlFor='slutt'>Sluttidspunkt:</label>
            <p name='slutt'>{this.changeDate(this.arrangement.sluttidspunkt)}</p>
            </div>
            <div className='form-group'>
              <label htmlFor='kart'>Oppmøtested:</label>
              <p>{this.arrangement.address}</p>
              <MapWithAMarker name='kart'/>
            </div>
            <div className='form-group'>
              <button className='btn btn-default' onClick={()=>{history.push('/endreArrangement/'+this.arrangement.id)}}>Endre arrangementet</button>
              <button className='btn btn-default' onClick={()=>{history.push('/inkalling/'+this.arrangement.id)}}>Kall inn</button>
            </div>
          </div>
      </div>
    )
  }if(signedInUser.admin === 0){
    return(
      <div>
      <div>
        <button className='btn btn-default tilbakeKnapp' onClick={()=>{history.goBack()}}>Tilbake</button>
      </div>
        <div className='Rot_nyttArrangement'>
            <div className='form-group'>
          <label htmlFor='navn'>Arragnemnet navn:</label>
           <p name='navn'>{this.arrangement.navn}</p>
            </div>
            <div className='form-group'>
              <label htmlFor='beskrivelse'>Arragnemnet beskrivelse:</label>
              <p name='beskrivelse'>{this.arrangement.beskrivelse}</p>
            </div>
            <div className='form-group'>
              <label htmlFor='kontaktperson'>Kontaktperson:</label>
              <p name='kontaktperson'><Link to={'/bruker/'+this.user.id}>{this.user.fornavn}, {this.user.etternavn}</Link></p>
            </div>
            <div className='form-group'>
                <label htmlFor='oppmote'>Oppmøtetidspunkt:</label>
              <p name='oppmote'>{this.changeDate(this.arrangement.oppmootetidspunkt)}</p>
            </div>
            <div className='form-group'>
              <label htmlFor='start'>Starttidspunkt:</label>
              <p name='start'>{this.changeDate(this.arrangement.starttidspunkt)}</p>
            </div>
            <div className='form-group'>
              <label htmlFor='slutt'>Sluttidspunkt:</label>
            <p name='slutt'>{this.changeDate(this.arrangement.sluttidspunkt)}</p>
            </div>
            <div className='form-group'>
              <label htmlFor='kart'>Oppmøtested:</label>
              <p>{this.arrangement.address}</p>
              <MapWithAMarker name='kart'/>
            </div>
          </div>
      </div>
    )
  }
  }
  changeDate(variabel){
    let a = moment(variabel).format('DD.MM.YY HH:mm');
    return a;
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
                  sluttidspunkt: '',
                  oppmotested: ''
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
      <div>
      <button className='btn btn-default tilbakeKnapp' onClick={()=>{this.props.history.goBack()}}>Gå tilbake</button>
      </div>
        <div className='Rot_nyttArrangement'>
            <div className='form-group'>
              <label htmlFor='navn'>Arrangement navn:</label>
              <p name='navn'>{this.arrangement.navn}</p>
            </div>
            <div className='form-group'>
                <label htmlFor='beskrivelse'>Arrangement beskrivelse:</label>
              <textarea name='beskrivelse' className='form-control col-8' ref='text' value={this.state.beskrivelse} onChange={this.handleChange} />
            </div>
            <div className='form-group'>
              <label htmlFor='kontaktperson'>Kontaktperson:</label>
              <p name='kontaktperson'><Link to={'/bruker/'+this.user.id}>{this.user.fornavn}, {this.user.etternavn}</Link></p>
            </div>
            <div className='form-group'>
              <label htmlFor='oppmootetidspunkt'>Oppmøtetidspunkt:</label>
              <input className='sokeFelt' type='datetime-local'name='oppmootetidspunkt' ref='oppmøte' className='form-control col-8' value={this.state.oppmootetidspunkt} onChange={this.handleChange}/>
            </div>
            <div className='form-group'>
              <label htmlFor='starttidspunkt'>Starttidspunkt:</label>
              <input className='sokeFelt' type='datetime-local' name='starttidspunkt' ref='start' className='form-control col-8' value={this.state.starttidspunkt} onChange={this.handleChange} />
            </div>
            <div className='form-group'>
              <label htmlFor='sluttidspunkt'>Sluttidspunkt:</label>
              <input className='sokeFelt' type='datetime-local' name='sluttidspunkt' ref='slutt' className='form-control col-8' value={this.state.sluttidspunkt} onChange={this.handleChange} />
            </div>
            <div className='form-group'>
              <label htmlFor='kart'>Oppmøtested:</label>
              <p>{this.state.oppmotested}</p>
              <MapWithASearchBox name='kart' />
            </div>
            <div className='form-group'>
              <button className='btn btn-default' ref='lagreEndringer'>Lagre endringene</button>
            </div>
          </div>
      </div>
    )
  }
  changeDate(variabel){
  let a = moment(variabel).format('YYYY-MM-DDTHH:mm');
  return a;
  }
  componentWillUnmount(){
    latitude = 63.4123278
    longitude = 10.404471000000058
  }
  componentDidMount(){
    arrangementService.showArrangement(this.id).then((result)=>{
      this.arrangement = result[0];

      this.state.beskrivelse = this.arrangement.beskrivelse;
      this.state.oppmootetidspunkt = this.changeDate(this.arrangement.oppmootetidspunkt);
      this.state.starttidspunkt = this.changeDate(this.arrangement.starttidspunkt);
      this.state.sluttidspunkt = this.changeDate(this.arrangement.sluttidspunkt);
      this.state.oppmotested = this.arrangement.address;
      latitude = this.arrangement.latitude;
      longitude = this.arrangement.longitute;
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
    this.refs.lagreEndringer.onclick = () =>{
      arrangementService.updateArrangement(this.refs.text.value,this.refs.oppmøte.value,this.refs.start.value,this.refs.slutt.value,latitude,longitude,address,this.id).then((result)=>{
      history.push('/visArrangement/'+this.arrangement.id);
    }).catch((error)=>{
      if(errorMessage) errorMessage.set('Kan ikke oppdaterer arrangement' + error);
    });

    }
  }
}

class Innkalling extends React.Component {
  constructor(props) {
    super(props);
    this.id = props.match.params.id;
    this.arrangement = []
    this.r = 1;
    this.roller = []
    this.ikkeValgte = []
    this.valgte = []
  }

  render() {
    let rolle = []
    let ikkeValgtePersoner = []
    let valgtePersoner = []
    // console.log(this.roller);
    console.log(this.ikkeValgte);
    console.log(this.valgte);

    for(let i in this.ikkeValgte){
      let item = this.ikkeValgte[i];
      if (item.r_id === this.r) {
        ikkeValgtePersoner.push(<li key={item.m_id}>{item.r_id} - {item.brukernavn} - {(item.interesse) ? 'Ja':'Nei'} - {item.vaktpoeng} - {this.getRollName(item.registrert)} - {this.getRollName(item.opptatt)}<button className='btn btn-default' onClick={() => {this.leggTil(+i)}}>Flytt over</button></li>)
      }
    }
    for(let i in this.valgte){
      let item = this.valgte[i];
      if (item.r_id === this.r) {
        valgtePersoner.push(<li key={item.m_id}>{item.r_id} - {item.brukernavn} - {(item.interesse) ? 'Ja':'Nei'} - {item.vaktpoeng} - {this.getRollName(item.registrert)} - {this.getRollName(item.opptatt)}<button className='btn btn-default' onClick={() => {this.taVekk(+i)}}>Flytt over</button></li>)
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
              <button className='btn btn-default' ref='button'>Button</button>{this.r}</td>
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
        <button className='btn btn-default' ref="save">Save</button>
      </div>
    )
  }

  componentDidMount() {
    arrangementService.showArrangement(this.id).then((result)=>{
      this.arrangement = result[0];
      console.log(result[0]);
    }).catch((error)=>{
      if(errorMessage) errorMessage.set('Finner ikke arrangement')
    })
    arrangementService.getRoles(this.id).then((result) => {
      this.roller = result
      if (result && result[0]) {
        this.r = result[0].r_id;
      }
      // console.log(result);
      this.forceUpdate()
    }).catch((error) => {
      console.log(error);
      if(errorMessage) errorMessage.set('Fant ingen roller i dette arrnagementet' + error)
    })

    VaktValg.lagListe3(this.id).then((res)=>{
      // console.log(res);
      this.ikkeValgte = res;
      this.forceUpdate();
    }).catch((err)=>{
      console.log('Feil med resultatet');
      console.log(err);
    });

    VaktValg.getReg(this.id).then((res)=>{
      // console.log(res);
      this.valgte = res;
      this.forceUpdate();
    }).catch((err)=>{
      console.log('Feil med resultatet');
      console.log(err);
    });

    this.refs.button.onclick = () => {
      this.r = +this.refs.r.value;
      this.forceUpdate();
    }

    this.refs.save.onclick = () => {
      console.log(this.roller);

      let leggTil = [];
      let fjern = [];
      let ignorer = [];

      for(let item of this.ikkeValgte) {
        if(item.registrert) {
          fjern.push({
            m_id: item.m_id,
            r_id: item.registrert
          });
        }
      }

      for(let item of this.valgte) {
        if(item.registrert === item.opptatt) {
          ignorer.push({
            m_id: item.m_id,
            r_id: item.registrert
          });
        } else {
          if(item.registrert) {
            fjern.push({
              m_id: item.m_id,
              r_id: item.registrert
            });
          }
          leggTil.push({
            m_id: item.m_id,
            r_id: item.opptatt,
            epost: item.epost
          });
        }
      }
      console.log(ignorer);
      console.log(fjern);
      console.log(leggTil);

      for(let item of this.roller) {
        let count = 0;
        for(let med of leggTil) {
          if (med.r_id === item.r_id) {
            count++;
          }
        }
        for(let med of ignorer) {
          console.log('dawdsd');
          if (med.r_id === item.r_id) {
            console.log('greawdas');
            count++;
          }
        }
        if (count > item.antall) {
          console.log('Error');
          return;
        }
      }

      console.log(fjern);
      console.log(leggTil);

      let proms = [];
      for(let item of fjern) {
        console.log(item.m_id + ' - ' + this.id + ' - ' + item.r_id);
        proms.push(VaktValg.removeVakt(item.m_id, this.id, item.r_id));
      }
      Promise.all(proms).then(() => {
        console.log('Middels sukse!');
        let proms = []
        for(let item of leggTil) {
          console.log(item.m_id + ' - ' + this.id + ' - ' + item.r_id);
          proms.push(VaktValg.setVakt(item.m_id, this.id, item.r_id, new Date()).then((res) => {
            console.log('Mini sukse');
            console.log(res);
            console.log(item.epost);
            console.log(this.getRollName(item.r_id));
            console.log(this.arrangement.navn);
            console.log(this.arrangement.oppmootetidspunkt);
            console.log(moment(this.arrangement.oppmootetidspunkt).format('DD-MM-YYYY HH:mm'));
            emailService.innkalling(item.epost, this.getRollName(item.r_id), this.arrangement.navn, moment(this.arrangement.oppmootetidspunkt).format('DD-MM-YYYY HH:mm')).then((res) => {
              console.log('mikro sukse');
              console.log(res);
            }).catch((err) => {
              console.log('mikro feil');
              console.log(err);
            });
          }).catch((err) => {
            console.log('Mini feil');
            console.log(err);
          }));
        }
        console.log(proms);
        Promise.all(proms).then((res) => {
          console.log('MASSIV SUKSE!!!!');
          this.componentDidMount();
        }).catch((err) => {
          console.log('MASSIV FEIL!!!');
          console.log(err);
        });
      }).catch((err)=>{
        console.log('Something went wrong.');
        console.log(err);
      });

    }

  }

  leggTil(i) {
    console.log(i);
    let flytt = this.ikkeValgte[i].m_id;
    let roll = this.ikkeValgte[i].r_id;
    for (let per of this.valgte) {
      if (per.m_id === flytt) {
        return;
      }
    }
    this.valgte.push(this.ikkeValgte.splice(i,1)[0]);
    this.settOpptatt(flytt, roll);
    this.forceUpdate();
  }

  taVekk(i) {
    console.log(i);
    console.log(this.valgte);
    let flytt = this.valgte[i].m_id;
    console.log(flytt);
    this.ikkeValgte.push(this.valgte.splice(i,1)[0]);
    this.settOpptatt(flytt, 0);
    this.forceUpdate();
  }

  getRollName(reg) {
    if (reg) {
      for (let item of this.roller) {
        if (reg === item.r_id) {
          return item.navn;
        }
      }
      return 'ERROR: Roll id not found in event';
    }
    else {
      return 'Ikke registrert';
    }
  }

  settOpptatt(m_id, r_id) {
    console.log(m_id, r_id);
    for (var i = 0; i < this.valgte.length; i++) {
      if (this.valgte[i].m_id === m_id) {
        // console.log(m_id);
        // console.log(this.valgte[i].opptatt);
        // console.log(r_id);
        this.valgte[i].opptatt = r_id;
        // console.log(this.valgte[i].opptatt);
      }
    }
    for (var i = 0; i < this.ikkeValgte.length; i++) {
      if (this.ikkeValgte[i].m_id === m_id) {
        // console.log(m_id);
        // console.log(this.valgte[i].opptatt);
        // console.log(r_id);
        this.ikkeValgte[i].opptatt = r_id;
        // console.log(this.valgte[i].opptatt);
      }
    }
  }

  // setOpptatt(m_id, r_id) {
  //   for (item of this.ikkeValgte) {
  //     if (item.m_id === m_id) {
  //       item.opptatt = r_id
  //     }
  //   }
  //   for (item of this.valgte) {
  //     if (item.m_id === m_id) {
  //       item.opptatt = r_id;
  //     }
  //   }
  // }
}

class Utstyr extends React.Component {
  constructor() {
    super();
    this.utstyr = [];
  }
  render() {
    let utstyrsListe = [];

    utstyrsListe.push(<tr key={'utstyrsListe'}><td>Id</td><td>Navn</td><td>Knapper</td></tr>);
    for (let item of this.utstyr) {
      utstyrsListe.push(<tr key={item.id}><td>{item.id}</td><td>{item.navn}</td><td><button className='btn btn-default' onClick={() => {this.changeUtstyr(item.id)}}>Endre</button><button className='btn btn-default' onClick={() => {this.removeUtstyr(item.id)}}>Fjern</button></td></tr>);
    }

    return(
      <div>
        <div>
          <table>
            <tbody>
              {utstyrsListe}
            </tbody>
          </table>
          Navn: <input className='sokeFelt' ref='utNavn'/> <button className='btn btn-default' ref='lagUt'>Legg til</button>
        </div>
        <RolleUtstyr />
        <ArrangementUtstyr />
        <br />
      </div>
    )
  }
  componentDidMount() {
    this.update();

    this.refs.lagUt.onclick = () => {
      console.log(this.refs.utNavn.value);
      UtstyrService.addUtstyr(this.refs.utNavn.value).then((res) => {
        console.log(res);
        this.update();
      }).catch((err) => {
        console.log(err);
      });
    };
  }
  update() {
    UtstyrService.getAllUtstyr().then((res) => {
      console.log(res);
      this.utstyr = res;
      this.forceUpdate();
    }).catch((err) => {
      console.log(err);
    });
  }

  changeUtstyr(id) {
    console.log('Endre: ' + id);
    UtstyrService.alterUtstyr(id, this.refs.utNavn.value).then((res) => {
      console.log(res);
      this.update();
    }).catch((err) => {
      console.log(err);
    });
  }
  removeUtstyr(id) {
    console.log('Fjern: ' + id);
    UtstyrService.removeUtstyr(id).then((res) => {
      console.log(res);
      this.update();
    }).catch((err) => {
      console.log(err);
    });
  }
}

class RolleUtstyr extends React.Component {
  constructor() {
    super();
    this.rolleUtstyr = []
  }
  render() {
    let utstyrsListe = [];

    utstyrsListe.push(<tr key={'r_utstyrsListe'}><td>Rolle</td><td>Utstyr</td><td>Antall</td><td>Knapper</td></tr>);
    for (let item of this.rolleUtstyr) {
      utstyrsListe.push(<tr key={item.r_id + ' - ' + item.u_id}><td>{item.r_navn}</td><td>{item.u_navn}</td><td>{item.antall}</td><td><button className='btn btn-default' onClick={() => {this.changeUtstyr(item.r_id, item.u_id)}}>Endre</button><button className='btn btn-default' onClick={() => {this.removeUtstyr(item.r_id, item.u_id)}}>Fjern</button></td></tr>);
    }

    return(
      <div>
        <br />
        <p>Rolle utstyrsListe</p>
        <div>
          <table>
            <tbody>
              {utstyrsListe}
            </tbody>
          </table>
          Rolle: <input className='sokeFelt' ref='rolle'/> Utstyr: <input className='sokeFelt' ref='utstyr'/> Antall: <input className='sokeFelt' ref='antall'/> <button className='btn btn-default' ref='lagUt'>Legg til</button>
        </div>
        <br />
      </div>
    )
  }
  componentDidMount() {
    this.update();

    this.refs.lagUt.onclick = () => {
      console.log('Click');
      UtstyrService.addRU(this.refs.rolle.value, this.refs.utstyr.value, this.refs.antall.value).then((res) => {
        console.log(res);
        this.update();
      }).catch((err) => {
        console.log(err);
      });
    };
  }
  update() {
    UtstyrService.getAllRU().then((res) => {
      console.log(res);
      this.rolleUtstyr = res;
      this.forceUpdate();
    }).catch((err) => {
      console.log(err);
    });
  }

  changeUtstyr(r_id, u_id) {
    console.log('Endre');
    UtstyrService.alterRU(r_id, u_id, this.refs.antall.value).then((res) => {
      console.log(res);
      this.update();
    }).catch((err) => {
      console.log(err);
    });
  }
  removeUtstyr(r_id, u_id) {
    console.log('Fjern');
    UtstyrService.removeRU(r_id, u_id).then((res) => {
      console.log(res);
      this.update();
    }).catch((err) => {
      console.log(err);
    });
  }
}

class ArrangementUtstyr extends React.Component {
  constructor() {
    super();
    this.arrangememtUtstyr = []
  }
  render() {
    let utstyrsListe = [];

    utstyrsListe.push(<tr key={'a_utstyrsListe'}><td>Arrangement</td><td>Utstyr</td><td>Antall</td><td>Knapper</td></tr>);
    for (let item of this.arrangememtUtstyr) {
      utstyrsListe.push(<tr key={item.a_id + ' - ' + item.u_id}><td>{item.a_navn}</td><td>{item.u_navn}</td><td>{item.antall}</td><td><button className='btn btn-default' onClick={() => {this.changeUtstyr(item.a_id, item.u_id)}}>Endre</button><button className='btn btn-default' onClick={() => {this.removeUtstyr(item.a_id, item.u_id)}}>Fjern</button></td></tr>);
    }

    return(
      <div>
        <br />
        <p>Arrangament utstyrsListe</p>
        <div>
          <table>
            <tbody>
              {utstyrsListe}
            </tbody>
          </table>
          Arrangement: <input className='sokeFelt' ref='arrangement'/> Utstyr: <input className='sokeFelt' ref='utstyr'/> Antall: <input className='sokeFelt' ref='antall'/> <button className='btn btn-default' ref='lagUt'>Legg til</button>
        </div>
        <br />
      </div>
    )
  }
  componentDidMount() {
    this.update();

    this.refs.lagUt.onclick = () => {
      console.log('Click');
      UtstyrService.addAU(this.refs.arrangement.value, this.refs.utstyr.value, this.refs.antall.value).then((res) => {
        console.log(res);
        this.update();
      }).catch((err) => {
        console.log(err);
      });
    };
  }
  update() {
    UtstyrService.getAllAU().then((res) => {
      console.log(res);
      this.arrangememtUtstyr = res;
      this.forceUpdate();
    }).catch((err) => {
      console.log(err);
    });
  }

  changeUtstyr(a_id, u_id) {
    console.log('Endre');
    UtstyrService.alterAU(a_id, u_id, this.refs.antall.value).then((res) => {
      console.log(res);
      this.update();
    }).catch((err) => {
      console.log(err);
    });
  }
  removeUtstyr(a_id, u_id) {
    console.log('Fjern');
    UtstyrService.removeAU(a_id, u_id).then((res) => {
      console.log(res);
      this.update();
    }).catch((err) => {
      console.log(err);
    });
  }
}

class MineVakter extends React.Component {
  constructor(){
    super();
    this.godkjente = [];
    this.ikkeGodkjente = [];
    this.vaktbytter = []
  }
  render(){
    let ikke = [];
    let godtatt = [];
    let vakter = []
    for(let bytte of this.vaktbytter){
      vakter.push(<tr key={bytte.id}><td className='arrangementTableDataa'><Link to={'/bruker/'+ bytte.om_id}>{bytte.byttenavn}</Link>, vil bytte vakt med deg på arrangement <Link to={'/visArrangement/'+bytte.aid}>{bytte.arrangement}</Link></td><td className='arrangementTableDataa'><button className='btn btn-default' onClick={()=>{this.vaktGodtatt(bytte.id)}}>Ok</button><button className='btn btn-default' onClick={()=>{this.vaktIkkeGodtatt(bytte.id)}}>Nei</button></td></tr>)
    }
    for(let yes of this.godkjente){
      godtatt.push(<tr key={yes.id}><td className='arrangementTableDataa'><Link to={'/visArrangement/'+yes.id}>{yes.navn}</Link></td><td className='arrangementTableDataa'><button className='btn btn-default' onClick={()=>{this.bytte(yes.vakt_id, yes.rolleid, yes.id)}}>Bytt vakt</button></td></tr>);
    }
    for(let not of this.ikkeGodkjente){
      ikke.push(<tr key={not.id}><td className='arrangementTableDataa'><Link to={'/visArrangement/'+not.id}>{not.navn}</Link></td><td className='arrangementTableDataa'><button className='btn btn-default' onClick={()=>{this.godta(not.id)}}>Godta vakt</button></td></tr>);
    }
    return(
      <div className='mineVakterTabell'>
        <table className='table-responsive-a' >
          <thead>

          </thead>
          <tbody>
            <tr>
              <td>
                <p><strong>Ikke godkjente</strong></p>
              </td>
              <td>
                <p><strong>Godkjente</strong></p>
              </td>
              <td>
                <p><strong>Bytte forespørsler</strong></p>
              </td>
            </tr>
            <tr>
              <td className='mineVakter'>
                <table >
                  <tbody>

                      {ikke}

                  </tbody>
                </table>
              </td>
              <td className='mineVakter'>
                <table >
                  <tbody>

                        {godtatt}

                  </tbody>
                </table>
              </td>
              <td className='mineVakter'>
                <table >
                  <tbody>

                        {vakter}

                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>

      </div>
    );
  }
  vaktIkkeGodtatt(vaktid){
    arrangementService.ikkeGodtaVaktBytte(vaktid).then(()=>{
      this.componentDidMount();
    }).catch((error)=>{
      if(errorMessage) errorMessage.set('Du fikk ikke avslått vakten' + error);
    });
  }
  vaktGodtatt(vaktid){
    arrangementService.godtaVaktBytte(vaktid).then(()=>{
      arrangementService.vaktBytter(loginService.getSignedInUser().id).then((result)=>{
        this.vaktbytter = result;
        this.forceUpdate();
      }).catch((error)=>{
        if(errorMessage) errorMessage.set('Finner ikke vaktbytter' + error);
      });
    }).catch((error)=>{
      if(errorMessage) errorMessage.set('Du fikk ikke godtatt vaktbytte' + error);
    });
  }
  //Send forespørsel om vaktbytte
  bytte(vaktid, rolleid,arrangementid){
    VaktValg.lagListe3(arrangementid).then((result)=>{
      let søl = []
      for(let item of result){
        if(item.r_id === rolleid){
          søl.push({Navn: item.brukernavn, Id:item.m_id})
        }
      }
      velgBytteBruker = søl;
      Popup.plugins(vaktid).prompt2('', 'Velg bruker', function (value,signedInUser) {
        arrangementService.byttVakt(vaktid,value).then(()=>{
          console.log(value);
          history.push('/mineVakter');
        }).catch((error)=>{
          if(errorMessage) errorMessage.set('Får ikke byttet vakt' + error);
        });
      });
    }).catch((error)=>{
      if(errorMessage) errorMessage.set('Finner ikke det du leter etter' + error);
    });

  }
  //Godta vakt du er utkalt til
  godta(value){
    arrangementService.godtaVakt(new Date(),value,loginService.getSignedInUser().id).then(()=>{
      this.componentDidMount();
    }).catch((error)=>{
      if(errorMessage) errorMessage.set('Karte ikke godta vakt' + error);
    });
  }
  componentDidMount() {
    arrangementService.vaktBytter(loginService.getSignedInUser().id).then((result)=>{
      this.vaktbytter = result;
      this.forceUpdate();
    }).catch((error)=>{
      if(errorMessage) errorMessage.set('Finner ikke vaktbytter' + error);
    });
    arrangementService.getGodkjenteArrangement(loginService.getSignedInUser().id).then((result)=>{
      this.godkjente = result;
      this.forceUpdate();
    }).catch((error)=>{
      if(errorMessage) errorMessage.set('Finner ikke arrangement' + error);
    });
    arrangementService.getUtkaltArrangement(loginService.getSignedInUser().id).then((result)=>{
      this.ikkeGodkjente = result;
      this.forceUpdate();
    }).catch((error)=>{
      if(errorMessage) errorMessage.set('Finner ikke arrangement' + error);
    });
  }
}

class Kvalifikasjoner extends React.Component {
  constructor() {
    super();
    this.kvalifikasjon = [];
  }
  render() {
    let kvalListe = [];

    kvalListe.push(<tr key={'kvalListe'}><td>Id</td><td>Navn</td><td>Varighet</td><td>Knapper</td></tr>);
    for (let item of this.kvalifikasjon) {
      kvalListe.push(<tr key={item.id}><td>{item.id}</td><td>{item.navn}</td><td>{item.varighet}</td><td><button className='btn btn-default' onClick={() => {this.changeKval(item.id)}}>Endre</button><button className='btn btn-default' onClick={() => {this.removeKval(item.id)}}>Fjern</button></td></tr>);
    }

    return(
      <div>
        <div>
          <table>
            <tbody>
              {kvalListe}
            </tbody>
          </table>
          Navn: <input className='sokeFelt' ref='kvNavn'/> Varighet: <input className='sokeFelt'  ref='kvVar'/> <button className='btn btn-default' ref='lagKv'>Legg til</button>
        </div>
        <RolleKvalifikasjoner />
        <MedlemKvalifikasjoner />
        <br />
      </div>
    )
  }
  componentDidMount() {
    this.update();

    this.refs.lagKv.onclick = () => {
      console.log(this.refs.kvNavn.value);
      KvalifikasjonService.addKvalifikasjon(this.refs.kvNavn.value, this.refs.kvVar.value).then((res) => {
        console.log(res);
        this.update();
      }).catch((err) => {
        console.log(err);
      });
    };
  }
  update() {
    KvalifikasjonService.getAllKvalifikasjon().then((res) => {
      console.log(res);
      this.kvalifikasjon = res;
      this.forceUpdate();
    }).catch((err) => {
      console.log(err);
    });
  }

  changeKval(id) {
    console.log('Endre: ' + id);
    KvalifikasjonService.alterKvalifikasjon(id, this.refs.kvNavn.value, this.refs.kvVar.value).then((res) => {
      console.log(res);
      this.update();
    }).catch((err) => {
      console.log(err);
    });
  }
  removeKval(id) {
    console.log('Fjern: ' + id);
    KvalifikasjonService.removeKvalifikasjon(id).then((res) => {
      console.log(res);
      this.update();
    }).catch((err) => {
      console.log(err);
    });
  }
}

class RolleKvalifikasjoner extends React.Component {
  constructor() {
    super();
    this.rolleKval = []
  }
  render() {
    let kvalListe = [];

    kvalListe.push(<tr key={'RKListe'}><td>Rolle</td><td>Kvalifikasjon</td><td>Knapper</td></tr>);
    for (let item of this.rolleKval) {
      kvalListe.push(<tr key={item.r_id + ' - ' + item.k_id}><td>{item.r_navn}</td><td>{item.k_navn}</td><td><button className='btn btn-default' onClick={() => {this.removeKval(item.r_id, item.k_id)}}>Fjern</button></td></tr>);
    }

    return(
      <div>
        <br />
        <p>Rolle KvalifikkasjonListe</p>
        <div>
          <table>
            <tbody>
              {kvalListe}
            </tbody>
          </table>
          Rolle: <input className='sokeFelt' ref='rolle'/> Kvalifikasjon: <input className='sokeFelt' ref='kval'/> <button className='btn btn-default' ref='lagRK'>Legg til</button>
        </div>
        <br />
      </div>
    )
  }
  componentDidMount() {
    this.update();

    this.refs.lagRK.onclick = () => {
      console.log('Click');
      KvalifikasjonService.addRK(this.refs.rolle.value, this.refs.kval.value).then((res) => {
        console.log(res);
        this.update();
      }).catch((err) => {
        console.log(err);
      });
    };
  }
  update() {
    KvalifikasjonService.getAllRK().then((res) => {
      console.log(res);
      this.rolleKval = res;
      this.forceUpdate();
    }).catch((err) => {
      console.log(err);
    });
  }

  changeKval(r_id, k_id) {
    console.log('Endre');
    // KvalifikasjonService.alterRK(r_id, k_id).then((res) => {
    //   console.log(res);
    //   this.update();
    // }).catch((err) => {
    //   console.log(err);
    // });
  }
  removeKval(r_id, k_id) {
    console.log('Fjern');
    KvalifikasjonService.removeRK(r_id, k_id).then((res) => {
      console.log(res);
      this.update();
    }).catch((err) => {
      console.log(err);
    });
  }
}

class MedlemKvalifikasjoner extends React.Component {
  constructor() {
    super();
    this.medKval = []
  }
  render() {
    let kvalListe = [];

    kvalListe.push(<tr key={'medKval'}><td>Medlem</td><td>Kvalifikasjon</td><td>Gyldig til</td><td>Knapper</td></tr>);
    for (let item of this.medKval) {
      kvalListe.push(<tr key={item.m_id + ' - ' + item.k_id}><td>{item.m_navn}</td><td>{item.k_navn}</td><td>{moment(item.gyldig).format('YYYY-MM-DD')}</td><td><button className='btn btn-default' onClick={() => {this.changeKval(item.m_id, item.k_id)}}>Endre</button><button className='btn btn-default' onClick={() => {this.removeKval(item.m_id, item.k_id)}}>Fjern</button></td></tr>);
    }

    return(
      <div>
        <br />
        <p>Arrangament utstyrsListe</p>
        <div>
          <table>
            <tbody>
              {kvalListe}
            </tbody>
          </table>
          Medlem: <input className='sokeFelt' ref='med'/> Kvalifikasjon: <input className='sokeFelt' ref='kval'/> Gyldig til: <input className='sokeFelt' ref='gyldig'/> <button className='btn btn-default' ref='lagMK'>Legg til</button>
        </div>
        <br />
      </div>
    )
  }
  componentDidMount() {
    this.update();

    this.refs.lagMK.onclick = () => {
      console.log('Click');
      KvalifikasjonService.addMK(this.refs.med.value, this.refs.kval.value, new Date()).then((res) => {
        console.log(res);
        this.update();
      }).catch((err) => {
        console.log(err);
      });
    };
  }
  update() {
    KvalifikasjonService.getAllMK().then((res) => {
      console.log(res);
      this.medKval = res;
      this.forceUpdate();
    }).catch((err) => {
      console.log(err);
    });
  }

  changeKval(m_id, k_id) {
    console.log('Endre');
    KvalifikasjonService.alterMK(m_id, k_id, new Date()).then((res) => {
      console.log(res);
      this.update();
    }).catch((err) => {
      console.log(err);
    });
  }
  removeKval(m_id, k_id) {
    console.log('Fjern');
    KvalifikasjonService.removeMK(m_id, k_id).then((res) => {
      console.log(res);
      this.update();
    }).catch((err) => {
      console.log(err);
    });
  }
}

class Rolle extends React.Component {
  constructor() {
    super();
    this.roller = [];
  }
  render() {
    let rolleListe = [];

    rolleListe.push(<tr key={'rolleListe'}><td>Id</td><td>Navn</td><td>Knapper</td></tr>);
    for (let item of this.roller) {
      rolleListe.push(<tr key={item.id}><td>{item.id}</td><td>{item.navn}</td><td><button className='btn btn-default' onClick={() => {this.changeRolle(item.id)}}>Endre</button><button className='btn btn-default' onClick={() => {this.removeRolle(item.id)}}>Fjern</button></td></tr>);
    }

    return(
      <div>
        <div>
          <table>
            <tbody>
              {rolleListe}
            </tbody>
          </table>
          Navn: <input ref='roNavn'/> <button className='btn btn-default' ref='lagRo'>Legg til</button>
        </div>
      </div>
    )
  }
  componentDidMount() {
    this.update();

    this.refs.lagRo.onclick = () => {
      console.log(this.refs.roNavn.value);
      rolleService.addRolle(this.refs.roNavn.value).then((res) => {
        console.log(res);
        this.update();
      }).catch((err) => {
        console.log(err);
      });
    };
  }
  update() {
    rolleService.getAllRolle().then((res) => {
      console.log(res);
      this.roller = res;
      this.forceUpdate();
    }).catch((err) => {
      console.log(err);
    });
  }

  changeRolle(id) {
    console.log('Endre: ' + id);
    rolleService.alterRolle(id, this.refs.roNavn.value).then((res) => {
      console.log(res);
      this.update();
    }).catch((err) => {
      console.log(err);
    });
  }
  removeRolle(id) {
    console.log('Fjern: ' + id);
    rolleService.removeRolle(id).then((res) => {
      console.log(res);
      this.update();
    }).catch((err) => {
      console.log(err);
    });
  }
}

class Hjelp extends React.Component {
  render() {
    let signedInUser = loginService.getSignedInUser();
    if (signedInUser.admin === 1) {
      return(
        <div className='bd-content col-12'>
          <div className='row'>
            <div className='col'>
              <h3 className='display-4'>Opprette arrangement</h3>
              <p>
                For å lage et nytt arrangement gå til arrangement-fanen og klikk knappen hvor det står «Opprett arrangement».
                Deretter fyller du inn nødvendig informasjon.
              </p>
            </div>
            <div className='col'>
              <h3 className='display-4'>Kalle inn til arrangement</h3>
              <p>
              </p>
            </div>
            <div className='col'>
              <h3 className='display-4'>Godkjenne bruker</h3>
              <p>
              </p>
            </div>
          </div>
        </div>
      )
    } else {
      return(
        <div>
        </div>
      )
    }
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
        <Route exact path='/passiv' component={Passiv} />
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
        <Route exact path='/T-utstyr' component={Utstyr} />
        <Route exact path='/T-kvalifikasjon' component={Kvalifikasjoner} />
        <Route exact path='/T-rolle' component={Rolle} />
        <Route exact path='/mineVakter' component={MineVakter} />
        <Route exact path='/hjelp' component={Hjelp} />
      </Switch>
      <Popup />
    </div>
  </HashRouter>
), document.getElementById('root'))
