const http = require('restana')();
const bodyParser = require('body-parser');
const storage = require('node-persist');


/**
 * Setup
 */
async function setup() {
  await storage.init();
}
http.use(bodyParser.json({
  limit: '20mb'
}))
http.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
  // Allow incorrectly named header "contenttype" (due to error in the original Mydraft UI)
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, contenttype");
  next();
});
setup();



/**
 * Routes
 */
http
  .options('*', (req, res) => { res.send() })
  .get('/', (req, res) => { res.send() })
  .get('/:token', getDiagram)
  .post('/', saveDiagram)
  .put('/:readToken/:writeToken', updateDiagram)



/**
 * @description Get a saved diagram
 * @param {any} req Request
 * @param {any} res Response
 */
async function getDiagram(req, res) {
  const item = await storage.getItem(req.params.token);
  let data = {};
  if(item) data = item.data;
  res.send(data);
}



/**
 * @description Save new diagram
 * @param {any} req Request
 * @param {any} res Response
 */
async function saveDiagram(req, res) {
  const tokens = {
    readToken: createToken(),
    writeToken: createToken()
  };
  await storage.setItem(tokens.readToken, {
    writeToken: tokens.writeToken,
    data: req.body
  })
  res.send(tokens);
}



/**
 * @description Update existing diagram
 * @param {any} req Request
 * @param {any} res Response
 */
async function updateDiagram(req, res) {
  const item = await storage.getItem(req.params.readToken);
  if(item && item.writeToken === req.params.writeToken) {
    await storage.setItem(req.params.readToken, {
      writeToken: item.writeToken,
      data: req.body
    });
  }
  res.send();
}



/**
 * @description Create simple tokens
 */
function createToken() {
  return (
    Math.random().toString(36).substr(2, 10) + 
    Date.now().toString(36) + 
    Math.random().toString(36).substr(2, 10) + 
    Math.random().toString(36).substr(2, 10)
  );
}


/**
 * Start the service
 */
http.start(8080).then((server) => {});