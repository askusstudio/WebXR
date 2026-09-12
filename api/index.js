// api/index.js - Vercel Serverless Function Entrypoint
// MAYAVUE 6-Stage End-to-End VR Certification Platform

const { handleRequest } = require('../server.js');

module.exports = async (req, res) => {
  return handleRequest(req, res);
};
