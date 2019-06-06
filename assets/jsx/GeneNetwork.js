'use strict';


var GN = require('../../config/gn.js');

var React = require('react');
var ReactDOM = require('react-dom');
var ReactRouter = require('react-router');
var Router = ReactRouter.Router;
var Route = ReactRouter.Route;
var createBrowserHistory = require('history/lib/createBrowserHistory');

var Landing = require('./Landing');
var FAQ = require('./FAQ');
var About = require('./About');
var GeneList = require('./GeneList');
var API = require('./ReactComponents/API');
var Gene = require('./Gene/Gene');
var Term = require('./ReactComponents/Term');
var Network = require('./Network/Network');
var Ontology = require('./ReactComponents/Ontology');
var DiagnosisMain = require('./ReactComponents/DiagnosisMain');
var Diagnosis = require('./ReactComponents/Diagnosis');

//TODO: Is this really necessary? we can just import it in the appropriate jsx files, right?
window.GN = GN;

var history = createBrowserHistory();
ReactDOM.render(<Router history={history}>
                    <Route>
                        <Route path='/' component = {Landing}>
                            <Route path='/faq' component = {FAQ} />
                            <Route path='/about' component = {About} />
                            <Route path='/api' component = {API} />
                            <Route path='/gene-list' component = {GeneList} />
                            <Route path='/gene/:geneId' component = {Gene} />
                            <Route path='/term/:termId' component = {Term} />
                            <Route path='/network/:ids' component = {Network} />
                            <Route path='/ontology/:id' component = {Ontology} />
                            <Route path='/gado' component = {DiagnosisMain} />
                            <Route path='/gado/:id' component = {Diagnosis} />
                        </Route>
                    </Route>
                </Router>,
                document.getElementById('reactcontainer')
               );
