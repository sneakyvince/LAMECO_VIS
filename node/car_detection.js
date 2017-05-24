var cv = require('../../../lib/opencv');
var count = 0;
var io = require('socket.io').listen(8000);
var amountCars;
var mySocket;

io.sockets.on('connection', function (socket) {
  // mySocket is filled with socket so that I can use it later in the camera read function
  mySocket = socket;
  console.log('connected');

  // If a web browser disconnects from Socket.IO then this callback is called.
  socket.on('disconnect', function () {
    console.log('disconnected');
  });
});

try {

  var camera = new cv.VideoCapture(0);
  var window = new cv.NamedWindow('Video', 0)
  setInterval(function () {

    camera.read(function (err, im) {


      if (err) throw err;
      //console.log(im.size())

      if (im.size()[0] > 0 && im.size()[1] > 0) {

        im.detectObject("../../../data/hogcascade_cars_sideview.xml", {}, function (err, cars) {
          if (err) throw err;

          for (var i = 0; i < cars.length; i++) {
            var x = cars[i];
            im.rectangle([x.x, x.y], [x.width, x.height]);
          }

          window.show(im);
          console.log(cars.length);
          amountCars = cars.length;

          if (mySocket) {
            mySocket.send(amountCars);
          }

        });
        count++;
        //im.save('./tmp/car-detection-' + count + '.jpg');
      }
      window.blockingWaitKey(0, 50);
    });
  }, 2000);

} catch (e) {
  console.log("Couldn't start camera:", e)
}
