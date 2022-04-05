# Tests unitaires du contract "Voting"

Les tests portent sur le contract "Voting" de la correction du drive que j'ai ouvert tel quel et dont je n'ai rien modifié.

J'ai décidé de le faire dans l'ordre chronologique pour chaque catégorie, ce qui me semblait être le plus pertinent vu le déroulement d'un vote.

---
## Nombre de test total : 26
---
## Pourcentage de coverage atteint : 100%

|File         |  % Stmts | % Branch |  % Funcs |  % Lines |Uncovered Lines |
|-------------|----------|----------|----------|----------|----------------|
| contracts/  |      100 |      100 |      100 |      100 |                |
|  Voting.sol |      100 |      100 |      100 |      100 |                ||
|All files    |      100 |      100 |      100 |      100 |                |

---

## 1) Test des changements d'états du Workflow


### 4 Tests :

- Doit passer le Workflow de 0 à 1
- Doit passer le Workflow de 1 à 2
- Doit passer le Workflow de 2 à 3
- Doit passer le Workflow de 3 à 4
---
## 2) Test des setters
### 3 Tests :

- Doit enregistrer le voter dans le mapping 
- Doit enregistrer une proposal dans l'array
- Doit enregistrer un vote sur la struct Voter
---
## 3) Test des Events
### 4 Tests :

- Event : VoterRegistered
- Event : ProposalRegistered
- Event : Voted
- Event : WorkflowStatusChange
---
## 4) Test des Requires / Reverts
### 14 Tests :

- Modifier OnlyVoters, Doit revert lors des ajouts de propositions si la personne n'est pas enregistée dans le mapping
- Modifier OnlyOwner, Doit revert si la personne utilisant la fonction n'est pas l'admin
- Doit revert si la session d'enregistrement est terminée et qu'on ajoute un voter
- Doit revert lors d'un ajout de voter si la personne est déjà enregistée dans le mapping
- Doit revert lors d'un ajout de proposal si la session d'enregistrement n'a pas commencé
- Doit revert lors d'un ajout de proposal si la proposal est vide
- Doit revert lors d'un ajout de vote si la session de vote n'a pas commencé
- Doit revert lors d'un ajout de vote si la personne a déjà voté
- Doit revert lors d'un ajout de vote si l'ID de la proposal n'existe pas
- Doit revert si l'état du Workflow n'est pas sur RegisteringVoters
- Doit revert si l'état du Workflow n'est pas sur ProposalsRegistrationStarted
- Doit revert si l'état du Workflow n'est pas sur ProposalsRegistrationEnded
- Doit revert si l'état du Workflow n'est pas sur VotingSessionStarted
- Doit revert si l'état du Workflow n'est pas sur VotingSessionEnded
---
## 5) Test de la fonction "tallyVotes"
### 1 Test :
- Doit retourner la proposition avec le plus de vote
---
Thanks for reading ! :)
