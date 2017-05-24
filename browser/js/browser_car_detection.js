//
// ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── I ──────────
//   :::::: F I L E T R I S   A N I M A T I O N   B A S E D   O N   O P E N C V   C A R   D E T E C T I O N : :  :   :    :     :        :          :
// ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
//

//
// ─── CANVAS XMOVE ANIMATION ─────────────────────────────────────────────────────
//

$(document).ready(function () {

    "use strict";

    var c = document.getElementById("c"),
        ctx = c.getContext("2d"),
        WIDTH = c.width = window.innerWidth,
        HEIGHT = c.height = window.innerHeight;

    var particles = [],
        particle = null,
        particleCount = 3,
        radius = 0,
        numParticles = [0, 0, 0, 0, 0, 0],
        colors = ["#00FF6D", "E8D90C", "#FF5900", "#C00CE8", "#0D90FF"];

    var Vector = function (x, y) {
        this.x = x || 0;
        this.y = y || 0;
    };

    Vector.prototype = {
        constructor: Vector,
        add: function (v) {
            this.x += v.x;
            this.y += v.y;
        },
        sub: function (v) {
            this.x -= v.x;
            this.y -= v.y;
        },
        mul: function (v) {
            this.x *= v.x;
            this.y *= v.y;
        }
    };

    var Particle = function (position, velocity, radius, lane, color) {
        this.position = position;
        this.velocity = velocity;
        this.radius = radius;
        this.baseRadius = radius;
        this.angle = 3;
        this.lane = lane;
        this.color = color;

    };

    Particle.prototype = {
        constructor: Particle,
        update: function (lane) {
            this.radius = 3;
            this.angle += 10;
            this.position.add(this.velocity);

            // CHECKS FIRST IF THERE'S ALREADY A PARTICLE IN THE LANE AND THEN SHORTENS THE STOP LENGTH
            if (this.position.x > WIDTH - (numParticles[this.lane] + 1) * 120) {

                // IF THERE IS ALREADY A PARTICLE ON A LANE THE NUMBER OF PARTICLES PER IS INCREASED
                if (this.velocity.x > 0) {
                    console.log(numParticles[this.lane] + " particles in this lane")
                    numParticles[this.lane]++;

                    if (numParticles[this.lane] > 8) {

                        numParticles[this.lane] = 0;
                        if (particle = lane[this.lane]) {
                            particle = [];

                        }
                        //particles = []; 
                    }
                    // STOPS THE PARTICLE
                    this.velocity.x = 0;
                }
            }
        },
        render: function (ctx) {
            for (var i = 0; i < 10; i++) {
                for (var j = 0; j < 5; j++) {
                    ctx.beginPath()
                    ctx.fillStyle = this.color;
                    ctx.arc(this.position.x - i * 12, (this.position.y - 30) + j * 12, this.radius + 0.5, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.closePath();
                }
            }
        }
    };



    function addParticle(lane) {
        radius = 3;
        particle = new Particle(
            new Vector(-radius, lane * (HEIGHT) / 5),
            new Vector(5),
            radius,
            lane,
            colors[Math.round(Math.random() * 4)]
        );
        particles.push(particle);
    }

    requestAnimationFrame(function loop() {
        requestAnimationFrame(loop);
        ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
        ctx.fillRect(0, 0, WIDTH, HEIGHT);

        for (var i = 0, len = particles.length; i < len; i++) {
            particle = particles[i];
            particle.update();
            particle.render(ctx);
        }
    });

    //
    // ─── SOCKETIO CONNECTION TO NODE WEBSERVER RUNNING OPENCV ───────────────────────
    //
    var socket = io.connect('http://localhost:8000');

    // SEND "CONNECTED" MESSAGE ONCE SUCCSEFULLY CONNECTED   
    socket.on('connect', function () {
        console.log('connected');
    });

    socket.on('message', function (msg) {
        console.log(msg);

        // IF NUMBER OF CARS DETECTED IS MORE THAN 0, A PARTICLE WILL BE ADDED RANDOMLY TO ONE OF THE 4 LANES
        if (msg >= 0) {
            addParticle(Math.round((Math.random() * 3) + 1));
        }
    });
});