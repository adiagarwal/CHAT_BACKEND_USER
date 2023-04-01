let UserController = require('./user_controller');
let UserConvs = require('./conv_controller');
let Message_Controller = require('./message_controller');

let usercontroller = new UserController();
let convcontroller = new UserConvs();
let MessageController = new Message_Controller();

module.exports={
    usercontroller,
    convcontroller,
    MessageController
}