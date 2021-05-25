/**
 * import modules
 */
const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const socket = require("socket.io");
const io = socket(server);

/**
 * defining the port
 */
const PORT = process.env.PORT || 8000;

/**
 * initializing all the variables
 */
let users = [];
const messages = {
  edm: [],
  hiphop: [],
  bollywood: [],
  developer: []
};

const votingData = {
  edm: [
    {
      songName: 'Motoloya 2.0',
      votingCount: 0,
      url: 'https://soundcloud.com/sannidhyabhuyan-music/motoliya-2-0',
      current: false
    },
    {
      songName: 'alakananda',
      votingCount: 0,
      url: 'https://soundcloud.com/xobdoofficial/alakananda-xobdo-remix',
      current: false
    },
    {
      songName: 'xuronjona',
      votingCount: 0,
      url: 'https://soundcloud.com/muzammilaslamhere/tonmoy-krypton-x-sannidhya-1',
      current: false
    }
  ],
  hiphop: [
    {
      songName: 'Motoloya 2.0',
      votingCount: 0,
      url: 'https://soundcloud.com/sannidhyabhuyan-music/motoliya-2-0',
      current: false
    },
    {
      songName: 'alakananda',
      votingCount: 0,
      url: 'https://soundcloud.com/xobdoofficial/alakananda-xobdo-remix',
      current: false
    },
    {
      songName: 'xuronjona',
      votingCount: 0,
      url: 'https://soundcloud.com/muzammilaslamhere/tonmoy-krypton-x-sannidhya-1',
      current: false
    }
  ],
  bollywood: [
    {
      songName: 'Motoloya 2.0',
      votingCount: 0,
      url: 'https://soundcloud.com/sannidhyabhuyan-music/motoliya-2-0',
      current: false
    },
    {
      songName: 'alakananda',
      votingCount: 0,
      url: 'https://soundcloud.com/xobdoofficial/alakananda-xobdo-remix',
      current: false
    },
    {
      songName: 'xuronjona',
      votingCount: 0,
      url: 'https://soundcloud.com/muzammilaslamhere/tonmoy-krypton-x-sannidhya-1',
      current: false
    }
  ],
  developer: [
    {
      songName: 'Motoloya 2.0',
      votingCount: 0,
      url: 'https://soundcloud.com/sannidhyabhuyan-music/motoliya-2-0',
      current: false
    },
    {
      songName: 'alakananda',
      votingCount: 0,
      url: 'https://soundcloud.com/xobdoofficial/alakananda-xobdo-remix',
      current: false
    },
    {
      songName: 'xuronjona',
      votingCount: 0,
      url: 'https://soundcloud.com/muzammilaslamhere/tonmoy-krypton-x-sannidhya-1',
      current: false
    }
  ]
};


/**
 * listen to a connection event
 */
io.on("connection", socket => {
  /**
   * set of event listeners
   */

  /**
   * join the server
   */
  socket.on("join-server", username => {
    const user = {
      username,
      id: socket.id
    };
    users.push(user);
    /**
     * broadcasting to all users
     */
    console.log('new user added: ', username)
    io.emit("new user", users);
  });

  /**
   * join a room event
   */
  socket.on("join-room", (roomName, cb) => {
    socket.join(roomName);
    let currentSongIndex = votingData[roomName].findIndex(item => {
      return item.current === true
    })
    if(currentSongIndex > -1) {
      votingData[roomName][currentSongIndex].current = true
    }
    cb(messages[roomName],votingData);
  });

  socket.on("update-vote", ({ chatName, songId }) => {
    if(votingData[chatName]) {
      votingData[chatName][songId].votingCount++;
      const votingPayload = {
        votingData: votingData[chatName],
        chatName: chatName
      }
      socket.to(chatName).emit("new-voteData", votingPayload);
    }
  })

  socket.on("send-active", ({ activeIndex, room }) => {
    for (let i=0; i<votingData[room].length; i++) {
      votingData[room][i].current = false
    }
    votingData[room][activeIndex].current = true;
  })

  socket.on("removing-vote", ({ chatName, songId }) => {
    if(votingData[chatName]) {
      votingData[chatName][songId].votingCount = 0;
      const votingPayload = {
        votingData: votingData[chatName],
        chatName: chatName
      }
      socket.to(chatName).emit("new-voteData", votingPayload);
    }
  })

  /**
   * send a message
   */
  socket.on("send-message", ({ content, to, sender, chatName, isChannel }) => {
    if (isChannel) {
      const payload = {
        content,
        chatName,
        sender
      };
      socket.to(to).emit("new message", payload);
    } else {
      const payload = {
        content,
        chatName: sender,
        sender
      };
      socket.to(to).emit("new message", payload);
    }
    if (messages[chatName]) {
      messages[chatName].push({
        sender,
        content
      });
    }
  });

  /**
   * disconnect socket connection
   */
  socket.on("disconnect", () => {
    users = users.filter(u => u.id !== socket.id);
    console.log('user left')
    socket.emit("new user", users);
  });
});

/**
 * Initializing the root node
 */
app.get("/", (req, res) => {
    res.send("Welcome to musicmood server !!!! ");
});

/**
 * listen to the port
 */
server.listen(PORT, () => {
  console.log(`server is running on port: ${PORT}`);
});
