const pool = require("../conf/db");
const { v4: uuidv4 } = require('uuid');
var func = {};
func.queryPlaylist = (server) =>{
  return new Promise((resolve, reject)=>{
      pool.query(`SELECT * FROM playlist where guild_id = "${server}"`,  (error, rows)=>{
          if(error){
              return reject(error);
          }
          return resolve(Object.values(JSON.parse(JSON.stringify(rows))));
      });
  });
};



func.querySongs = (playlist) =>{
  return new Promise((resolve, reject)=>{
    pool.query(`SELECT * FROM playlist_has_songs where playlist_id = "${playlist}" ORDER BY created_time`,  (error, result)=>{
        if(error){
            return reject(error);
        }
        return resolve(Object.values(JSON.parse(JSON.stringify(result))));
    });
});
};

func.historyInsert = (track, guild_id) =>{
  return new Promise((resolve, reject)=>{
  pool.query(`INSERT INTO history (url, requester, guild_id) VALUES ("${track.uri}", "${track.requester}", "${guild_id}")`, function (err, result) {
    if (err) return reject(err);
  });
});
},


func.insertPlaylist = (name, creator, guild) =>{
  return new Promise((resolve, reject)=>{
    pool.query(`INSERT INTO playlist (id, name, creator, guild_id) VALUES ("${uuidv4()}","${name}", "${creator}", "${guild}") ` ,(error, result)=>{
        if(error){
            return reject(error);
        }
        return resolve(true);
    });
});
};



 func.insertSong = async (playlist, songarray, player, user) =>{
    var errorsarray = []
    var values = []
    let trackForPlay;
    async function asyncCall() {
        await Promise.all(songarray.map(async (song) => {
        trackForPlay = await player?.search(
            song,
            user
          );
          if (trackForPlay.loadType === "TRACK_LOADED" || trackForPlay.loadType === "SEARCH_RESULT"|| trackForPlay.loadType === "PLAYLIST_LOADED") {
            var title = trackForPlay.tracks[0].title.replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g,'')
              .replace(/\s+/g, ' ')
              .replace(/[&\/\\#,+()$~%.'":*?<>{}]/g,'')
              .trim();
              var id = uuidv4();
            values.push([
              `${id}`, 
              `${title}`, 
              `${song}`, 
              `${playlist}`
            ])
        }
         else{
          errorsarray.push(
            song
            )};
        }));
        if(values.length>0){
        pool.query("INSERT INTO playlist_has_songs (id, name, url, playlist_id) VALUES ?", [values] ,(error, result)=>{
          if(error){
            throw error;
          }
      });
    }
    return errorsarray;
  }
  //var insert = await asyncCall(); SE NON VA
  return await asyncCall();
}
module.exports = func;