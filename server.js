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
  assamese: [],
  overseas: [],
  hits: [],
  missouts: []
};

const votingData = {
  assamese: [
    {
      songName: 'Motoloya 2.0',
      votingCount: 0,
      url: 'https://soundcloud.com/sannidhyabhuyan-music/motoliya-2-0',
      current: false
    },
    {
      songName: 'Alakananda',
      votingCount: 0,
      url: 'https://soundcloud.com/xobdoofficial/alakananda-xobdo-remix',
      current: false
    },
    {
      songName: 'Mon Mur',
      votingCount: 0,
      url: 'https://soundcloud.com/assamese-songs/mon-mur',
      current: false
    },
    {
      songName: 'Xuronjona',
      votingCount: 0,
      url: 'https://soundcloud.com/muzammilaslamhere/tonmoy-krypton-x-sannidhya-1',
      current: false
    },
    {
      songName: 'Jonake bisare ki',
      votingCount: 0,
      url: 'https://soundcloud.com/assamese-songs/jonake-bisare-ki',
      current: false
    }
  ],
  overseas: [
    {
      songName: 'Avicii - the nights',
      votingCount: 0,
      url: 'https://soundcloud.com/adolfo-ayala-alen/avicii-the-nights',
      current: false
    },
    {
      songName: 'Skillet - Hero',
      votingCount: 0,
      url: 'https://soundcloud.com/s-rgiokishino/skillet-hero-awake-remix',
      current: false
    },
    {
      songName: 'Backstreet Boys - I want it that way',
      votingCount: 0,
      url: 'https://soundcloud.com/clemenswenners/i-want-it-that-way',
      current: false
    },
    {
      songName: 'Shape of you',
      votingCount: 0,
      url: 'https://soundcloud.com/jamescarterpresents/shape-of-you',
      current: false
    },
    {
      songName: 'Let Her Go',
      votingCount: 0,
      url: 'https://soundcloud.com/nettwerkmusicgroup/passenger-let-her-go',
      current: false
    }
  ],
  hits: [
    {
      songName: 'Tere bin nahi lagda',
      votingCount: 0,
      url: 'https://soundcloud.com/user-836130715/tere-bin-nahi-lagda-dil-mera-dholna-by-papon',
      current: false
    },
    {
      songName: 'Samajavaragamana',
      votingCount: 0,
      url: 'https://soundcloud.com/user-713826249/01-samajavaragamana',
      current: false
    },
    {
      songName: 'Makhna',
      votingCount: 0,
      url: 'https://soundcloud.com/sabtain-amjad/makhna-drive-sushant-singh',
      current: false
    },
    {
      songName: 'Khairiyat',
      votingCount: 0,
      url: 'https://soundcloud.com/desimelodies/khairiyat-arijit-singh-1',
      current: false
    },
    {
      songName: 'Dheera Dheera',
      votingCount: 0,
      url: 'https://soundcloud.com/filmy-songs/dheera-dheera-anaya-bhatt-kgf-telugu-filmysongs',
      current: false
    }
  ],
  missouts: [
    {
      songName: "Lokada Kalaji - Raghu Dixit",
      votingCount: 0,
      url: "https://soundcloud.com/trdp/raghu-dixit-jagchanga-lokada?in=trdp/sets/jag-changa",
      current: false
    },
    {
      songName: "making all the things new",
      votingCount: 0,
      url: "https://soundcloud.com/dougwaterman/making-all-things-new-waterman?in=user-961145082/sets/as-beautiful-as-it-sounds",
      current: false
    },
    {
      songName: "Stay Alive",
      votingCount: 0,
      url:
        "https://soundcloud.com/eddy-thevenet/stay-alive-jose-gonzalez-vs",
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
