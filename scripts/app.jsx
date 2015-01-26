'use strict';

var React = require('react/addons');
window.React = React;

var SearchableIssue = require('./components/searchable-issue.jsx');

React.render(<SearchableIssue />, document.getElementById('content'));
