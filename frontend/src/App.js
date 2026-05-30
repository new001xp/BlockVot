import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import "./App.css";

const CONTRACT_ADDRESS = "PASTE_DEPLOYED_CONTRACT_ADDRESS";

const ABI = [
  "function candidatesCount() view returns(uint)",
  "function getCandidate(uint) view returns(uint,string,uint)",
  "function vote(uint)"
];

function App() {
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [candidates, setCandidates] = useState([]);

  useEffect(() => {
    connectWallet();
  }, []);

  async function connectWallet() {
    if (!window.ethereum) {
      alert("Install MetaMask");
      return;
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);

    const signer = await provider.getSigner();
    const address = await signer.getAddress();

    setAccount(address);

    const votingContract = new ethers.Contract(
      CONTRACT_ADDRESS,
      ABI,
      signer
    );

    setContract(votingContract);

    loadCandidates(votingContract);
  }

  async function loadCandidates(votingContract) {
    const count = await votingContract.candidatesCount();

    let loaded = [];

    for (let i = 1; i <= Number(count); i++) {
      const candidate = await votingContract.getCandidate(i);

      loaded.push({
        id: candidate[0].toString(),
        name: candidate[1],
        votes: candidate[2].toString()
      });
    }

    setCandidates(loaded);
  }

  async function vote(id) {
    try {
      const tx = await contract.vote(id);
      await tx.wait();

      alert("Vote submitted successfully!");

      loadCandidates(contract);
    } catch (err) {
      alert(err.reason || "Transaction failed");
    }
  }

  return (
    <div className="container">
      <h1>BlockVote</h1>

      <p className="wallet">
        Connected Wallet: {account}
      </p>

      <div className="cards">
        {candidates.map((candidate) => (
          <div key={candidate.id} className="card">
            <h2>{candidate.name}</h2>
            <p>Votes: {candidate.votes}</p>

            <button onClick={() => vote(candidate.id)}>
              Vote
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
