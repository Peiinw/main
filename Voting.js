const Voting = artifacts.require("./Voting.sol");
const { BN, expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');

contract('Voting', accounts => {
    const owner = accounts[0];
    const second = accounts[1];
    const third = accounts[2];
    const fourth = accounts[3];
    const fifth = accounts[4];
    const sixth = accounts[5];
    const seventh = accounts[6];

    let VotingInstance;


    describe("Test des changements d'états du Workflow", function () {


        before(async function () {
            VotingInstance = await Voting.new( {from: owner} );
        });


        it("Doit passer le Workflow de 0 à 1", async () => {
            await VotingInstance.startProposalsRegistering();
            const status = await VotingInstance.workflowStatus();
            console.log(new BN(status));
            expect(new BN(status)).to.be.bignumber.equal(new BN(Voting.WorkflowStatus.ProposalsRegistrationStarted));
        });

        it("Doit passer le Workflow de 1 à 2", async () => {
            await VotingInstance.endProposalsRegistering();
            const status = await VotingInstance.workflowStatus();
            console.log(new BN(status));
            expect(new BN(status)).to.be.bignumber.equal(new BN(Voting.WorkflowStatus.ProposalsRegistrationEnded));
        });

        it("Doit passer le Workflow de 2 à 3", async () => {
            await VotingInstance.startVotingSession();
            const status = await VotingInstance.workflowStatus();
            console.log(new BN(status));
            expect(new BN(status)).to.be.bignumber.equal(new BN(Voting.WorkflowStatus.VotingSessionStarted));
        });

        it("Doit passer le Workflow de 3 à 4", async () => {
            await VotingInstance.endVotingSession();
            const status = await VotingInstance.workflowStatus();
            console.log(new BN(status));
            expect(new BN(status)).to.be.bignumber.equal(new BN(Voting.WorkflowStatus.VotingSessionEnded));
        }); 
    });


describe("Test des setters", function () {


        before(async function () {
            VotingInstance = await Voting.new( {from: owner} );
        });


        it("Doit enregistrer le voter dans le mapping", async () => {
            await VotingInstance.addVoter(owner, { from: owner });
            const storedData = await VotingInstance.getVoter(owner);
            expect(storedData.isRegistered).to.be.true;
        });

        it("Doit enregistrer une proposal dans l'array", async () => {
            await VotingInstance.startProposalsRegistering();
            await VotingInstance.addProposal("pomme", { from: owner });
            const storedData = await VotingInstance.getOneProposal(0);
            expect(storedData.description).to.equal("pomme");
        });

        it("Doit enregistrer un vote sur la struct Voter", async () => {
            await VotingInstance.endProposalsRegistering();
            await VotingInstance.startVotingSession();
            await VotingInstance.setVote(0, { from: owner });
            const storedData = await VotingInstance.getVoter(owner);
            expect(storedData.hasVoted).to.be.true;
            expect(new BN(storedData.votedProposalId)).to.be.bignumber.equal(new BN(0));
        });
    });


    describe("Test des Events", function () {


        before(async function () {
            VotingInstance = await Voting.new({ from: owner });
        });


        it("Doit enregister un voter et ajouter l'event 'VoterRegistered' ", async () => {
            const findEvent = await VotingInstance.addVoter(owner, { from: owner });
            expectEvent(findEvent, "VoterRegistered", {voterAddress: owner});
        });

        it("Doit enregister une proposal et ajouter l'event 'ProposalRegistered' ", async () => {
            await VotingInstance.startProposalsRegistering();
            const findEvent = await VotingInstance.addProposal("pomme", { from: owner });
            expectEvent(findEvent, "ProposalRegistered", {proposalId: new BN(0)});
        });

        it("Doit enregister un vote et ajouter l'event 'Voted' ", async () => {
            await VotingInstance.endProposalsRegistering();
            await VotingInstance.startVotingSession();
            const findEvent = await VotingInstance.setVote(0, { from: owner });
            expectEvent(findEvent, "Voted", {voter: owner, proposalId: new BN(0)});
        });

        it("Doit passer le Workflow de 3 à 4 et ajouter l'event 'WorkflowStatusChange' ", async () => {
            const findEvent = await VotingInstance.endVotingSession();
            expectEvent(findEvent, "WorkflowStatusChange", {previousStatus: new BN(Voting.WorkflowStatus.VotingSessionStarted), newStatus: new BN(Voting.WorkflowStatus.VotingSessionEnded)});
        });
    });


    describe("Test des Require / Revert", function () {


        beforeEach(async function () {
            VotingInstance = await Voting.new({from: owner});
        });


        it("Modifier OnlyVoters, Doit revert lors des ajouts de propositions si la personne n'est pas enregistée dans le mapping", async () => {
            await VotingInstance.startProposalsRegistering();
            await expectRevert(VotingInstance.addProposal("pomme", {from: second}), "You're not a voter");
        });

        it("Modifier OnlyOwner, Doit revert si la personne utilisant la fonction n'est pas l'admin", async () => {
            await expectRevert(VotingInstance.startProposalsRegistering({from: second}), "Ownable: caller is not the owner");
        });

        it("Doit revert si la session d'enregistrement est terminée et qu'on ajoute un voter", async () => {
            await VotingInstance.startProposalsRegistering();
            await expectRevert(VotingInstance.addVoter(second, {from: owner}), 'Voters registration is not open yet');
        });

        it("Doit revert lors d'un ajout de voter si la personne est déjà enregistée dans le mapping", async () => {
            await VotingInstance.addVoter(second, {from: owner});
            await expectRevert(VotingInstance.addVoter(second, {from: owner}), 'Already registered');
        });

        it("Doit revert lors d'un ajout de proposal si la session d'enregistrement n'a pas commencé", async () => {
            await VotingInstance.addVoter(owner, {from: owner});
            await expectRevert(VotingInstance.addProposal("banane", {from: owner}), 'Proposals are not allowed yet');
        });

        it("Doit revert lors d'un ajout de proposal si la proposal est vide", async () => {
            await VotingInstance.addVoter(owner, {from: owner});
            await VotingInstance.startProposalsRegistering();
            await expectRevert(VotingInstance.addProposal("", {from: owner}), 'Vous ne pouvez pas ne rien proposer');
        });

        it("Doit revert lors d'un ajout de vote si la session de vote n'a pas commencé", async () => {
            await VotingInstance.addVoter(owner, {from: owner});
            await expectRevert(VotingInstance.setVote(new BN(0), {from: owner}), 'Voting session havent started yet');
        });

        it("Doit revert lors d'un ajout de vote si la personne a déjà voté", async () => {
            await VotingInstance.addVoter(owner, {from: owner});
            await VotingInstance.startProposalsRegistering();
            await VotingInstance.addProposal("pomme", {from: owner});
            await VotingInstance.endProposalsRegistering();
            await VotingInstance.startVotingSession();
            await VotingInstance.setVote(new BN(0), {from: owner});
            await expectRevert(VotingInstance.setVote(new BN(0), {from: owner}), 'You have already voted');
        });

        it("Doit revert lors d'un ajout de vote si l'ID de la proposal n'existe pas'", async () => {
            await VotingInstance.addVoter(owner, {from: owner});
            await VotingInstance.startProposalsRegistering();
            await VotingInstance.addProposal("pomme", {from: owner});
            await VotingInstance.endProposalsRegistering();
            await VotingInstance.startVotingSession();
            await expectRevert(VotingInstance.setVote(new BN(10), {from: owner}), 'Proposal not found');
        });

        it("Doit revert si l'état du Workflow n'est pas sur RegisteringVoters", async () => {
            await VotingInstance.startProposalsRegistering();
            await VotingInstance.endProposalsRegistering();
            await expectRevert(VotingInstance.startProposalsRegistering(), 'Registering proposals cant be started now');
        });

        it("Doit revert si l'état du Workflow n'est pas sur ProposalsRegistrationStarted", async () => {
            await expectRevert(VotingInstance.endProposalsRegistering(), 'Registering proposals havent started yet');
        });

        it("Doit revert si l'état du Workflow n'est pas sur ProposalsRegistrationEnded", async () => {
            await expectRevert(VotingInstance.startVotingSession(), 'Registering proposals phase is not finished');
        });

        it("Doit revert si l'état du Workflow n'est pas sur VotingSessionStarted", async () => {
            await expectRevert(VotingInstance.endVotingSession(), 'Voting session havent started yet');
        });

        it("Doit revert si l'état du Workflow n'est pas sur VotingSessionEnded", async () => {
            await expectRevert(VotingInstance.tallyVotes(), "Current status is not voting session ended");
        });
    });


    describe("Test du comptage des votes", function () {


        before(async function () {
            VotingInstance = await Voting.new( {from: owner} );
        });
        

        it("Doit retourner la proposition avec le plus de vote", async () => {
            await VotingInstance.addVoter(owner, {from: owner});
            await VotingInstance.addVoter(second, {from: owner});
            await VotingInstance.addVoter(third, {from: owner});
            await VotingInstance.addVoter(fourth, {from: owner});
            await VotingInstance.addVoter(fifth, {from: owner});
            await VotingInstance.addVoter(sixth, {from: owner});
            await VotingInstance.addVoter(seventh, {from: owner});
            await VotingInstance.startProposalsRegistering();
            await VotingInstance.addProposal("pomme", {from: owner});
            await VotingInstance.addProposal("banane", {from: third});
            await VotingInstance.addProposal("poire", {from: fifth});
            await VotingInstance.addProposal("mangue", {from: seventh});
            await VotingInstance.endProposalsRegistering();
            await VotingInstance.startVotingSession();
            await VotingInstance.setVote(new BN(0), {from: owner});
            await VotingInstance.setVote(new BN(0), {from: second});
            await VotingInstance.setVote(new BN(1), {from: third});
            await VotingInstance.setVote(new BN(1), {from: fourth});
            await VotingInstance.setVote(new BN(1), {from: fifth});
            await VotingInstance.setVote(new BN(1), {from: sixth});
            await VotingInstance.setVote(new BN(2), {from: seventh});
            await VotingInstance.endVotingSession();
            await VotingInstance.tallyVotes();
            const storedData = await VotingInstance.winningProposalID();
            expect(new BN (storedData)).to.be.bignumber.equal(new BN (1));
        });
    });
});