const axios = require("axios");
var sha256 = require("js-sha256").sha256;
require("dotenv").config();

const baseURL = process.env.URL;
const apiKey = process.env.API_KEY;

const apiCall = axios.create({
  baseURL,
  headers: {
    Authorization: "Token " + apiKey
  }
});

console.log(baseURL, apiKey);

const proof_of_work = (last_proof, difficulty) => {
  console.log("Searching for next proof");
  let proof = 0;
  while (valid_proof(last_proof, proof, difficulty) === false) {
    proof += 1;
    // console.log(proof);
  }
  console.log(`Proof found: ${proof}`);
  return proof;
};

const valid_proof = (last_proof, proof, difficulty) => {
  // Validates the Proof:  Does hash(last_proof, proof) contain 8 leading zeroes?
  const guess = `${last_proof}${proof}`;
  const guess_hash = sha256
    .create()
    .update(guess)
    .hex()
    .slice(0, difficulty);
  //   console.log("valid_proof", guess_hash);
  if (guess_hash === "000000") {
    return true;
  } else {
    return false;
  }
};

const getStatus = async () => {
  try {
    const { data } = await apiCall.post("/api/adv/status");
    if (data) console.log(data);
    return data;
  } catch (err) {
    console.log(err);
    return err;
  }
};

const getProof = async () => {
  try {
    const { data } = await apiCall.get("/api/bc/last_proof");
    console.log("getProof response", data);
    return data;
  } catch (err) {
    console.log(err);
    return err;
  }
};

const mine = async proof => {
  try {
    const { data } = await apiCall.post("/api/bc/mine", { proof: proof });
    console.log("mine response", data);
    return data;
  } catch (err) {
    console.log(err);
    return err;
  }
};

const autoMine = async () => {
  const proofRes = await getProof();
  const newProof = await proof_of_work(proofRes.proof, proofRes.difficulty);
  const mineRes = await setTimeout(() => mine(newProof), 10 * 1000);
  setTimeout(async () => await console.log("global mine", mineRes), 10 * 1000);
};
// try {
//   const { data } = await setTimeout(() => {
//     apiCall.get("/api/bc/last_proof");
//   }, cooldown);
//   console.log("get Proof: ", data);
//   cooldown = data.cooldown * 1000;
//   const proof = setTimeout(() => {
//     proof_of_work(data.proof);
//   }, data.cooldown * 1000);
//   const mineResponse = await apiCall.post("/api/bc/mine", {
//     proof: `${proof}`
//   });
//   console.log("mineResponse", mineResponse.data);
//   cooldown = mineResponse.data.cooldown * 1000;
// } catch (err) {
//   console.log(err);
//   if (err.response.status === 400) !keepMining;
// }
autoMine();
