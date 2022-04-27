// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.13;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Voting is Ownable {

// VARIABLES
struct Voter {
    bool isRegistered;
    bool hasVoted;
    uint votedProposalId;
}
struct Proposal {
    string description;
    uint voteCount;
}
enum WorkflowStatus {
    RegisteringVoters,
    ProposalsRegistrationStarted,
    ProposalsRegistrationEnded,
    VotingSessionStarted,
    VotingSessionEnded,
    VotesTallied
}
WorkflowStatus public status;
mapping (address => Voter) voters;
Proposal[] public proposals;


// EVENTS
event VoterRegistered(address voterAddress); 
event WorkflowStatusChange(WorkflowStatus previousStatus, WorkflowStatus newStatus);
event ProposalRegistered(uint proposalId);
event Voted (address voter, uint proposalId);


// MODIFIERS
modifier whitelisted() {   // Require the voter has been whitelisted.
    require(voters[msg.sender].isRegistered, "You have not the permission to vote yet.");
    _;
}


// FUNCTIONS
function whitelist (address _address) public onlyOwner { // Allow voters to participate 
    voters[_address].isRegistered = true;
    voters[_address].hasVoted = false;
    emit VoterRegistered(_address);
}

function startProposalRegistering (WorkflowStatus _previousStatus,WorkflowStatus _newStatus) public onlyOwner { // Start proposal registering step
    status = WorkflowStatus.ProposalsRegistrationStarted;
    emit WorkflowStatusChange(_previousStatus, _newStatus);
}

function addProposals (string memory _description) public whitelisted {                                  // Allow voters to give vote proposals
    require(status==WorkflowStatus.ProposalsRegistrationStarted, "We are not in registering step yet."); // Ensure we are in proposal registering step
        proposals.push(Proposal(_description, 0));                                                       // Push the proposal into the array
        for (uint i = 0; i <= proposals.length; i++) {                                                   
            emit ProposalRegistered(i);
        }     
}

function stopProposalRegistering (WorkflowStatus _previousStatus,WorkflowStatus _newStatus) public onlyOwner { // Stop proposal registering step
    status = WorkflowStatus.ProposalsRegistrationEnded; 
    emit WorkflowStatusChange(_previousStatus, _newStatus);
}

function startVoting (WorkflowStatus _previousStatus,WorkflowStatus _newStatus) public onlyOwner { // Start the voting step
    status = WorkflowStatus.VotingSessionStarted;
    emit WorkflowStatusChange(_previousStatus, _newStatus);
}

function vote (uint _proposalId) public whitelisted {                                      // Allow voters to give their vote to their favorite proposal
    require(status == WorkflowStatus.VotingSessionStarted, "We are not in voting step.");  // Ensure we are in voting step
    require(!voters[msg.sender].hasVoted, "You have already voted.");                      // Ensure the voter has not already given his vote
    voters[msg.sender].votedProposalId = _proposalId;                                      // Knowing what proposal the voter has choose
    voters[msg.sender].hasVoted = true;                                                    // Tells the voter has voted
    proposals[_proposalId].voteCount += 1;                                                 // Add +1 vote to the voted proposal
    emit Voted(msg.sender, _proposalId);                 
}

function stopVoting (WorkflowStatus _previousStatus,WorkflowStatus _newStatus) public onlyOwner { // Stop the voting step
    status = WorkflowStatus.VotingSessionEnded;
    emit WorkflowStatusChange(_previousStatus, _newStatus);
}

function voteCounting (uint _proposalId) public view onlyOwner returns (uint _voteCount) {   // Vote counts getter for admin
    return proposals[_proposalId].voteCount;
}

function votesTallied (WorkflowStatus _previousStatus,WorkflowStatus _newStatus) public onlyOwner { // Ensure the votes are tallied
    status = WorkflowStatus.VotesTallied;
    emit WorkflowStatusChange(_previousStatus, _newStatus);
}

function winningProposal () public view returns (uint _winner) {                       // Get and returns the proposal which has been voted the most 
    require(status == WorkflowStatus.VotesTallied, "The votes are not tallied yet.");  // Ensure voters can call the function only if votes are tallied
    uint winningVoteCount = 0;
    for (uint i = 0; i < proposals.length; i++) {                                      // Use a "for" loop to go trough the array
        if (proposals[i].voteCount > winningVoteCount) {                               // Use a "if" condition to replace the proposal ID if it has more votes 
            winningVoteCount = proposals[i].voteCount;
            _winner = i;
        }
    }
    return _winner;
}

function getWinningProposalDetails () public view returns (string memory _details) {   // Returns the description of the winning proposal
    _details = proposals[winningProposal()].description;
    return _details;
}
}
