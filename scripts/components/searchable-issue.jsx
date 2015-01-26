'use strict';

var $      = require('jquery');
var moment = require('moment');

var SearchableIssue = React.createClass({
  getInitialState: function() {
    return {
      fetchResult: "",
      fetchState: "ready"
    };
  },

  handleUsernameSubmit: function(login) {
    var searchURL = 'https://api.github.com/search/issues?q=type:pr+author:"'+login+'"&sort=created&order=asc&per_page=1'
    var self = this;
    self.setState({
      fetchState: "loading"
    });
    $.getJSON(searchURL, function(data){
      if(data.items.length > 0){
        $.getJSON(data.items[0].pull_request.url, function(data){
          self.setState({
            fetchResult: data,
            fetchState: "found"
          });
        });
      } else {
        self.setState({
          fetchResult: {"login": login},
          fetchState: "missing"
        })
      }
    }).error(function(){
      self.setState({
        fetchResult: {"login": login},
        fetchState: "error"
      })
    })

  },

  render: function() {
    return (
      <div>
        <Header />
        <div className="content">
          <UsernameForm fetchState={this.state.fetchState} onUsernameSubmit={this.handleUsernameSubmit}/>
          <div id="main">
            <Issue fetchResult={this.state.fetchResult} fetchState={this.state.fetchState} />
          </div>
        </div>
      </div>
    )
  }
});

var Header = React.createClass({

  render: function() {
    return (
      <header>
        <h1>First Pull Request</h1>
        <h2>What was the first pull request you sent on GitHub?</h2>
      </header>
    );
  }
});

var UsernameForm = React.createClass({
  handleSubmit: function(e) {
    e.preventDefault();
    this.props.onUsernameSubmit(this.refs.login.getDOMNode().value);
  },

  render: function() {
    var cx = React.addons.classSet;
    var classes = cx({
      'spinner': true,
      'hide': !(this.props.fetchState === "loading")
    });

    return (
      <form id='user-form' onSubmit={this.handleSubmit} >
        <input ref='login' placeholder="Your GitHub username" className="login-field" />
        <div className={classes}>
          <div className="rect1"></div>
          <div className="rect2"></div>
          <div className="rect3"></div>
          <div className="rect4"></div>
          <div className="rect5"></div>
        </div>
      </form>
    );
  }
});

var Issue = React.createClass({

  render: function() {
    var partial,
        show;

    var result = this.props.fetchResult,
        fetchState = this.props.fetchState;

    switch (fetchState) {

      case "found":

        var status = "";
        if (result.merged) {
          status =
            <p>
              <time className="state merged moment-date"> Merged </time>
              <time className="state closed moment-date"> Closed </time>
            </p>
        } else if ( result.closed_at) {
          status =
            <p>
              <time className="state closed moment-date"> Closed </time>
            </p>
        } else {
          status =
            <p>
              <span className='state open'>Open</span>
            </p>
        }

        partial =
          <div key="found-result" className="result found cf">
            <h2 id="pr-title">
              <a href={ result.html_url} id="title" target="_blank">
                { result.title } &nbsp;
              </a>
              <span className="pr-number">#{ result.number}</span>
              <br/>
              <small>
                to &nbsp;
                <a href={ result.base.repo.html_url} target="_blank">
                  { result.base.repo.full_name}
                </a>
              </small>
            </h2>
            <div className="user-media">
              <a className="avatar" href={ result.user.html_url} target="_blank">
                <img src={ result.user.avatar_url} width="48" height="48" />
              </a>
              <div className="pr-dates">
                <p className="sent-on">
                  <a href={ result.user.html_url}>{ result.user.login}</a> sent this pull request
                  <time className="moment-date sent"> { moment(result.created_at).fromNow() } </time>
                </p>
                { status }
              </div>
            </div>
          </div>;
        break;

      case "missing":
        partial =
          <div key="missing-result" className="result missing">
            <h2>
              It doesn't look like
              <a href="https://github.com/{result.login}">{result.login}</a>
               has sent a pull request yet.
            </h2>
            <p>
              <strong>Need help sending your first pull request?</strong>
               Check out
              <a href="https://guides.github.com/activities/contributing-to-open-source/">
                this handy guide.
              </a>
            </p>
          </div>
        break;

      case "error":
        partial =
          <div key="error-result" className="result error">
            <h2>
              <b> {result.login} </b>
              doesn't appear to be on GitHub at all.
            </h2>
          </div>
        break;

      default:
        partial = <div />
    }

    var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;
    return (
      <div className="results-wrapper">
        <ReactCSSTransitionGroup transitionName="result">
          {partial}
        </ReactCSSTransitionGroup>
      </div>
    );
  }
});

module.exports = SearchableIssue;
