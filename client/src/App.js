import React, { Component } from "react";
import ElectionContract from "./contracts/Election.json";
import getWeb3 from "./getWeb3";

import "./App.css";

class App extends Component {
  state = { loaded: false, putUpMessage: '', candidates: {} };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      this.web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      this.accounts = await this.web3.eth.getAccounts();

      // Get the contract instance.
      this.networkId = await this.web3.eth.net.getId();

      this.electionInstance = new this.web3.eth.Contract(
        ElectionContract.abi,
        ElectionContract.networks[this.networkId] && ElectionContract.networks[this.networkId].address,
      );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.listenForEvents();
      this.setState({ loaded: true }, this.getCandidates);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  listenForEvents = () => {
    this.electionInstance.events.newVote().on('data', result => {
      this.setState(prevState => {
        let candidates = Object.assign({}, prevState.candidates);
        candidates[result.returnValues.addr] = result.returnValues.votes;                
        return {candidates};
      })
    })
    this.electionInstance.events.newCandidateAdded().on('data', (result) => {
      this.setState(prevState => {
        let candidates = Object.assign({}, prevState.candidates);
        candidates[result.returnValues.addr] = 0;                
        return {candidates};
      })
    })
  }

  getCandidates = async() => {
    let candidates = await this.electionInstance.methods.getCandidates().call();
    
    if (candidates.length >= 1) {
      candidates.forEach(async(c) => {
        let votes = await this.electionInstance.methods.getVotesFor(c).call();
        this.setState(prevState => {
          let candidates = Object.assign({}, prevState.candidates);
          candidates[c] = votes;                
          return {candidates};
       })
      })
    }
  }

  addNewCandidate = () => {
    this.electionInstance.methods.enterSelection().send({from: this.accounts[0]})
    .then(() => this.setState({putUpMessage: 'You are put up for election. Good luck.'}))
    .catch(() => this.setState({putUpMessage: 'There was an error. Find additional output in the console.'}))
  }

  handleVoteFor = (addr) => {
    this.electionInstance.methods.voteFor(addr).send({from: this.accounts[0]})
    .then(() => alert('Thanks for voting!'))
    .catch(() => alert('There was an error. Find additional output in the console.'))
  }

  render() {
    if (!this.state.loaded) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <div className="container">
          <div className="description">
            <div className="inner">
              <h1>Blockchain Election</h1>
              <p>
                Vote for your next blockchain president! Simply click on the "VOTE" button next to a candidate in order to vote.
                <br />
                <br />
                If you want to put yourself up for election, click the button below.
              </p>
              <div>
                <button type="button" onClick={this.addNewCandidate}>Put me up!</button>
                <div style={{marginTop: 15}}>{this.state.putUpMessage || ' '}</div>
              </div>
            </div>
          </div>
          <div className="candidates">
            {Object.keys(this.state.candidates).map(key => {
                return (<div className="candidate" key={key}>
                  <strong>Candidate: </strong>{key}
                  <br />
                  <strong>Votes: </strong>{this.state.candidates[key]}
                  <div style={{marginTop: 10}}>
                    <button type="button" onClick={() => this.handleVoteFor(key)}>Vote!</button>
                  </div>
                </div>)
            })}
          </div>
        </div>
      </div>
    );
  }
}

export default App;
