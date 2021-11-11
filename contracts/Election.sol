pragma solidity ^0.8.7;

contract Election {
    struct CandidateInfo {
        uint votes;
        bool isPutUpForElection;
    }
    
    address[] public candidatesArray;
    
    mapping(address => CandidateInfo) public candidates;
    mapping(address => bool) hasVoted;

    event newCandidateAdded(address addr);
    event newVote(address addr, uint votes);
    
    function enterSelection() public {
        require(!candidates[msg.sender].isPutUpForElection, "You are already set up for election.");
        candidates[msg.sender].isPutUpForElection = true;
        candidatesArray.push(msg.sender);
        emit newCandidateAdded(msg.sender);
    }
    
    function voteFor(address _addr) public {
        require(!hasVoted[msg.sender], "You have already voted in this election.");
        require(candidates[_addr].isPutUpForElection, "This person is not set up for election");
        hasVoted[msg.sender] = true;
        candidates[_addr].votes++;
        emit newVote(_addr, candidates[_addr].votes);
    }
    
    function getVotesFor(address _addr) public view returns(uint) {
        return candidates[_addr].votes;
    }
    
    function getCandidates() public view returns(address[] memory) {
        return candidatesArray;
    }
}