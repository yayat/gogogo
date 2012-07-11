// Generated by CoffeeScript 1.3.3

/*
CLI to automatically deploy stuff, kind of like heroku. 
Ubuntu only! (upstart)

TODO remember last command again
TODO multiple services
TODO multiple cron
*/


(function() {
  var CONFIG, LOGS_LINES, Layer, MainConfig, VERSION, exec, finish, fs, getConfigRepo, getLayer, init, list, mainConfigPath, path, program, reponame, writeConfig;

  CONFIG = "ggg";

  LOGS_LINES = 40;

  VERSION = "0.3.1";

  exec = require("child_process").exec;

  fs = require('fs');

  path = require('path');

  program = require('commander');

  MainConfig = require("./lib/MainConfig");

  Layer = require("./lib/Layer");

  program.version(VERSION);

  program.command("init").description("creates a ggg.js config file for you").action(function() {
    return init(finish);
  });

  program.command("deploy <name> [branch]").description("deploys a branch (defaults to origin/master) to named server").action(function(name, branch) {
    return getLayer(name, function(err, layer) {
      if (err != null) {
        return finish(err);
      }
      branch = branch || "origin/master";
      return layer.deploy(branch, finish);
    });
  });

  program.command("restart <name>").description("restarts named server").action(function(name) {
    return getLayer(name, function(err, layer) {
      if (err != null) {
        return finish(err);
      }
      return layer.restart(finish);
    });
  });

  program.command("start <name>").description("starts named server").action(function(name) {
    return getLayer(name, function(err, layer) {
      if (err != null) {
        return finish(err);
      }
      return layer.start(finish);
    });
  });

  program.command("stop <name>").description("stops named server").action(function(name) {
    return getLayer(name, function(err, layer) {
      if (err != null) {
        return finish(err);
      }
      return layer.stop(finish);
    });
  });

  program.command("logs <name>").description("Logs " + LOGS_LINES + " lines of named servers log files").option("-l, --lines <num>", "the number of lines to log").action(function(name) {
    return getLayer(name, function(err, layer) {
      var lines;
      if (err != null) {
        return finish(err);
      }
      lines = program.lines || LOGS_LINES;
      return layer.serverLogs(lines, finish);
    });
  });

  program.command("list").description("lists all the servers").action(function() {
    return getConfigRepo(function(err, repoName, mainConfig) {
      if (err != null) {
        return finish(err);
      }
      return list(mainConfig, finish);
    });
  });

  program.command("help").description("display this help").action(function() {
    console.log(program.helpInformation());
    return finish();
  });

  program.command("*").action(function() {
    return finish(new Error("bad command!"));
  });

  init = function(cb) {
    var initConfigContent;
    initConfigContent = "// example ggg.js. Delete what you don't need\nmodule.exports = {\n\n  // services\n  start: \"node app.js\",\n\n  // install\n  install: \"npm install\",\n\n  // cron jobs (from your app folder)\n  cron: {name: \"someTask\", time: \"0 3 * * *\", command: \"node sometask.js\"},\n\n  // servers to deploy to\n  servers: {\n    dev: \"deploy@dev.mycompany.com\",\n    staging: [\"deploy@staging.mycompany.com\", \"deploy@staging2.mycompany.com\"]\n    prod: {\n      hosts: [\"deploy@mycompany.com\", \"deploy@backup.mycompany.com\"],\n      cron: [\n        {name: \"someTask\", time: \"0 3 * * *\", command: \"node sometask.js\"},\n        {name: \"anotherTask\", time: \"0 3 * * *\", command: \"node secondTask.js\"}\n      ],\n      start: \"prodstart app.js\"\n    }\n  }\n}";
    console.log("GOGOGO INITIALIZING!");
    console.log("*** Written to ggg.js ***");
    console.log(initConfigContent);
    return fs.writeFile(mainConfigPath() + ".js", initConfigContent, 0x1ed, cb);
  };

  list = function(mainConfig, cb) {
    console.log("GOGOGO servers (see ggg.js)");
    return console.log(" - " + mainConfig.getServerNames().join("\n - "));
  };

  reponame = function(dir, cb) {
    return exec("git config --get remote.origin.url", {
      cwd: dir
    }, function(err, stdout, stderr) {
      var url;
      if (err != null) {
        return cb(null, path.basename(dir));
      } else {
        url = stdout.replace("\n", "");
        return cb(null, path.basename(url).replace(".git", ""));
      }
    });
  };

  writeConfig = function(f, obj, cb) {
    return fs.mkdir(path.dirname(f), function(err) {
      return fs.writeFile(f, "module.exports = " + JSON.stringify(obj), 0x1fd, cb);
    });
  };

  mainConfigPath = function() {
    return path.join(process.cwd(), CONFIG);
  };

  getConfigRepo = function(cb) {
    return reponame(process.cwd(), function(err, repoName) {
      if (err != null) {
        return cb(err);
      }
      return MainConfig.loadFromFile(mainConfigPath(), function(err, mainConfig) {
        if (err) {
          return cb(new Error("Bad gogogo config file, ggg.js. Run 'gogogo init' to create one. Err=" + err.message));
        }
        return cb(null, repoName, mainConfig);
      });
    });
  };

  getLayer = function(name, cb) {
    return getConfigRepo(function(err, repoName, mainConfig) {
      var layer, layerConfig;
      if (err != null) {
        return cb(err);
      }
      layerConfig = mainConfig.getLayerByName(name);
      if (!layerConfig) {
        return cb(new Error("Invalid Layer Name: " + name));
      }
      layer = new layer(name, servers, repoName, mainConfig);
      return cb(null, layer);
    });
  };

  finish = function(err) {
    if (err != null) {
      console.log("!!! " + err.message);
      process.exit(1);
    }
    return console.log("OK");
  };

  module.exports = program;

}).call(this);
