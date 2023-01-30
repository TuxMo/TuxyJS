export default class TestController {
  index(request, response) {
    response.status(200).json({type: 'TestController'});
  }
}
