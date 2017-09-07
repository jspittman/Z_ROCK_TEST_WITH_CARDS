var lastPlayedByUser = {};
var podcastURL = "https://www.gomain.com/koze/koze.m3u";
 
 
exports.handler = function(event, context) {
    var player = new SidRothPlayer(event, context);
    player.handle();
};
 
var SidRothPlayer = function (event, context) {
    this.event = event;
    this.context = context;
};



SidRothPlayer.prototype.handle = function () {
    var requestType = this.event.request.type;
    var userId = this.event.context ? this.event.context.System.user.userId : this.event.session.user.userId;
 
   if (requestType === "LaunchRequest") {
        this.play(podcastURL, 0);
 
    } else  if (requestType === "IntentRequest") {
        var intent = this.event.request.intent;
        if (intent.name === "Play") {
            this.play(podcastURL, 0);
        } else if (intent.name === "AMAZON.PauseIntent") {
            this.stop();
        } else if (intent.name === "AMAZON.StopIntent") {
            this.stop();
        } else if (intent.name === "AMAZON.ResumeIntent") {
            var lastPlayed = this.loadLastPlayed(userId);
            var offsetInMilliseconds = 0;
            if (lastPlayed !== null) {
                offsetInMilliseconds = lastPlayed.request.offsetInMilliseconds;
            }
            this.play(podcastURL, offsetInMilliseconds);
        }
 
    } else if (requestType === "AudioPlayer.PlaybackStopped") {
        this.saveLastPlayed(userId, this.event);
        this.context.succeed(true);
    }
};
 
 
 SidRothPlayer.prototype.play = function (audioURL, offsetInMilliseconds) {
    var response = {
        version: "1.0",
        response: {
            shouldEndSession: true,
            card:
                {
                     "type": "Standard",
                     "title": "Z-Rock 96.5",
                     "text": "Z-Rock is the best",
                     "image": 
                              { 
                          "smallImageUrl": "https://s3.amazonaws.com/skill-images-gomain/birthdaywishes512.PNG",
                          "largeImageUrl": "https://s3.amazonaws.com/skill-images-gomain/birthdaywishes512.PNG"
                              }
                },
            directives: [
                {
                    type: "AudioPlayer.Play",
                    playBehavior: "REPLACE_ALL", 
                    audioItem: {
                        stream: {
                            url: audioURL,
                            token: "0", 
                            expectedPreviousToken: null, 
                            offsetInMilliseconds: offsetInMilliseconds
                        }
                    }
                }
            ]
        }
    };
    this.context.succeed(response);
};
 
SidRothPlayer.prototype.stop = function () {
    var response = {
        version: "1.0",
        response: {
            shouldEndSession: true,
            directives: [
                {
                    type: "AudioPlayer.Stop"
                }
            ]
        }
    };
    this.context.succeed(response);
};
 
SidRothPlayer.prototype.saveLastPlayed = function (userId, lastPlayed) {
    lastPlayedByUser[userId] = lastPlayed;
};
 
SidRothPlayer.prototype.loadLastPlayed = function (userId) {
    var lastPlayed = null;
    if (userId in lastPlayedByUser) {
        lastPlayed = lastPlayedByUser[userId];
    }
    return lastPlayed;
};
