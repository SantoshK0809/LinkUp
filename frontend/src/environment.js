let IS_PROD = true;

const servers = IS_PROD
  ? "https://linkupbackend-rusu.onrender.com"
  : "http://localhost:3000";

export default servers;
