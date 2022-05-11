const Cluster = require('discord-hybrid-sharding')
const colors = require('colors')
let d = new Date();
const config = require('./conf/config')
const manager = new Cluster.Manager('./index.js',{
    totalShards: 'auto',
    shardPerClusters: 2,
    mode: 'process',
    token: config.token
})

manager.on('clusterCreate', cluster => 
console.log(
    colors.gray(
      `[${d.getDate()}:${d.getMonth()+1}:${d.getFullYear()} - ${d.getHours()}:${d.getMinutes()}]`
    ) + colors.blue(" | " + `[CLUSTER]: Created cluster ${cluster.id}`)
  )
  );
manager.spawn({ timeout: -1 });